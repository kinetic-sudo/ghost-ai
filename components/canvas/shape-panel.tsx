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
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";
import { DragPreview } from "@/components/canvas/drag-preview";

const SHAPE_ICONS: Record<NodeShape, React.ElementType> = {
  rectangle: RectangleHorizontal,
  diamond:   Diamond,
  circle:    Circle,
  pill:      Pill,
  cylinder:  Cylinder,
  hexagon:   Hexagon,
};

function ShapeButton({ shape }: { shape: NodeShape }) {
  const Icon = SHAPE_ICONS[shape];

  function onDragStart(e: React.DragEvent) {
    const payload: ShapeDragPayload = { shape, ...SHAPE_DEFAULTS[shape] };
    e.dataTransfer.setData(DRAG_TYPE, JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "copy";
    // Suppress the browser's default drag image (we render our own ghost)
    const blank = document.createElement("div");
    blank.style.width = "1px";
    blank.style.height = "1px";
    blank.style.position = "fixed";
    blank.style.top = "-9999px";
    document.body.appendChild(blank);
    e.dataTransfer.setDragImage(blank, 0, 0);
    requestAnimationFrame(() => blank.remove());
  }

  return (
    <button
      draggable
      onDragStart={onDragStart}
      // data-shape is a fallback for browsers that return "" from getData during dragstart
      data-shape={shape}
      title={shape.charAt(0).toUpperCase() + shape.slice(1)}
      className="flex h-9 w-9 cursor-grab items-center justify-center rounded-lg text-white/40 transition-all hover:bg-white/[0.06] hover:text-white active:cursor-grabbing active:scale-95"
    >
      <Icon className="size-4" />
    </button>
  );
}

export function ShapePanel() {
  return (
    <>
      {/* Ghost preview — renders in a portal over everything */}
      <DragPreview />

      <div className="pointer-events-none absolute inset-x-0 bottom-6 z-10 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/[0.08] bg-[#111111]/90 px-3 py-1.5 shadow-2xl backdrop-blur-md">
          {NODE_SHAPES.map((shape) => (
            <ShapeButton key={shape} shape={shape} />
          ))}
        </div>
      </div>
    </>
  );
}