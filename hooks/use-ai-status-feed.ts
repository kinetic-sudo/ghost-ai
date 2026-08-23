"use client";

import { useEffect, useRef } from "react";
import { useCreateFeed, useFeedMessages } from "@liveblocks/react/suspense";

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
  const createFeed = useCreateFeed();
  const feedEnsured = useRef(false);

  // Ensure the feed exists client-side, on mount — mirrors use-ai-chat-feed.ts.
  // Previously this feed only ever got created server-side, just-in-time,
  // the first time design-agent.ts called publishStatus mid-run. That meant
  // useFeedMessages below was subscribing to a feed that didn't exist yet on
  // every fresh room. Symptom: the very first status message ("Reading your
  // prompt…") would show up fine, but nothing published after it ever did —
  // consistent with a feed created out from under an already-established
  // subscription not properly upgrading to live updates. Ensuring the feed
  // exists before any run can publish to it avoids that path entirely.
  useEffect(() => {
    if (feedEnsured.current) return;
    feedEnsured.current = true;
    Promise.resolve(createFeed(AI_STATUS_FEED_ID, { metadata: { kind: "status" } })).catch(() => {
      // Already exists — fine.
    });
  }, [createFeed]);

  const { messages } = useFeedMessages(AI_STATUS_FEED_ID);

  // Liveblocks Feeds returns messages chronologically (oldest-first) — the
  // last element is the latest, not index 0.
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