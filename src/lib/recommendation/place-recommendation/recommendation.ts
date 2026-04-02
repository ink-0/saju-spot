import { PLACE_DATASET } from './places';
import { calculatePlaceInfluence } from './place-influence';
import { getElementTraitReasons } from './element-place-traits';
import type {
  ElementKey,
  EnvironmentTranslationOutput,
  PlaceInfluenceProfile,
  PlaceRecord,
  RecommendationBreakdown,
  RecommendationOutput,
  RecommendationResult,
  InterpretationOutput,
  UserPreferenceInput,
} from '../types';

export function runRecommendationEngine(
  interpretation: InterpretationOutput,
  environment: EnvironmentTranslationOutput,
  userPreference: UserPreferenceInput = {},
  places: PlaceRecord[] = PLACE_DATASET,
): RecommendationOutput {
  const recommendations = places
    .map((place) => scorePlace(place, interpretation, environment, userPreference))
    .sort((left, right) => {
      if (right.breakdown.replenishment_score !== left.breakdown.replenishment_score) {
        return right.breakdown.replenishment_score - left.breakdown.replenishment_score;
      }
      if (right.breakdown.excess_element_control !== left.breakdown.excess_element_control) {
        return right.breakdown.excess_element_control - left.breakdown.excess_element_control;
      }
      if (right.breakdown.environment_fit !== left.breakdown.environment_fit) {
        return right.breakdown.environment_fit - left.breakdown.environment_fit;
      }
      if (right.breakdown.supportive_element_match !== left.breakdown.supportive_element_match) {
        return right.breakdown.supportive_element_match - left.breakdown.supportive_element_match;
      }
      if (right.breakdown.user_preference !== left.breakdown.user_preference) {
        return right.breakdown.user_preference - left.breakdown.user_preference;
      }
      return right.score - left.score;
    })
    .slice(0, 8);

  return { recommendations };
}

function scorePlace(
  place: PlaceRecord,
  interpretation: InterpretationOutput,
  environment: EnvironmentTranslationOutput,
  userPreference: UserPreferenceInput,
): RecommendationResult {
  const placeInfluence = calculatePlaceInfluence(place);
  const supportedMissingElements = getSupportedMissingElements(placeInfluence, interpretation);
  const breakdown: RecommendationBreakdown = {
    replenishment_score: computeReplenishmentScore(placeInfluence, interpretation),
    missing_element_match: computeMissingElementMatch(placeInfluence, interpretation),
    supportive_element_match: computeSupportiveElementMatch(placeInfluence, interpretation),
    environment_fit: computeEnvironmentFit(placeInfluence, environment),
    excess_element_control: computeExcessControl(placeInfluence, interpretation),
    user_preference: computeUserPreference(placeInfluence, userPreference),
  };

  const score = roundScore(
    breakdown.replenishment_score * 0.65
      + breakdown.excess_element_control * 0.15
      + breakdown.environment_fit * 0.15
      + breakdown.user_preference * 0.05,
  );

  return {
    id: place.id,
    name: place.name,
    location: place.location,
    summary: place.summary,
    score,
    reason: buildReasons(place, placeInfluence, interpretation, breakdown, supportedMissingElements),
    breakdown,
    dominant_elements: placeInfluence.dominant_elements,
    supported_missing_elements: supportedMissingElements,
    tags: place.tags,
  };
}

function computeReplenishmentScore(placeInfluence: PlaceInfluenceProfile, interpretation: InterpretationOutput): number {
  const missing = interpretation.layer_a.missing_elements;
  if (missing.length === 0) {
    return 3;
  }

  const scores = missing.map((element) => placeInfluence.element_scores[element]);
  if (scores.length === 1) {
    return scores[0];
  }

  const maxMissing = Math.max(...scores);
  const avgMissing = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return roundScore(maxMissing * 0.7 + avgMissing * 0.3);
}

function computeMissingElementMatch(placeInfluence: PlaceInfluenceProfile, interpretation: InterpretationOutput): number {
  const missing = interpretation.layer_a.missing_elements;
  if (missing.length === 0) {
    return 3;
  }

  const total = missing.reduce((sum, element) => sum + placeInfluence.element_scores[element], 0);
  return roundScore(total / missing.length);
}

function computeSupportiveElementMatch(
  placeInfluence: PlaceInfluenceProfile,
  interpretation: InterpretationOutput,
): number {
  const favorable = [interpretation.conclusion.yongshin, ...interpretation.conclusion.heeshin];
  const totalElementScore = favorable.reduce((sum, element) => sum + placeInfluence.element_scores[element], 0);
  return roundScore(totalElementScore / favorable.length);
}

function computeEnvironmentFit(
  placeInfluence: PlaceInfluenceProfile,
  environment: EnvironmentTranslationOutput,
): number {
  let score = 0;
  score += proximityScore(placeInfluence.observable_traits.nature_ratio, environment.environment_profile.nature_ratio) * 0.4;
  score += proximityScore(placeInfluence.observable_traits.brightness, environment.environment_profile.brightness) * 0.3;
  score += proximityScore(placeInfluence.observable_traits.crowd, environment.environment_profile.crowd) * 0.3;
  return roundScore(score);
}

function computeExcessControl(placeInfluence: PlaceInfluenceProfile, interpretation: InterpretationOutput): number {
  const excess = interpretation.conclusion.avoid;
  if (excess.length === 0) {
    return 3;
  }

  const amplification = excess.reduce((sum, element) => sum + placeInfluence.element_scores[element], 0) / excess.length;
  return roundScore(Math.max(0, 5 - amplification));
}

function computeUserPreference(placeInfluence: PlaceInfluenceProfile, userPreference: UserPreferenceInput): number {
  let score = 2.5;
  const traits = placeInfluence.observable_traits;

  if (userPreference.preferred_activity && userPreference.preferred_activity.some((activity) => traits.activity.includes(activity))) {
    score += 1;
  }

  if (userPreference.preferred_time && userPreference.preferred_time.some((time) => traits.time_preference.includes(time))) {
    score += 0.5;
  }

  if (userPreference.preferred_temperature && userPreference.preferred_temperature.includes(traits.temperature_feel)) {
    score += 0.5;
  }

  if (userPreference.preferred_structure && userPreference.preferred_structure.includes(traits.structure)) {
    score += 0.5;
  }

  if (userPreference.preferred_material && userPreference.preferred_material.some((material) => traits.material.includes(material))) {
    score += 0.5;
  }

  if (typeof userPreference.avoid_crowd_above === 'number' && traits.crowd > userPreference.avoid_crowd_above) {
    score -= 1.5;
  }

  return roundScore(Math.max(0, Math.min(5, score)));
}

function buildReasons(
  place: PlaceRecord,
  placeInfluence: PlaceInfluenceProfile,
  interpretation: InterpretationOutput,
  breakdown: RecommendationBreakdown,
  supportedMissingElements: ElementKey[],
): string[] {
  const reasons: string[] = [];

  if (supportedMissingElements.length > 0) {
    const primaryElement = supportedMissingElements[0];
    reasons.push(buildStoryLead(place, primaryElement, interpretation));
    reasons.push(`${getElementTraitReasons(primaryElement)[0]} 특징이 부족한 기운과 잘 맞아요.`);
  }

  if (placeInfluence.explanation_factors.length > 0) {
    reasons.push(`근거는 ${translateFactors(placeInfluence.explanation_factors.slice(0, 3)).join(', ')} 쪽 특징이 뚜렷하기 때문이에요.`);
  }

  if (breakdown.excess_element_control >= 3.5) {
    const avoidText = interpretation.conclusion.avoid.length > 0
      ? interpretation.conclusion.avoid.map((element) => toKoreanElement(element)).join(', ')
      : '과한 기운';
    reasons.push(`${avoidText} 기운을 더 세게 밀어 올리지 않아서, 머물수록 흐름을 정리하기 좋아요.`);
  }

  if (breakdown.environment_fit >= 3.5) {
    reasons.push('현재 필요한 환경 분위기와도 비교적 잘 맞는 편이에요.');
  }

  reasons.push(`부족한 기운 보강 ${breakdown.replenishment_score.toFixed(1)}/5 · 환경 적합 ${breakdown.environment_fit.toFixed(1)}/5`);

  return reasons;
}

function buildStoryLead(place: PlaceRecord, primaryElement: ElementKey, interpretation: InterpretationOutput): string {
  const lackingText = interpretation.layer_a.missing_elements.map((element) => toKoreanElement(element)).join(', ');
  const elementStory: Record<ElementKey, string> = {
    wood: '시작하는 힘과 의욕을 다시 세워주는',
    fire: '열정과 존재감을 다시 데워주는',
    earth: '마음을 가라앉히고 중심을 세워주는',
    metal: '맺고 끊는 힘과 결단을 세워주는',
    water: '열기를 식히고 생각을 유연하게 풀어주는',
  };

  return `지금은 ${lackingText} 기운이 부족한 편이라, ${place.name}처럼 ${elementStory[primaryElement]} 장소가 잘 맞아요.`;
}

function getSupportedMissingElements(placeInfluence: PlaceInfluenceProfile, interpretation: InterpretationOutput): ElementKey[] {
  return interpretation.layer_a.missing_elements
    .filter((element) => placeInfluence.element_scores[element] >= 2.5)
    .sort((left, right) => placeInfluence.element_scores[right] - placeInfluence.element_scores[left]);
}

function translateFactors(factors: string[]): string[] {
  const translations: Record<string, string> = {
    'high vegetation': '녹지와 식생이 많고',
    'bright visibility': '밝고 시야가 트여 있고',
    'high crowd energy': '사람과 활기가 모이고',
    'low stimulation': '자극이 과하지 않고',
    'linear structure': '직선적이고 정돈된 구조가 있고',
    'organic structure': '유기적이고 자연스러운 동선이 있고',
    'mixed structure': '안정적으로 머물기 쉬운 구조가 있고',
    'warm thermal feel': '따뜻한 느낌이 있고',
    'cool thermal feel': '서늘한 느낌이 있고',
    'neutral thermal feel': '온도감이 무난하고',
  };

  return factors.map((factor) => translations[factor] ?? factor.replace(' materials', ' 재질이 느껴지고'));
}

function toKoreanElement(element: ElementKey): string {
  const mapping: Record<ElementKey, string> = {
    wood: '목',
    fire: '화',
    earth: '토',
    metal: '금',
    water: '수',
  };

  return mapping[element];
}

function proximityScore(actual: number, desired: number): number {
  return Math.max(0, 5 - Math.abs(actual - desired));
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}
