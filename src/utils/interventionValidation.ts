import type { CausalGraph } from '../engine/Graph';
import type { InferenceEngine } from '../engine/Inference';
import type { State } from '../engine/Probability';

export interface InterventionWarning {
  hasWarning: boolean;
  intervenedParents: Array<{ id: string; name: string; state: string }>;
  strongDetermination: boolean;
  probabilities?: Record<State, number>;
  dominantState?: string;
  dominantProbability?: number;
}

/**
 * Check if intervening on a node would conflict with upstream interventions
 */
export function checkInterventionWarning(
  nodeId: string,
  proposedState: string,
  graph: CausalGraph,
  inferenceEngine: InferenceEngine
): InterventionWarning {
  const intervenedParents = graph.getIntervenedParents(nodeId);
  
  if (intervenedParents.length === 0) {
    return { hasWarning: false, intervenedParents: [], strongDetermination: false };
  }

  // Compute what the node's distribution would be given the intervened parents
  const node = graph.nodes.get(nodeId);
  if (!node) {
    return { hasWarning: false, intervenedParents: [], strongDetermination: false };
  }

  // Build parent states from interventions
  const parentStates: Record<string, State> = {};
  for (const parent of intervenedParents) {
    parentStates[parent.id] = parent.state;
  }

  // Get the conditional probability distribution
  const probabilities: Record<State, number> = {};
  let sum = 0;
  
  for (const state of node.variable.states) {
    const prob = node.distribution.getProbability(state, parentStates);
    probabilities[state] = prob;
    sum += prob;
  }

  // Find the dominant state (highest probability)
  let dominantState = '';
  let dominantProbability = 0;
  
  for (const [state, prob] of Object.entries(probabilities)) {
    if (prob > dominantProbability) {
      dominantProbability = prob;
      dominantState = state;
    }
  }

  // Strong determination if one state has >90% probability
  const strongDetermination = dominantProbability > 0.9;

  // Warning if:
  // 1. There are intervened parents AND
  // 2. Either strong determination OR proposed state conflicts with dominant state
  const hasWarning = strongDetermination || (proposedState !== dominantState && dominantProbability > 0.7);

  return {
    hasWarning,
    intervenedParents,
    strongDetermination,
    probabilities,
    dominantState,
    dominantProbability
  };
}

/**
 * Generate an educational explanation for the warning
 */
export function generateWarningMessage(warning: InterventionWarning, nodeName: string, proposedState: string): string {
  if (!warning.hasWarning) return '';

  const parentsList = warning.intervenedParents.map(p => `${p.name}=${p.state}`).join(', ');
  
  if (warning.strongDetermination) {
    return `The parent variable${warning.intervenedParents.length > 1 ? 's' : ''} (${parentsList}) strongly determine${warning.intervenedParents.length === 1 ? 's' : ''} ${nodeName}.\n\n` +
           `Given the current interventions, ${nodeName} has a ${(warning.dominantProbability! * 100).toFixed(0)}% probability of being "${warning.dominantState}".\n\n` +
           `Your proposed intervention do(${nodeName}=${proposedState}) will override this causal effect, which may not reflect realistic scenarios.`;
  }

  return `The parent variable${warning.intervenedParents.length > 1 ? 's' : ''} (${parentsList}) influence${warning.intervenedParents.length === 1 ? 's' : ''} ${nodeName}.\n\n` +
         `Given the current interventions, ${nodeName} is ${(warning.dominantProbability! * 100).toFixed(0)}% likely to be "${warning.dominantState}".\n\n` +
         `Intervening on ${nodeName} while its parents are already intervened creates an unusual scenario.`;
}
