import { PLACE_DATASET } from './places';
import type {
  EnvironmentTranslationOutput,
  ExplanationInput,
  PlaceRecord,
  RecommendationBreakdown,
  RecommendationOutput,
  RecommendationResult,
  InterpretationOutput,
  UserPreferenceInput,
} from './types';

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

export function generateExplanation(input: ExplanationInput): string {
  const lackText = input.lack.length > 0 ? input.lack.join(', ') : 'no major missing element';
  const excessText = input.excess.length > 0 ? input.excess.join(', ') : 'no strongly excessive element';
  const environmentText = input.environment.join(', ');

  return `Current chart pressure shows a shortage around ${lackText} and over-concentration around ${excessText}. The recommended environments emphasize ${environmentText} because those conditions compensate for what is under-supplied while reducing the load from what is excessive. In practice, that means selecting places whose pace, material feel, and sensory profile help the user recover balance instead of adding more of the same stress pattern.`;
}

function scorePlace(
  place: PlaceRecord,
  interpretation: InterpretationOutput,
  environment: EnvironmentTranslationOutput,
  userPreference: UserPreferenceInput,
): RecommendationResult {
  const breakdown: RecommendationBreakdown = {
    missing_element_match: computeMissingElementMatch(place, interpretation),
    favorable_element_match: computeFavorableElementMatch(place, interpretation, environment),
    excess_element_control: computeExcessControl(place, interpretation),
    user_preference: computeUserPreference(place, userPreference),
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
    reason: buildReasons(place, interpretation, environment, breakdown),
    breakdown,
    tags: place.tags,
  };
}

function computeMissingElementMatch(place: PlaceRecord, interpretation: InterpretationOutput): number {
  const missing = interpretation.layer_a.missing_elements;
  if (missing.length === 0) {
    return 3;
  }

  const matched = missing.filter((element) => place.tags.element.includes(element)).length;
  return normalizeRatio(matched, missing.length);
}

function computeFavorableElementMatch(
  place: PlaceRecord,
  interpretation: InterpretationOutput,
  environment: EnvironmentTranslationOutput,
): number {
  let score = 0;
  const favorable = [interpretation.conclusion.yongshin, ...interpretation.conclusion.heeshin];
  const elementMatches = favorable.filter((element) => place.tags.element.includes(element)).length;
  score += normalizeRatio(elementMatches, favorable.length) * 0.5;
  score += proximityScore(place.tags.nature_ratio, environment.environment_profile.nature_ratio) * 0.2;
  score += proximityScore(place.tags.brightness, environment.environment_profile.brightness) * 0.15;
  score += proximityScore(place.tags.crowd, environment.environment_profile.crowd) * 0.15;

  return roundScore(score * 5);
}

function computeExcessControl(place: PlaceRecord, interpretation: InterpretationOutput): number {
  const excess = interpretation.conclusion.avoid;
  if (excess.length === 0) {
    return 3;
  }

  const conflicts = excess.filter((element) => place.tags.element.includes(element)).length;
  return roundScore(Math.max(0, 5 - normalizeRatio(conflicts, excess.length)));
}

function computeUserPreference(place: PlaceRecord, userPreference: UserPreferenceInput): number {
  let score = 2.5;

  if (userPreference.preferred_activity && userPreference.preferred_activity.some((activity) => place.tags.activity.includes(activity))) {
    score += 1;
  }

  if (userPreference.preferred_time && userPreference.preferred_time.some((time) => place.tags.time_preference.includes(time))) {
    score += 0.5;
  }

  if (userPreference.preferred_temperature && userPreference.preferred_temperature.includes(place.tags.temperature_feel)) {
    score += 0.5;
  }

  if (userPreference.preferred_structure && userPreference.preferred_structure.includes(place.tags.structure)) {
    score += 0.5;
  }

  if (userPreference.preferred_material && userPreference.preferred_material.some((material) => place.tags.material.includes(material))) {
    score += 0.5;
  }

  if (typeof userPreference.avoid_crowd_above === 'number' && place.tags.crowd > userPreference.avoid_crowd_above) {
    score -= 1.5;
  }

  return roundScore(Math.max(0, Math.min(5, score)));
}

function buildReasons(
  place: PlaceRecord,
  interpretation: InterpretationOutput,
  environment: EnvironmentTranslationOutput,
  breakdown: RecommendationBreakdown,
): string[] {
  const reasons: string[] = [];

  const matchedMissing = interpretation.layer_a.missing_elements.filter((element) => place.tags.element.includes(element));
  if (matchedMissing.length > 0) {
    reasons.push(`Supports missing chart elements: ${matchedMissing.join(', ')}.`);
  }

  if (place.tags.material.some((material) => environment.environment_profile.material.includes(material))) {
    reasons.push(`Material profile matches the recommended environment: ${place.tags.material.join(', ')}.`);
  }

  if (proximityScore(place.tags.crowd, environment.environment_profile.crowd) >= 4) {
    reasons.push(`Crowd intensity is close to the target level (${environment.environment_profile.crowd}/5).`);
  }

  if (!interpretation.conclusion.avoid.some((element) => place.tags.element.includes(element))) {
    reasons.push('Does not over-amplify the elements that are already excessive.');
  }

  reasons.push(`Scoring breakdown — missing:${breakdown.missing_element_match}, favorable:${breakdown.favorable_element_match}, control:${breakdown.excess_element_control}, preference:${breakdown.user_preference}.`);

  return reasons;
}

function proximityScore(actual: number, desired: number): number {
  return Math.max(0, 5 - Math.abs(actual - desired));
}

function normalizeRatio(matched: number, total: number): number {
  if (total === 0) {
    return 5;
  }

  return roundScore((matched / total) * 5);
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}
