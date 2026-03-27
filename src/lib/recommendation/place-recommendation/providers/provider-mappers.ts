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
  return mapExternalPoiToPlaceRecord(normalizeKakaoLocalDocument(raw), override);
}

export function mapKakaoLocalDocumentsToPlaceRecords(
  raws: KakaoLocalDocument[],
  overrides: Record<string, PlaceRecordOverride> = {},
): PlaceRecord[] {
  return mapExternalPoisToPlaceRecords(raws.map(normalizeKakaoLocalDocument), overrides);
}

export function mapTourApiItemToPlaceRecord(
  raw: TourApiItem,
  override: PlaceRecordOverride = {},
): PlaceRecord {
  return mapExternalPoiToPlaceRecord(normalizeTourApiItem(raw), mergeTourApiOverride(raw, override));
}

export function mapTourApiItemsToPlaceRecords(
  raws: TourApiItem[],
  overrides: Record<string, PlaceRecordOverride> = {},
): PlaceRecord[] {
  return raws.map((raw) => {
    const normalized = normalizeTourApiItem(raw);
    return mapExternalPoiToPlaceRecord(normalized, mergeTourApiOverride(raw, overrides[String(normalized.id ?? normalized.name)]));
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
  return {
    id: raw.id ?? buildCoordinateId(raw.x, raw.y, raw.place_name),
    name: raw.place_name,
    location: raw.road_address_name || raw.address_name || 'Unknown location',
    summary: raw.category_name || raw.category_group_name || raw.place_name,
    category: [raw.category_group_name, raw.category_name].filter(Boolean).join(' / '),
    description: buildKakaoDescription(raw),
    hours: inferKakaoHours(raw),
  };
}

export function normalizeTourApiItem(raw: TourApiItem): RawExternalPoi {
  return {
    id: raw.contentid ?? buildCoordinateId(raw.mapx, raw.mapy, raw.title),
    name: raw.title,
    location: [raw.addr1, raw.addr2].filter(Boolean).join(' ') || 'Unknown location',
    summary: raw.overview || raw.title,
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

export function mapRawExternalPoisToPlaceRecords(
  raws: RawExternalPoi[],
  overrides: Record<string, PlaceRecordOverride> = {},
): PlaceRecord[] {
  return mapExternalPoisToPlaceRecords(raws, overrides);
}
