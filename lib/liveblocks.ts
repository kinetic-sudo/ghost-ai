import { Liveblocks } from "@liveblocks/node";

// ---------------------------------------------------------------------------
// Cursor color palette — deterministically assigned per user ID
// ---------------------------------------------------------------------------
const CURSOR_COLORS = [
  "#52A8FF",
  "#BF7AF0",
  "#FF990A",
  "#FF6166",
  "#F75F8F",
  "#62C073",
  "#0AC7B4",
  "#00c8d4",
] as const;

// ---------------------------------------------------------------------------
// Cached singleton — survives hot-reloads in development
// ---------------------------------------------------------------------------
const globalForLiveblocks = global as unknown as {
  liveblocks: Liveblocks | undefined;
};

function createLiveblocksClient(): Liveblocks {
  const secret = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set");
  }
  return new Liveblocks({ secret });
}

export function getLiveblocks(): Liveblocks {
  if (!globalForLiveblocks.liveblocks) {
    globalForLiveblocks.liveblocks = createLiveblocksClient();
  }
  return globalForLiveblocks.liveblocks;
}

// ---------------------------------------------------------------------------
// Deterministically map a userId to a cursor color
// ---------------------------------------------------------------------------
export function getUserCursorColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length;
  return CURSOR_COLORS[index];
}