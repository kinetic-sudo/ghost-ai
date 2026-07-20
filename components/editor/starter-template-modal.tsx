"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-template";
import { LayoutTemplate } from "lucide-react";
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
    <div className="relative h-36 w-full overflow-hidden rounded-lg border border-white/[0.08] bg-[#0d0d0d] p-2 flex items-center justify-center">
      <svg viewBox={viewBox} className="h-full w-full max-h-full max-w-full">
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

          if (shape === "circle") {
            const r = Math.min(w, h) / 2;
            return (
              <circle
                key={node.id}
                cx={x + w / 2}
                cy={y + h / 2}
                r={r}
                fill={color}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1.5}
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
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1.5}
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
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1.5}
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
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={1.5}
              />
            );
          }

          return (
            <rect
              key={node.id}
              x={x}
              y={y}
              width={w}
              height={h}
              rx={8}
              fill={color}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1.5}
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
      <DialogContent className="max-w-3xl border-white/10 bg-[#141414] text-white">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5">
              <LayoutTemplate className="h-4 w-4 text-[#00E5FF]" />
            </div>
            <DialogTitle className="text-lg font-semibold text-white">
              Starter Templates
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-neutral-400">
            Select a pre-built architecture diagram to quickly populate your canvas.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="group flex flex-col justify-between rounded-xl border border-white/10 bg-[#1a1a1a] p-3 transition-all hover:border-[#00E5FF]/40 hover:shadow-lg hover:shadow-[#00E5FF]/5"
              >
                <div className="space-y-3">
                  <TemplatePreview template={template} />
                  <div>
                    <h3 className="font-medium text-sm text-white group-hover:text-[#00E5FF] transition-colors">
                      {template.name}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => handleSelect(template)}
                  size="sm"
                  className="mt-4 w-full bg-white/10 text-xs text-white hover:bg-[#00E5FF] hover:text-black transition-colors"
                >
                  Import Template
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}