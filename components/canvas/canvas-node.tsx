"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { DEFAULT_NODE_COLOR, type CanvasNode, type NodeShape } from "@/types/canvas";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function borderStyle(selected: boolean, color: string) {
  return selected
    ? { border: `1.5px solid #00E5FF`, boxShadow: "0 0 0 2px rgba(0,229,255,0.2)" }
    : { border: `1px solid rgba(255,255,255,0.10)` };
}

function Handles() {
  const style = { width: 8, height: 8, opacity: 0, background: "rgba(255,255,255,0.4)" };
  return (
    <>
      <Handle type="source" position={Position.Top}    style={style} />
      <Handle type="source" position={Position.Right}  style={style} />
      <Handle type="source" position={Position.Bottom} style={style} />
      <Handle type="source" position={Position.Left}   style={style} />
    </>
  );
}

// ---------------------------------------------------------------------------
// CSS shapes — rectangle, pill, circle
// ---------------------------------------------------------------------------

function RectangleShape({ bg, border, label, textColor }: {
  bg: string; border: React.CSSProperties; label: string; textColor: string;
}) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: bg, borderRadius: 8, ...border }}
    >
      <Handles />
      {label && <span className="truncate px-3 text-sm font-medium" style={{ color: textColor }}>{label}</span>}
    </div>
  );
}

function PillShape({ bg, border, label, textColor }: {
  bg: string; border: React.CSSProperties; label: string; textColor: string;
}) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: bg, borderRadius: 9999, ...border }}
    >
      <Handles />
      {label && <span className="truncate px-4 text-sm font-medium" style={{ color: textColor }}>{label}</span>}
    </div>
  );
}

function CircleShape({ bg, border, label, textColor }: {
  bg: string; border: React.CSSProperties; label: string; textColor: string;
}) {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ backgroundColor: bg, borderRadius: "50%", ...border }}
    >
      <Handles />
      {label && <span className="truncate px-2 text-sm font-medium text-center" style={{ color: textColor }}>{label}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SVG shapes — diamond, hexagon, cylinder
// ---------------------------------------------------------------------------

function DiamondShape({ bg, stroke, label, textColor, w, h }: {
  bg: string; stroke: string; label: string; textColor: string; w: number; h: number;
}) {
  const cx = w / 2;
  const cy = h / 2;
  const points = `${cx},0 ${w},${cy} ${cx},${h} 0,${cy}`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
      <polygon points={points} fill={bg} stroke={stroke} strokeWidth="1.5" />
      {label && (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={500} fill={textColor} style={{ pointerEvents: "none" }}>
          {label}
        </text>
      )}
      <Handles />
    </svg>
  );
}

function HexagonShape({ bg, stroke, label, textColor, w, h }: {
  bg: string; stroke: string; label: string; textColor: string; w: number; h: number;
}) {
  const cx = w / 2;
  const cy = h / 2;
  const rx = w / 2;
  const ry = h / 2;
  // Flat-top hexagon points
  const pts = [0, 1, 2, 3, 4, 5].map((i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    return `${cx + rx * Math.cos(angle)},${cy + ry * Math.sin(angle)}`;
  }).join(" ");
  return (
    <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
      <polygon points={pts} fill={bg} stroke={stroke} strokeWidth="1.5" />
      {label && (
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={500} fill={textColor} style={{ pointerEvents: "none" }}>
          {label}
        </text>
      )}
      <Handles />
    </svg>
  );
}

function CylinderShape({ bg, stroke, label, textColor, w, h }: {
  bg: string; stroke: string; label: string; textColor: string; w: number; h: number;
}) {
  const rx = w / 2;
  const ry = Math.max(h * 0.12, 10); // ellipse height
  const bodyTop = ry;
  const bodyH = h - ry * 2;
  return (
    <svg width={w} height={h} style={{ overflow: "visible", display: "block" }}>
      {/* Body rect */}
      <rect x={0} y={bodyTop} width={w} height={bodyH} fill={bg} stroke={stroke} strokeWidth="1.5" />
      {/* Bottom ellipse */}
      <ellipse cx={rx} cy={bodyTop + bodyH} rx={rx} ry={ry} fill={bg} stroke={stroke} strokeWidth="1.5" />
      {/* Top ellipse (drawn last to overlay body top edge) */}
      <ellipse cx={rx} cy={bodyTop} rx={rx} ry={ry} fill={bg} stroke={stroke} strokeWidth="1.5" />
      {label && (
        <text x={rx} y={bodyTop + bodyH / 2} textAnchor="middle" dominantBaseline="central"
          fontSize={12} fontWeight={500} fill={textColor} style={{ pointerEvents: "none" }}>
          {label}
        </text>
      )}
      <Handles />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main node component
// ---------------------------------------------------------------------------

export const CanvasNodeComponent = memo(function CanvasNodeComponent({
  data,
  selected,
  width = 160,
  height = 80,
}: NodeProps<CanvasNode>) {
  const bg = data.color ?? DEFAULT_NODE_COLOR.fill;
  const textColor = data.textColor ?? DEFAULT_NODE_COLOR.text;
  const stroke = selected ? "#00E5FF" : "rgba(255,255,255,0.10)";
  const border = borderStyle(selected ?? false, stroke);
  const label = data.label ?? "";
  const shape: NodeShape = data.shape ?? "rectangle";

  const w = typeof width === "number" ? width : 160;
  const h = typeof height === "number" ? height : 80;

  switch (shape) {
    case "pill":
      return <PillShape bg={bg} border={border} label={label} textColor={textColor} />;
    case "circle":
      return <CircleShape bg={bg} border={border} label={label} textColor={textColor} />;
    case "diamond":
      return <DiamondShape bg={bg} stroke={stroke} label={label} textColor={textColor} w={w} h={h} />;
    case "hexagon":
      return <HexagonShape bg={bg} stroke={stroke} label={label} textColor={textColor} w={w} h={h} />;
    case "cylinder":
      return <CylinderShape bg={bg} stroke={stroke} label={label} textColor={textColor} w={w} h={h} />;
    case "rectangle":
    default:
      return <RectangleShape bg={bg} border={border} label={label} textColor={textColor} />;
  }
});