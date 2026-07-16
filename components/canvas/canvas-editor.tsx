"use client";

import { useCallback } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
  type NodeChange,
  type EdgeChange,
  type OnNodesChange,
  type OnEdgesChange,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";

import "@xyflow/react/dist/style.css";

import { NODE_TYPES, EDGE_TYPES } from "@/types/canvas";

export function CanvasEditor() {
  // useLiveblocksFlow syncs nodes and edges via Liveblocks Storage.
  // suspense: true — the hook suspends until the room storage is loaded,
  // so ClientSideSuspense handles the loading state above this component.
  const { nodes, edges, onNodesChange, onEdgesChange } = useLiveblocksFlow({
    suspense: true,
  });

  const handleNodesChange: OnNodesChange = useCallback(
    (changes: NodeChange[]) => onNodesChange(changes),
    [onNodesChange],
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes: EdgeChange[]) => onEdgesChange(changes),
    [onEdgesChange],
  );

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        nodeTypes={NODE_TYPES}
        edgeTypes={EDGE_TYPES}
        connectionMode={ConnectionMode.Loose}
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
    </div>
  );
}