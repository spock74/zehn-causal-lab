import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import { AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

// Data passed to the node
export interface CausalNodeData {
  label: string;
  distribution: Record<string, number>; // State -> Probability
  isObserved?: boolean;
  observedState?: string;
  isIntervened?: boolean;
  intervenedState?: string;
  hasIntervenedParents?: boolean;
}

const CausalNode = ({ data, selected }: NodeProps<CausalNodeData>) => {
  const chartData = data.distribution 
    ? Object.entries(data.distribution).map(([state, prob]) => ({
        name: state,
        prob: prob,
      }))
    : [];

  return (
    <Card
      className={clsx(
        'min-w-[180px] transition-all duration-300 overflow-hidden',
        selected ? 'ring-2 ring-primary shadow-lg' : 'shadow-md',
        data.isIntervened ? 'bg-destructive/10 border-destructive' : 'bg-card'
      )}
    >
      {/* Header */}
      <div className={clsx(
        "px-3 py-2 text-sm font-semibold flex justify-between items-center border-b gap-2",
        data.isIntervened ? "text-destructive" : "text-card-foreground"
      )}>
        <div className="flex items-center gap-1">
          <span>{data.label}</span>
          {data.hasIntervenedParents && !data.isIntervened && (
            <div title="This node has intervened parents">
              <AlertTriangle 
                size={14} 
                className="text-amber-500" 
              />
            </div>
          )}
        </div>
        <div className="flex gap-1">
          {data.isIntervened && <Badge variant="destructive" className="text-[10px] h-5 px-1">DO</Badge>}
          {data.isObserved && <Badge variant="secondary" className="text-[10px] h-5 px-1 text-accent-foreground">OBS</Badge>}
        </div>
      </div>

      {/* Histogram */}
      <div className="h-24 w-full p-2 bg-muted/20">
        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={50}>
          <BarChart data={chartData}>
            <XAxis 
              dataKey="name" 
              hide 
            />
            <YAxis hide domain={[0, 1]} />
            <Bar dataKey="prob" radius={[2, 2, 0, 0]} animationDuration={500}>
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    data.isIntervened && entry.name === data.intervenedState ? '#ef4444' :
                    data.isObserved && entry.name === data.observedState ? '#06b6d4' :
                    '#6366f1'
                  }
                  fillOpacity={
                    (data.isIntervened && entry.name !== data.intervenedState) || 
                    (data.isObserved && entry.name !== data.observedState) ? 0.3 : 0.9
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Footer */}
      <div className="px-3 py-1 text-[10px] text-muted-foreground flex justify-between bg-muted/40">
        {chartData.map((d) => (
          <span key={d.name}>{d.name}: {(d.prob * 100).toFixed(0)}%</span>
        ))}
      </div>

      <Handle type="target" position={Position.Top} className="!bg-muted-foreground !w-3 !h-3" />
      <Handle type="source" position={Position.Bottom} className="!bg-muted-foreground !w-3 !h-3" />
    </Card>
  );
};

export default memo(CausalNode);
