"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useCreateFeed,
  useCreateFeedMessage,
  useFeedMessages,
  useErrorListener,
} from "@liveblocks/react/suspense";
import { useUser } from "@clerk/nextjs";

import { AI_CHAT_FEED_ID, chatMessageSchema, type ChatMessage } from "@/types/tasks";

export function useAiChatFeed() {
  const { user } = useUser();
  const { messages: rawMessages } = useFeedMessages(AI_CHAT_FEED_ID);
  const createFeed = useCreateFeed();
  const createFeedMessage = useCreateFeedMessage();
  const [sendError, setSendError] = useState<string | null>(null);
  const feedEnsured = useRef(false);

  // Best-effort create-once per session — safe to ignore if it already exists.
  // createFeed rejects asynchronously (not a sync throw), so this must be
  // caught with .catch() — a try/catch here would never see the rejection
  // and it would surface as an unhandled promise rejection instead.
  useEffect(() => {
    if (feedEnsured.current) return;
    feedEnsured.current = true;
    Promise.resolve(createFeed(AI_CHAT_FEED_ID, { metadata: { kind: "chat" } })).catch(() => {
      // Already exists — fine.
    });
  }, [createFeed]);

  useErrorListener((error) => {
    const context = error.context as { type?: string; feedId?: string } | undefined;
    if (context?.type === "CREATE_FEED_MESSAGE_ERROR" && context.feedId === AI_CHAT_FEED_ID) {
      setSendError("Message failed to send. Try again.");
    }
  });

  // Validate every message before it's ever rendered. Liveblocks Feeds
  // already returns messages chronologically (oldest-first) — confirmed
  // against Liveblocks' own docs, which use `messages[messages.length - 1]`
  // as their documented pattern for "the latest message." A previous
  // version .reverse()'d this array under the opposite assumption, which
  // flipped an already-correct order into newest-first — visible as replies
  // rendering above the message that triggered them.
  const messages: ChatMessage[] = [...(rawMessages ?? [])]
    .map((m) => chatMessageSchema.safeParse(m.data))
    .filter((r): r is { success: true; data: ChatMessage } => r.success)
    .map((r) => r.data);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || !user) return;
      setSendError(null);
      const payload = chatMessageSchema.parse({
        senderId: user.id,
        senderName: user.fullName ?? user.username ?? "Anonymous",
        senderAvatar: user.imageUrl,
        role: "user" as const,
        content: trimmed,
        timestamp: Date.now(),
      });
      createFeedMessage(AI_CHAT_FEED_ID, payload, { timestamp: payload.timestamp });
    },
    [createFeedMessage, user],
  );

  return { messages, sendMessage, sendError, currentUserId: user?.id };
}