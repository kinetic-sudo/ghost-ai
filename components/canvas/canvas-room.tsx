"use client";

import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react";

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

function CanvasErrorFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0A0A0A]">
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-medium text-white/60">
          Could not connect to the workspace.
        </p>
        <p className="text-xs text-white/30">
          Check your connection and refresh the page.
        </p>
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
        <ClientSideSuspense fallback={<CanvasLoadingState />}>
          {() => <CanvasEditor />}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}