---
name: reactflow
description: Build interactive node-based visualizations for envelope chains using ReactFlow with custom nodes, edges, and dark theme
user-invocable: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# ReactFlow Development

Create interactive flow visualizations for the Envelope System using ReactFlow.

## Works With

| Skill      | Load when                                                                                    |
|------------|----------------------------------------------------------------------------------------------|
| `/react19` | Custom nodes/edges are React components — ref-as-prop, transitions for non-blocking updates.  |
| `/typedb`  | Edge weights render `path.strength - path.resistance`; query highways from TypeDB for layout. |
| `/signal`  | Every node/edge click emits `ui:graph:<action>` — graph interactions feed pheromone.          |
| `/astro`   | Graph pages are Astro routes — hydrate with `client:only="react"` (canvas can't SSR).        |
| `/shadcn`  | Side panels, node detail sheets, toolbars — shadcn primitives on dark-theme tokens.           |

## When to Use This Skill

- Visualize envelope chains as node graphs
- Create custom node types for agents and envelopes
- Build interactive flow editors
- Implement animated edge connections
- Add pan, zoom, and minimap features

## Installation

```bash
bun add @xyflow/react
```

## Core Setup

```tsx
// src/components/flow/FlowCanvas.tsx
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AgentNode } from './nodes/AgentNode';
import { EnvelopeNode } from './nodes/EnvelopeNode';

// Register custom node types
const nodeTypes = {
  agent: AgentNode,
  envelope: EnvelopeNode,
};

export function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="h-full w-full bg-[#0a0a0f]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        className="bg-[#0a0a0f]"
      >
        <Background color="#1e293b" gap={20} />
        <Controls className="bg-[#0f0f14] border-[#1e293b]" />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'agent') return '#3b82f6';
            return '#22c55e';
          }}
          className="bg-[#0f0f14] border-[#1e293b]"
        />
      </ReactFlow>
    </div>
  );
}
```

## Custom Nodes

### Agent Node

```tsx
// src/components/flow/nodes/AgentNode.tsx
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

interface AgentNodeData {
  name: string;
  status: 'ready' | 'waiting' | 'idle' | 'error';
  actionCount: number;
}

const statusColors = {
  ready: 'bg-green-500',
  waiting: 'bg-amber-500 animate-pulse',
  idle: 'bg-slate-500',
  error: 'bg-red-500',
};

export function AgentNode({ data }: NodeProps<AgentNodeData>) {
  return (
    <div className="px-4 py-3 bg-[#0f0f14] border border-[#1e293b] rounded-lg min-w-[150px]">
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-500 !w-3 !h-3"
      />

      {/* Content */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2 h-2 rounded-full ${statusColors[data.status]}`} />
        <span className="font-medium text-white">{data.name}</span>
      </div>

      <div className="text-xs text-slate-400">
        {data.actionCount} actions
      </div>

      {/* Output handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-green-500 !w-3 !h-3"
      />
    </div>
  );
}
```

### Envelope Node

```tsx
// src/components/flow/nodes/EnvelopeNode.tsx
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Badge } from '@/components/ui/badge';

interface EnvelopeNodeData {
  id: string;
  action: string;
  status: 'pending' | 'resolved' | 'rejected';
  hasCallback: boolean;
}

const statusColors = {
  pending: 'border-amber-500/50 bg-amber-500/10',
  resolved: 'border-green-500/50 bg-green-500/10',
  rejected: 'border-red-500/50 bg-red-500/10',
};

export function EnvelopeNode({ data }: NodeProps<EnvelopeNodeData>) {
  return (
    <div className={`px-4 py-3 border rounded-lg min-w-[180px] ${statusColors[data.status]}`}>
      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-500 !w-3 !h-3"
      />

      {/* Content */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-slate-400">envelope</span>
        <span className="font-mono text-blue-400 text-xs">{data.id}</span>
      </div>

      <div className="font-mono text-sm text-green-400">
        {data.action}
      </div>

      <Badge
        variant="outline"
        className={`mt-2 ${
          data.status === 'resolved' ? 'text-green-400' :
          data.status === 'pending' ? 'text-amber-400' : 'text-red-400'
        }`}
      >
        {data.status}
      </Badge>

      {/* Output handle (only if has callback) */}
      {data.hasCallback && (
        <Handle
          type="source"
          position={Position.Right}
          className="!bg-green-500 !w-3 !h-3"
        />
      )}
    </div>
  );
}
```

## Converting Runtime to Flow

```tsx
// src/components/flow/utils/runtimeToFlow.ts
import type { Node, Edge } from '@xyflow/react';
import type { Runtime } from '@/engine/Runtime';
import type { Envelope, Agent } from '@/engine/types';

interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

export function runtimeToFlow(runtime: Runtime): FlowData {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  const agents = Array.from(runtime.router.agents.values());
  const allEnvelopes = agents.flatMap(a => a.envelopes);

  // Position agents in a row at the top
  agents.forEach((agent, index) => {
    nodes.push({
      id: agent.id,
      type: 'agent',
      position: { x: index * 250, y: 0 },
      data: {
        name: agent.name,
        status: agent.status,
        actionCount: Object.keys(agent.actions).length,
      },
    });
  });

  // Position envelopes below their target agents
  allEnvelopes.forEach((envelope, index) => {
    const targetAgent = agents.find(a => a.id === envelope.metadata?.receiver);
    const agentIndex = targetAgent ? agents.indexOf(targetAgent) : 0;

    nodes.push({
      id: envelope.id,
      type: 'envelope',
      position: {
        x: agentIndex * 250 + 50,
        y: 150 + (index % 3) * 120,
      },
      data: {
        id: envelope.id.slice(-6),
        action: envelope.env.action,
        status: envelope.payload.status,
        hasCallback: !!envelope.callback,
      },
    });

    // Edge from sender to envelope
    if (envelope.metadata?.sender) {
      edges.push({
        id: `${envelope.metadata.sender}-${envelope.id}`,
        source: envelope.metadata.sender,
        target: envelope.id,
        animated: envelope.payload.status === 'pending',
        style: { stroke: '#3b82f6' },
      });
    }

    // Edge from envelope to receiver
    if (envelope.metadata?.receiver) {
      edges.push({
        id: `${envelope.id}-${envelope.metadata.receiver}`,
        source: envelope.id,
        target: envelope.metadata.receiver,
        animated: envelope.payload.status === 'pending',
        style: { stroke: '#22c55e' },
      });
    }

    // Edge to callback envelope
    if (envelope.callback) {
      edges.push({
        id: `${envelope.id}-callback`,
        source: envelope.id,
        target: envelope.callback.id,
        animated: true,
        style: { stroke: '#eab308', strokeDasharray: '5,5' },
        label: 'callback',
        labelStyle: { fill: '#eab308', fontSize: 10 },
      });
    }
  });

  return { nodes, edges };
}
```

## Interactive Flow Canvas

```tsx
// src/components/flow/InteractiveFlowCanvas.tsx
import { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { AgentNode } from './nodes/AgentNode';
import { EnvelopeNode } from './nodes/EnvelopeNode';
import { runtimeToFlow } from './utils/runtimeToFlow';
import type { Runtime } from '@/engine/Runtime';

const nodeTypes = {
  agent: AgentNode,
  envelope: EnvelopeNode,
};

interface Props {
  runtime: Runtime;
  onEnvelopeClick?: (envelopeId: string) => void;
}

export function InteractiveFlowCanvas({ runtime, onEnvelopeClick }: Props) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update flow when runtime changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = runtimeToFlow(runtime);
    setNodes(newNodes);
    setEdges(newEdges);
  }, [runtime, setNodes, setEdges]);

  // Handle new connections
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        animated: true,
        style: { stroke: '#3b82f6' },
      }, eds));
    },
    [setEdges]
  );

  // Handle node clicks
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'envelope' && onEnvelopeClick) {
        onEnvelopeClick(node.id);
      }
    },
    [onEnvelopeClick]
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-[#0a0a0f]"
      >
        <Background
          color="#1e293b"
          gap={20}
          size={1}
        />
        <Controls
          showZoom
          showFitView
          showInteractive
          className="!bg-[#0f0f14] !border-[#1e293b] !shadow-lg"
        />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === 'agent') return '#3b82f6';
            if (node.data?.status === 'resolved') return '#22c55e';
            if (node.data?.status === 'pending') return '#eab308';
            return '#64748b';
          }}
          className="!bg-[#0f0f14] !border-[#1e293b]"
          maskColor="rgba(10, 10, 15, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}
```

## Custom Edges

```tsx
// src/components/flow/edges/CallbackEdge.tsx
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react';

export function CallbackEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: '#eab308',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="px-2 py-1 bg-[#0f0f14] border border-[#1e293b] rounded text-xs text-amber-400"
        >
          callback
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
```

## Edge Types Registration

```tsx
import { CallbackEdge } from './edges/CallbackEdge';

const edgeTypes = {
  callback: CallbackEdge,
};

// In ReactFlow component
<ReactFlow
  edgeTypes={edgeTypes}
  // ...
/>
```

## Auto-Layout with dagre

```bash
bun add @dagrejs/dagre
```

```tsx
// src/components/flow/utils/autoLayout.ts
import dagre from '@dagrejs/dagre';
import type { Node, Edge } from '@xyflow/react';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 100;

export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: 'TB' | 'LR' = 'LR'
) {
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
}
```

## Astro Page with ReactFlow

```astro
---
// src/pages/visualise.astro
import Layout from "@/layouts/Layout.astro";
import { InteractiveFlowCanvas } from "@/components/flow/InteractiveFlowCanvas";
---

<Layout title="Envelope Flow Visualization">
  <div class="h-screen">
    <InteractiveFlowCanvas client:load />
  </div>
</Layout>

<style>
  /* ReactFlow dark theme overrides */
  :global(.react-flow__node) {
    font-family: ui-monospace, monospace;
  }

  :global(.react-flow__controls button) {
    background-color: #0f0f14 !important;
    border-color: #1e293b !important;
    color: white !important;
  }

  :global(.react-flow__controls button:hover) {
    background-color: #1e293b !important;
  }
</style>
```

## Real-time Updates

```tsx
// Update flow when runtime emits events
import { useEffect } from 'react';

export function useRuntimeSync(
  runtime: Runtime,
  setNodes: (nodes: Node[]) => void,
  setEdges: (edges: Edge[]) => void
) {
  useEffect(() => {
    const updateFlow = () => {
      const { nodes, edges } = runtimeToFlow(runtime);
      setNodes(nodes);
      setEdges(edges);
    };

    // Initial render
    updateFlow();

    // Subscribe to runtime events
    runtime.on('envelope:sent', updateFlow);
    runtime.on('envelope:resolved', updateFlow);
    runtime.on('agent:statusChange', updateFlow);

    return () => {
      runtime.off('envelope:sent', updateFlow);
      runtime.off('envelope:resolved', updateFlow);
      runtime.off('agent:statusChange', updateFlow);
    };
  }, [runtime, setNodes, setEdges]);
}
```

## Best Practices

1. **Memoize custom nodes**: Use `React.memo` to prevent re-renders
2. **Use fitView**: Auto-fit the view after layout changes
3. **Animate pending edges**: Show activity with `animated` prop
4. **Dark theme CSS**: Override ReactFlow default styles
5. **Custom handles**: Style handles to match your theme
6. **Auto-layout**: Use dagre for complex graphs

---

**Version**: 1.0.0
**Tech**: @xyflow/react 12+
