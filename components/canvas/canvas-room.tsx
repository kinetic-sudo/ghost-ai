"use client";

import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react";
import { ReactFlowProvider } from "@xyflow/react";

import { CanvasEditor } from "@/components/canvas/canvas-editor";

interface CanvasRoomProps {
  roomId: string;
}

function CanvasLoadingState() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0A0A0A]">
      <div className="flex flex-col items-center gap-3">
        <div className="size-6 animate-spin rounded-full border-2 border-white/10 border-t-[#00E5FF]" />
        <p className="text-xs text-white/30">Connecting to room…</p>
      </div>
    </div>
  );
}

export function CanvasRoom({ roomId }: CanvasRoomProps) {
  return (
    <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
      >
        {/* ReactFlowProvider wraps everything so useReactFlow() works
            inside CanvasInner which is inside ClientSideSuspense */}
        <ReactFlowProvider>
          <ClientSideSuspense fallback={<CanvasLoadingState />}>
            {() => <CanvasEditor />}
          </ClientSideSuspense>
        </ReactFlowProvider>
      </RoomProvider>
    </LiveblocksProvider>
  );
}