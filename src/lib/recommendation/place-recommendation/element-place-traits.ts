import type { ElementKey, ElementPlaceTraitDefinition, PlaceRecord } from '../types';
import { calculatePlaceInfluence } from './place-influence';

export const ELEMENT_PLACE_TRAITS: Record<ElementKey, ElementPlaceTraitDefinition> = {
  wood: {
    label: '목 기운 장소 특징',
    search_keywords: [
      { keyword: '공원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '숲길', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '수목원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '생태공원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '둘레길', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '정원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '숲 전망', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
    ],
    curated_tags: ['숲', '수목', '흙길', '산책', '정원', '한강', '연못'],
    preferred_categories: ['공원', '자연', '궁궐'],
    preferred_materials: ['wood', 'water'],
    preferred_structures: ['organic'],
    preferred_activities: ['explore'],
    preferred_time_preferences: ['day'],
    preferred_temperature: ['neutral', 'cool'],
    ideal_nature_ratio: 5,
    ideal_brightness: 3,
    ideal_crowd: 2,
    reason_phrases: ['숲과 수목이 많고', '걷기 좋은 동선이 있고', '물과 나무가 함께 느껴지고'],
  },
  fire: {
    label: '화 기운 장소 특징',
    search_keywords: [
      { keyword: '전망대', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '광장', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '야경 명소', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '루프탑', kakaoCategoryGroupCode: 'CE7', tourContentTypeId: '15' },
      { keyword: '타워', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '빛 축제', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '15' },
      { keyword: '메인거리', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
    ],
    curated_tags: ['야경', '빛', '활기', '광장', '전망대', '고층', '버스킹'],
    preferred_categories: ['랜드마크', '거리', '호텔', '자연'],
    preferred_materials: ['glass'],
    preferred_structures: ['linear'],
    preferred_activities: ['explore'],
    preferred_time_preferences: ['day', 'night'],
    preferred_temperature: ['warm'],
    ideal_nature_ratio: 1,
    ideal_brightness: 5,
    ideal_crowd: 4,
    reason_phrases: ['빛과 시야가 강하게 열려 있고', '높이감과 도시 에너지가 느껴지고', '사람과 활기가 모이는 편이고'],
  },
  earth: {
    label: '토 기운 장소 특징',
    search_keywords: [
      { keyword: '궁궐', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '박물관', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '고궁', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '정원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '왕릉', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '한옥마을', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '미술관 정원', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
    ],
    curated_tags: ['궁궐', '정원', '안정', '명당', '박물관', '왕릉', '한옥'],
    preferred_categories: ['궁궐', '랜드마크', '호텔', '자연', '거리'],
    preferred_materials: ['stone', 'earth'],
    preferred_structures: ['mixed', 'linear'],
    preferred_activities: ['rest', 'explore'],
    preferred_time_preferences: ['day'],
    preferred_temperature: ['neutral'],
    ideal_nature_ratio: 3,
    ideal_brightness: 3,
    ideal_crowd: 2,
    reason_phrases: ['오래 머물기 편하고', '땅과 돌의 안정감이 있고', '고궁이나 정원처럼 차분한 흐름이 있고'],
  },
  metal: {
    label: '금 기운 장소 특징',
    search_keywords: [
      { keyword: '전시관', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '미술관', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '현대건축', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '도심 전망', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '로비 라운지', kakaoCategoryGroupCode: 'CE7', tourContentTypeId: '32' },
      { keyword: '컨벤션', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '바위 전망', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
    ],
    curated_tags: ['대리석', '스틸', '통유리', '결단', '금융', '바위', '격식'],
    preferred_categories: ['호텔', '랜드마크', '자연'],
    preferred_materials: ['metal', 'glass', 'stone'],
    preferred_structures: ['linear'],
    preferred_activities: ['rest', 'explore'],
    preferred_time_preferences: ['day', 'night'],
    preferred_temperature: ['cool', 'neutral'],
    ideal_nature_ratio: 1,
    ideal_brightness: 4,
    ideal_crowd: 2,
    reason_phrases: ['직선적이고 정돈된 구조가 있고', '대리석·금속·유리 같은 재질감이 있고', '결단하기 좋은 차가운 집중감이 있고'],
  },
  water: {
    label: '수 기운 장소 특징',
    search_keywords: [
      { keyword: '한강공원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '수변', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '강변 산책로', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '천변', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '선착장', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '야외 수영장', kakaoCategoryGroupCode: 'AD5', tourContentTypeId: '28' },
      { keyword: '물정원', kakaoCategoryGroupCode: 'AD5', tourContentTypeId: '12' },
    ],
    curated_tags: ['한강', '수변', '흐르는물', '재물운', '선착장', '물정원', '수맥'],
    preferred_categories: ['공원', '거리', '호텔'],
    preferred_materials: ['water'],
    preferred_structures: ['linear', 'organic'],
    preferred_activities: ['rest'],
    preferred_time_preferences: ['day', 'night'],
    preferred_temperature: ['cool'],
    ideal_nature_ratio: 4,
    ideal_brightness: 2,
    ideal_crowd: 2,
    reason_phrases: ['물가와 흐름이 느껴지고', '자극이 과하지 않고', '서늘하고 생각이 정리되기 좋은 분위기예요'],
  },
};

export function buildElementSearchSpecs(element: ElementKey, location: string) {
  return ELEMENT_PLACE_TRAITS[element].search_keywords.map((spec) => ({
    ...spec,
    query: `${location} ${spec.keyword}`,
  }));
}

export function scorePlaceAgainstElementTraits(place: PlaceRecord, element: ElementKey): number {
  const traits = ELEMENT_PLACE_TRAITS[element];
  const influence = calculatePlaceInfluence(place);
  let score = influence.element_scores[element] * 0.45;

  score += proximityScore(place.tags.nature_ratio, traits.ideal_nature_ratio) * 0.15;
  score += proximityScore(place.tags.brightness, traits.ideal_brightness) * 0.1;
  score += proximityScore(place.tags.crowd, traits.ideal_crowd) * 0.1;

  if (traits.preferred_materials.some((material) => place.tags.material.includes(material))) {
    score += 0.7;
  }
  if (traits.preferred_structures.includes(place.tags.structure)) {
    score += 0.5;
  }
  if (traits.preferred_activities.some((activity) => place.tags.activity.includes(activity))) {
    score += 0.4;
  }
  if (traits.preferred_time_preferences.some((time) => place.tags.time_preference.includes(time))) {
    score += 0.2;
  }
  if (traits.preferred_temperature.includes(place.tags.temperature_feel)) {
    score += 0.3;
  }

  return Math.round(score * 100) / 100;
}

export function getElementTraitReasons(element: ElementKey): string[] {
  return ELEMENT_PLACE_TRAITS[element].reason_phrases;
}

function proximityScore(actual: number, desired: number): number {
  return Math.max(0, 5 - Math.abs(actual - desired));
}
