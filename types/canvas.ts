import { Node, Edge } from '@xyflow/react';

export type CanvasNodeData = {
  label: string;
  color?: string;
  shape?: string;
};

export type CanvasNode = Node<CanvasNodeData, 'canvasNode'>;
export type CanvasEdge = Edge<Record<string, unknown>, 'canvasEdge'>;