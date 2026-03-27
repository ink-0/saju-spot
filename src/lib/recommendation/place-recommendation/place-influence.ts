import type {
  ActivityTag,
  ElementKey,
  ElementTraitDefinition,
  MaterialTag,
  PlaceAxisKey,
  PlaceInfluenceAxes,
  PlaceInfluenceProfile,
  PlaceRecord,
  StructureTag,
  TemperatureFeel,
  TimePreferenceTag,
} from '../types';

type AxisDelta = Partial<Record<PlaceAxisKey, number>>;

const AXIS_LIMIT = 2;

export const ELEMENT_TRAITS: Record<ElementKey, ElementTraitDefinition> = {
  wood: {
    label: 'Wood',
    core_keywords: ['growth', 'nature', 'upward movement'],
    direct_signals: ['parks', 'trees', 'forest trails', 'organic layouts'],
    environment_cues: ['high vegetation', 'natural materials', 'exploratory movement'],
  },
  fire: {
    label: 'Fire',
    core_keywords: ['brightness', 'heat', 'visibility'],
    direct_signals: ['plazas', 'nightlife', 'restaurants', 'observation decks'],
    environment_cues: ['high brightness', 'warm feel', 'crowd energy'],
  },
  earth: {
    label: 'Earth',
    core_keywords: ['stability', 'grounding', 'staying power'],
    direct_signals: ['palaces', 'museums', 'hotels', 'stone-heavy places'],
    environment_cues: ['stable pacing', 'rest-oriented use', 'grounded materials'],
  },
  metal: {
    label: 'Metal',
    core_keywords: ['structure', 'clarity', 'order'],
    direct_signals: ['modern buildings', 'finance districts', 'minimal interiors'],
    environment_cues: ['linear layouts', 'metal or glass', 'clear circulation'],
  },
  water: {
    label: 'Water',
    core_keywords: ['flow', 'cooling', 'reflection'],
    direct_signals: ['riversides', 'streams', 'waterfronts', 'quiet lounges'],
    environment_cues: ['cool feel', 'low stimulation', 'night suitability'],
  },
};

const MATERIAL_AXIS_MAP: Record<MaterialTag, AxisDelta> = {
  wood: { naturalness: 0.8, grounding: 0.2 },
  water: { thermal: -0.8, naturalness: 0.3, grounding: -0.6 },
  stone: { grounding: 0.9, naturalness: 0.1 },
  earth: { grounding: 1.1, naturalness: 0.2 },
  metal: { grounding: 0.7, naturalness: -0.6, brightness: 0.2 },
  glass: { brightness: 0.6, grounding: 0.2, naturalness: -0.5 },
};

const ACTIVITY_AXIS_MAP: Record<ActivityTag, AxisDelta> = {
  rest: { stimulation: -0.8, sociability: -0.3, grounding: 0.4 },
  explore: { stimulation: 0.8, sociability: 0.2, naturalness: 0.2 },
};

const TIME_AXIS_MAP: Record<TimePreferenceTag, AxisDelta> = {
  day: { brightness: 0.5, thermal: 0.2 },
  night: { brightness: -0.2, thermal: -0.2, sociability: -0.1 },
};

const TEMPERATURE_AXIS_MAP: Record<TemperatureFeel, AxisDelta> = {
  warm: { thermal: 1.4 },
  cool: { thermal: -1.4 },
  neutral: {},
};

const STRUCTURE_AXIS_MAP: Record<StructureTag, AxisDelta> = {
  organic: { naturalness: 1.1, grounding: -0.1 },
  linear: { grounding: 0.7, naturalness: -0.8, brightness: 0.3 },
  mixed: { grounding: 0.5, naturalness: 0.2 },
};

const EXPLICIT_ELEMENT_PRIOR = 2.4;

export function calculatePlaceInfluence(place: PlaceRecord): PlaceInfluenceProfile {
  const axes = calculatePlaceAxes(place);
  const explicitScores = createEmptyElementScores();
  const explanationFactors = collectObservableFactors(place);

  for (const element of place.tags.element) {
    explicitScores[element] += EXPLICIT_ELEMENT_PRIOR;
  }

  const axisScores = calculateElementScoresFromAxes(axes);
  const element_scores = normalizeElementScores(mergeElementScores(explicitScores, axisScores));
  const dominant_elements = getDominantElements(element_scores);

  return {
    axes,
    element_scores,
    dominant_elements,
    observable_traits: place.tags,
    explanation_factors: explanationFactors,
  };
}

export function calculatePlaceAxes(place: PlaceRecord): PlaceInfluenceAxes {
  const axes: PlaceInfluenceAxes = {
    thermal: 0,
    brightness: scaleCentered(place.tags.brightness),
    stimulation: scaleCentered(place.tags.crowd) * 0.7,
    sociability: scaleCentered(place.tags.crowd) * 0.5,
    naturalness: scaleCentered(place.tags.nature_ratio),
    grounding: 0,
  };

  applyAxisDelta(axes, TEMPERATURE_AXIS_MAP[place.tags.temperature_feel]);
  applyAxisDelta(axes, STRUCTURE_AXIS_MAP[place.tags.structure]);

  for (const material of place.tags.material) {
    applyAxisDelta(axes, MATERIAL_AXIS_MAP[material], 1 / place.tags.material.length);
  }

  for (const activity of place.tags.activity) {
    applyAxisDelta(axes, ACTIVITY_AXIS_MAP[activity], 1 / place.tags.activity.length);
  }

  for (const timePreference of place.tags.time_preference) {
    applyAxisDelta(axes, TIME_AXIS_MAP[timePreference], 1 / place.tags.time_preference.length);
  }

  axes.grounding += clamp((3 - place.tags.crowd) * 0.25, -0.6, 0.8);

  return {
    thermal: clamp(axes.thermal, -AXIS_LIMIT, AXIS_LIMIT),
    brightness: clamp(axes.brightness, -AXIS_LIMIT, AXIS_LIMIT),
    stimulation: clamp(axes.stimulation, -AXIS_LIMIT, AXIS_LIMIT),
    sociability: clamp(axes.sociability, -AXIS_LIMIT, AXIS_LIMIT),
    naturalness: clamp(axes.naturalness, -AXIS_LIMIT, AXIS_LIMIT),
    grounding: clamp(axes.grounding, -AXIS_LIMIT, AXIS_LIMIT),
  };
}

function calculateElementScoresFromAxes(axes: PlaceInfluenceAxes): Record<ElementKey, number> {
  const warm = positive(axes.thermal);
  const cool = positive(-axes.thermal);
  const bright = positive(axes.brightness);
  const active = positive(axes.stimulation);
  const quiet = positive(-axes.stimulation);
  const social = positive(axes.sociability);
  const privateFeel = positive(-axes.sociability);
  const organic = positive(axes.naturalness);
  const built = positive(-axes.naturalness);
  const grounded = positive(axes.grounding);
  const fluid = positive(-axes.grounding);

  return {
    wood: organic * 0.45 + active * 0.3 + bright * 0.25,
    fire: warm * 0.35 + bright * 0.3 + active * 0.2 + social * 0.15,
    earth: grounded * 0.5 + warm * 0.2 + quiet * 0.2 + organic * 0.1,
    metal: grounded * 0.4 + bright * 0.35 + quiet * 0.15 + built * 0.1,
    water: cool * 0.4 + quiet * 0.25 + privateFeel * 0.2 + fluid * 0.15,
  };
}

function normalizeElementScores(scores: Record<ElementKey, number>): Record<ElementKey, number> {
  const maxValue = Math.max(...Object.values(scores), 0.1);

  return {
    wood: roundScore((scores.wood / maxValue) * 5),
    fire: roundScore((scores.fire / maxValue) * 5),
    earth: roundScore((scores.earth / maxValue) * 5),
    metal: roundScore((scores.metal / maxValue) * 5),
    water: roundScore((scores.water / maxValue) * 5),
  };
}

function getDominantElements(scores: Record<ElementKey, number>): ElementKey[] {
  const maxValue = Math.max(...Object.values(scores));

  return (Object.entries(scores) as Array<[ElementKey, number]>)
    .filter(([, value]) => maxValue - value <= 0.75)
    .map(([element]) => element);
}

function collectObservableFactors(place: PlaceRecord): string[] {
  const factors: string[] = [];

  if (place.tags.nature_ratio >= 4) {
    factors.push('high vegetation');
  }

  if (place.tags.brightness >= 4) {
    factors.push('bright visibility');
  }

  if (place.tags.crowd >= 4) {
    factors.push('high crowd energy');
  }

  if (place.tags.crowd <= 2) {
    factors.push('low stimulation');
  }

  if (place.tags.material.length > 0) {
    factors.push(`${place.tags.material.join('/')} materials`);
  }

  factors.push(`${place.tags.structure} structure`);
  factors.push(`${place.tags.temperature_feel} thermal feel`);

  return factors;
}

function createEmptyElementScores(): Record<ElementKey, number> {
  return {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0,
  };
}

function mergeElementScores(
  left: Record<ElementKey, number>,
  right: Record<ElementKey, number>,
): Record<ElementKey, number> {
  return {
    wood: left.wood + right.wood,
    fire: left.fire + right.fire,
    earth: left.earth + right.earth,
    metal: left.metal + right.metal,
    water: left.water + right.water,
  };
}

function applyAxisDelta(target: PlaceInfluenceAxes, delta: AxisDelta, weight = 1) {
  for (const [axis, value] of Object.entries(delta) as Array<[PlaceAxisKey, number]>) {
    target[axis] += value * weight;
  }
}

function scaleCentered(value: number): number {
  return ((value - 2.5) / 2.5) * AXIS_LIMIT;
}

function positive(value: number): number {
  return Math.max(0, value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function roundScore(value: number): number {
  return Math.round(value * 100) / 100;
}
