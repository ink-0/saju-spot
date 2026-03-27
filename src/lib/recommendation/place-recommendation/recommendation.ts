import { PLACE_DATASET } from './places';
import { calculatePlaceInfluence } from './place-influence';
import type {
  EnvironmentTranslationOutput,
  PlaceRecord,
  PlaceInfluenceProfile,
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
    .sort((left, right) => right.score - left.score)
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
  const breakdown: RecommendationBreakdown = {
    missing_element_match: computeMissingElementMatch(placeInfluence, interpretation),
    favorable_element_match: computeFavorableElementMatch(placeInfluence, interpretation, environment),
    excess_element_control: computeExcessControl(placeInfluence, interpretation),
    user_preference: computeUserPreference(placeInfluence, userPreference),
  };

  const score = roundScore(
    breakdown.missing_element_match * 0.5
      + breakdown.favorable_element_match * 0.3
      + breakdown.excess_element_control * 0.1
      + breakdown.user_preference * 0.1,
  );

  return {
    id: place.id,
    name: place.name,
    location: place.location,
    score,
    reason: buildReasons(place, placeInfluence, interpretation, environment, breakdown),
    breakdown,
    tags: place.tags,
  };
}

function computeMissingElementMatch(placeInfluence: PlaceInfluenceProfile, interpretation: InterpretationOutput): number {
  const missing = interpretation.layer_a.missing_elements;
  if (missing.length === 0) {
    return 3;
  }

  const total = missing.reduce((sum, element) => sum + placeInfluence.element_scores[element], 0);
  return roundScore(total / missing.length);
}

function computeFavorableElementMatch(
  placeInfluence: PlaceInfluenceProfile,
  interpretation: InterpretationOutput,
  environment: EnvironmentTranslationOutput,
): number {
  let score = 0;
  const favorable = [interpretation.conclusion.yongshin, ...interpretation.conclusion.heeshin];
  const totalElementScore = favorable.reduce((sum, element) => sum + placeInfluence.element_scores[element], 0);
  score += (totalElementScore / favorable.length) * 0.5;
  score += proximityScore(placeInfluence.observable_traits.nature_ratio, environment.environment_profile.nature_ratio) * 0.2;
  score += proximityScore(placeInfluence.observable_traits.brightness, environment.environment_profile.brightness) * 0.15;
  score += proximityScore(placeInfluence.observable_traits.crowd, environment.environment_profile.crowd) * 0.15;

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
  environment: EnvironmentTranslationOutput,
  breakdown: RecommendationBreakdown,
): string[] {
  const reasons: string[] = [];

  const matchedMissing = interpretation.layer_a.missing_elements.filter((element) => placeInfluence.element_scores[element] >= 3);
  if (matchedMissing.length > 0) {
    reasons.push(`Supports missing chart elements: ${matchedMissing.join(', ')}.`);
  }

  if (placeInfluence.observable_traits.material.some((material) => environment.environment_profile.material.includes(material))) {
    reasons.push(`Material profile matches the recommended environment: ${placeInfluence.observable_traits.material.join(', ')}.`);
  }

  if (proximityScore(placeInfluence.observable_traits.crowd, environment.environment_profile.crowd) >= 4) {
    reasons.push(`Crowd intensity is close to the target level (${environment.environment_profile.crowd}/5).`);
  }

  if (!interpretation.conclusion.avoid.some((element) => placeInfluence.element_scores[element] >= 3)) {
    reasons.push('Does not over-amplify the elements that are already excessive.');
  }

  if (placeInfluence.explanation_factors.length > 0) {
    reasons.push(`Observed place traits: ${placeInfluence.explanation_factors.slice(0, 3).join(', ')}.`);
  }

  reasons.push(`Scoring breakdown — missing:${breakdown.missing_element_match}, favorable:${breakdown.favorable_element_match}, control:${breakdown.excess_element_control}, preference:${breakdown.user_preference}.`);

  return reasons;
}

function proximityScore(actual: number, desired: number): number {
  return Math.max(0, 5 - Math.abs(actual - desired));
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}
