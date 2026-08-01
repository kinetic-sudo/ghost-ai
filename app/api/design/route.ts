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

  const handle = await tasks.trigger<typeof designAgentTask>("design-agent", {
    prompt,
    roomId,
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