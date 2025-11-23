import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  applyNodeChanges,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CausalGraph } from '../engine/Graph';
import { InferenceEngine } from '../engine/Inference';
import CausalNode from './CausalNode';
import InterventionControls from './InterventionControls';
import ProbabilityPanel from './ProbabilityPanel';

interface GraphCanvasProps {
  graph: CausalGraph;
}

const nodeTypes = { causalNode: CausalNode };

const GraphCanvas = ({ graph }: GraphCanvasProps) => {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // Re-create engine when graph changes
  const [inferenceEngine, setInferenceEngine] = useState(() => new InferenceEngine(graph));

  useEffect(() => {
    setInferenceEngine(new InferenceEngine(graph));
  }, [graph]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [showProbPanel, setShowProbPanel] = useState(false);

  // Sync Engine -> UI
  const syncGraphToUI = useCallback(() => {
    const marginals = inferenceEngine.computeAllMarginals();
    console.log('Computed marginals:', marginals);
    
    const newNodes: Node[] = Array.from(graph.nodes.entries()).map(([id, data]) => ({
      id,
      type: 'causalNode',
      position: data.position,
      data: {
        label: data.variable.name,
        distribution: marginals[id],
        isObserved: data.isObserved,
        observedState: data.observedState,
        isIntervened: data.isIntervened,
        intervenedState: data.intervenedState,
        hasIntervenedParents: graph.hasIntervenedParents(id),
      },
    }));

    console.log('Graph nodes:', Array.from(graph.nodes.entries()));
    console.log('New ReactFlow nodes:', newNodes);

    const newEdges: Edge[] = graph.edges.map((e) => ({
      id: `${e.source}-${e.target}`,
      source: e.source,
      target: e.target,
      animated: true,
      style: { stroke: 'hsl(var(--muted-foreground))', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: 'hsl(var(--muted-foreground))',
      },
    }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [graph, inferenceEngine, setNodes, setEdges]);

  // Initial Load
  useEffect(() => {
    syncGraphToUI();
  }, [syncGraphToUI]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      // Update positions in engine
      changes.forEach(change => {
        if (change.type === 'position' && change.position) {
          const node = graph.nodes.get(change.id);
          if (node) {
            node.position = change.position;
          }
        }
      });
    },
    [setNodes, graph]
  );

  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        graph.addEdge(params.source, params.target);
        syncGraphToUI();
      }
    },
    [graph, syncGraphToUI]
  );

  const onSelectionChange = useCallback(({ nodes }: { nodes: Node[] }) => {
    if (nodes.length > 0) {
      setSelectedNodeId(nodes[0].id);
    } else {
      setSelectedNodeId(null);
    }
  }, []);

  const handleIntervene = useCallback((nodeId: string, state: string | null) => {
    graph.setIntervention(nodeId, state);
    syncGraphToUI();
  }, [graph, syncGraphToUI]);

  const handleObserve = useCallback((nodeId: string, state: string | null) => {
    graph.setObservation(nodeId, state);
    syncGraphToUI();
  }, [graph, syncGraphToUI]);

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    // Don't auto-open panel, let user choose via a button or double click?
    // For now, let's add a button in InterventionControls or just double click.
    // Let's use double click for Panel.
  }, []);

  const handleNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    setShowProbPanel(true);
  }, []);

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <div className="absolute inset-0 bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ maxZoom: 1 }}
        className="bg-background"
      >
        <Background color="hsl(var(--border))" gap={20} />
        <Controls />
      </ReactFlow>
      
      <InterventionControls 
        selectedNode={selectedNode}
        graph={graph}
        inferenceEngine={inferenceEngine}
        onIntervene={handleIntervene}
        onObserve={handleObserve}
      />

      {showProbPanel && (
        <ProbabilityPanel
          selectedNode={selectedNode}
          graph={graph}
          onUpdate={syncGraphToUI}
          onClose={() => setShowProbPanel(false)}
        />
      )}
    </div>
  );
};

export default GraphCanvas;
