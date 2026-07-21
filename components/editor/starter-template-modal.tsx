"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-template";
import { Download } from "lucide-react";
import type { CanvasNodeData } from "@/types/canvas";

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const nodes = template.nodes;
  const edges = template.edges;

  if (nodes.length === 0) return null;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  nodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    const w = typeof node.style?.width === "number" ? node.style.width : 100;
    const h = typeof node.style?.height === "number" ? node.style.height : 60;

    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x + w);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y + h);
  });

  const padding = 30;
  const bboxWidth = Math.max(1, maxX - minX + padding * 2);
  const bboxHeight = Math.max(1, maxY - minY + padding * 2);

  const nodeCenters = new Map<
    string,
    { cx: number; cy: number; x: number; y: number; w: number; h: number; color: string }
  >();

  nodes.forEach((node) => {
    const x = node.position.x;
    const y = node.position.y;
    const w = typeof node.style?.width === "number" ? node.style.width : 100;
    const h = typeof node.style?.height === "number" ? node.style.height : 60;
    const color = (node.data as CanvasNodeData)?.color || "#1f2937";

    nodeCenters.set(node.id, {
      cx: x + w / 2,
      cy: y + h / 2,
      x,
      y,
      w,
      h,
      color,
    });
  });

  const viewBox = `${minX - padding} ${minY - padding} ${bboxWidth} ${bboxHeight}`;

  return (
    <div className="relative h-40 w-full overflow-hidden rounded-lg border border-white/[0.04] bg-[#050505] p-2 flex items-center justify-center">
      <svg
        viewBox={viewBox}
        className="h-full w-full max-h-full max-w-full opacity-70 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md"
      >
        {/* Draw Edges */}
        {edges.map((edge) => {
          const source = nodeCenters.get(edge.source);
          const target = nodeCenters.get(edge.target);
          if (!source || !target) return null;
          return (
            <line
              key={edge.id}
              x1={source.cx}
              y1={source.cy}
              x2={target.cx}
              y2={target.cy}
              stroke="rgba(255, 255, 255, 0.25)"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          );
        })}

        {/* Draw Nodes */}
        {nodes.map((node) => {
          const info = nodeCenters.get(node.id);
          if (!info) return null;
          const { x, y, w, h, color } = info;
          const shape = (node.data as CanvasNodeData)?.shape || "rectangle";
          const strokeColor = "rgba(255,255,255,0.15)";
          const strokeWidth = 1.5;

          if (shape === "circle") {
            const r = Math.min(w, h) / 2;
            return (
              <circle
                key={node.id}
                cx={x + w / 2}
                cy={y + h / 2}
                r={r}
                fill={color}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
            );
          }

          if (shape === "pill") {
            return (
              <rect
                key={node.id}
                x={x}
                y={y}
                width={w}
                height={h}
                rx={h / 2}
                fill={color}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
            );
          }

          if (shape === "diamond") {
            const pts = `${x + w / 2},${y} ${x + w},${y + h / 2} ${x + w / 2},${y + h} ${x},${y + h / 2}`;
            return (
              <polygon
                key={node.id}
                points={pts}
                fill={color}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
            );
          }

          if (shape === "hexagon") {
            const inset = w * 0.2;
            const pts = `${x + inset},${y} ${x + w - inset},${y} ${x + w},${y + h / 2} ${x + w - inset},${y + h} ${x + inset},${y + h} ${x},${y + h / 2}`;
            return (
              <polygon
                key={node.id}
                points={pts}
                fill={color}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
              />
            );
          }

          if (shape === "cylinder") {
            const rx = w / 2;
            const ry = h * 0.15;
            return (
              <g key={node.id}>
                {/* Cylinder Body */}
                <path
                  d={`M ${x},${y + ry} v ${h - 2 * ry} a ${rx},${ry} 0 0,0 ${w},0 v -${h - 2 * ry} z`}
                  fill={color}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
                {/* Cylinder Top */}
                <ellipse
                  cx={x + w / 2}
                  cy={y + ry}
                  rx={rx}
                  ry={ry}
                  fill={color}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                />
              </g>
            );
          }

          // Default Rectangle
          return (
            <rect
              key={node.id}
              x={x}
              y={y}
              width={w}
              height={h}
              rx={8}
              fill={color}
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          );
        })}
      </svg>
    </div>
  );
}

interface StarterTemplatesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (template: CanvasTemplate) => void;
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  const handleSelect = (template: CanvasTemplate) => {
    onImport(template);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[950px] w-[95vw] bg-[#121212] border-white/10 p-6 sm:p-8 text-white rounded-2xl shadow-2xl overflow-hidden">
        <DialogHeader className="mb-6 text-left space-y-2">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-white">
            Starter Templates
          </DialogTitle>
          <p className="text-[14px] text-white/50 font-medium">
            Select a pre-built architecture diagram to quickly populate your canvas. Existing nodes will be replaced — use{" "}
            <kbd className="inline-flex items-center justify-center font-sans px-1.5 py-0.5 rounded-md bg-white/10 border border-white/10 text-white/80 text-[11px] font-semibold mx-0.5 shadow-sm">
              ⌘Z
            </kbd>{" "}
            to undo.
          </p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CANVAS_TEMPLATES.map((template) => (
            <div
              key={template.id}
              className="flex flex-col group rounded-2xl border border-white/5 bg-white/[0.02] p-3 transition-all duration-300 hover:border-[#00E5FF]/30 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-[#00E5FF]/5"
            >
              <div className="mb-4">
                <TemplatePreview template={template} />
              </div>

              <div className="flex flex-col flex-1 px-1 pb-1">
                <h3 className="text-[15px] font-semibold text-white mb-2 group-hover:text-[#00E5FF] transition-colors">
                  {template.name}
                </h3>
                <p className="text-[13px] text-white/40 leading-relaxed flex-1 mb-5 line-clamp-3">
                  {template.description}
                </p>

                <Button
                  variant="outline"
                  className="w-full bg-transparent border-white/10 hover:bg-[#00E5FF] hover:text-[#00E5FF] hover:border-[#00E5FF] text-white/80 transition-all rounded-lg h-9 shadow-sm font-medium"
                  onClick={() => handleSelect(template)}
                >
                  <Download className="w-3.5 h-3.5 mr-2 opacity-50 group-hover:opacity-200 transition-opacity" />
                  Import Template
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}