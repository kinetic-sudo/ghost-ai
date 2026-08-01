import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getLiveblocks } from "@/lib/liveblocks";
import { tasks } from "@trigger.dev/sdk/v3";

import { prisma } from "@/lib/prisma";
import { getAccessibleProject } from "@/lib/project-acess";
import type { designAgentTask } from "@/trigger/design-agent";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const roomId = typeof body?.roomId === "string" ? body.roomId : "";
  const projectId = typeof body?.projectId === "string" ? body.projectId : "";

  if (!prompt || !roomId || !projectId) {
    return NextResponse.json(
      { error: "prompt, roomId, and projectId are required" },
      { status: 400 },
    );
  }

  const project = await getAccessibleProject(projectId);
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

 // Snapshot current canvas as context for the model. This is
  // informational only — the task re-reads live storage right before it
  // actually writes, so a stale snapshot here can never cause data loss.
  let nodes: unknown[] = [];
  let edges: unknown[] = [];
  try {
    const storage = await getLiveblocks().getStorageDocument(roomId, "json");
    nodes = Array.isArray((storage as any)?.nodes) ? (storage as any).nodes : [];
    edges = Array.isArray((storage as any)?.edges) ? (storage as any).edges : [];
  } catch (err) {
    console.error("Failed to read current canvas for AI context", err);
  }


  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
        projectId,
        roomId,
        prompt,
        nodes,
        edges,
       });

  const taskRun = await prisma.taskRun.create({
    data: {
      runId: handle.id,
      projectId,
      userId,
    },
  });

  return NextResponse.json({ runId: taskRun.runId });
}