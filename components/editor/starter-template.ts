import { type Node, type Edge, MarkerType } from "@xyflow/react";
import { NODE_COLORS, type NodeShape, type CanvasNodeData } from "@/types/canvas";

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  nodes: Node<CanvasNodeData>[];
  edges: Edge[];
}

const DEFAULT_MARKER = {
  type: MarkerType.ArrowClosed,
  width: 14,
  height: 14,
  color: "rgba(255, 255, 255, 0.4)",
};

function createNode(
  id: string,
  shape: NodeShape,
  label: string,
  x: number,
  y: number,
  width: number,
  height: number,
  colorIdx = 0
): Node<CanvasNodeData> {
  const colorObj = NODE_COLORS[colorIdx % NODE_COLORS.length];
  return {
    id,
    type: "canvasNode",
    position: { x, y },
    data: {
      label,
      shape,
      color: colorObj.value,
      textColor: colorObj.textColor,
    },
    style: {
      width,
      height,
    },
  };
}

function createEdge(id: string, source: string, target: string, label = ""): Edge {
  return {
    id,
    source,
    target,
    type: "canvasEdge",
    markerEnd: DEFAULT_MARKER,
    data: { label },
  };
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: "microservices",
    name: "Microservices Architecture",
    description: "API Gateway routing requests to Auth, User, and Payment services with database layers.",
    nodes: [
      createNode("client", "pill", "Client App", 50, 150, 120, 60, 1),
      createNode("gateway", "hexagon", "API Gateway", 240, 145, 140, 70, 0),
      createNode("auth-service", "rectangle", "Auth Service", 460, 40, 130, 65, 2),
      createNode("user-service", "rectangle", "User Service", 460, 150, 130, 65, 3),
      createNode("payment-service", "rectangle", "Payment Service", 460, 260, 130, 65, 4),
      createNode("user-db", "cylinder", "User DB", 670, 150, 100, 65, 5),
      createNode("payment-db", "cylinder", "Payment DB", 670, 260, 100, 65, 5),
    ],
    edges: [
      createEdge("e1", "client", "gateway", "HTTP/HTTPS"),
      createEdge("e2", "gateway", "auth-service", "/auth"),
      createEdge("e3", "gateway", "user-service", "/users"),
      createEdge("e4", "gateway", "payment-service", "/checkout"),
      createEdge("e5", "user-service", "user-db", "SQL"),
      createEdge("e6", "payment-service", "payment-db", "SQL"),
    ],
  },
  
  {
    id: "cicd-pipeline",
    name: "CI/CD Pipeline",
    description: "Automated workflow from Git commit to build, test, approval, and production deployment.",
    nodes: [
      createNode("git-repo", "diamond", "Git Commit", 50, 100, 110, 80, 3),
      createNode("build-step", "rectangle", "Build App", 220, 100, 120, 60, 0),
      createNode("test-step", "rectangle", "Run Tests", 390, 100, 120, 60, 1),
      createNode("decision", "diamond", "Tests Pass?", 560, 90, 120, 80, 4),
      createNode("deploy-staging", "pill", "Deploy Staging", 740, 30, 130, 55, 2),
      createNode("deploy-prod", "pill", "Deploy Prod", 740, 170, 130, 55, 5),
    ],
    edges: [
      createEdge("e1", "git-repo", "build-step", "Trigger"),
      createEdge("e2", "build-step", "test-step"),
      createEdge("e3", "test-step", "decision"),
      createEdge("e4", "decision", "deploy-staging", "Pass"),
      createEdge("e5", "decision", "deploy-prod", "Approved"),
    ],
  },
  {
    id: "event-driven",
    name: "Event-Driven System",
    description: "Producers publishing events to Kafka topic consumed asynchronously by worker services.",
    nodes: [
      createNode("producer-1", "rectangle", "Web Producer", 50, 50, 130, 60, 0),
      createNode("producer-2", "rectangle", "IoT Ingest", 50, 180, 130, 60, 1),
      createNode("event-bus", "hexagon", "Kafka Stream", 250, 110, 150, 80, 4),
      createNode("consumer-analytics", "pill", "Analytics Worker", 470, 40, 140, 60, 2),
      createNode("consumer-notification", "pill", "Email Worker", 470, 180, 140, 60, 3),
      createNode("analytics-store", "cylinder", "Clickhouse DB", 680, 40, 120, 70, 5),
    ],
    edges: [
      createEdge("e1", "producer-1", "event-bus", "Publish"),
      createEdge("e2", "producer-2", "event-bus", "Publish"),
      createEdge("e3", "event-bus", "consumer-analytics", "Subscribe"),
      createEdge("e4", "event-bus", "consumer-notification", "Subscribe"),
      createEdge("e5", "consumer-analytics", "analytics-store", "Batch Write"),
    ],
    
  },
];