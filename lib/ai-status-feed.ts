import { getLiveblocks } from "@/lib/liveblocks";
import { AI_STATUS_FEED_ID, aiStatusFeedMessageSchema, type AiStatusFeedMessage } from "@/types/tasks";

// Best-effort per-process cache to skip redundant createFeed calls on a warm
// worker — correctness comes from the try/catch below, not this cache.
const ensuredRooms = new Set<string>();

export async function ensureAiStatusFeed(roomId: string) {
  if (ensuredRooms.has(roomId)) return;
  const liveblocks = getLiveblocks();
  try {
    await liveblocks.createFeed({ roomId, feedId: AI_STATUS_FEED_ID, metadata: {} });
  } catch {
    // Feed already exists — safe to ignore.
  } finally {
    ensuredRooms.add(roomId);
  }
}

export async function publishAiStatus(roomId: string, message: AiStatusFeedMessage) {
  const parsed = aiStatusFeedMessageSchema.parse(message);
  await ensureAiStatusFeed(roomId);
  await getLiveblocks().createFeedMessage({
    roomId,
    feedId: AI_STATUS_FEED_ID,
    data: parsed,
  });
}