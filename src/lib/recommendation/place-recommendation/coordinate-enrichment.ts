import type { FengshuiSignal, PlaceContextSignals, PlaceRecord } from '../types';

interface ReferencePoint {
  lng: number;
  lat: number;
}

const HAN_RIVER_POINTS: ReferencePoint[] = [
  { lng: 127.0096, lat: 37.5194 },
  { lng: 127.0325, lat: 37.5280 },
  { lng: 126.9537, lat: 37.5288 },
  { lng: 126.9016, lat: 37.5358 },
  { lng: 127.0230, lat: 37.5422 },
];

const CHEONGGYECHEON_POINTS: ReferencePoint[] = [
  { lng: 126.9882, lat: 37.5693 },
  { lng: 127.0020, lat: 37.5695 },
  { lng: 127.0189, lat: 37.5700 },
];

const METAL_MOUNTAIN_POINTS: ReferencePoint[] = [
  { lng: 126.9584, lat: 37.6587 },
  { lng: 126.9618, lat: 37.6026 },
  { lng: 127.0826, lat: 37.6993 },
];

const FIRE_MOUNTAIN_POINTS: ReferencePoint[] = [
  { lng: 126.9582, lat: 37.4476 },
  { lng: 126.9834, lat: 37.5512 },
];

const SHELTERED_CORE_POINTS: ReferencePoint[] = [
  { lng: 126.9769, lat: 37.5796 },
  { lng: 126.9910, lat: 37.5651 },
  { lng: 127.0606, lat: 37.5095 },
];

const WATER_CONFLUENCE_POINTS: ReferencePoint[] = [
  { lng: 127.0306, lat: 37.5419 },
  { lng: 127.0927, lat: 37.5208 },
];

export function enrichPlaceWithCoordinateSignals(place: PlaceRecord): PlaceRecord {
  const contextSignals = inferPlaceContextSignals(place);
  const inferredSignals = place.coordinates
    ? inferSignalsFromCoordinates(place.coordinates.lng, place.coordinates.lat, contextSignals)
    : inferSignalsFromContext(place, contextSignals);

  return {
    ...place,
    context_signals: contextSignals,
    tags: {
      ...place.tags,
      fengshui_signals: uniqueSignals([...(place.tags.fengshui_signals ?? []), ...inferredSignals]),
    },
  };
}

export function inferSignalsFromCoordinates(lng: number, lat: number, contextSignals?: PlaceContextSignals): FengshuiSignal[] {
  const signals: FengshuiSignal[] = [];

  const hanRiverDistance = minDistanceKm({ lng, lat }, HAN_RIVER_POINTS);
  const streamDistance = minDistanceKm({ lng, lat }, CHEONGGYECHEON_POINTS);
  const metalMountainDistance = minDistanceKm({ lng, lat }, METAL_MOUNTAIN_POINTS);
  const fireMountainDistance = minDistanceKm({ lng, lat }, FIRE_MOUNTAIN_POINTS);
  const shelteredCoreDistance = minDistanceKm({ lng, lat }, SHELTERED_CORE_POINTS);
  const confluenceDistance = minDistanceKm({ lng, lat }, WATER_CONFLUENCE_POINTS);

  if (hanRiverDistance <= 1.2 || streamDistance <= 0.6 || (contextSignals?.water_proximity ?? 0) >= 4) {
    signals.push('water_edge');
  }

  if (confluenceDistance <= 0.9 || ((contextSignals?.water_proximity ?? 0) >= 4 && (contextSignals?.city_core_score ?? 0) >= 3)) {
    signals.push('water_confluence', 'water_encircled');
  }

  if (metalMountainDistance <= 2.2 || (contextSignals?.ridge_score ?? 0) >= 4) {
    signals.push('rock_exposed');
  }

  if (fireMountainDistance <= 2.3 || ((contextSignals?.ridge_score ?? 0) >= 3 && (contextSignals?.landmark_prestige ?? 0) >= 3)) {
    signals.push('flame_ridge');
  }

  if (
    shelteredCoreDistance <= 1.3 ||
    ((hanRiverDistance <= 1.6 || streamDistance <= 0.8) && metalMountainDistance <= 4.5) ||
    ((contextSignals?.city_core_score ?? 0) >= 4 && (contextSignals?.landmark_prestige ?? 0) >= 3)
  ) {
    signals.push('sheltered_site');
  }

  if ((contextSignals?.landmark_prestige ?? 0) >= 4) {
    signals.push('flagship_site');
  }

  return uniqueSignals(signals);
}

export function inferPlaceContextSignals(place: Pick<PlaceRecord, 'name' | 'location' | 'summary' | 'tags' | 'coordinates'>): PlaceContextSignals {
  const text = `${place.name} ${place.location} ${place.summary}`.toLowerCase();
  const waterKeywordScore = keywordScore(text, ['한강', '청계천', '수변', '강변', '천변', '선착장', '호수', '물정원', 'waterfront', 'river']);
  const greenKeywordScore = keywordScore(text, ['숲', '공원', '수목원', '정원', '생태', '식물원', 'forest', 'park', 'garden']);
  const mountainKeywordScore = keywordScore(text, ['산', '암릉', '바위', '봉우리', 'ridge', 'peak', 'rock']);
  const ridgeKeywordScore = keywordScore(text, ['암릉', '바위', '능선', '전망', '고층', 'sky', 'tower', 'ridge']);
  const cityCoreKeywordScore = keywordScore(text, ['광화문', '시청', '소공동', '여의도', '삼성동', '잠실', '강남', '도심']);
  const prestigeKeywordScore = keywordScore(text, ['호텔', '팰리스', '플라자', '시그니엘', '웨스틴', '파르나스', '랜드마크', 'luxury', 'flagship']);
  const quietKeywordScore = keywordScore(text, ['조용', '차분', '고요', '산책', '정원', 'rest', 'quiet']);

  const coordinates = place.coordinates;
  const waterDistanceScore = coordinates
    ? scoreByDistance(Math.min(minDistanceKm(coordinates, HAN_RIVER_POINTS), minDistanceKm(coordinates, CHEONGGYECHEON_POINTS)), 0.5, 3)
    : 0;
  const mountainDistanceScore = coordinates
    ? scoreByDistance(Math.min(minDistanceKm(coordinates, METAL_MOUNTAIN_POINTS), minDistanceKm(coordinates, FIRE_MOUNTAIN_POINTS)), 1.5, 5)
    : 0;
  const cityDistanceScore = coordinates
    ? scoreByDistance(minDistanceKm(coordinates, SHELTERED_CORE_POINTS), 0.8, 4)
    : 0;

  return {
    water_proximity: clampScore(Math.max(waterKeywordScore, waterDistanceScore, place.tags.material.includes('water') ? 3 : 0)),
    green_proximity: clampScore(Math.max(greenKeywordScore, place.tags.nature_ratio, place.tags.structure === 'organic' ? 3 : 0)),
    mountain_proximity: clampScore(Math.max(mountainKeywordScore, mountainDistanceScore, place.tags.material.includes('stone') ? 2 : 0)),
    ridge_score: clampScore(Math.max(ridgeKeywordScore, place.tags.brightness >= 4 ? 2 : 0, place.tags.material.includes('stone') ? 2 : 0)),
    city_core_score: clampScore(Math.max(cityCoreKeywordScore, cityDistanceScore, place.tags.structure === 'linear' ? 2 : 0)),
    landmark_prestige: clampScore(Math.max(prestigeKeywordScore, place.tags.brightness >= 4 ? 2 : 0)),
    quietness_score: clampScore(Math.max(quietKeywordScore, place.tags.crowd <= 2 ? 4 : place.tags.crowd <= 3 ? 2 : 0)),
  };
}

function inferSignalsFromContext(place: PlaceRecord, contextSignals: PlaceContextSignals): FengshuiSignal[] {
  const signals: FengshuiSignal[] = [];

  if (contextSignals.water_proximity >= 4) {
    signals.push('water_edge');
  }
  if (contextSignals.water_proximity >= 4 && contextSignals.city_core_score >= 3) {
    signals.push('water_encircled', 'water_confluence');
  }
  if (contextSignals.mountain_proximity >= 4 || contextSignals.ridge_score >= 4) {
    signals.push('rock_exposed');
  }
  if (contextSignals.ridge_score >= 4 && place.tags.brightness >= 4) {
    signals.push('flame_ridge');
  }
  if (contextSignals.city_core_score >= 4 && contextSignals.quietness_score >= 2) {
    signals.push('sheltered_site');
  }
  if (contextSignals.landmark_prestige >= 4) {
    signals.push('flagship_site');
  }

  return uniqueSignals(signals);
}

function minDistanceKm(target: ReferencePoint, points: ReferencePoint[]): number {
  return Math.min(...points.map((point) => distanceKm(target, point)));
}

function distanceKm(a: ReferencePoint, b: ReferencePoint): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * earthRadiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function uniqueSignals(signals: FengshuiSignal[]): FengshuiSignal[] {
  return [...new Set(signals)];
}

function keywordScore(text: string, keywords: string[]): number {
  const matches = keywords.filter((keyword) => text.includes(keyword.toLowerCase())).length;
  return clampScore(matches * 2);
}

function scoreByDistance(distanceKm: number, near: number, far: number): number {
  if (distanceKm <= near) {
    return 5;
  }
  if (distanceKm >= far) {
    return 0;
  }

  const ratio = 1 - (distanceKm - near) / (far - near);
  return clampScore(Math.round(ratio * 5));
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(5, Math.round(value)));
}
