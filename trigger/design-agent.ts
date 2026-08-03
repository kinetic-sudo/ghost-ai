import { schemaTask, metadata, logger } from "@trigger.dev/sdk/v3";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject, NoObjectGeneratedError } from "ai";
import type { GoogleGenerativeAIProviderOptions } from "@ai-sdk/google";
import { z } from "zod";

import { getLiveblocks } from "@/lib/liveblocks";
import {
  NODE_SHAPES,
  NODE_COLORS,
  SHAPE_DEFAULTS,
  type CanvasNode,
  type CanvasEdge,
} from "@/types/canvas";

// ---------------------------------------------------------------------------
// Payload — loosely-typed nodes/edges, mirroring generate-spec.ts's pattern
// ---------------------------------------------------------------------------


const nodeSchema = z.object({ id: z.string() }).passthrough();
const edgeSchema = z.object({ id: z.string() }).passthrough();

const payloadSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  prompt: z.string(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

// ---------------------------------------------------------------------------
// Gemini's output schema — constrained to your actual shape/color palette
// ---------------------------------------------------------------------------

const shapeEnum = z.enum(NODE_SHAPES);
const handleEnum = z.enum(["top", "right", "bottom", "left"]);
const paletteIndexSchema = z
  .number()
  .int()
  .min(0)
  .max(NODE_COLORS.length - 1)
  .describe("Index into the fixed color palette. Never invent a hex code.");

const canvasActionSchema = z.array(
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("ADD_NODE"),
      id: z.string().describe("Short, unique, kebab-case id, e.g. 'auth-service'"),
      shape: shapeEnum,
      colorIndex: paletteIndexSchema,
      label: z.string(),
      x: z.number(),
      y: z.number(),
    }),
    z.object({
      type: z.literal("MOVE_NODE"),
      id: z.string(),
      x: z.number(),
      y: z.number(),
    }),
    z.object({
      type: z.literal("RESIZE_NODE"),
      id: z.string(),
      width: z.number().min(60),
      height: z.number().min(40),
    }),
    z.object({
      type: z.literal("UPDATE_NODE"),
      id: z.string(),
      label: z.string().optional(),
      colorIndex: paletteIndexSchema.optional(),
    }),
    z.object({
      type: z.literal("DELETE_NODE"),
      id: z.string(),
    }),
    z.object({
      type: z.literal("ADD_EDGE"),
      id: z.string(),
      source: z.string(),
      target: z.string(),
      sourceHandle: handleEnum,
      targetHandle: handleEnum,
      label: z.string().optional(),
    }),
    z.object({
      type: z.literal("DELETE_EDGE"),
      id: z.string(),
    }),
  ]),
);

const canvasResponseSchema = z.object({
      actions: canvasActionSchema,
    });
    
    type CanvasAction = z.infer<typeof canvasActionSchema>[number];

// ---------------------------------------------------------------------------
// AI agent identity — must satisfy the UserMeta shape in liveblocks.config.ts
// ---------------------------------------------------------------------------

const AI_AGENT_USER_ID = "ghost-ai";
const AI_AGENT_USER_INFO = {
  name: "Ghost AI",
  avatar: "/ghost-ai-avatar.png",
  color: "#8B5CF6",
};

const EDGE_MARKER_END = {
  type: "arrowclosed",
  width: 14,
  height: 14,
  color: "rgba(255, 255, 255, 0.4)",
} as const;

// ---------------------------------------------------------------------------
// Prompt context
// ---------------------------------------------------------------------------

function buildContext(nodes: CanvasNode[], edges: CanvasEdge[]): string {
  const nodeLines = nodes
    .map(
      (n) =>
        `- ${n.data?.label || n.id} (id: ${n.id}, shape: ${n.data?.shape ?? "rectangle"}, at ${JSON.stringify(n.position)})`,
    )
    .join("\n");

  const edgeLines = edges
    .map((e) => `- ${e.source} → ${e.target}${e.data?.label ? ` [${e.data.label}]` : ""}`)
    .join("\n");

  return [
    "## Existing Nodes",
    nodeLines || "(none — canvas is empty)",
    "",
    "## Existing Edges",
    edgeLines || "(none)",
  ].join("\n");
}

const SYSTEM_PROMPT = `You are Ghost AI, an expert system design architect working inside a real-time collaborative canvas.

Translate the user's request into a structured list of canvas actions.

Rules:
- Only use shapes from this exact list: ${NODE_SHAPES.join(", ")}.
- Colors must be given as a palette index (0 to ${NODE_COLORS.length - 1}) — never invent a hex code.
- Space nodes at least 220px apart horizontally and 140px apart vertically so labels don't overlap.
- Reuse the exact existing node ids shown in context for MOVE_NODE, RESIZE_NODE, UPDATE_NODE, DELETE_NODE, and as edge endpoints — never invent an id for something that isn't either already on the canvas or being created in this same batch via ADD_NODE.
- Do not duplicate a node that already represents the same concept — extend or connect to the existing one instead.
- For edges, prefer outgoing connections from the "right" handle and incoming connections to the "left" handle, unless the layout clearly calls for a different side.`;

// ---------------------------------------------------------------------------
// Apply actions against a plain-array snapshot of nodes/edges
// ---------------------------------------------------------------------------

function applyActions(
  currentNodes: CanvasNode[],
  currentEdges: CanvasEdge[],
  actions: CanvasAction[],
): { nodes: CanvasNode[]; edges: CanvasEdge[] } {
  let nodes = [...currentNodes];
  let edges = [...currentEdges];

  for (const action of actions) {
    switch (action.type) {
      case "ADD_NODE": {
        if (nodes.some((n) => n.id === action.id)) break; // avoid duplicate ids
        const palette = NODE_COLORS[action.colorIndex];
        const { width, height } = SHAPE_DEFAULTS[action.shape];
        nodes.push({
          id: action.id,
          type: "canvasNode",
          position: { x: action.x, y: action.y },
          data: {
            label: action.label,
            shape: action.shape,
            color: palette.fill,
            textColor: palette.text,
          },
          style: { width, height },
        } as CanvasNode);
        break;
      }
      case "MOVE_NODE":
        nodes = nodes.map((n) =>
          n.id === action.id ? { ...n, position: { x: action.x, y: action.y } } : n,
        );
        break;
      case "RESIZE_NODE":
        nodes = nodes.map((n) =>
          n.id === action.id
            ? { ...n, style: { ...n.style, width: action.width, height: action.height } }
            : n,
        );
        break;
      case "UPDATE_NODE": {
        const palette = action.colorIndex !== undefined ? NODE_COLORS[action.colorIndex] : undefined;
        nodes = nodes.map((n) =>
          n.id === action.id
            ? {
                ...n,
                data: {
                  ...n.data,
                  ...(action.label !== undefined ? { label: action.label } : {}),
                  ...(palette ? { color: palette.fill, textColor: palette.text } : {}),
                },
              }
            : n,
        );
        break;
      }
      case "DELETE_NODE":
        nodes = nodes.filter((n) => n.id !== action.id);
        edges = edges.filter((e) => e.source !== action.id && e.target !== action.id);
        break;
      case "ADD_EDGE":
        if (edges.some((e) => e.id === action.id)) break;
        edges.push({
          id: action.id,
          source: action.source,
          target: action.target,
          sourceHandle: action.sourceHandle,
          targetHandle: action.targetHandle,
          type: "canvasEdge",
          markerEnd: EDGE_MARKER_END,
          data: action.label ? { label: action.label } : {},
        } as CanvasEdge);
        break;
      case "DELETE_EDGE":
        edges = edges.filter((e) => e.id !== action.id);
        break;
    }
  }

  return { nodes, edges };
}

// ---------------------------------------------------------------------------
// Task
// ---------------------------------------------------------------------------

export const designAgentTask = schemaTask({
  id: "design-agent",
  schema: payloadSchema,
  retry: { maxAttempts: 2, minTimeoutInMs: 1000, maxTimeoutInMs: 10000, factor: 2 },
  run: async (payload) => {
    const { roomId, prompt, nodes, edges } = payload;
    const liveblocks = getLiveblocks();
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_AI_API_KEY });

    async function publishStatus(status: string, message: string) {
      metadata.set("status", status);
      metadata.set("message", message);
      await liveblocks.broadcastEvent(roomId, { type: "AI_STATUS", status, message } as any);
    }

    try {
      await liveblocks.setPresence(roomId, {
        userId: AI_AGENT_USER_ID,
        userInfo: AI_AGENT_USER_INFO,
        data: { cursor: null, isThinking: true },
        ttl: 120,
      });

      await publishStatus("start", "Reading your prompt…");
      logger.info("design-agent: starting", { roomId, promptLength: prompt.length });

      await publishStatus("processing", "Drafting the architecture…");

       const { object } = await generateObject({
        model: google("gemini-3.5-flash"),
        system: SYSTEM_PROMPT,
        prompt: `${buildContext(nodes as CanvasNode[], edges as CanvasEdge[])}\n\n## User Request\n${prompt}`,
        schema: canvasResponseSchema,
        providerOptions: {
                     google: {
                       thinkingConfig: { thinkingLevel: "low" },
                     } satisfies GoogleGenerativeAIProviderOptions,
                   },
    });
       const actions = object.actions;

      await publishStatus(
        "applying",
        `Applying ${actions.length} change${actions.length === 1 ? "" : "s"} to the canvas…`,
      );

      // Re-read LIVE state inside the mutation rather than trusting the
      // context snapshot passed in via payload — collaborators may have
      // edited the canvas in the seconds since this task was triggered.
      await liveblocks.mutateStorage(roomId, ({ root }) => {
        const liveNodes = ((root.get("nodes") as CanvasNode[] | undefined) ?? []);
        const liveEdges = ((root.get("edges") as CanvasEdge[] | undefined) ?? []);
        const result = applyActions(liveNodes, liveEdges, actions);
        root.set("nodes", result.nodes);
        root.set("edges", result.edges);
      });

      await publishStatus("complete", "Architecture generated.");
      metadata.set("actionsApplied", actions.length);
      logger.info("design-agent: complete", { roomId, actionsApplied: actions.length });

      await liveblocks.setPresence(roomId, {
        userId: AI_AGENT_USER_ID,
        userInfo: AI_AGENT_USER_INFO,
        data: { cursor: null, isThinking: false },
        ttl: 5,
      });

      return { success: true, actionsApplied: actions.length };
    } catch (err) {
             if (err instanceof NoObjectGeneratedError) {
                logger.error("design-agent: schema validation failed", {
                  roomId,
                  text: err.text,
                  finishReason: err.finishReason,
                  cause: err.cause instanceof Error ? err.cause.message : String(err.cause),
                });
              }
      logger.error("design-agent: failed", {
        roomId,
        error: err instanceof Error ? err.message : String(err),
      });

      await publishStatus("error", "Couldn't generate the architecture — try rephrasing your prompt.");

      await liveblocks.setPresence(roomId, {
        userId: AI_AGENT_USER_ID,
        userInfo: AI_AGENT_USER_INFO,
        data: { cursor: null, isThinking: false },
        ttl: 5,
      });

      throw err;
    }
  },
});