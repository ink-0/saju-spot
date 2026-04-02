import type { ExplanationInput } from '../types';

export function generateExplanation(input: ExplanationInput): string {
  const lackText = input.lack.length > 0 ? input.lack.join(', ') : 'no major missing element';
  const excessText = input.excess.length > 0 ? input.excess.join(', ') : 'no strongly excessive element';
  const environmentText = input.environment.join(', ');

  return `Current chart pressure shows a shortage around ${lackText} and over-concentration around ${excessText}. The recommended environments emphasize ${environmentText} because those conditions compensate for what is under-supplied while reducing the load from what is excessive. In practice, that means selecting places whose pace, material feel, and sensory profile help the user recover balance instead of adding more of the same stress pattern.`;
}
