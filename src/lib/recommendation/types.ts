export type CalendarType = 'solar' | 'lunar';
export type Gender = 'male' | 'female';
export type ElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water';
export type SeasonKey = 'spring' | 'summer' | 'autumn' | 'winter';
export type DayMasterStrength = 'strong' | 'balanced' | 'weak';
export type ClimateCondition = 'cold' | 'hot' | 'dry' | 'damp' | 'balanced';
export type ConflictType = 'combination' | 'clash' | 'punishment' | 'harm';
export type TimePreferenceTag = 'day' | 'night';
export type ActivityTag = 'rest' | 'explore';
export type TemperatureFeel = 'cool' | 'warm' | 'neutral';
export type StructureTag = 'linear' | 'organic' | 'mixed';
export type MaterialTag = 'metal' | 'wood' | 'stone' | 'water' | 'glass' | 'earth';

export interface SajuEngineInput {
  birth_date: string;
  birth_time: string;
  calendar_type: CalendarType;
  leap_month: boolean;
  gender: Gender;
  location: string;
}

export interface UserPreferenceInput {
  preferred_activity?: ActivityTag[];
  preferred_time?: TimePreferenceTag[];
  preferred_temperature?: TemperatureFeel[];
  preferred_structure?: StructureTag[];
  preferred_material?: MaterialTag[];
  avoid_crowd_above?: number;
}

export interface PillarValue {
  stem: string;
  branch: string;
}

export interface SajuCoreOutput {
  input: SajuEngineInput;
  normalized: {
    solar_date: string;
    solar_time: string;
    lunar_date: string;
    is_leap_month: boolean;
    timezone: string;
    longitude: number;
    time_corrected: boolean;
    corrected_time?: string;
  };
  pillars: {
    year: PillarValue;
    month: PillarValue;
    day: PillarValue;
    hour: PillarValue | null;
  };
  elements: Record<ElementKey, number>;
  seasonal_context: {
    saju_month: number;
    season: SeasonKey;
  };
}

export interface ConflictRecord {
  type: ConflictType;
  pair: [string, string];
  description: string;
}

export interface InterpretationLayerA {
  element_balance: Record<ElementKey, number>;
  seasonal_context: SajuCoreOutput['seasonal_context'];
  dominant_elements: ElementKey[];
  missing_elements: ElementKey[];
}

export interface InterpretationLayerB {
  day_master: ElementKey;
  day_master_strength: DayMasterStrength;
  climate_condition: ClimateCondition;
  conflicts: ConflictRecord[];
}

export interface InterpretationConclusion {
  yongshin: ElementKey;
  heeshin: ElementKey[];
  avoid: ElementKey[];
  environment_need: string[];
}

export interface InterpretationOutput {
  layer_a: InterpretationLayerA;
  layer_b: InterpretationLayerB;
  conclusion: InterpretationConclusion;
}

export interface EnvironmentProfile {
  brightness: number;
  crowd: number;
  nature_ratio: number;
  material: MaterialTag[];
  time_preference: TimePreferenceTag[];
  activity: ActivityTag[];
  temperature_feel: TemperatureFeel[];
  structure: StructureTag[];
}

export interface EnvironmentTranslationOutput {
  environment_profile: EnvironmentProfile;
  primary_needs: string[];
  tradeoffs: string[];
}

export interface PlaceRecord {
  id: string;
  name: string;
  location: string;
  summary: string;
  tags: {
    element: ElementKey[];
    nature_ratio: number;
    brightness: number;
    crowd: number;
    material: MaterialTag[];
    activity: ActivityTag[];
    time_preference: TimePreferenceTag[];
    temperature_feel: TemperatureFeel;
    structure: StructureTag;
  };
}

export interface RecommendationBreakdown {
  missing_element_match: number;
  favorable_element_match: number;
  excess_element_control: number;
  user_preference: number;
}

export interface RecommendationResult {
  id: string;
  name: string;
  location: string;
  score: number;
  reason: string[];
  breakdown: RecommendationBreakdown;
  tags: PlaceRecord['tags'];
}

export interface RecommendationOutput {
  recommendations: RecommendationResult[];
}

export interface ExplanationInput {
  lack: ElementKey[];
  excess: ElementKey[];
  environment: string[];
}

export interface RecommendationPipelineOutput {
  saju_core: SajuCoreOutput;
  interpretation: InterpretationOutput;
  environment_translation: EnvironmentTranslationOutput;
  recommendation: RecommendationOutput;
  explanation: string;
}
