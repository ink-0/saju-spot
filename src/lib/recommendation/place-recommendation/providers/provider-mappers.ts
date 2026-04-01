import {
  mapExternalPoiToPlaceRecord,
  mapExternalPoisToPlaceRecords,
  type PlaceRecordOverride,
  type RawExternalPoi,
} from '../external-poi-mapper';
import type { PlaceRecord } from '../../types';

export interface KakaoLocalDocument {
  id?: string;
  place_name: string;
  category_name?: string;
  category_group_code?: string;
  category_group_name?: string;
  address_name?: string;
  road_address_name?: string;
  place_url?: string;
  phone?: string;
  distance?: string;
  x?: string;
  y?: string;
}

export interface TourApiItem {
  contentid?: string | number;
  contenttypeid?: string | number;
  title: string;
  addr1?: string;
  addr2?: string;
  cat1?: string;
  cat2?: string;
  cat3?: string;
  firstimage?: string;
  firstimage2?: string;
  overview?: string;
  mapx?: string | number;
  mapy?: string | number;
  tel?: string;
  readcount?: string | number;
  usetime?: string;
  eventstartdate?: string;
  eventenddate?: string;
}

export function mapKakaoLocalDocumentToPlaceRecord(
  raw: KakaoLocalDocument,
  override: PlaceRecordOverride = {},
): PlaceRecord {
  const normalized = normalizeKakaoLocalDocument(raw);
  return mapExternalPoiToPlaceRecord(normalized, applyKnownPlaceOverride(normalized, override));
}

export function mapKakaoLocalDocumentsToPlaceRecords(
  raws: KakaoLocalDocument[],
  overrides: Record<string, PlaceRecordOverride> = {},
): PlaceRecord[] {
  return raws.map((raw) => {
    const normalized = normalizeKakaoLocalDocument(raw);
    return mapExternalPoiToPlaceRecord(normalized, applyKnownPlaceOverride(normalized, overrides[String(normalized.id ?? normalized.name)]));
  });
}

export function mapTourApiItemToPlaceRecord(
  raw: TourApiItem,
  override: PlaceRecordOverride = {},
): PlaceRecord {
  const normalized = normalizeTourApiItem(raw);
  return mapExternalPoiToPlaceRecord(normalized, applyKnownPlaceOverride(normalized, mergeTourApiOverride(raw, override)));
}

export function mapTourApiItemsToPlaceRecords(
  raws: TourApiItem[],
  overrides: Record<string, PlaceRecordOverride> = {},
): PlaceRecord[] {
  return raws.map((raw) => {
    const normalized = normalizeTourApiItem(raw);
    return mapExternalPoiToPlaceRecord(normalized, applyKnownPlaceOverride(normalized, mergeTourApiOverride(raw, overrides[String(normalized.id ?? normalized.name)])));
  });
}

export async function searchAndMapKakaoLocalDocuments(
  params: import('./kakao-client').KakaoKeywordSearchParams,
  overrideMap: Record<string, PlaceRecordOverride> = {},
  apiKey?: string,
): Promise<PlaceRecord[]> {
  const { searchKakaoLocalByKeyword } = await import('./kakao-client');
  const response = await searchKakaoLocalByKeyword(params, apiKey);
  return mapKakaoLocalDocumentsToPlaceRecords(response.documents, overrideMap);
}

export async function searchAndMapTourApiItemsByKeyword(
  params: import('./tourapi-client').TourApiSearchParams,
  overrideMap: Record<string, PlaceRecordOverride> = {},
  serviceKey?: string,
): Promise<PlaceRecord[]> {
  const { searchTourApiByKeyword } = await import('./tourapi-client');
  const response = await searchTourApiByKeyword(params, serviceKey);
  return mapTourApiItemsToPlaceRecords(response.items, overrideMap);
}

export async function searchAndMapTourApiItemsByLocation(
  params: import('./tourapi-client').TourApiSearchParams,
  overrideMap: Record<string, PlaceRecordOverride> = {},
  serviceKey?: string,
): Promise<PlaceRecord[]> {
  const { searchTourApiByLocation } = await import('./tourapi-client');
  const response = await searchTourApiByLocation(params, serviceKey);
  return mapTourApiItemsToPlaceRecords(response.items, overrideMap);
}

export function normalizeKakaoLocalDocument(raw: KakaoLocalDocument): RawExternalPoi {
  const koreanCategoryLabel = getKakaoCategoryLabel(raw);
  const normalizedName = normalizePlaceName(raw.place_name, koreanCategoryLabel, raw.address_name || raw.road_address_name);
  return {
    id: raw.id ?? buildCoordinateId(raw.x, raw.y, normalizedName),
    name: normalizedName,
    location: raw.road_address_name || raw.address_name || 'Unknown location',
    summary: normalizeSummary(raw.category_name || raw.category_group_name || raw.place_name, koreanCategoryLabel),
    category: [raw.category_group_name, raw.category_name].filter(Boolean).join(' / '),
    description: buildKakaoDescription(raw),
    hours: inferKakaoHours(raw),
  };
}

export function normalizeTourApiItem(raw: TourApiItem): RawExternalPoi {
  const koreanCategoryLabel = getTourApiCategoryLabel(raw);
  const normalizedName = normalizePlaceName(raw.title, koreanCategoryLabel, raw.addr1);
  return {
    id: raw.contentid ?? buildCoordinateId(raw.mapx, raw.mapy, normalizedName),
    name: normalizedName,
    location: [raw.addr1, raw.addr2].filter(Boolean).join(' ') || 'Unknown location',
    summary: normalizeSummary(raw.overview || raw.title, koreanCategoryLabel),
    category: [raw.contenttypeid, raw.cat1, raw.cat2, raw.cat3].filter(Boolean).join(' / '),
    description: raw.overview,
    hours: raw.usetime || inferTourApiHours(raw),
  };
}

function buildKakaoDescription(raw: KakaoLocalDocument): string | undefined {
  const parts = [raw.category_name, raw.category_group_name, raw.road_address_name].filter(Boolean);
  return parts.length > 0 ? parts.join(' · ') : undefined;
}

function inferKakaoHours(raw: KakaoLocalDocument): string | undefined {
  const nightKeywords = ['주점', 'bar', 'pub', 'club', 'night'];
  const haystack = `${raw.place_name} ${raw.category_name ?? ''}`.toLowerCase();

  if (nightKeywords.some((keyword) => haystack.includes(keyword))) {
    return 'night';
  }

  return undefined;
}

function inferTourApiHours(raw: TourApiItem): string | undefined {
  if (raw.eventstartdate && raw.eventenddate) {
    return 'event';
  }

  return undefined;
}

function mergeTourApiOverride(raw: TourApiItem, override: PlaceRecordOverride = {}): PlaceRecordOverride {
  const contentTypeId = String(raw.contenttypeid ?? '');
  const contentTypeOverride = getTourApiContentTypeOverride(contentTypeId);

  return {
    ...contentTypeOverride,
    ...override,
    element: override.element ?? contentTypeOverride.element,
    material: override.material ?? contentTypeOverride.material,
    activity: override.activity ?? contentTypeOverride.activity,
    time_preference: override.time_preference ?? contentTypeOverride.time_preference,
  };
}

function getTourApiContentTypeOverride(contentTypeId: string): PlaceRecordOverride {
  switch (contentTypeId) {
    case '12':
      return { element: ['wood'], nature_ratio: 4, activity: ['explore'], structure: 'organic' };
    case '14':
      return { element: ['earth'], material: ['stone'], activity: ['rest', 'explore'], structure: 'mixed' };
    case '15':
      return { element: ['fire'], brightness: 5, crowd: 4, activity: ['explore'], time_preference: ['day', 'night'] };
    case '28':
      return { element: ['wood', 'water'], nature_ratio: 4, activity: ['explore'], structure: 'organic' };
    case '32':
      return { element: ['earth'], material: ['stone'], activity: ['rest'], structure: 'mixed' };
    case '38':
      return { element: ['fire'], brightness: 4, crowd: 3, activity: ['explore'], temperature_feel: 'warm' };
    default:
      return {};
  }
}

function buildCoordinateId(x: string | number | undefined, y: string | number | undefined, fallbackName: string): string {
  if (x && y) {
    return `${String(x)}:${String(y)}`;
  }

  return fallbackName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function normalizePlaceName(name: string, fallbackCategory?: string, location?: string): string {
  if (containsHangul(name)) {
    return name;
  }

  const cityLabel = getLocationLabel(location);
  const categoryLabel = fallbackCategory ?? '추천 명소';
  return cityLabel ? `${cityLabel} ${categoryLabel}` : `${categoryLabel}`;
}

function normalizeSummary(summary: string, fallbackCategory?: string): string {
  if (containsHangul(summary)) {
    return summary;
  }

  return `${fallbackCategory ?? '이 장소'} 관련 추천 장소예요.`;
}

function containsHangul(value: string): boolean {
  return /[가-힣]/.test(value);
}

function getKakaoCategoryLabel(raw: KakaoLocalDocument): string {
  const category = `${raw.category_group_name ?? ''} ${raw.category_name ?? ''}`;

  if (/공원|수목원|숲|산책|trail|park|forest/i.test(category)) return '공원 명소';
  if (/강|하천|수변|호수|바다|river|stream|water/i.test(category)) return '수변 명소';
  if (/광장|전망|축제|카페|음식점|restaurant|cafe|plaza|tower/i.test(category)) return '활기 명소';
  if (/박물관|미술관|궁|문화|hotel|museum|gallery|palace/i.test(category)) return '문화 명소';
  if (/병원|금융|업무|역|station|business|finance/i.test(category)) return '도심 명소';

  return '추천 명소';
}

function getTourApiCategoryLabel(raw: TourApiItem): string {
  const contentTypeId = String(raw.contenttypeid ?? '');

  switch (contentTypeId) {
    case '12':
      return '관광 명소';
    case '14':
      return '문화 명소';
    case '15':
      return '축제 명소';
    case '28':
      return '레저 명소';
    case '32':
      return '휴식 명소';
    case '38':
      return '쇼핑 명소';
    default:
      return '추천 명소';
  }
}

function getLocationLabel(location?: string): string {
  if (!location) {
    return '';
  }

  if (/서울/.test(location)) return '서울';
  if (/부산/.test(location)) return '부산';
  if (/인천/.test(location)) return '인천';
  if (/대구/.test(location)) return '대구';
  if (/대전/.test(location)) return '대전';
  if (/광주/.test(location)) return '광주';
  if (/울산/.test(location)) return '울산';
  if (/제주/.test(location)) return '제주';

  return location.split(' ')[0] ?? '';
}

function getKnownPlaceOverride(rawName: string, location?: string): PlaceRecordOverride {
  const normalized = `${rawName} ${location ?? ''}`;

  if (/더플라자|plaza/i.test(normalized)) {
    return {
      element: ['metal', 'earth'],
      material: ['metal', 'glass', 'stone'],
      structure: 'linear',
      temperature_feel: 'cool',
      fengshui_signals: ['flagship_site', 'sheltered_site'],
    };
  }

  if (/시그니엘|signiel/i.test(normalized)) {
    return {
      element: ['metal', 'fire'],
      material: ['metal', 'glass'],
      structure: 'linear',
      brightness: 5,
      fengshui_signals: ['flagship_site'],
    };
  }

  if (/웨스틴조선|westin/i.test(normalized)) {
    return {
      element: ['metal', 'earth'],
      material: ['metal', 'stone'],
      structure: 'linear',
      fengshui_signals: ['flagship_site', 'sheltered_site'],
    };
  }

  if (/파르나스|parnas/i.test(normalized)) {
    return {
      element: ['water', 'metal'],
      material: ['water', 'glass', 'metal'],
      structure: 'mixed',
      temperature_feel: 'cool',
      fengshui_signals: ['flagship_site', 'water_edge'],
    };
  }

  if (/북한산|인왕산|수락산/i.test(normalized)) {
    return {
      element: ['metal'],
      material: ['stone'],
      activity: ['explore'],
      fengshui_signals: ['rock_exposed'],
    };
  }

  if (/관악산/i.test(normalized)) {
    return {
      element: ['fire', 'metal'],
      material: ['stone'],
      activity: ['explore'],
      fengshui_signals: ['flame_ridge', 'rock_exposed'],
    };
  }

  if (/한강|청계천|선착장|수변|천변/i.test(normalized)) {
    return {
      element: ['water'],
      material: ['water'],
      activity: ['rest', 'explore'],
      fengshui_signals: ['water_edge'],
    };
  }

  return {};
}

function applyKnownPlaceOverride(raw: RawExternalPoi, override: PlaceRecordOverride = {}): PlaceRecordOverride {
  const knownOverride = getKnownPlaceOverride(raw.name, raw.location);
  return {
    ...knownOverride,
    ...override,
    element: override.element ?? knownOverride.element,
    material: override.material ?? knownOverride.material,
    activity: override.activity ?? knownOverride.activity,
    time_preference: override.time_preference ?? knownOverride.time_preference,
    fengshui_signals: override.fengshui_signals ?? knownOverride.fengshui_signals,
  };
}

export function mapRawExternalPoisToPlaceRecords(
  raws: RawExternalPoi[],
  overrides: Record<string, PlaceRecordOverride> = {},
): PlaceRecord[] {
  return mapExternalPoisToPlaceRecords(raws, overrides);
}
