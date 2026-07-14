"use client";

import React from "react";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";
import { Loader2, AlertTriangle } from "lucide-react";
import { Canvas } from "./canvas";

class CanvasErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center bg-[#0A0A0A] text-white/50 h-full w-full">
          <AlertTriangle className="size-8 text-red-500/50 mb-4" />
          <p className="text-sm">Failed to connect to the collaboration room.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

interface CanvasRoomProps {
  roomId: string;
}

export function CanvasRoom({ roomId }: CanvasRoomProps) {
  return (
    <CanvasErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider id={roomId} initialPresence={{ cursor: null, isThinking: false }}>
          <ClientSideSuspense fallback={
            <div className="flex h-full w-full items-center justify-center bg-[#0A0A0A]">
              <Loader2 className="size-6 text-[#00E5FF] animate-spin" />
            </div>
          }>
            <Canvas />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
}