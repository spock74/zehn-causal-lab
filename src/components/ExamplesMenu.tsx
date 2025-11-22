import { useState } from 'react';
import { Library, ChevronDown, ChevronRight } from 'lucide-react';
import { createSimpsonsParadox, createColliderBias, createChain, createFork } from '../content/ExampleGraphs';
import { CausalGraph } from '../engine/Graph';

interface ExamplesMenuProps {
  onSelectGraph: (graph: CausalGraph) => void;
}

const examples = [
  { name: "Simpson's Paradox", factory: createSimpsonsParadox, desc: "Confounder bias example" },
  { name: "Collider Bias", factory: createColliderBias, desc: "Selection bias example" },
  { name: "Causal Chain", factory: createChain, desc: "Mediation (A -> B -> C)" },
  { name: "Common Cause (Fork)", factory: createFork, desc: "Confounding (A <- B -> C)" },
];

const ExamplesMenu = ({ onSelectGraph }: ExamplesMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative z-40">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
      >
        <Library size={16} />
        <span>Examples</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-950 border border-border rounded-xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            {examples.map((ex) => (
              <button
                key={ex.name}
                onClick={() => {
                  onSelectGraph(ex.factory());
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group"
              >
                <div className="text-sm font-medium text-foreground">
                  {ex.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {ex.desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamplesMenu;
