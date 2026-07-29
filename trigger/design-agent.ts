import { task } from "@trigger.dev/sdk/v3";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { Liveblocks } from "@liveblocks/node";
import { z } from "zod";

// Initialize Liveblocks Node client
const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY as string,
});

// Schema for allowed canvas actions
const canvasActionSchema = z.object({
  actions: z.array(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("ADD_NODE"),
        payload: z.object({ id: z.string(), shape: z.enum(["rectangle", "diamond", "circle", "pill", "cylinder", "hexagon"]), x: z.number(), y: z.number(), color: z.string(), textColor: z.string(), label: z.string() })
      }),
      z.object({
        type: z.literal("MOVE_NODE"),
        payload: z.object({ id: z.string(), x: z.number(), y: z.number() })
      }),
      z.object({
        type: z.literal("RESIZE_NODE"),
        payload: z.object({ id: z.string(), width: z.number(), height: z.number() })
      }),
      z.object({
        type: z.literal("UPDATE_NODE"),
        payload: z.object({ id: z.string(), label: z.string().optional(), color: z.string().optional(), textColor: z.string().optional() })
      }),
      z.object({
        type: z.literal("DELETE_NODE"),
        payload: z.object({ id: z.string() })
      }),
      z.object({
        type: z.literal("ADD_EDGE"),
        payload: z.object({ id: z.string(), source: z.string(), target: z.string(), sourceHandle: z.enum(["top", "right", "bottom", "left"]), targetHandle: z.enum(["top", "right", "bottom", "left"]), label: z.string().optional() })
      }),
      z.object({
        type: z.literal("DELETE_EDGE"),
        payload: z.object({ id: z.string() })
      }),
    ])
  ),
});

export const designAgentTask = task({
  id: "design-agent",
  run: async (payload: { projectId: string; prompt: string; currentNodes: any[]; currentEdges: any[] }) => {
    const { projectId, prompt, currentNodes, currentEdges } = payload;
    const room = liveblocks.room(projectId);

    try {
      // 1. Start: Broadcast initial status and AI presence (thinking + center cursor)
      await room.broadcastEvent({
        type: "AI_STATUS",
        status: "start",
        message: "AI is analyzing your system architecture request...",
        presence: { isThinking: true, cursor: { x: 0, y: 0 } }
      });

      // 2. Processing: Interpret prompt using Gemini
      await room.broadcastEvent({
        type: "AI_STATUS",
        status: "processing",
        message: "Drafting architecture layout and components...",
      });

      const { object: aiResponse } = await generateObject({
        model: google("gemini-1.5-pro"),
        system: `You are an expert system design architect and AI agent operating inside a collaborative real-time canvas.
        Translate the user's natural language prompt into a structured array of canvas mutations.
        
        Rules:
        - Allowed shapes: "rectangle", "diamond", "circle", "pill", "cylinder", "hexagon".
        - Spacing: Maintain a clean, readable layout with at least 150px gaps between nodes.
        - Colors: Use standard hex codes from the predefined NODE_COLORS palette.
        - Edges: Connect relevant nodes logically (e.g., sourceHandle "right" to targetHandle "left").
        - Context: You have access to the current nodes and edges. Do not duplicate existing structures unless requested.`,
        prompt: `Current Canvas State:\nNodes: ${JSON.stringify(currentNodes)}\nEdges: ${JSON.stringify(currentEdges)}\n\nUser Request: ${prompt}`,
        schema: canvasActionSchema,
      });

      // 3. Apply updates: Send the mutations to the Liveblocks room
      // Assuming your frontend uses `useEventListener` to catch "AI_MUTATE_CANVAS" and apply them via `useLiveblocksFlow`
      await room.broadcastEvent({
        type: "AI_MUTATE_CANVAS",
        actions: aiResponse.actions,
      });

      // 4. Complete: Clear AI presence and push success status
      await room.broadcastEvent({
        type: "AI_STATUS",
        status: "complete",
        message: "Architecture successfully generated.",
        presence: { isThinking: false, cursor: null }
      });

      return { success: true, actionsApplied: aiResponse.actions.length };

    } catch (error) {
      // Handle errors gracefully and clear presence
      console.error("AI Generation Error:", error);
      await room.broadcastEvent({
        type: "AI_STATUS",
        status: "error",
        message: "Failed to generate architecture. Please try adjusting your prompt.",
        presence: { isThinking: false, cursor: null }
      });
      throw error;
    }
  }
});