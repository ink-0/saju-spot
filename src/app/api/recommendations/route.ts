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
  type ElementKey,
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
    const providerResult = await fetchProviderPlaces(input.location, interpretation.layer_a.missing_elements, interpretation.conclusion.yongshin);
    const providerPlaces = providerResult.places;
    const placePool = providerPlaces.length > 0 ? providerPlaces : PLACE_DATASET;
    const recommendation = runRecommendationEngine(interpretation, environment, {}, placePool);

    return NextResponse.json({
      source: providerPlaces.length > 0 ? 'external' : 'fallback',
      query_keyword: buildPrimaryKeyword(input.location, interpretation.layer_a.missing_elements, interpretation.conclusion.yongshin),
      provider_status: providerResult.status,
      recommendation,
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

async function fetchProviderPlaces(location: string, missingElements: ElementKey[], yongshin: ElementKey): Promise<{
  places: PlaceRecord[];
  status: 'success' | 'partial' | 'empty' | 'failed';
}> {
  const searchSpecs = buildSearchSpecs(location, missingElements, yongshin);

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

  const targetElements = missingElements.length > 0 ? missingElements : [yongshin];
  const filtered = filterPlacesByTargetElements(merged, targetElements);
  const deduped = dedupePlaces(filtered.length > 0 ? filtered : merged);
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

function buildPrimaryKeyword(location: string, missingElements: ElementKey[], yongshin: ElementKey): string {
  return buildSearchSpecs(location, missingElements, yongshin)[0]?.query ?? `${location} 명소`;
}

function buildSearchSpecs(location: string, missingElements: ElementKey[], yongshin: ElementKey) {
  const targetElement = missingElements[0] ?? yongshin;
  const baseLocation = normalizeSearchLocation(location);
  const traitMap: Record<ElementKey, Array<{
    keyword: string;
    kakaoCategoryGroupCode?: string;
    tourContentTypeId?: string;
  }>> = {
    wood: [
      { keyword: '공원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '숲길', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '수목원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '생태공원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
    ],
    fire: [
      { keyword: '전망대', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '광장', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '야경 명소', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '루프탑', kakaoCategoryGroupCode: 'CE7', tourContentTypeId: '15' },
    ],
    earth: [
      { keyword: '궁궐', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '박물관', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '고궁', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '정원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
    ],
    metal: [
      { keyword: '전시관', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '미술관', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '현대건축', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '도심 전망', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
    ],
    water: [
      { keyword: '한강공원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '수변', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '강변 산책로', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '천변', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
    ],
  };

  return traitMap[targetElement].map((spec) => ({
    ...spec,
    query: `${baseLocation} ${spec.keyword}`,
  }));
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
