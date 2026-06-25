import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { Project } from "@/types/project";

// ---------------------------------------------------------------------------
// Server-side data helper — used by server components only
// ---------------------------------------------------------------------------

export async function getProjects(): Promise<{
  ownedProjects: Project[];
  sharedProjects: Project[];
}> {
  const { userId } = await auth();
  if (!userId) return { ownedProjects: [], sharedProjects: [] };

  const [owned, collaborating] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        canvasJsonPath: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.projectCollaborator.findMany({
      where: { email: { not: "" } }, // placeholder — swap for real user email lookup
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            canvasJsonPath: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    }),
  ]);

  const ownedProjects: Project[] = owned.map((p) => ({
    ...p,
    role: "owner" as const,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  // Shared projects — collaborating rows where the project is owned by someone else
  const sharedProjects: Project[] = collaborating
    .filter((c) => c.project.id)
    .map((c) => ({
      ...c.project,
      role: "collaborator" as const,
      createdAt: c.project.createdAt.toISOString(),
      updatedAt: c.project.updatedAt.toISOString(),
    }));

  return { ownedProjects, sharedProjects };
}