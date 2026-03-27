import type {
  ActivityTag,
  ElementKey,
  EnvironmentTranslationOutput,
  InterpretationOutput,
  MaterialTag,
  StructureTag,
  TemperatureFeel,
  TimePreferenceTag,
} from '../types';

interface EnvironmentAccumulator {
  brightness: number;
  crowd: number;
  nature_ratio: number;
  material: MaterialTag[];
  time_preference: TimePreferenceTag[];
  activity: ActivityTag[];
  temperature_feel: TemperatureFeel[];
  structure: StructureTag[];
}

const ELEMENT_PROFILE: Record<ElementKey, Omit<EnvironmentAccumulator, 'material' | 'time_preference' | 'activity' | 'temperature_feel' | 'structure'> & {
  material: MaterialTag[];
  time_preference: TimePreferenceTag[];
  activity: ActivityTag[];
  temperature_feel: TemperatureFeel[];
  structure: StructureTag[];
}> = {
  wood: {
    brightness: 3,
    crowd: 2,
    nature_ratio: 5,
    material: ['wood'],
    time_preference: ['day'],
    activity: ['explore'],
    temperature_feel: ['neutral'],
    structure: ['organic'],
  },
  fire: {
    brightness: 5,
    crowd: 5,
    nature_ratio: 1,
    material: ['glass'],
    time_preference: ['day', 'night'],
    activity: ['explore'],
    temperature_feel: ['warm'],
    structure: ['linear'],
  },
  earth: {
    brightness: 3,
    crowd: 2,
    nature_ratio: 3,
    material: ['stone', 'earth'],
    time_preference: ['day'],
    activity: ['rest'],
    temperature_feel: ['neutral'],
    structure: ['mixed'],
  },
  metal: {
    brightness: 4,
    crowd: 2,
    nature_ratio: 1,
    material: ['metal', 'glass'],
    time_preference: ['day', 'night'],
    activity: ['explore'],
    temperature_feel: ['cool'],
    structure: ['linear'],
  },
  water: {
    brightness: 2,
    crowd: 1,
    nature_ratio: 4,
    material: ['water'],
    time_preference: ['night'],
    activity: ['rest'],
    temperature_feel: ['cool'],
    structure: ['organic'],
  },
};

export function runEnvironmentTranslationEngine(interpretation: InterpretationOutput): EnvironmentTranslationOutput {
  const accumulator = seedAccumulator();

  applyElement(accumulator, interpretation.conclusion.yongshin, 1.2);
  interpretation.conclusion.heeshin.forEach((element) => applyElement(accumulator, element, 0.8));
  interpretation.layer_a.missing_elements.forEach((element) => applyElement(accumulator, element, 0.6));

  if (interpretation.layer_b.climate_condition === 'cold') {
    accumulator.brightness += 1;
    accumulator.temperature_feel.unshift('warm');
  }

  if (interpretation.layer_b.climate_condition === 'hot') {
    accumulator.crowd -= 1;
    accumulator.temperature_feel.unshift('cool');
  }

  return {
    environment_profile: {
      brightness: clampScore(accumulator.brightness),
      crowd: clampScore(accumulator.crowd),
      nature_ratio: clampScore(accumulator.nature_ratio),
      material: unique(accumulator.material).slice(0, 3),
      time_preference: unique(accumulator.time_preference).slice(0, 2),
      activity: unique(accumulator.activity).slice(0, 2),
      temperature_feel: unique(accumulator.temperature_feel).slice(0, 2),
      structure: unique(accumulator.structure).slice(0, 2),
    },
    primary_needs: interpretation.conclusion.environment_need,
    tradeoffs: buildTradeoffs(interpretation),
  };
}

function seedAccumulator(): EnvironmentAccumulator {
  return {
    brightness: 2.5,
    crowd: 2.5,
    nature_ratio: 2.5,
    material: [],
    time_preference: [],
    activity: [],
    temperature_feel: [],
    structure: [],
  };
}

function applyElement(accumulator: EnvironmentAccumulator, element: ElementKey, weight: number) {
  const profile = ELEMENT_PROFILE[element];

  accumulator.brightness += (profile.brightness - 2.5) * weight * 0.6;
  accumulator.crowd += (profile.crowd - 2.5) * weight * 0.6;
  accumulator.nature_ratio += (profile.nature_ratio - 2.5) * weight * 0.6;
  accumulator.material.push(...profile.material);
  accumulator.time_preference.push(...profile.time_preference);
  accumulator.activity.push(...profile.activity);
  accumulator.temperature_feel.push(...profile.temperature_feel);
  accumulator.structure.push(...profile.structure);
}

function buildTradeoffs(interpretation: InterpretationOutput): string[] {
  const tradeoffs: string[] = [];

  if (interpretation.layer_b.day_master_strength === 'weak') {
    tradeoffs.push('Avoid highly stimulating places with high crowd and high brightness at the same time.');
  }

  if (interpretation.layer_b.climate_condition === 'hot') {
    tradeoffs.push('Avoid stacking heat with crowd-heavy indoor environments for long stays.');
  }

  if (interpretation.layer_b.climate_condition === 'cold') {
    tradeoffs.push('Avoid overly dark or isolating spaces when recovery is the primary goal.');
  }

  if (interpretation.layer_b.conflicts.some((conflict) => conflict.type === 'clash')) {
    tradeoffs.push('Favor places with clear wayfinding and pacing to reduce internal friction.');
  }

  return tradeoffs;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(5, Math.round(value)));
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}
