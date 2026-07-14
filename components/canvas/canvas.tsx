"use client";

import { 
  ReactFlow, 
  Background, 
  BackgroundVariant, 
  MiniMap, 
  Controls, 
  ConnectionMode 
} from '@xyflow/react';
import { useLiveblocksFlow } from '@liveblocks/react-flow';
import '@xyflow/react/dist/style.css';

import { CanvasNode } from '@/types/canvas';

export function Canvas() {
  // Hook initialized correctly with custom generics and initial config
  const { nodes, edges, onNodesChange, onEdgesChange } = useLiveblocksFlow<CanvasNode>({
    suspense: true,
    nodes: {
      initial: [],
    },
    edges: {
      initial: [],
    },
  });

  return (
    <div className="w-full h-full relative flex-1">
      <ReactFlow
        nodes={nodes || []}
        edges={edges || []}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionMode={ConnectionMode.Loose}
        colorMode="dark"
        fitView
        className="bg-[#0A0A0A]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={32}
          size={1.5}
          color="rgba(255, 255, 255, 0.15)"
        />
        <Controls className="bg-neutral-900 border border-white/10 text-white fill-white rounded-lg" />
        <MiniMap
          className="bg-neutral-900 border border-white/10 rounded-lg"
          nodeColor="#222"
          maskColor="rgba(0, 0, 0, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}