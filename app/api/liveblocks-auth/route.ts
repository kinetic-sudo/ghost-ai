import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getLiveblocks, getUserCursorColor } from "@/lib/liveblocks";
import { getAccessibleProject } from "@/lib/project-acess"; // Typo corrected 

interface AuthRequestBody {
  room?: string;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as AuthRequestBody;
  const roomId =
    typeof body.room === "string" && body.room.trim()
      ? body.room.trim()
      : null;

  if (!roomId) {
    return NextResponse.json({ error: "room is required" }, { status: 400 });
  }

  // Verify the user has access to this project
  const project = await getAccessibleProject(roomId);
  if (!project) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const liveblocks = getLiveblocks();

  // Ensure the room exists — no-op if it already does
  await liveblocks.getOrCreateRoom(roomId, {
    defaultAccesses: [],
  });

  // Fetch user info from Clerk to attach to the session
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);

  // FIXED: Explicitly group the ?? and || fallbacks to resolve ts(5076)
  const name =
    (user.fullName ?? [user.firstName, user.lastName].filter(Boolean).join(" ")) ||
    (user.username ?? "Anonymous");

  const avatar = user.imageUrl ?? "";
  const color = getUserCursorColor(userId);

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      name,
      avatar,
      color,
    },
  });

  session.allow(roomId, session.FULL_ACCESS);

  const { status, body: responseBody } = await session.authorize();
  return new Response(responseBody, { status });
}