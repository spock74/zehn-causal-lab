import { useState, useEffect } from 'react';
import type { Node } from 'reactflow';
import { X, Save, AlertCircle } from 'lucide-react';
import { CausalGraph } from '../engine/Graph';
import type { ProbabilityTable, State } from '../engine/Probability';

interface ProbabilityPanelProps {
  selectedNode: Node | null;
  graph: CausalGraph;
  onUpdate: () => void;
  onClose: () => void;
}

const ProbabilityPanel = ({ selectedNode, graph, onUpdate, onClose }: ProbabilityPanelProps) => {
  const [table, setTable] = useState<ProbabilityTable | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedNode) {
      const nodeData = graph.nodes.get(selectedNode.id);
      if (nodeData) {
        // Deep copy to avoid direct mutation
        setTable(JSON.parse(JSON.stringify(nodeData.distribution.table)));
        setError(null);
      }
    } else {
      setTable(null);
    }
  }, [selectedNode, graph]);

  if (!selectedNode || !table) return null;

  const nodeData = graph.nodes.get(selectedNode.id)!;
  const states = nodeData.variable.states;

  const handleProbChange = (key: string, state: State, value: string) => {
    const numVal = parseFloat(value);
    if (isNaN(numVal)) return;

    setTable(prev => {
      if (!prev) return null;
      return {
        ...prev,
        [key]: {
          ...prev[key],
          [state]: numVal
        }
      };
    });
  };

  const handleSave = () => {
    if (!table) return;

    // Validate
    for (const [key, dist] of Object.entries(table)) {
      const sum = Object.values(dist).reduce((a, b) => a + b, 0);
      if (Math.abs(sum - 1.0) > 0.01) {
        setError(`Probabilities for condition ${key} must sum to 1.0 (current: ${sum.toFixed(2)})`);
        return;
      }
    }

    // Update graph
    nodeData.distribution.updateTable(table);
    onUpdate();
    setError(null);
  };

  // Helper to format parent condition string
  const formatCondition = (jsonKey: string) => {
    const condition = JSON.parse(jsonKey);
    if (Object.keys(condition).length === 0) return "Prior (No Parents)";
    return Object.entries(condition)
      .map(([pid, state]) => `${graph.nodes.get(pid)?.variable.name}=${state}`)
      .join(', ');
  };

  return (
    <div className="absolute bottom-4 right-4 w-96 bg-card text-card-foreground border border-border rounded-xl overflow-hidden flex flex-col max-h-[50vh] transition-all duration-300 shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex justify-between items-center">
        <h3 className="font-semibold text-foreground">Probability Table: {nodeData.variable.name}</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto">
        {error && (
          <div className="mb-4 p-3 rounded bg-destructive/10 border border-destructive text-sm text-destructive flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-6">
          {Object.entries(table).map(([key, dist]) => (
            <div key={key} className="space-y-2">
              <div className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-1 rounded border border-border/50">
                {formatCondition(key)}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {states.map(state => (
                  <div key={state} className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground w-16 truncate" title={state}>{state}</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={dist[state]}
                      onChange={(e) => handleProbChange(key, state, e.target.value)}
                      className="flex-1 bg-background border border-input rounded px-2 py-1 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-all shadow-sm"
        >
          <Save size={16} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default ProbabilityPanel;
