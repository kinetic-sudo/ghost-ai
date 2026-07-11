import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Collaborator } from "@/types/collaborator";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

async function enrichEmails(
  emails: string[],
): Promise<Map<string, { name: string; imageUrl: string }>> {
  if (!emails.length) return new Map();
  try {
    const clerk = await clerkClient();
    const results = await Promise.allSettled(
      emails.map((email) =>
        clerk.users.getUserList({ emailAddress: [email], limit: 1 }),
      ),
    );
    const map = new Map<string, { name: string; imageUrl: string }>();
    results.forEach((r, i) => {
      if (r.status === "fulfilled" && r.value.data[0]) {
        const u = r.value.data[0];
        map.set(emails[i], {
          name:
            [u.firstName, u.lastName].filter(Boolean).join(" ") ||
            u.emailAddresses[0]?.emailAddress,
          imageUrl: u.imageUrl,
        });
      }
    });
    return map;
  } catch {
    return new Map();
  }
}

// GET /api/projects/[projectId]/collaborators
export async function GET(_req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rows = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { email: true, createdAt: true },
  });

  // Enrich collaborators + owner in one batch
  const clerk = await clerkClient();
  const ownerUser = await clerk.users
    .getUser(project.ownerId)
    .catch(() => null);

  const collabEmails = rows.map((r) => r.email);
  const enriched = await enrichEmails(collabEmails);

  const collaborators: Collaborator[] = rows.map((r) => {
    const info = enriched.get(r.email);
    return {
      email: r.email,
      createdAt: r.createdAt.toISOString(),
      name: info?.name ?? null,
      imageUrl: info?.imageUrl ?? null,
    };
  });

  const owner: Collaborator = {
    email: ownerUser?.emailAddresses[0]?.emailAddress ?? "",
    createdAt: "",
    name: ownerUser
      ? [ownerUser.firstName, ownerUser.lastName].filter(Boolean).join(" ") ||
        null
      : null,
    imageUrl: ownerUser?.imageUrl ?? null,
    isOwner: true,
  };

  return NextResponse.json({
    collaborators,
    isOwner: project.ownerId === userId,
    owner,
  });
}

// POST /api/projects/[projectId]/collaborators
export async function POST(req: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (project.ownerId !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const email =
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : undefined;

  if (!email || !email.includes("@"))
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });

  const row = await prisma.projectCollaborator.upsert({
    where: { projectId_email: { projectId, email } },
    update: {},
    create: { projectId, email },
    select: { email: true, createdAt: true },
  });

  const enriched = await enrichEmails([row.email]);
  const info = enriched.get(row.email);

  return NextResponse.json(
    {
      email: row.email,
      createdAt: row.createdAt.toISOString(),
      name: info?.name ?? null,
      imageUrl: info?.imageUrl ?? null,
    } satisfies Collaborator,
    { status: 201 },
  );
}