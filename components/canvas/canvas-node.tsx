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
  const shape = data.shape ?? "rectangle";

  const renderShape = () => {
    const isSvg = ["diamond", "hexagon", "cylinder"].includes(shape);

    if (!isSvg) {
      // CSS Shapes: rectangle, pill, circle
      let borderRadius = "0px";
      if (shape === "pill" || shape === "circle") borderRadius = "9999px";

      return (
        <div
          className="absolute inset-0 h-full w-full transition-all"
          style={{
            backgroundColor: bgColor,
            borderRadius,
            border: selected
              ? "2px solid #00E5FF"
              : "1px solid rgba(255,255,255,0.15)",
            boxShadow: selected ? "0 0 0 2px rgba(0,229,255,0.2)" : "none",
          }}
        />
      );
    }

    // SVG Shapes: diamond, hexagon, cylinder
    const strokeColor = selected ? "#00E5FF" : "rgba(255,255,255,0.15)";
    const strokeWidth = selected ? "4" : "2"; // non-scaling-stroke treats this as absolute pixels

    const commonProps = {
      fill: bgColor,
      stroke: strokeColor,
      strokeWidth,
      vectorEffect: "non-scaling-stroke",
      className: "transition-all duration-200",
    };

    let svgContent = null;
    if (shape === "diamond") {
      svgContent = (
        <polygon points="50,0 100,50 50,100 0,50" {...commonProps} />
      );
    } else if (shape === "hexagon") {
      svgContent = (
        <polygon points="25,0 75,0 100,50 75,100 25,100 0,50" {...commonProps} />
      );
    } else if (shape === "cylinder") {
      svgContent = (
        <>
          <path
            d="M 0 15 L 0 85 A 50 15 0 0 0 100 85 L 100 15 A 50 15 0 0 1 0 15 Z"
            {...commonProps}
          />
          <ellipse cx="50" cy="15" rx="50" ry="15" {...commonProps} />
        </>
      );
    }

    return (
      <svg
        className="absolute inset-0 h-full w-full overflow-visible"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {svgContent}
      </svg>
    );
  };

  return (
    <div className="relative flex h-full w-full items-center justify-center pointer-events-auto">
      {renderShape()}

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
          className="relative z-10 truncate px-3 text-sm font-medium"
          style={{ color: textColor }}
        >
          {data.label}
        </span>
      ) : null}
    </div>
  );
});