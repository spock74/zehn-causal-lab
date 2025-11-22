import type { Variable } from './Probability';
import { DiscreteDistribution } from './Probability';

export interface NodeData {
  variable: Variable;
  distribution: DiscreteDistribution;
  position: { x: number; y: number };
  isObserved?: boolean;
  observedState?: string;
  isIntervened?: boolean;
  intervenedState?: string;
}

export interface EdgeData {
  source: string;
  target: string;
}

export class CausalGraph {
  nodes: Map<string, NodeData>;
  edges: EdgeData[];

  constructor() {
    this.nodes = new Map();
    this.edges = [];
  }

  addNode(id: string, name: string, states: string[] = ['True', 'False'], position = { x: 0, y: 0 }) {
    if (this.nodes.has(id)) return;
    
    const variable: Variable = { id, name, states };
    const distribution = new DiscreteDistribution(variable, []);
    
    this.nodes.set(id, {
      variable,
      distribution,
      position
    });
  }

  addEdge(sourceId: string, targetId: string) {
    if (this.edges.some(e => e.source === sourceId && e.target === targetId)) return;
    if (sourceId === targetId) return; // No self-loops
    
    // Check for cycles
    if (this.detectCycle(sourceId, targetId)) {
      console.warn('Cycle detected, edge rejected');
      return;
    }

    this.edges.push({ source: sourceId, target: targetId });
    this.updateNodeParents(targetId);
  }

  removeEdge(sourceId: string, targetId: string) {
    this.edges = this.edges.filter(e => !(e.source === sourceId && e.target === targetId));
    this.updateNodeParents(targetId);
  }

  private updateNodeParents(nodeId: string) {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    const parentIds = this.edges.filter(e => e.target === nodeId).map(e => e.source);
    const parents = parentIds.map(id => this.nodes.get(id)!.variable);
    
    // Re-initialize distribution with new parents (preserves old probs if possible? No, structure changed)
    // For simplicity in this version, we reset to uniform when structure changes.
    // A better version would try to map old params to new ones.
    node.distribution = new DiscreteDistribution(node.variable, parents);
  }

  private detectCycle(source: string, target: string): boolean {
    // DFS to see if source is reachable from target
    const visited = new Set<string>();
    const stack = [target];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === source) return true;
      if (visited.has(current)) continue;
      visited.add(current);

      const children = this.edges.filter(e => e.source === current).map(e => e.target);
      stack.push(...children);
    }
    return false;
  }

  getTopologicalSort(): string[] {
    const visited = new Set<string>();
    const stack: string[] = [];
    const tempVisited = new Set<string>(); // For cycle detection during sort (though we prevent cycles on add)

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      if (tempVisited.has(nodeId)) throw new Error("Graph has cycle");
      
      tempVisited.add(nodeId);
      
      const children = this.edges.filter(e => e.source === nodeId).map(e => e.target);
      children.forEach(visit);
      
      tempVisited.delete(nodeId);
      visited.add(nodeId);
      stack.push(nodeId); // Post-order
    };

    this.nodes.forEach((_, id) => {
      if (!visited.has(id)) visit(id);
    });

    return stack.reverse(); // Reverse post-order is topological sort
  }

  setIntervention(nodeId: string, state: string | null) {
    const node = this.nodes.get(nodeId);
    if (!node) return;
    
    if (state === null) {
      node.isIntervened = false;
      node.intervenedState = undefined;
    } else {
      node.isIntervened = true;
      node.intervenedState = state;
    }
  }

  setObservation(nodeId: string, state: string | null) {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    if (state === null) {
      node.isObserved = false;
      node.observedState = undefined;
    } else {
      node.isObserved = true;
      node.observedState = state;
    }
  }

  // Get parent node IDs for a given node
  getParents(nodeId: string): string[] {
    return this.edges.filter(e => e.target === nodeId).map(e => e.source);
  }

  // Get intervened parent nodes
  getIntervenedParents(nodeId: string): Array<{ id: string; state: string; name: string }> {
    const parentIds = this.getParents(nodeId);
    const intervenedParents: Array<{ id: string; state: string; name: string }> = [];
    
    for (const parentId of parentIds) {
      const parent = this.nodes.get(parentId);
      if (parent && parent.isIntervened && parent.intervenedState) {
        intervenedParents.push({
          id: parentId,
          state: parent.intervenedState,
          name: parent.variable.name
        });
      }
    }
    
    return intervenedParents;
  }

  // Check if a node has any intervened parents
  hasIntervenedParents(nodeId: string): boolean {
    return this.getIntervenedParents(nodeId).length > 0;
  }
}
