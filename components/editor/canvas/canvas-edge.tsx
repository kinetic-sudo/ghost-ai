"use client";

import { memo, useState, useCallback, useEffect } from "react";
import {
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react";

import type { CanvasEdgeData } from "@/types/canvas";
import { cn } from "@/lib/utils";

export const CanvasEdgeComponent = memo(function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected,
  data,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const edgeData = (data || {}) as CanvasEdgeData;
  const label = edgeData.label || "";
  const [localLabel, setLocalLabel] = useState(label);

  useEffect(() => {
    setLocalLabel(edgeData.label || "");
  }, [edgeData.label]);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const updateLabel = useCallback(
    (newLabel: string) => {
      setEdges((edges) =>
        edges.map((edge) => {
          if (edge.id === id) {
            return {
              ...edge,
              data: {
                ...edge.data,
                label: newLabel,
              },
            };
          }
          return edge;
        })
      );
    },
    [id, setEdges]
  );

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const onBlur = useCallback(() => {
    setIsEditing(false);
    updateLabel(localLabel);
  }, [localLabel, updateLabel]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === "Escape") {
        e.preventDefault();
        setIsEditing(false);
        updateLabel(localLabel);
      }
    },
    [localLabel, updateLabel]
  );

  const isHighlighted = selected || isHovered;

  return (
    <>
      {/* Wide invisible stroke path for easy hover & click detection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="cursor-pointer pointer-events-stroke"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onDoubleClick={onDoubleClick}
      />

      {/* Visible right-angle stroke path */}
      <path
        d={edgePath}
        fill="none"
        stroke={isHighlighted ? "#00E5FF" : "rgba(255, 255, 255, 0.35)"}
        strokeWidth={isHighlighted ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        markerEnd={markerEnd}
        className="transition-colors duration-150 pointer-events-none"
        style={style}
      />

      {/* Inline Edge Label via EdgeLabelRenderer & SmoothStep Path Coordinates */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan select-none"
          onDoubleClick={onDoubleClick}
        >
          {isEditing ? (
            <input
              type="text"
              value={localLabel}
              onChange={(e) => setLocalLabel(e.target.value)}
              onBlur={onBlur}
              onKeyDown={onKeyDown}
              autoFocus
              style={{
                width: `${Math.max(4, localLabel.length + 1)}ch`,
              }}
              className="rounded-full border border-[#00E5FF] bg-[#141414] px-2.5 py-0.5 text-xs text-white shadow-xl outline-none text-center"
              placeholder="Label"
            />
          ) : localLabel ? (
            <div
              className={cn(
                "rounded-full border bg-[#141414]/90 px-2.5 py-0.5 text-xs font-medium text-neutral-200 shadow-sm backdrop-blur-sm transition-all duration-150 cursor-pointer",
                isHighlighted
                  ? "border-[#00E5FF] text-white shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                  : "border-white/10 hover:border-white/30 hover:text-white"
              )}
            >
              {localLabel}
            </div>
          ) : isHighlighted ? (
            <div className="rounded-full border border-dashed border-white/20 bg-[#141414]/70 px-2 py-0.5 text-[10px] text-neutral-400 backdrop-blur-sm cursor-pointer hover:border-white/40 hover:text-neutral-200 transition-all">
              + Label
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});