"use client";

import {
  Circle,
  Diamond,
  Hexagon,
  Pill,
  RectangleHorizontal,
  Cylinder,
} from "lucide-react";

import {
  DRAG_TYPE,
  SHAPE_DEFAULTS,
  NODE_SHAPES,
  DEFAULT_NODE_COLOR,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";

const SHAPE_ICONS: Record<NodeShape, React.ElementType> = {
  rectangle: RectangleHorizontal,
  diamond: Diamond,
  circle: Circle,
  pill: Pill,
  cylinder: Cylinder,
  hexagon: Hexagon,
};

interface ShapeButtonProps {
  shape: NodeShape;
}

function ShapeButton({ shape }: ShapeButtonProps) {
  const Icon = SHAPE_ICONS[shape];

  function onDragStart(e: React.DragEvent) {
    const payload: ShapeDragPayload = {
      shape,
      ...SHAPE_DEFAULTS[shape],
    };
    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";

    // Create the drag ghost preview
    const { width, height } = SHAPE_DEFAULTS[shape];
    const ghost = document.createElement("div");
    ghost.id = `drag-ghost-${shape}`;
    ghost.style.width = `${width}px`;
    ghost.style.height = `${height}px`;
    ghost.style.position = "absolute";
    ghost.style.top = "-9999px";
    ghost.style.left = "-9999px";
    ghost.style.pointerEvents = "none";
    ghost.style.zIndex = "9999";

    const bgColor = DEFAULT_NODE_COLOR.fill;
    const strokeColor = "rgba(255,255,255,0.15)";
    const isSvg = ["diamond", "hexagon", "cylinder"].includes(shape);

    if (!isSvg) {
      ghost.style.backgroundColor = bgColor;
      ghost.style.border = `1px solid ${strokeColor}`;
      if (shape === "pill" || shape === "circle") {
        ghost.style.borderRadius = "9999px";
      }
    } else {
      const sw = "2";
      let innerHTML = "";
      if (shape === "diamond") {
        innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible;"><polygon points="50,0 100,50 50,100 0,50" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/></svg>`;
      } else if (shape === "hexagon") {
        innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible;"><polygon points="25,0 75,0 100,50 75,100 25,100 0,50" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/></svg>`;
      } else if (shape === "cylinder") {
        innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%; height:100%; overflow:visible;"><path d="M 0 15 L 0 85 A 50 15 0 0 0 100 85 L 100 15 A 50 15 0 0 1 0 15 Z" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/><ellipse cx="50" cy="15" rx="50" ry="15" fill="${bgColor}" stroke="${strokeColor}" stroke-width="${sw}" vector-effect="non-scaling-stroke"/></svg>`;
      }
      ghost.innerHTML = innerHTML;
    }

    document.body.appendChild(ghost);

    // Attach ghost directly to the cursor center based on shape dimensions
    e.dataTransfer.setDragImage(ghost, width / 2, height / 2);

    // Destroy ghost from DOM immediately so it doesn't linger
    setTimeout(() => {
      if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
    }, 0);
  }

  return (
    <button
      draggable
      onDragStart={onDragStart}
      title={shape.charAt(0).toUpperCase() + shape.slice(1)}
      className="flex h-9 w-9 cursor-grab items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/[0.06] hover:text-white active:cursor-grabbing active:scale-95"
    >
      <Icon className="size-4" />
    </button>
  );
}

export function ShapePanel() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#111111]/90 px-3 py-1.5 shadow-2xl backdrop-blur-md">
        {NODE_SHAPES.map((shape) => (
          <ShapeButton key={shape} shape={shape} />
        ))}
      </div>
    </div>
  );
}