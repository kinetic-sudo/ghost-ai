"use client";

import { useCallback } from "react";
import { 
  ReactFlow, 
  Background, 
  ConnectionMode, 
  MarkerType,
  useReactFlow,
  type Connection 
} from "@xyflow/react";

import { CanvasNodeComponent } from "./canvas-node";
import { CanvasEdgeComponent } from "./canvas-edge";
import { ShapePanel } from "./shape-panel";
import { CanvasControls } from "./canvas-control";
import { useLiveblocksFlow } from "@/hooks/use-liveblocks-flow";
import { DRAG_TYPE, type ShapeDragPayload } from "@/types/canvas";

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

let idCounter = 0;

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

  const { screenToFlowPosition } = useReactFlow();

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

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const rawData = e.dataTransfer.getData(DRAG_TYPE);
      if (!rawData) return;

      try {
        const payload: ShapeDragPayload = JSON.parse(rawData);
        const position = screenToFlowPosition({
          x: e.clientX - payload.width / 2,
          y: e.clientY - payload.height / 2,
        });

        const newNode = {
          id: `${payload.shape}-${Date.now()}-${++idCounter}`,
          type: "canvasNode",
          position,
          data: {
            label: "",
            shape: payload.shape,
          },
          style: {
            width: payload.width,
            height: payload.height,
          },
        };

        setNodes((nds) => nds.concat(newNode));
      } catch (err) {
        console.error("Failed to parse shape drop payload", err);
      }
    },
    [screenToFlowPosition, setNodes]
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
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        fitView
      >
        <Background color="#222" gap={16} />
        <CanvasControls />
      </ReactFlow>
      <ShapePanel />
    </div>
  );
}