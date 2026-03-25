import { runEnvironmentTranslationEngine } from './environment';
import { runInterpretationEngine } from './interpretation';
import { generateExplanation, runRecommendationEngine } from './recommendation';
import { runSajuCoreEngine } from './saju-core';
import type {
  RecommendationPipelineOutput,
  SajuEngineInput,
} from './types';

export const SAMPLE_PIPELINE_INPUT: SajuEngineInput = {
  birth_date: '1995-03-14',
  birth_time: '14:30',
  calendar_type: 'solar',
  leap_month: false,
  gender: 'female',
  location: 'Seoul',
};

export function runRecommendationPipeline(input: SajuEngineInput): RecommendationPipelineOutput {
  const saju_core = runSajuCoreEngine(input);
  const interpretation = runInterpretationEngine(saju_core);
  const environment_translation = runEnvironmentTranslationEngine(interpretation);
  const recommendation = runRecommendationEngine(interpretation, environment_translation);
  const explanation = generateExplanation({
    lack: interpretation.layer_a.missing_elements,
    excess: interpretation.conclusion.avoid,
    environment: environment_translation.primary_needs,
  });

  return {
    saju_core,
    interpretation,
    environment_translation,
    recommendation,
    explanation,
  };
}

export const SAMPLE_PIPELINE_OUTPUT = runRecommendationPipeline(SAMPLE_PIPELINE_INPUT);
