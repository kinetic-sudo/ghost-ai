"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DRAG_TYPE,
  SHAPE_DEFAULTS,
  DEFAULT_NODE_COLOR,
  type NodeShape,
  type ShapeDragPayload,
} from "@/types/canvas";

// ---------------------------------------------------------------------------
// Ghost shape preview — mirrors the canvas-node SVG/CSS rendering at 70% opacity
// ---------------------------------------------------------------------------

interface GhostShapeProps {
  shape: NodeShape;
  width: number;
  height: number;
}

function GhostShape({ shape, width: w, height: h }: GhostShapeProps) {
  const bg = DEFAULT_NODE_COLOR.fill;
  const stroke = "rgba(0,229,255,0.6)";

  if (shape === "pill") {
    return (
      <div style={{
        width: w, height: h,
        backgroundColor: bg,
        borderRadius: 9999,
        border: `1.5px solid ${stroke}`,
      }} />
    );
  }

  if (shape === "circle") {
    return (
      <div style={{
        width: w, height: h,
        backgroundColor: bg,
        borderRadius: "50%",
        border: `1.5px solid ${stroke}`,
      }} />
    );
  }

  if (shape === "diamond") {
    const cx = w / 2, cy = h / 2;
    return (
      <svg width={w} height={h}>
        <polygon points={`${cx},0 ${w},${cy} ${cx},${h} 0,${cy}`}
          fill={bg} stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  }

  if (shape === "hexagon") {
    const cx = w / 2, cy = h / 2, rx = w / 2, ry = h / 2;
    const pts = [0,1,2,3,4,5].map((i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + rx * Math.cos(a)},${cy + ry * Math.sin(a)}`;
    }).join(" ");
    return (
      <svg width={w} height={h}>
        <polygon points={pts} fill={bg} stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  }

  if (shape === "cylinder") {
    const rx = w / 2, ry = Math.max(h * 0.12, 10);
    const bodyTop = ry, bodyH = h - ry * 2;
    return (
      <svg width={w} height={h}>
        <rect x={0} y={bodyTop} width={w} height={bodyH} fill={bg} stroke={stroke} strokeWidth="1.5" />
        <ellipse cx={rx} cy={bodyTop + bodyH} rx={rx} ry={ry} fill={bg} stroke={stroke} strokeWidth="1.5" />
        <ellipse cx={rx} cy={bodyTop} rx={rx} ry={ry} fill={bg} stroke={stroke} strokeWidth="1.5" />
      </svg>
    );
  }

  // rectangle (default)
  return (
    <div style={{
      width: w, height: h,
      backgroundColor: bg,
      borderRadius: 8,
      border: `1.5px solid ${stroke}`,
    }} />
  );
}

// ---------------------------------------------------------------------------
// DragPreview — mounts a portal div that follows the cursor during drag
// ---------------------------------------------------------------------------

export function DragPreview() {
  const [preview, setPreview] = useState<{ shape: NodeShape; width: number; height: number } | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    function onDragStart(e: DragEvent) {
      const raw = e.dataTransfer?.getData(DRAG_TYPE);
      // dataTransfer.getData returns "" during dragstart on some browsers —
      // read from the element's data attribute instead via types
      // We store the shape in a custom mime type; parse it directly if available,
      // otherwise fall back to reading the shape from the drag element's dataset.
      if (!raw) {
        // Try to read shape from the dragged element's data attribute
        const el = e.target as HTMLElement | null;
        const shape = el?.dataset?.shape as NodeShape | undefined;
        if (shape && SHAPE_DEFAULTS[shape]) {
          const { width, height } = SHAPE_DEFAULTS[shape];
          setPreview({ shape, width, height });
          setPos({ x: e.clientX, y: e.clientY });
        }
        return;
      }
      try {
        const payload = JSON.parse(raw) as ShapeDragPayload;
        setPreview({ shape: payload.shape, width: payload.width, height: payload.height });
        setPos({ x: e.clientX, y: e.clientY });
      } catch {
        // ignore
      }
    }

    function onDrag(e: DragEvent) {
      if (e.clientX === 0 && e.clientY === 0) return; // end-of-drag ghost position
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        setPos({ x: e.clientX, y: e.clientY });
      });
    }

    function onDragEnd() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      setPreview(null);
    }

    window.addEventListener("dragstart", onDragStart);
    window.addEventListener("drag", onDrag);
    window.addEventListener("dragend", onDragEnd);
    window.addEventListener("drop", onDragEnd);

    return () => {
      window.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("drag", onDrag);
      window.removeEventListener("dragend", onDragEnd);
      window.removeEventListener("drop", onDragEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!preview) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        left: pos.x - preview.width / 2,
        top: pos.y - preview.height / 2,
        width: preview.width,
        height: preview.height,
        opacity: 0.65,
        pointerEvents: "none",
        zIndex: 9999,
        transition: "none",
      }}
      aria-hidden
    >
      <GhostShape shape={preview.shape} width={preview.width} height={preview.height} />
    </div>,
    document.body,
  );
}