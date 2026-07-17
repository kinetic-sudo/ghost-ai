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
// Inner — useReactFlow() is safe here because it's inside <ReactFlow>
// ---------------------------------------------------------------------------
function CanvasInner() {
  const { screenToFlowPosition, setNodes } = useReactFlow();

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const raw = e.dataTransfer.getData(DRAG_TYPE);
      if (!raw) return;

      let payload: ShapeDragPayload;
      try {
        payload = JSON.parse(raw) as ShapeDragPayload;
      } catch {
        return;
      }

      // Convert cursor screen position → canvas coordinates (handles pan + zoom)
      const canvasPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });

      // Center the node on the cursor in canvas-space
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
    // This div is a direct child of ReactFlow and acts as the full-area
    // drop target. It must be position:absolute inset-0 and pointer-events-all
    // so drag events reach it before ReactFlow's internal pane catches them.
    <div
      className="absolute inset-0 z-10"
      onDragOver={onDragOver}
      onDrop={onDrop}
    />
  );
}

// ---------------------------------------------------------------------------
// Outer — sets up Liveblocks + ReactFlow, no card styling
// ---------------------------------------------------------------------------
export function CanvasEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useLiveblocksFlow({
    suspense: true,
  });

  return (
    // Full-area container — no border, no radius, no shadow, no background
    // so the canvas fills flush without looking like a floating card.
    <div className="h-full w-full relative">
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
        // No bg-[#0A0A0A] — let the parent background show through uniformly
        style={{ background: "transparent" }}
      >
        <CanvasInner />
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

      {/* Shape panel floats above the canvas */}
      <ShapePanel />
    </div>
  );
}