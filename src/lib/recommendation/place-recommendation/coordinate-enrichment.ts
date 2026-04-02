import type { FengshuiSignal, PlaceRecord } from '../types';

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
  if (!place.coordinates) {
    return place;
  }

  const inferredSignals = inferSignalsFromCoordinates(place.coordinates.lng, place.coordinates.lat);
  if (inferredSignals.length === 0) {
    return place;
  }

  return {
    ...place,
    tags: {
      ...place.tags,
      fengshui_signals: uniqueSignals([...(place.tags.fengshui_signals ?? []), ...inferredSignals]),
    },
  };
}

export function inferSignalsFromCoordinates(lng: number, lat: number): FengshuiSignal[] {
  const signals: FengshuiSignal[] = [];

  const hanRiverDistance = minDistanceKm({ lng, lat }, HAN_RIVER_POINTS);
  const streamDistance = minDistanceKm({ lng, lat }, CHEONGGYECHEON_POINTS);
  const metalMountainDistance = minDistanceKm({ lng, lat }, METAL_MOUNTAIN_POINTS);
  const fireMountainDistance = minDistanceKm({ lng, lat }, FIRE_MOUNTAIN_POINTS);
  const shelteredCoreDistance = minDistanceKm({ lng, lat }, SHELTERED_CORE_POINTS);
  const confluenceDistance = minDistanceKm({ lng, lat }, WATER_CONFLUENCE_POINTS);

  if (hanRiverDistance <= 1.2 || streamDistance <= 0.6) {
    signals.push('water_edge');
  }

  if (confluenceDistance <= 0.9) {
    signals.push('water_confluence', 'water_encircled');
  }

  if (metalMountainDistance <= 2.2) {
    signals.push('rock_exposed');
  }

  if (fireMountainDistance <= 2.3) {
    signals.push('flame_ridge');
  }

  if (shelteredCoreDistance <= 1.3 || ((hanRiverDistance <= 1.6 || streamDistance <= 0.8) && metalMountainDistance <= 4.5)) {
    signals.push('sheltered_site');
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
