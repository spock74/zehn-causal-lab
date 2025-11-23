import { useState } from 'react';
import type { Node } from 'reactflow';
import { X, Eye, Zap } from 'lucide-react';
import { InterventionWarningDialog } from './InterventionWarningDialog';
import { checkInterventionWarning, type InterventionWarning } from '../utils/interventionValidation';
import type { CausalGraph } from '../engine/Graph';
import type { InferenceEngine } from '../engine/Inference';
import { cn } from '../lib/utils';

interface InterventionControlsProps {
  selectedNode: Node | null;
  graph: CausalGraph;
  inferenceEngine: InferenceEngine;
  onIntervene: (nodeId: string, state: string | null) => void;
  onObserve: (nodeId: string, state: string | null) => void;
}

const InterventionControls = ({ 
  selectedNode, 
  graph,
  onIntervene, 
  onObserve 
}: InterventionControlsProps) => {
  const [activeTab, setActiveTab] = useState<'observe' | 'intervene'>('observe');
  const [warningDialog, setWarningDialog] = useState<{
    open: boolean;
    warning: InterventionWarning | null;
    proposedState: string | null;
  }>({
    open: false,
    warning: null,
    proposedState: null
  });

  if (!selectedNode) {
    return (
      <div className="absolute top-4 right-4 w-64 bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
        Select a node to perform actions.
      </div>
    );
  }

  const { label, distribution, isIntervened, intervenedState, isObserved, observedState } = selectedNode.data;
  const states = Object.keys(distribution);

  const handleInterventionClick = (state: string, isActive: boolean) => {
    const newState = isActive ? null : state;
    
    // If removing intervention or observing, no warning needed
    if (activeTab === 'observe' || newState === null) {
      if (activeTab === 'intervene') {
        onIntervene(selectedNode.id, newState);
      } else {
        onObserve(selectedNode.id, newState);
      }
      return;
    }

    // Check for intervention warning
    const warning = checkInterventionWarning(selectedNode.id, state, graph);
    
    if (warning.hasWarning) {
      setWarningDialog({
        open: true,
        warning,
        proposedState: state
      });
    } else {
      onIntervene(selectedNode.id, state);
    }
  };

  const handleWarningContinue = () => {
    if (warningDialog.proposedState) {
      onIntervene(selectedNode.id, warningDialog.proposedState);
    }
    setWarningDialog({ open: false, warning: null, proposedState: null });
  };

  const handleWarningCancel = () => {
    setWarningDialog({ open: false, warning: null, proposedState: null });
  };

  return (
    <>
      <div className="absolute top-4 right-4 w-72 bg-white dark:bg-slate-950 border border-border rounded-xl overflow-hidden flex flex-col transition-all duration-300 shadow-lg">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-slate-100 dark:bg-slate-900 flex justify-between items-center">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">{label}</h3>
          <div className="flex gap-1">
            <button 
              onClick={() => setActiveTab('observe')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                activeTab === 'observe' ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
              )}
              title="Observe (Evidence)"
            >
              <Eye size={16} />
            </button>
            <button 
              onClick={() => setActiveTab('intervene')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                activeTab === 'intervene' ? "bg-destructive text-destructive-foreground" : "text-muted-foreground hover:bg-destructive/50"
              )}
              title="Intervene (Do-Operator)"
            >
              <Zap size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-3">
          <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
            {activeTab === 'intervene' ? 'Apply Do-Operator' : 'Set Observation'}
          </div>
          
          <div className="flex flex-col gap-2">
            {states.map((state: string) => {
              const isActive = activeTab === 'intervene' 
                ? isIntervened && intervenedState === state
                : isObserved && observedState === state;

              return (
                <button
                  key={state}
                  onClick={() => handleInterventionClick(state, isActive)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-all flex justify-between items-center border",
                    isActive 
                      ? (activeTab === 'intervene' 
                          ? "bg-destructive/20 border-destructive text-destructive" 
                          : "bg-accent/20 border-accent text-accent-foreground")
                      : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <span>{state}</span>
                  {isActive && <X size={14} />}
                </button>
              );
            })}
          </div>

          {activeTab === 'intervene' && (
            <div className="mt-2 p-2 rounded bg-destructive/10 border border-destructive/20 text-[10px] text-destructive leading-tight">
              <strong>Warning:</strong> Intervening severs all incoming causal links to this node.
            </div>
          )}
        </div>
      </div>

      {warningDialog.warning && (
        <InterventionWarningDialog
          open={warningDialog.open}
          onOpenChange={(open) => !open && handleWarningCancel()}
          nodeName={label}
          proposedState={warningDialog.proposedState || ''}
          warning={warningDialog.warning}
          onContinue={handleWarningContinue}
          onCancel={handleWarningCancel}
        />
      )}
    </>
  );
};

export default InterventionControls;
