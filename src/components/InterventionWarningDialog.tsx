import { AlertTriangle, Lightbulb, TrendingUp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import type { InterventionWarning } from '../utils/interventionValidation';
import { cn } from '../lib/utils';

interface InterventionWarningDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodeName: string;
  proposedState: string;
  warning: InterventionWarning;
  onContinue: () => void;
  onCancel: () => void;
}

export function InterventionWarningDialog({
  open,
  onOpenChange,
  nodeName,
  proposedState,
  warning,
  onContinue,
  onCancel,
}: InterventionWarningDialogProps) {
  if (!warning.hasWarning) return null;

  const parentsList = warning.intervenedParents.map(p => `${p.name}=${p.state}`).join(', ');

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-xl">
              Upstream Intervention Detected
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base space-y-4 pt-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="font-medium text-slate-900 dark:text-slate-100">Current Situation:</p>
              <p className="text-slate-700 dark:text-slate-300">
                The parent variable{warning.intervenedParents.length > 1 ? 's' : ''}{' '}
                <span className="font-mono bg-background px-2 py-0.5 rounded border border-border">
                  {parentsList}
                </span>{' '}
                {warning.intervenedParents.length > 1 ? 'are' : 'is'} currently intervened.
              </p>
            </div>

            {warning.probabilities && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <p className="font-medium text-slate-900 dark:text-slate-100">Causal Effect:</p>
                </div>
                <p className="text-slate-700 dark:text-slate-300">
                  Given the current interventions, <span className="font-semibold text-slate-900 dark:text-slate-100">{nodeName}</span> has:
                </p>
                <div className="space-y-1 pl-4">
                  {Object.entries(warning.probabilities).map(([state, prob]) => (
                    <div key={state} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className={cn(
                        "text-slate-700 dark:text-slate-300",
                        state === warning.dominantState ? 'font-semibold text-slate-900 dark:text-slate-100' : ''
                      )}>
                        {(prob * 100).toFixed(1)}% probability of being "{state}"
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-500" />
                <p className="font-medium text-slate-900 dark:text-slate-100">Educational Note:</p>
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Your proposed intervention <span className="font-mono bg-background px-2 py-0.5 rounded border border-border">do({nodeName}={proposedState})</span> will{' '}
                <span className="font-semibold text-slate-900 dark:text-slate-100">override</span> the causal effect from the parent{warning.intervenedParents.length > 1 ? 's' : ''}.
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                In causal inference, we typically intervene on <span className="font-semibold text-slate-900 dark:text-slate-100">root causes</span> rather than their effects. 
                Intervening on both a parent and its child can create unrealistic scenarios.
              </p>
            </div>

            <div className="text-sm text-muted-foreground italic">
              💡 Tip: Try removing the parent intervention first, or experiment with this to see how interventions override causal relationships.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onContinue} className="bg-amber-500 hover:bg-amber-600">
            Continue Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
