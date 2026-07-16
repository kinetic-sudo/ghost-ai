"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";

// ---------------------------------------------------------------------------
// Basic canvas node renderer.
// Every shape is rendered as a bordered rectangle for now — shape-specific
// visuals will be added in a later spec. This just makes new nodes visible.
// ---------------------------------------------------------------------------

export const CanvasNodeComponent = memo(function CanvasNodeComponent({
  data,
  selected,
}: NodeProps<CanvasNode>) {
  const bgColor = data.color ?? DEFAULT_NODE_COLOR.fill;
  const textColor = data.textColor ?? DEFAULT_NODE_COLOR.text;

  return (
    <div
      className="flex items-center justify-center rounded-lg border text-sm font-medium transition-shadow"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: bgColor,
        color: textColor,
        borderColor: selected ? "#00E5FF" : "rgba(255,255,255,0.12)",
        boxShadow: selected ? "0 0 0 1px #00E5FF" : "none",
      }}
    >
      {/* Connection handles — hidden visually, active on hover */}
      <Handle
        type="source"
        position={Position.Top}
        className="!size-2 !border-white/20 !bg-white/40 opacity-0 group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!size-2 !border-white/20 !bg-white/40 opacity-0 group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!size-2 !border-white/20 !bg-white/40 opacity-0 group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="!size-2 !border-white/20 !bg-white/40 opacity-0 group-hover:opacity-100"
      />

      <span className="truncate px-3 py-1">
        {data.label || data.shape || ""}
      </span>
    </div>
  );
});