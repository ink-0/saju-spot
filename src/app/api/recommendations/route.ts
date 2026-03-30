import { NextResponse } from 'next/server';

import {
  calculatePlaceInfluence,
  PLACE_DATASET,
  runEnvironmentTranslationEngine,
  runInterpretationEngine,
  runRecommendationEngine,
  runSajuCoreEngine,
  searchAndMapKakaoLocalDocuments,
  searchAndMapTourApiItemsByKeyword,
  scorePlaceAgainstElementTraits,
  buildElementSearchSpecs,
  type ElementKey,
  type GroupedRecommendationOutput,
  type PlaceRecord,
  type SajuEngineInput,
} from '@/lib/recommendation';

interface RecommendationRequestBody {
  birth_date: string;
  birth_time: string;
  calendar_type: 'solar' | 'lunar';
  leap_month: boolean;
  location?: string;
  gender?: 'male' | 'female';
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as RecommendationRequestBody;
    const input = normalizeRequestBody(body);

    const sajuCore = runSajuCoreEngine(input);
    const interpretation = runInterpretationEngine(sajuCore);
    const environment = runEnvironmentTranslationEngine(interpretation);
    const targetElements = interpretation.layer_a.missing_elements.length > 0
      ? interpretation.layer_a.missing_elements
      : [interpretation.conclusion.yongshin];
    const providerResult = await fetchProviderPlaces(input.location, targetElements);
    const providerPlaces = providerResult.places;
    const placePool = providerPlaces.length > 0 ? providerPlaces : PLACE_DATASET;
    const recommendation = runRecommendationEngine(interpretation, environment, {}, placePool);
    const grouped_recommendations = buildGroupedRecommendations(targetElements, interpretation, environment, placePool);

    return NextResponse.json({
      source: providerPlaces.length > 0 ? 'external' : 'fallback',
      query_keyword: buildPrimaryKeyword(input.location, targetElements),
      provider_status: providerResult.status,
      recommendation,
      grouped_recommendations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to create recommendations',
      },
      { status: 500 },
    );
  }
}

function normalizeRequestBody(body: RecommendationRequestBody): SajuEngineInput {
  return {
    birth_date: body.birth_date,
    birth_time: body.birth_time,
    calendar_type: body.calendar_type,
    leap_month: body.leap_month,
    gender: body.gender ?? 'female',
    location: body.location ?? 'Seoul',
  };
}

async function fetchProviderPlaces(location: string, targetElements: ElementKey[]): Promise<{
  places: PlaceRecord[];
  status: 'success' | 'partial' | 'empty' | 'failed';
}> {
  const searchSpecs = targetElements.flatMap((element) => buildElementSearchSpecs(element, normalizeSearchLocation(location)));

  const kakaoTasks = searchSpecs.map((spec) =>
    searchAndMapKakaoLocalDocuments(
      {
        query: spec.query,
        size: 8,
        category_group_code: spec.kakaoCategoryGroupCode,
      },
    ),
  );
  const tourTasks = searchSpecs.map((spec) =>
    searchAndMapTourApiItemsByKeyword(
      {
        keyword: spec.query,
        numOfRows: 8,
        areaCode: '1',
        contentTypeId: spec.tourContentTypeId,
      },
    ),
  );

  const [kakaoResults, tourResults] = await Promise.all([
    Promise.allSettled(kakaoTasks),
    Promise.allSettled(tourTasks),
  ]);

  const merged = [
    ...extractPlaces(kakaoResults),
    ...extractPlaces(tourResults),
  ];

  const filtered = filterPlacesByTargetElements(merged, targetElements);
  const ranked = rankPlacesByTargetElements(filtered.length > 0 ? filtered : merged, targetElements);
  const deduped = dedupePlaces(ranked);
  const providerStatuses = [...kakaoResults, ...tourResults];
  const successCount = providerStatuses.filter((result) => result.status === 'fulfilled').length;

  return {
    places: deduped,
    status:
      deduped.length > 0
        ? successCount === 2
          ? 'success'
          : 'partial'
        : successCount > 0
          ? 'empty'
          : 'failed',
  };
}

function buildPrimaryKeyword(location: string, missingElements: ElementKey[]): string {
  return buildElementSearchSpecs(missingElements[0], normalizeSearchLocation(location))[0]?.query ?? `${location} 명소`;
}

function buildGroupedRecommendations(
  targetElements: ElementKey[],
  interpretation: ReturnType<typeof runInterpretationEngine>,
  environment: ReturnType<typeof runEnvironmentTranslationEngine>,
  placePool: PlaceRecord[],
): GroupedRecommendationOutput[] {
  return targetElements.map((element) => {
    const groupedInterpretation = {
      ...interpretation,
      layer_a: {
        ...interpretation.layer_a,
        missing_elements: [element],
      },
    };

    return {
      element,
      recommendations: runRecommendationEngine(groupedInterpretation, environment, {}, placePool).recommendations,
    };
  });
}

function extractPlaces(
  results: PromiseSettledResult<PlaceRecord[]>[],
): PlaceRecord[] {
  return results.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));
}

function filterPlacesByTargetElements(places: PlaceRecord[], targetElements: ElementKey[]): PlaceRecord[] {
  return places.filter((place) => {
    const influence = calculatePlaceInfluence(place);
    return targetElements.some((element) => influence.element_scores[element] >= 2.5);
  });
}

function normalizeSearchLocation(location: string): string {
  if (/^seoul$/i.test(location)) {
    return '서울';
  }

  return location;
}

function rankPlacesByTargetElements(places: PlaceRecord[], targetElements: ElementKey[]): PlaceRecord[] {
  return [...places].sort((left, right) => {
    const leftScore = getBestTraitScore(left, targetElements);
    const rightScore = getBestTraitScore(right, targetElements);
    return rightScore - leftScore;
  });
}

function getBestTraitScore(place: PlaceRecord, targetElements: ElementKey[]): number {
  return Math.max(...targetElements.map((element) => scorePlaceAgainstElementTraits(place, element)));
}

function dedupePlaces(places: PlaceRecord[]): PlaceRecord[] {
  const seen = new Set<string>();

  return places.filter((place) => {
    const signature = `${place.name}:${place.location}`;
    if (seen.has(signature)) {
      return false;
    }
    seen.add(signature);
    return true;
  });
}
