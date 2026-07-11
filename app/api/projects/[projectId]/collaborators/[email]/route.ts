import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{ projectId: string; email: string }>;
}

// DELETE /api/projects/[projectId]/collaborators/[email]
export async function DELETE(_req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId, email } = await params;
  const decoded = decodeURIComponent(email).toLowerCase();

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.ownerId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.projectCollaborator.deleteMany({
    where: { projectId, email: decoded },
  });

  return new NextResponse(null, { status: 204 });
}