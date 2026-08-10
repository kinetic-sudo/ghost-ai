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
  useEffect(() => {
    if (feedEnsured.current) return;
    feedEnsured.current = true;
    try {
      createFeed(AI_CHAT_FEED_ID, { metadata: { kind: "chat" } });
    } catch {
      // Already exists — fine.
    }
  }, [createFeed]);

  useErrorListener((error) => {
    const context = error.context as { type?: string; feedId?: string } | undefined;
    if (context?.type === "CREATE_FEED_MESSAGE_ERROR" && context.feedId === AI_CHAT_FEED_ID) {
      setSendError("Message failed to send. Try again.");
    }
  });

  // Validate every message before it's ever rendered, and reverse into
  // chronological (oldest-first) order for a normal top-to-bottom chat read.
  const messages: ChatMessage[] = [...(rawMessages ?? [])]
    .reverse()
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