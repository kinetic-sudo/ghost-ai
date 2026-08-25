import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAccessibleProject } from "@/lib/project-acess";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

// ---------------------------------------------------------------------------
// GET /api/projects/[projectId]/specs — list specs for a project (metadata only)
// ---------------------------------------------------------------------------

export async function GET(_request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getAccessibleProject(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const specs = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: { id: true, filename: true, createdAt: true },
  });

  return NextResponse.json(specs);
}