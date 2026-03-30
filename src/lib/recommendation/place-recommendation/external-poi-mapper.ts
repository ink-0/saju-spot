import type {
  ActivityTag,
  MaterialTag,
  PlaceRecord,
  StructureTag,
  TemperatureFeel,
  TimePreferenceTag,
} from '../types';

export interface RawExternalPoi {
  id?: string | number;
  name: string;
  location?: string;
  summary?: string;
  category?: string;
  description?: string;
  hours?: string;
}

export interface PlaceRecordOverride {
  element?: PlaceRecord['tags']['element'];
  nature_ratio?: number;
  brightness?: number;
  crowd?: number;
  material?: MaterialTag[];
  activity?: ActivityTag[];
  time_preference?: TimePreferenceTag[];
  temperature_feel?: TemperatureFeel;
  structure?: StructureTag;
}

const CATEGORY_DEFAULTS: Array<{
  keywords: string[];
  override: PlaceRecordOverride;
}> = [
  {
    keywords: ['park', 'forest', 'trail', 'garden', 'arboretum', '공원', '수목원', '숲', '산책', '둘레길', '정원', '생태'],
    override: {
      element: ['wood'],
      nature_ratio: 5,
      brightness: 3,
      crowd: 2,
      material: ['wood'],
      activity: ['explore'],
      time_preference: ['day'],
      temperature_feel: 'neutral',
      structure: 'organic',
    },
  },
  {
    keywords: ['river', 'stream', 'waterfront', 'lake', 'beach', '한강', '강', '천', '수변', '호수', '바다', '해변', '폭포'],
    override: {
      element: ['water'],
      nature_ratio: 4,
      brightness: 3,
      crowd: 2,
      material: ['water'],
      activity: ['rest'],
      time_preference: ['day', 'night'],
      temperature_feel: 'cool',
      structure: 'linear',
    },
  },
  {
    keywords: ['museum', 'palace', 'hotel', 'gallery', 'cultural', '박물관', '미술관', '궁', '문화', '도서관', '호텔', '사찰', '전통'],
    override: {
      element: ['earth'],
      nature_ratio: 2,
      brightness: 3,
      crowd: 2,
      material: ['stone'],
      activity: ['rest', 'explore'],
      time_preference: ['day'],
      temperature_feel: 'neutral',
      structure: 'mixed',
    },
  },
  {
    keywords: ['tower', 'plaza', 'restaurant', 'cafe', 'festival', '광장', '전망대', '타워', '축제', '거리', '시장', '야경', '카페', '음식점'],
    override: {
      element: ['fire'],
      nature_ratio: 1,
      brightness: 5,
      crowd: 4,
      material: ['glass'],
      activity: ['explore'],
      time_preference: ['day', 'night'],
      temperature_feel: 'warm',
      structure: 'linear',
    },
  },
  {
    keywords: ['finance', 'bank', 'business', 'hospital', 'station', '금융', '은행', '업무', '병원', '역', '센터', '오피스', '전시관', '컨벤션'],
    override: {
      element: ['metal'],
      nature_ratio: 0,
      brightness: 4,
      crowd: 2,
      material: ['metal', 'glass'],
      activity: ['rest'],
      time_preference: ['day', 'night'],
      temperature_feel: 'cool',
      structure: 'linear',
    },
  },
];

const FALLBACK_TAGS: PlaceRecord['tags'] = {
  element: [],
  nature_ratio: 2,
  brightness: 3,
  crowd: 2,
  material: [],
  activity: ['rest', 'explore'],
  time_preference: ['day', 'night'],
  temperature_feel: 'neutral',
  structure: 'mixed',
};

export function mapExternalPoiToPlaceRecord(raw: RawExternalPoi, override: PlaceRecordOverride = {}): PlaceRecord {
  const inferred = inferOverrideFromRaw(raw);
  const mergedTags = {
    ...FALLBACK_TAGS,
    ...inferred,
    ...override,
    element: override.element ?? inferred.element ?? FALLBACK_TAGS.element,
    material: override.material ?? inferred.material ?? FALLBACK_TAGS.material,
    activity: override.activity ?? inferred.activity ?? FALLBACK_TAGS.activity,
    time_preference: override.time_preference ?? inferred.time_preference ?? FALLBACK_TAGS.time_preference,
  };

  return {
    id: String(raw.id ?? slugify(raw.name)),
    name: raw.name,
    location: raw.location ?? 'Unknown location',
    summary: raw.summary ?? raw.description ?? raw.category ?? raw.name,
    tags: mergedTags,
  };
}

export function mapExternalPoisToPlaceRecords(
  raws: RawExternalPoi[],
  overrides: Record<string, PlaceRecordOverride> = {},
): PlaceRecord[] {
  return raws.map((raw) => mapExternalPoiToPlaceRecord(raw, overrides[String(raw.id ?? slugify(raw.name))]));
}

function inferOverrideFromRaw(raw: RawExternalPoi): PlaceRecordOverride {
  const haystack = `${raw.name} ${raw.category ?? ''} ${raw.description ?? ''}`.toLowerCase();
  const matches = CATEGORY_DEFAULTS.filter((entry) => entry.keywords.some((keyword) => haystack.includes(keyword)));
  const override = mergeOverrides(matches.map((match) => match.override));

  if (raw.hours?.toLowerCase().includes('night') && !override.time_preference) {
    return {
      ...override,
      time_preference: ['night'],
    };
  }

  return override;
}

function mergeOverrides(overrides: PlaceRecordOverride[]): PlaceRecordOverride {
  if (overrides.length === 0) {
    return {};
  }

  return overrides.reduce<PlaceRecordOverride>((merged, current) => ({
    ...merged,
    ...current,
    element: uniqueElements([...(merged.element ?? []), ...(current.element ?? [])]),
    material: uniqueArray([...(merged.material ?? []), ...(current.material ?? [])]),
    activity: uniqueArray([...(merged.activity ?? []), ...(current.activity ?? [])]),
    time_preference: uniqueArray([...(merged.time_preference ?? []), ...(current.time_preference ?? [])]),
  }), {});
}

function uniqueElements(items: PlaceRecord['tags']['element']): PlaceRecord['tags']['element'] {
  return [...new Set(items)];
}

function uniqueArray<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
