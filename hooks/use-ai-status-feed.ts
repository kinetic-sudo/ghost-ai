"use client";

import { useFeedMessages } from "@liveblocks/react/suspense";

import {
  AI_STATUS_FEED_ID,
  aiStatusFeedMessageSchema,
  isAiStatusActive,
  type AiStatusFeedMessage,
} from "@/types/tasks";

export function useAiStatusFeed(): {
  message: AiStatusFeedMessage | null;
  isGenerating: boolean;
} {
  const { messages } = useFeedMessages(AI_STATUS_FEED_ID);
  const latest = messages[messages.length - 1];

  if (!latest) return { message: null, isGenerating: false };

  // Validate before displaying — a malformed/foreign message on this feed
  // should never crash the sidebar or render garbage.
  const parsed = aiStatusFeedMessageSchema.safeParse(latest.data);
  if (!parsed.success) return { message: null, isGenerating: false };

  return { message: parsed.data, isGenerating: isAiStatusActive(parsed.data.status) };
}