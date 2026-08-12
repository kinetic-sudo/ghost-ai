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

    // Liveblocks Feeds returns messages newest-first, not chronological —
    // index 0 is the latest, not the last element.
    const latest = messages[0];

    // No status has ever been posted to this room yet (brand new room, or
    // no design run has run since it was created) — nothing to show.
    if (!latest) return { message: null, isGenerating: false };

  // Validate before displaying — a malformed/foreign message on this feed
  // should never crash the sidebar or render garbage.
  const parsed = aiStatusFeedMessageSchema.safeParse(latest.data);
  if (!parsed.success) return { message: null, isGenerating: false };

  return { message: parsed.data, isGenerating: isAiStatusActive(parsed.data.status) };
}