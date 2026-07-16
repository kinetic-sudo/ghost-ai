import type { Node, Edge } from "@xyflow/react";

// ---------------------------------------------------------------------------
// Node data shape
// ---------------------------------------------------------------------------
export interface CanvasNodeData extends Record<string, unknown> {
  label: string;
  color?: string;
  shape?: "rectangle" | "circle" | "diamond";
}

// ---------------------------------------------------------------------------
// Named node and edge types used throughout the canvas
// ---------------------------------------------------------------------------
export type CanvasNode = Node<CanvasNodeData, "canvasNode">;
export type CanvasEdge = Edge<Record<string, unknown>, "canvasEdge">;

// ---------------------------------------------------------------------------
// React Flow nodeTypes / edgeTypes maps
// (populated with real renderers in later feature specs)
// ---------------------------------------------------------------------------
export const NODE_TYPES = {} as const;
export const EDGE_TYPES = {} as const;