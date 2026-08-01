import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { auth as triggerAuth } from "@trigger.dev/sdk/v3";


import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const runId = typeof body?.runId === "string" ? body.runId : "";

  if (!runId) {
    return NextResponse.json({ error: "runId is required" }, { status: 400 });
  }

  const taskRun = await prisma.taskRun.findUnique({ where: { runId } });

  if (!taskRun || taskRun.userId !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const publicToken = await triggerAuth.createPublicToken({
    scopes: {
      read: {
        runs: [runId],
      },
    },
    expirationTime: "1h",
  });

  return NextResponse.json({ token: publicToken });
}