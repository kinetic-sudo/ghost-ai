"use client";

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  ConnectionMode,
} from "@xyflow/react";
import { useLiveblocksFlow } from "@liveblocks/react-flow";


import { NODE_TYPES, EDGE_TYPES } from "@/types/canvas";

export function CanvasEditor() {
  const { nodes, edges, onNodesChange, onEdgesChange } = useLiveblocksFlow({
    suspense: true,
  });

  return (
    <div className="h-full w-full">
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