"use client";

import { useCallback, useState, useEffect } from "react";
import { 
  ReactFlow, 
  Background, 
  ConnectionMode, 
  MarkerType,
  useReactFlow,
  type Connection 
} from "@xyflow/react";
import { useMyPresence } from "@liveblocks/react/suspense";

import { CanvasNodeComponent } from "./canvas-node";
import { CanvasEdgeComponent } from "./canvas-edge";
import { ShapePanel } from "./shape-panel";
import { CanvasControls } from "./canvas-control";
import { PresenceUI } from "./canvas-prescense";
import { LiveCursors } from "./live-cursor";
import { StarterTemplatesModal } from "@/components/editor/starter-template-modal";
import { type CanvasTemplate } from "@/components/editor/starter-template";
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
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const { 
    nodes, 
    edges, 
    onNodesChange, 
    onEdgesChange, 
    onConnect, 
    onDelete, 
    setNodes,
    setEdges,
  } = useLiveblocksFlow({ suspense: true });

  const { screenToFlowPosition, fitView } = useReactFlow();
  const [, updateMyPresence] = useMyPresence();

  // Listen for the custom event dispatched from the layout EditorNavbar
  useEffect(() => {
    const handleOpenTemplates = () => setTemplatesOpen(true);
    window.addEventListener("open-templates", handleOpenTemplates);
    return () => window.removeEventListener("open-templates", handleOpenTemplates);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      updateMyPresence({
        cursor: {
          x: Math.round(e.clientX),
          y: Math.round(e.clientY),
        },
      });
    },
    [updateMyPresence]
  );

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

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

  const handleImportTemplate = useCallback(
    (template: CanvasTemplate) => {
      setNodes(template.nodes);
      setEdges(template.edges);

      setTimeout(() => {
        fitView({ duration: 300 });
      }, 50);
    },
    [setNodes, setEdges, fitView]
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
    <div 
      className="relative flex h-full w-full flex-col bg-[#0a0a0a]"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="relative flex-1">
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

        {/* Real-time Collaboration Overlays */}
        <LiveCursors />
        <PresenceUI />

        <ShapePanel />
      </div>

      <StarterTemplatesModal
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onImport={handleImportTemplate}
      />
    </div>
  );
}