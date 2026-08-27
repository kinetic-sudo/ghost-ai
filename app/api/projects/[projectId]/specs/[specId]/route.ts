import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAccessibleProject } from "@/lib/project-acess";

interface RouteContext {
  params: Promise<{ projectId: string; specId: string }>;
}

// ---------------------------------------------------------------------------
// GET /api/projects/[projectId]/specs/[specId] — spec content, for the
// preview modal. Returns JSON, not the raw file — the client never touches
// Blob directly (per 29-spec-ui-integration's scope limits).
// ---------------------------------------------------------------------------

export async function GET(_request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, specId } = await params;
  const project = await getAccessibleProject(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Scope the lookup to this project too, not just the spec id — a spec id
  // alone shouldn't be enough to read content from a project the caller
  // doesn't have access to, even if they can guess/enumerate ids.
  const spec = await prisma.projectSpec.findFirst({
    where: { id: specId, projectId },
  });

  if (!spec) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const blobRes = await fetch(spec.filePath, { cache: "no-store" });
    if (!blobRes.ok) {
      return NextResponse.json({ error: "Failed to load spec content" }, { status: 502 });
    }
    const content = await blobRes.text();
    return NextResponse.json({ content, filename: spec.filename, createdAt: spec.createdAt });
  } catch (err) {
    console.error("Failed to fetch spec content from Blob", err);
    return NextResponse.json({ error: "Failed to load spec content" }, { status: 502 });
  }
}