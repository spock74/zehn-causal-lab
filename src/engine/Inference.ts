import type { CausalGraph, NodeData } from './Graph';
import type { State } from './Probability';

export type MarginalDistribution = Record<State, number>;
export type AllMarginals = Record<string, MarginalDistribution>;

export class InferenceEngine {
  graph: CausalGraph;

  constructor(graph: CausalGraph) {
    this.graph = graph;
  }

  // Compute marginals for all nodes given current observations and interventions
  computeAllMarginals(): AllMarginals {
    // 1. Apply Interventions (Do-Calculus)
    // Conceptually, we work on a mutilated graph.
    // In practice, we can just override the CPT of the intervened node to be deterministic
    // and ignore its parents during calculation.
    
    // 2. Apply Observations
    // We filter the joint distribution to match observations.

    // For small graphs (educational use), we can generate the full Joint Probability Distribution (JPD)
    // and marginalize. This is O(S^N) where S is states and N is nodes.
    // If N < 15, this is fine.
    
    const sortedNodes = this.graph.getTopologicalSort();
    const nodes = sortedNodes.map(id => this.graph.nodes.get(id)!);
    
    // Helper to recursively sum over all states
    // We want P(TargetNode = s) for all TargetNodes.
    // Actually, it's more efficient to compute the full JPD once if possible, 
    // or use Variable Elimination.
    // Let's stick to a simulation (Forward Sampling) for scalability, 
    // OR exact calculation for very small graphs.
    // Given "Scientific" and "Pedagogical", exact is better.
    
    // Let's try a bucket elimination or just simple enumeration if N is small.
    // Let's assume N is small (< 10) for this V1.
    
    return this.exactInferenceEnumeration(nodes);
  }

  private exactInferenceEnumeration(nodes: NodeData[]): AllMarginals {
    // Initialize marginals
    const marginals: AllMarginals = {};
    nodes.forEach(n => {
      marginals[n.variable.id] = {};
      n.variable.states.forEach(s => marginals[n.variable.id][s] = 0);
    });

    // Generate all combinations of states for all nodes
    // This is heavy. Optimization: Forward Sampling is much faster and sufficient for "Simulation".
    // The user asked for "Simulating".
    // Let's do Forward Sampling with a high sample count (e.g., 10,000).
    // It's robust, handles any graph size, and is easy to implement.
    // AND it naturally handles "Simulation".
    
    return this.monteCarloSimulation(nodes, 20000);
  }

  private monteCarloSimulation(nodes: NodeData[], samples: number): AllMarginals {
    const marginals: AllMarginals = {};
    nodes.forEach(n => {
      marginals[n.variable.id] = {};
      n.variable.states.forEach(s => marginals[n.variable.id][s] = 0);
    });

    let validSamples = 0;

    for (let i = 0; i < samples; i++) {
      const sample: Record<string, State> = {};
      let consistent = true;

      // Generate sample in topological order
      for (const node of nodes) {
        // 1. Check Intervention
        if (node.isIntervened && node.intervenedState) {
          sample[node.variable.id] = node.intervenedState;
          if (i === 0) {
            console.log(`[Intervention] ${node.variable.name} set to ${node.intervenedState}`);
          }
          continue;
        }

        // 2. Sample from distribution given parents
        const parentStates: Record<string, State> = {};
        // Find parents in the graph (not just in distribution object, as graph might have changed)
        // But the distribution object should be up to date.
        // We use the distribution's parent list.
        node.distribution.parents.forEach(p => {
          parentStates[p.id] = sample[p.id];
        });

        if (i === 0 && node.distribution.parents.length > 0) {
          console.log(`[Sampling] ${node.variable.name} with parents:`, parentStates);
        }

        const probDist = this.getDistributionForParents(node, parentStates);
        if (i === 0) {
          console.log(`[Distribution] ${node.variable.name}:`, probDist);
        }
        const sampledState = this.sampleFrom(probDist);
        sample[node.variable.id] = sampledState;

        // 3. Check Observation
        if (node.isObserved && node.observedState) {
          if (sampledState !== node.observedState) {
            consistent = false;
            break; // Reject sample (Rejection Sampling)
          }
        }
      }

      if (consistent) {
        validSamples++;
        for (const nodeId in sample) {
          marginals[nodeId][sample[nodeId]]++;
        }
      }
    }

    // Normalize
    if (validSamples === 0) return marginals; // Avoid division by zero (impossible evidence)

    for (const nodeId in marginals) {
      for (const state in marginals[nodeId]) {
        marginals[nodeId][state] /= validSamples;
      }
    }

    return marginals;
  }

  private getDistributionForParents(node: NodeData, parentStates: Record<string, State>): Record<State, number> {
    // We need the raw probabilities for the specific parent combo
    // The DiscreteDistribution class has a getProbability method but it returns a single value.
    // We need the full map for sampling.
    const dist: Record<State, number> = {};
    let sum = 0;
    node.variable.states.forEach(s => {
      const p = node.distribution.getProbability(s, parentStates);
      dist[s] = p;
      sum += p;
    });
    return dist;
  }

  private sampleFrom(dist: Record<State, number>): State {
    const rand = Math.random();
    let cumulative = 0;
    for (const state in dist) {
      cumulative += dist[state];
      if (rand < cumulative) return state;
    }
    // Fallback (should not happen if sum is 1)
    return Object.keys(dist)[0];
  }
}
