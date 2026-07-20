"use client";

import { memo, useCallback, useState, useEffect } from "react";
import { 
  Handle, 
  Position, 
  NodeToolbar, 
  NodeResizer,
  useReactFlow, 
  type NodeProps 
} from "@xyflow/react";
import { Trash2 } from "lucide-react";

import type { CanvasNode } from "@/types/canvas";
import { DEFAULT_NODE_COLOR } from "@/types/canvas";

export const CanvasNodeComponent = memo(function CanvasNodeComponent({
  id,
  data,
  selected,
}: NodeProps<CanvasNode>) {
  const { deleteElements, updateNodeData } = useReactFlow();

  const bgColor = data.color ?? DEFAULT_NODE_COLOR.fill;
  const textColor = data.textColor ?? DEFAULT_NODE_COLOR.text;
  const shape = data.shape ?? "rectangle";

  const [isEditing, setIsEditing] = useState(false);
  const [localLabel, setLocalLabel] = useState(data.label || "");

  useEffect(() => {
    setLocalLabel(data.label || "");
  }, [data.label]);

  const onDelete = useCallback(() => {
    deleteElements({ nodes: [{ id }] });
  }, [id, deleteElements]);

  const onDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const onLabelChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setLocalLabel(newText);
    updateNodeData(id, { label: newText });
  }, [id, updateNodeData]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape" || e.key === "Enter") {
      e.preventDefault();
      setIsEditing(false);
    }
  }, []);

  const renderShape = () => {
    const isSvg = ["diamond", "hexagon", "cylinder"].includes(shape);

    if (!isSvg) {
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

    const strokeColor = selected ? "#00E5FF" : "rgba(255,255,255,0.15)";
    const strokeWidth = selected ? "4" : "2";

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
    <div 
      onDoubleClick={onDoubleClick}
      className="group relative flex h-full w-full items-center justify-center pointer-events-auto"
    >
      <NodeToolbar
        isVisible={selected}
        position={Position.Top}
        offset={10}
        className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-[#111111]/90 p-1 shadow-xl backdrop-blur-md"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation(); 
            onDelete();
          }}
          className="flex h-8 w-8 items-center justify-center rounded text-neutral-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
          title="Delete Shape"
        >
          <Trash2 className="size-4" />
        </button>
      </NodeToolbar>

      <NodeResizer
        isVisible={selected}
        minWidth={60}
        minHeight={40}
        handleStyle={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.55)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
        lineStyle={{
          borderColor: "rgba(255,255,255,0.3)",
          borderWidth: 1,
        }}
      />

      {renderShape()}

      {/* Handles with explicit IDs for edge connections */}
      <Handle 
        id="top" 
        type="source" 
        position={Position.Top} 
        className="!opacity-0 group-hover:!opacity-100" 
        style={{ width: 8, height: 8 }} 
      />
      <Handle 
        id="right" 
        type="source" 
        position={Position.Right} 
        className="!opacity-0 group-hover:!opacity-100" 
        style={{ width: 8, height: 8 }} 
      />
      <Handle 
        id="bottom" 
        type="source" 
        position={Position.Bottom} 
        className="!opacity-0 group-hover:!opacity-100" 
        style={{ width: 8, height: 8 }} 
      />
      <Handle 
        id="left" 
        type="source" 
        position={Position.Left} 
        className="!opacity-0 group-hover:!opacity-100" 
        style={{ width: 8, height: 8 }} 
      />

      {isEditing ? (
        <textarea
          value={localLabel}
          onChange={onLabelChange}
          onBlur={() => setIsEditing(false)}
          onKeyDown={onKeyDown}
          autoFocus
          className="nodrag nopan relative z-20 w-[90%] resize-none overflow-hidden bg-transparent text-center text-sm font-medium outline-none"
          style={{ color: textColor }}
          rows={1}
          placeholder="Label"
        />
      ) : (
        <span
          className="relative z-10 truncate px-3 text-sm font-medium pointer-events-none"
          style={{ 
            color: textColor,
            opacity: localLabel ? 1 : 0.35 
          }}
        >
          {localLabel || "Label"}
        </span>
      )}
    </div>
  );
});