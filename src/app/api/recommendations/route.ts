import { NextResponse } from 'next/server';

import {
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
  const keyword = buildPrimaryKeyword(location, missingElements, yongshin);

  const [kakaoResult, tourResult] = await Promise.allSettled([
    searchAndMapKakaoLocalDocuments({ query: keyword, size: 10 }),
    searchAndMapTourApiItemsByKeyword({ keyword, numOfRows: 10, areaCode: '1' }),
  ]);

  const merged = [
    ...(kakaoResult.status === 'fulfilled' ? kakaoResult.value : []),
    ...(tourResult.status === 'fulfilled' ? tourResult.value : []),
  ];

  const deduped = dedupePlaces(merged);
  const successCount = [kakaoResult, tourResult].filter((result) => result.status === 'fulfilled').length;

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
  const targetElement = missingElements[0] ?? yongshin;
  const keywordByElement: Record<ElementKey, string> = {
    wood: '공원',
    fire: '광장',
    earth: '박물관',
    metal: '전시관',
    water: '수변',
  };

  return `${location} ${keywordByElement[targetElement]}`;
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
