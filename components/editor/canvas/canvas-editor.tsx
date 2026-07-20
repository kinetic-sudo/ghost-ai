"use client";

import { useCallback } from "react";
import { 
  ReactFlow, 
  Background, 
  Controls, 
  ConnectionMode, 
  MarkerType,
  type Connection 
} from "@xyflow/react";

import { CanvasNodeComponent } from "./canvas-node";
import { CanvasEdgeComponent } from "./canvas-edge";
import { ShapePanel } from "./shape-panel";
import { useLiveblocksFlow } from "";

const NODE_TYPES = {
  canvasNode: CanvasNodeComponent,
};

const EDGE_TYPES = {
  canvasEdge: CanvasEdgeComponent,
};

const DEFAULT_EDGE_OPTIONS = {
  type: "canvasEdge",
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 14,
    height: 14,
    color: "rgba(255, 255, 255, 0.4)",
  },
};

export function CanvasEditor() {
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    onDelete, 
    setNodes 
  } = useLiveblocksFlow({ suspense: true });

  const handleConnect = useCallback(
    (params: Connection) => {
      onConnect({
        ...params,
        type: "canvasEdge",
        markerEnd: DEFAULT_EDGE_OPTIONS.markerEnd,
      });
    },
    [onConnect]
  );

  return (
    <div className="relative h-full w-full bg-[#0a0a0a]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onDelete={onDelete}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        fitView
      >
        <Background color="#222" gap={16} />
        <Controls />
      </ReactFlow>
      <ShapePanel setNodes={setNodes} />
    </div>
  );
}