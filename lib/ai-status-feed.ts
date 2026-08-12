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

    // Liveblocks Feeds returns messages chronologically (oldest-first) — the
    // last element is the latest, not index 0. (Confirmed against
    // Liveblocks' own docs: `messages[messages.length - 1]` is their
    // documented pattern for "latest message.") Previous version treated
    // index 0 as latest, which meant this always showed the very first
    // status ever published to the room and never updated again.
    const latest = messages[messages.length - 1];

    // No status has ever been posted to this room yet (brand new room, or
    // no design run has run since it was created) — nothing to show.
    if (!latest) return { message: null, isGenerating: false };

  // Validate before displaying — a malformed/foreign message on this feed
  // should never crash the sidebar or render garbage.
  const parsed = aiStatusFeedMessageSchema.safeParse(latest.data);
  if (!parsed.success) return { message: null, isGenerating: false };

  return { message: parsed.data, isGenerating: isAiStatusActive(parsed.data.status) };
}