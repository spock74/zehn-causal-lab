export type State = string;

export interface Variable {
  id: string;
  name: string;
  states: State[];
}

// A probability table maps a combination of parent states to a probability distribution over the child states.
// Key: JSON.stringify({ parent1: stateA, parent2: stateB }) -> Value: { childState1: 0.2, childState2: 0.8 }
export type ProbabilityTable = Record<string, Record<State, number>>;

export class DiscreteDistribution {
  variable: Variable;
  parents: Variable[];
  table: ProbabilityTable;

  constructor(variable: Variable, parents: Variable[] = []) {
    this.variable = variable;
    this.parents = parents;
    this.table = this.initializeTable();
  }

  // Initialize uniform distribution
  private initializeTable(): ProbabilityTable {
    const table: ProbabilityTable = {};
    const parentCombinations = this.generateCombinations(this.parents);

    parentCombinations.forEach(combo => {
      const key = JSON.stringify(combo);
      const prob = 1.0 / this.variable.states.length;
      table[key] = {};
      this.variable.states.forEach(state => {
        table[key][state] = prob;
      });
    });

    return table;
  }

  private generateCombinations(vars: Variable[]): Record<string, State>[] {
    if (vars.length === 0) return [{}];
    
    const first = vars[0];
    const rest = vars.slice(1);
    const restCombinations = this.generateCombinations(rest);
    
    const combinations: Record<string, State>[] = [];
    
    first.states.forEach(state => {
      restCombinations.forEach(combo => {
        combinations.push({ [first.id]: state, ...combo });
      });
    });
    
    return combinations;
  }

  getProbability(targetState: State, parentStates: Record<string, State> = {}): number {
    // Filter parentStates to only include actual parents
    const relevantParents: Record<string, State> = {};
    this.parents.forEach(p => {
      if (parentStates[p.id]) {
        relevantParents[p.id] = parentStates[p.id];
      } else {
        // Default to first state if missing (should not happen in valid inference)
        relevantParents[p.id] = p.states[0]; 
      }
    });

    const key = JSON.stringify(relevantParents);
    return this.table[key]?.[targetState] ?? 0;
  }

  updateTable(newTable: ProbabilityTable) {
    // Validate probabilities sum to 1
    // For now, we assume the UI handles validation or we normalize
    this.table = newTable;
  }
}
