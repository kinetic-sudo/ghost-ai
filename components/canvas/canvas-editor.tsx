"use client";

import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  useReactFlow,
  type Node,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";

import "@xyflow/react/dist/style.css";

import {
  DRAG_TYPE,
  DEFAULT_NODE_COLOR,
  type ShapeDragPayload,
  type CanvasNode,
} from "@/types/canvas";
import { CanvasNodeComponent } from "@/components/canvas/canvas-node";
import { ShapePanel } from "@/components/canvas/shape-panel";

const NODE_TYPES = { canvasNode: CanvasNodeComponent } as const;
const EDGE_TYPES = {} as const;

let nodeCounter = 0;
function generateNodeId(shape: string): string {
  nodeCounter += 1;
  return `${shape}-${Date.now()}-${nodeCounter}`;
}

function CanvasInner() {
  const { screenToFlowPosition, setNodes } = useReactFlow();
  
  // 1. Destructure `onConnect` from the Liveblocks hook
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect 
  } = useLiveblocksFlow({
    suspense: true,
  });

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData(DRAG_TYPE);
      if (!raw) return;

      let payload: ShapeDragPayload;
      try {
        payload = JSON.parse(raw) as ShapeDragPayload;
      } catch {
        return;
      }

      const canvasPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const position = {
        x: canvasPos.x - payload.width / 2,
        y: canvasPos.y - payload.height / 2,
      };

      const newNode: CanvasNode = {
        id: generateNodeId(payload.shape),
        type: "canvasNode",
        position,
        style: { width: payload.width, height: payload.height },
        data: {
          label: "",
          shape: payload.shape,
          color: DEFAULT_NODE_COLOR.fill,
          textColor: DEFAULT_NODE_COLOR.text,
        },
      };

      setNodes((prev: Node[]) => [...prev, newNode]);
    },
    [screenToFlowPosition, setNodes],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect} /* 2. Pass it to ReactFlow */
      nodeTypes={NODE_TYPES}
      edgeTypes={EDGE_TYPES}
      onDragOver={onDragOver}
      onDrop={onDrop}
      connectionMode={ConnectionMode.Loose}
      fitView
      proOptions={{ hideAttribution: true }}
      style={{ background: "transparent" }}
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={24}
        size={1}
        color="rgba(255,255,255,0.08)"
      />
      <MiniMap
        nodeColor="rgba(255,255,255,0.1)"
        maskColor="rgba(0,0,0,0.6)"
        className="!border-white/[0.06] !bg-[#111111]"
      />
    </ReactFlow>
  );
}

export function CanvasEditor() {
  return (
    <div className="relative h-full w-full">
      <CanvasInner />
      <ShapePanel />
    </div>
  );
}