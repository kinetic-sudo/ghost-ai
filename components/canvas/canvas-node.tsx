"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { CanvasNode } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";

export const CanvasNodeComponent = memo(function CanvasNodeComponent({
  data,
  selected,
}: NodeProps<CanvasNode>) {
  const bgColor = data.color ?? DEFAULT_NODE_COLOR.fill;
  const textColor = data.textColor ?? DEFAULT_NODE_COLOR.text;

  return (
    <div
      className="relative flex items-center justify-center w-full h-full"
      style={{
        backgroundColor: bgColor,
        // Subtle border — teal when selected
        border: selected
          ? "1.5px solid #00E5FF"
          : "1px solid rgba(255,255,255,0.10)",
        borderRadius: 8,
        boxShadow: selected
          ? "0 0 0 2px rgba(0,229,255,0.2)"
          : "0 1px 4px rgba(0,0,0,0.3)",
        color: textColor,
      }}
    >
      {/* Handles on all 4 sides — source/target for loose connections */}
      <Handle
        type="source"
        position={Position.Top}
        style={{ opacity: 0, width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ opacity: 0, width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ opacity: 0, width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        style={{ opacity: 0, width: 8, height: 8 }}
      />

      {/* Only show label if one is set — no shape name placeholder */}
      {data.label ? (
        <span
          className="truncate px-3 text-sm font-medium"
          style={{ color: textColor }}
        >
          {data.label}
        </span>
      ) : null}
    </div>
  );
});