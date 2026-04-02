import type { KakaoLocalDocument } from './provider-mappers';

const KAKAO_LOCAL_BASE_URL = 'https://dapi.kakao.com/v2/local';

export interface KakaoKeywordSearchParams {
  query: string;
  category_group_code?: string;
  x?: string;
  y?: string;
  radius?: number;
  page?: number;
  size?: number;
  sort?: 'accuracy' | 'distance';
}

export interface KakaoKeywordSearchResponse {
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
  documents: KakaoLocalDocument[];
}

export async function searchKakaoLocalByKeyword(
  params: KakaoKeywordSearchParams,
  apiKey = process.env.KAKAO_REST_API_KEY,
): Promise<KakaoKeywordSearchResponse> {
  if (!apiKey) {
    throw new Error('Missing KAKAO_REST_API_KEY');
  }

  const response = await fetch(buildKakaoKeywordSearchUrl(params), {
    headers: {
      Authorization: `KakaoAK ${apiKey}`,
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Kakao Local API request failed: ${response.status}`);
  }

  return response.json() as Promise<KakaoKeywordSearchResponse>;
}

function buildKakaoKeywordSearchUrl(params: KakaoKeywordSearchParams): string {
  const searchParams = new URLSearchParams({
    query: params.query,
  });

  if (params.category_group_code) searchParams.set('category_group_code', params.category_group_code);
  if (params.x) searchParams.set('x', params.x);
  if (params.y) searchParams.set('y', params.y);
  if (typeof params.radius === 'number') searchParams.set('radius', String(params.radius));
  if (typeof params.page === 'number') searchParams.set('page', String(params.page));
  if (typeof params.size === 'number') searchParams.set('size', String(params.size));
  if (params.sort) searchParams.set('sort', params.sort);

  return `${KAKAO_LOCAL_BASE_URL}/search/keyword.json?${searchParams.toString()}`;
}
