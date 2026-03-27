import type { TourApiItem } from './provider-mappers';

const TOUR_API_BASE_URL = 'https://apis.data.go.kr/B551011/KorService1';

export interface TourApiSearchParams {
  numOfRows?: number;
  pageNo?: number;
  MobileOS?: string;
  MobileApp?: string;
  arrange?: 'A' | 'C' | 'D' | 'O' | 'Q' | 'R';
  contentTypeId?: string;
  areaCode?: string;
  sigunguCode?: string;
  mapX?: string;
  mapY?: string;
  radius?: number;
  keyword?: string;
}

interface TourApiResponseEnvelope<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items?: {
        item?: T[] | T;
      };
      numOfRows?: number;
      pageNo?: number;
      totalCount?: number;
    };
  };
}

export interface TourApiSearchResponse {
  totalCount: number;
  items: TourApiItem[];
}

export async function searchTourApiByKeyword(
  params: TourApiSearchParams,
  serviceKey = process.env.TOURAPI_SERVICE_KEY,
): Promise<TourApiSearchResponse> {
  return requestTourApi('searchKeyword1', params, serviceKey);
}

export async function searchTourApiByLocation(
  params: TourApiSearchParams,
  serviceKey = process.env.TOURAPI_SERVICE_KEY,
): Promise<TourApiSearchResponse> {
  return requestTourApi('locationBasedList1', params, serviceKey);
}

async function requestTourApi(
  endpoint: 'searchKeyword1' | 'locationBasedList1',
  params: TourApiSearchParams,
  serviceKey?: string,
): Promise<TourApiSearchResponse> {
  if (!serviceKey) {
    throw new Error('Missing TOURAPI_SERVICE_KEY');
  }

  const response = await fetch(buildTourApiUrl(endpoint, params, serviceKey), {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`TourAPI request failed: ${response.status}`);
  }

  const data = await response.json() as TourApiResponseEnvelope<TourApiItem>;
  const items = normalizeTourApiItems(data.response.body.items?.item);

  return {
    totalCount: data.response.body.totalCount ?? items.length,
    items,
  };
}

function buildTourApiUrl(
  endpoint: 'searchKeyword1' | 'locationBasedList1',
  params: TourApiSearchParams,
  serviceKey: string,
): string {
  const searchParams = new URLSearchParams({
    serviceKey,
    _type: 'json',
    MobileOS: params.MobileOS ?? 'ETC',
    MobileApp: params.MobileApp ?? 'saju-spot',
    numOfRows: String(params.numOfRows ?? 10),
    pageNo: String(params.pageNo ?? 1),
    arrange: params.arrange ?? 'A',
  });

  if (params.keyword) searchParams.set('keyword', params.keyword);
  if (params.contentTypeId) searchParams.set('contentTypeId', params.contentTypeId);
  if (params.areaCode) searchParams.set('areaCode', params.areaCode);
  if (params.sigunguCode) searchParams.set('sigunguCode', params.sigunguCode);
  if (params.mapX) searchParams.set('mapX', params.mapX);
  if (params.mapY) searchParams.set('mapY', params.mapY);
  if (typeof params.radius === 'number') searchParams.set('radius', String(params.radius));

  return `${TOUR_API_BASE_URL}/${endpoint}?${searchParams.toString()}`;
}

function normalizeTourApiItems(items: TourApiItem[] | TourApiItem | undefined): TourApiItem[] {
  if (!items) {
    return [];
  }

  return Array.isArray(items) ? items : [items];
}
