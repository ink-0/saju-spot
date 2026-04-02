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
      { keyword: '식물원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '꽃시장', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '숲 산책', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '교보문고', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '온실 카페', kakaoCategoryGroupCode: 'CE7', tourContentTypeId: '12' },
    ],
    curated_tags: ['숲', '수목', '흙길', '산책', '정원', '한강', '연못', '식물', '꽃시장', '수생목'],
    preferred_categories: ['공원', '자연', '궁궐'],
    preferred_materials: ['wood', 'water'],
    preferred_structures: ['organic'],
    preferred_activities: ['explore'],
    preferred_time_preferences: ['day'],
    preferred_temperature: ['neutral', 'cool'],
    ideal_nature_ratio: 5,
    ideal_brightness: 3,
    ideal_crowd: 2,
    reason_phrases: [
      '물과 나무가 함께 있어 수생목(水生木) 기운이 흐르고',
      '생명력과 성장 에너지가 느껴지는 숲 환경이고',
      '걷기 좋은 흙길과 푸른 식생, 책과 종이의 목 기운이 함께 쌓이고',
    ],
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
      { keyword: '관악산', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '야경 카페', kakaoCategoryGroupCode: 'CE7', tourContentTypeId: '15' },
      { keyword: '고층 전망', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '강남역', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '테헤란로', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '숭례문', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '호텔 로비', kakaoCategoryGroupCode: 'CE7', tourContentTypeId: '32' },
    ],
    curated_tags: ['야경', '빛', '활기', '광장', '전망대', '고층', '버스킹', '화형산', '루프탑', '남향'],
    preferred_categories: ['랜드마크', '거리', '호텔', '자연'],
    preferred_materials: ['glass'],
    preferred_structures: ['linear'],
    preferred_activities: ['explore'],
    preferred_time_preferences: ['day', 'night'],
    preferred_temperature: ['warm'],
    ideal_nature_ratio: 1,
    ideal_brightness: 5,
    ideal_crowd: 4,
    reason_phrases: [
      '빛과 시야가 강하게 열려 있어 화 에너지가 집약되고',
      '높이와 네온, 화려한 인테리어가 자신감을 끌어올리고',
      '사람과 빛의 에너지가 모여 축 처진 기운을 다시 데워주고',
    ],
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
      { keyword: '황톳길', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '도자기 체험', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '미술관 정원', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '조계사', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '장충동', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '남산', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '용산', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
    ],
    curated_tags: ['궁궐', '정원', '안정', '명당', '박물관', '왕릉', '한옥', '황톳길', '정혈', '대지'],
    preferred_categories: ['궁궐', '랜드마크', '호텔', '자연', '거리'],
    preferred_materials: ['stone', 'earth'],
    preferred_structures: ['mixed', 'linear'],
    preferred_activities: ['rest', 'explore'],
    preferred_time_preferences: ['day'],
    preferred_temperature: ['neutral'],
    ideal_nature_ratio: 3,
    ideal_brightness: 3,
    ideal_crowd: 2,
    reason_phrases: [
      '수백 년 대지의 기운이 응집된 정혈(正穴) 터에 위치하고',
      '땅과 돌, 넓은 평지의 묵직한 안정 에너지가 있고',
      '마음이 붕 뜰 때 중심을 다시 잡아주기 좋은 분위기고',
    ],
  },
  metal: {
    label: '금 기운 장소 특징',
    search_keywords: [
      { keyword: '바위산', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '북한산', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '인왕산', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '수락산', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '전시관', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '미술관', kakaoCategoryGroupCode: 'CT1', tourContentTypeId: '14' },
      { keyword: '호텔 라운지', kakaoCategoryGroupCode: 'CE7', tourContentTypeId: '32' },
      { keyword: '고층 빌딩', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '바위 전망', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '도산대로', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '압구정', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '명품거리', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '환구단', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
    ],
    curated_tags: ['바위산', '화강암', '대리석', '스틸', '통유리', '결단', '금융', '명당터', '금성', '고층'],
    preferred_categories: ['호텔', '랜드마크', '자연'],
    preferred_materials: ['metal', 'glass', 'stone'],
    preferred_structures: ['linear'],
    preferred_activities: ['rest', 'explore'],
    preferred_time_preferences: ['day', 'night'],
    preferred_temperature: ['cool', 'neutral'],
    ideal_nature_ratio: 1,
    ideal_brightness: 4,
    ideal_crowd: 2,
    reason_phrases: [
      '화강암 바위나 금속·유리 구조에서 금 기운이 수렴되고',
      '높이와 날카로운 구조가 결단력과 집중력을 끌어올리고',
      '명예와 재물의 기운이 모이는 하이엔드 축에 걸쳐 있고',
    ],
  },
  water: {
    label: '수 기운 장소 특징',
    search_keywords: [
      { keyword: '한강공원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '수변', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '강변 산책로', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '천변', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '선착장', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '수변 카페', kakaoCategoryGroupCode: 'CE7', tourContentTypeId: '15' },
      { keyword: '호수', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '물정원', kakaoCategoryGroupCode: 'AD5', tourContentTypeId: '12' },
      { keyword: '한강 야경', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '반포 한강공원', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '석촌호수', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '덕수궁 돌담길', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
      { keyword: '서촌', kakaoCategoryGroupCode: 'AT4', tourContentTypeId: '12' },
    ],
    curated_tags: ['한강', '수변', '흐르는물', '재물운', '선착장', '갈룡음수형', '환포지형', '삼수합류', '서늘'],
    preferred_categories: ['공원', '거리', '호텔'],
    preferred_materials: ['water'],
    preferred_structures: ['linear', 'organic'],
    preferred_activities: ['rest'],
    preferred_time_preferences: ['day', 'night'],
    preferred_temperature: ['cool'],
    ideal_nature_ratio: 4,
    ideal_brightness: 2,
    ideal_crowd: 2,
    reason_phrases: [
      '물이 감싸는 환포(環抱) 지형이라 재물 기운이 모이고',
      '흐르는 물소리가 막힌 흐름과 과열된 기운을 식혀주고',
      '서늘하고 고요한 수 에너지로 유연성과 지혜를 충전시키고',
    ],
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
