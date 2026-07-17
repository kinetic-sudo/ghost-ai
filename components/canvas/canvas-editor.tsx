"use client";

import { useCallback } from "react";
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

// ---------------------------------------------------------------------------
// DropLayer — inside <ReactFlow> so useReactFlow() context is available
// ---------------------------------------------------------------------------
function DropLayer() {
  const { screenToFlowPosition, setNodes } = useReactFlow();

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

      // screenToFlowPosition converts a screen-space point to canvas-space,
      // accounting for the current pan and zoom. We pass the raw cursor
      // position here — no manual offset needed before the call.
      const canvasCenter = screenToFlowPosition({
        x: e.clientX,
        y: e.clientY,
      });

      // Then offset by half the node size so the node is centered on the
      // cursor in canvas-space (after transform).
      const position = {
        x: canvasCenter.x - payload.width / 2,
        y: canvasCenter.y - payload.height / 2,
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
    <div
      className="absolute inset-0 z-0"
      onDragOver={onDragOver}
      onDrop={onDrop}
    />
  );
}

// ---------------------------------------------------------------------------
// CanvasEditor — outer component, sets up ReactFlow context
// ---------------------------------------------------------------------------
export function CanvasEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useLiveblocksFlow({
    suspense: true,
  });

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        connectionMode={ConnectionMode.Loose}
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-[#0A0A0A]"
      >
        <DropLayer />
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

      <ShapePanel />
    </div>
  );
}