import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared AI status feed — generic across design generation, spec generation,
// and any future background AI task that needs to report progress to a room.
// ---------------------------------------------------------------------------

export const AI_STATUS_FEED_ID = "ai-status-feed";

export const AI_STATUS_VALUES = [
  "start",
  "processing",
  "applying",
  "complete",
  "error",
] as const;

export const aiStatusFeedMessageSchema = z.object({
  // Which generation flow this status belongs to — optional today (only
  // design generation exists), keeps the feed reusable for spec generation
  // later without a schema change.
  kind: z.enum(["design", "spec"]).optional(),
  status: z.enum(AI_STATUS_VALUES),
  text: z.string().optional(),
});

export type AiStatusFeedMessage = z.infer<typeof aiStatusFeedMessageSchema>;

export function isAiStatusActive(status: AiStatusFeedMessage["status"]): boolean {
  return status === "start" || status === "processing" || status === "applying";
}

// ---------------------------------------------------------------------------
// Shared room chat — a separate feed from ai-status-feed. Chat is
// user-authored; AI replies are explicitly out of scope for this unit, but
// "role" is widened to include "assistant" now so a future unit can add
// them to this same feed without a schema change.
// ---------------------------------------------------------------------------

 export const AI_CHAT_FEED_ID = "ai-chat";
 export const chatMessageSchema = z.object({
  senderId: z.string(),
  senderName: z.string(),
  senderAvatar: z.string().optional(),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  timestamp: z.number(),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;