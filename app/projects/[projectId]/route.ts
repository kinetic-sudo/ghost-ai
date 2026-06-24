import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

// ---------------------------------------------------------------------------
// Shared helper — fetch project and enforce ownership
// ---------------------------------------------------------------------------

async function getOwnedProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, ownerId: true },
  });

  if (!project) return { project: null, error: "not_found" } as const;
  if (project.ownerId !== userId) return { project: null, error: "forbidden" } as const;

  return { project, error: null } as const;
}

// ---------------------------------------------------------------------------
// PATCH /api/projects/[projectId] — rename project
// ---------------------------------------------------------------------------

export async function PATCH(request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const { project, error } = await getOwnedProject(projectId, userId);

  if (error === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (error === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const name: string | undefined =
    typeof body.name === "string" && body.name.trim()
      ? body.name.trim()
      : undefined;

  if (!name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 },
    );
  }

  const updated = await prisma.project.update({
    where: { id: project.id },
    data: { name },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      canvasJsonPath: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(updated);
}

// ---------------------------------------------------------------------------
// DELETE /api/projects/[projectId] — delete project
// ---------------------------------------------------------------------------

export async function DELETE(_request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const { project, error } = await getOwnedProject(projectId, userId);

  if (error === "not_found") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (error === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id: project.id } });

  return new NextResponse(null, { status: 204 });
}