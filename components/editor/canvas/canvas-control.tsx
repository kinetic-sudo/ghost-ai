"use client";

import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
} from "@liveblocks/react/suspense";
import { ZoomIn, ZoomOut, Maximize2, Undo2, Redo2 } from "lucide-react";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcut";

export function CanvasControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  const handleZoomIn = useCallback(() => {
    zoomIn({ duration: 300 });
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut({ duration: 300 });
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView({ duration: 300 });
  }, [fitView]);

  useKeyboardShortcuts({
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut,
    undo,
    redo,
    canUndo,
    canRedo,
  });

  return (
    <div className="pointer-events-none absolute bottom-6 left-6 z-10 flex items-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#111111]/90 px-3 py-1.5 shadow-2xl backdrop-blur-md">
        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-all hover:bg-white/[0.08] hover:text-white active:scale-95"
          >
            <ZoomOut className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleFitView}
            title="Fit View"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-all hover:bg-white/[0.08] hover:text-white active:scale-95"
          >
            <Maximize2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In (+)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-all hover:bg-white/[0.08] hover:text-white active:scale-95"
          >
            <ZoomIn className="size-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-1 h-4 w-[1px] bg-white/10" />

        {/* History Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-all hover:bg-white/[0.08] hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          >
            <Undo2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z / Ctrl+Y)"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/60 transition-all hover:bg-white/[0.08] hover:text-white active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          >
            <Redo2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}