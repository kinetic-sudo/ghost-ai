"use client";

import { useCallback, useRef } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  useReactFlow,
  ReactFlowProvider, // 1. Import the Provider
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

const NODE_TYPES = {
  canvasNode: CanvasNodeComponent,
} as const;

const EDGE_TYPES = {} as const;

let nodeCounter = 0;

function generateNodeId(shape: string): string {
  nodeCounter += 1;
  return `${shape}-${Date.now()}-${nodeCounter}`;
}

// 2. Rename this to CanvasEditorInner so it can safely consume the context
function CanvasEditorInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, setNodes } =
    useLiveblocksFlow<CanvasNode>({ suspense: true });

  const { screenToFlowPosition } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

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

      const position = screenToFlowPosition({
        x: e.clientX - payload.width / 2,
        y: e.clientY - payload.height / 2,
      });

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
    <div ref={wrapperRef} className="relative h-full w-full">
      <ReactFlow
        nodes={nodes || []}
        edges={edges || []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        onDragOver={onDragOver}
        onDrop={onDrop}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
        proOptions={{ hideAttribution: true }}
        className="bg-[#0A0A0A]"
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

      <ShapePanel />
    </div>
  );
}

// 3. Export the main CanvasEditor wrapped with the ReactFlowProvider
export function CanvasEditor() {
  return (
    <ReactFlowProvider>
      <CanvasEditorInner />
    </ReactFlowProvider>
  );
}