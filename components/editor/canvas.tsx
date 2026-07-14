"use client";

import { ReactFlow, Background, BackgroundVariant, MiniMap, ConnectionMode } from '@xyflow/react';
import { useLiveblocksFlow } from '@liveblocks/react-flow';
import '@xyflow/react/dist/style.css';
import { CanvasNode } from '@/types/canvas';

export function Canvas() {
  // 1. Pass your custom CanvasNode type as a generic parameter
  const { nodes, edges, onNodesChange, onEdgesChange } = useLiveblocksFlow<CanvasNode>({
    suspense: true, // Informs the hook it is working under a ClientSideSuspense container
    nodes: {
      initial: [],
    },
    edges: {
      initial: [],
    },
  });

  return (
    <ReactFlow
      // 2. Use a safe array fallback to ensure 'null' is never passed into React Flow
      nodes={nodes || []}
      edges={edges || []}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      connectionMode={ConnectionMode.Loose}
      fitView
      className="bg-[#0A0A0A]"
    >
      <Background
        variant={BackgroundVariant.Dots}
        gap={32}
        size={1}
        color="rgba(255,255,255,0.04)"
      />
      <MiniMap
        nodeColor="#ffffff"
        maskColor="rgba(0,0,0,0.8)"
        style={{ backgroundColor: '#0A0A0A' }}
      />
    </ReactFlow>
  );
}