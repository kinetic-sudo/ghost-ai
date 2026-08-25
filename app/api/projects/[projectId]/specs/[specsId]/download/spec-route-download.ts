import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getAccessibleProject } from "@/lib/project-acess";

interface RouteContext {
  params: Promise<{ projectId: string; specId: string }>;
}

// ---------------------------------------------------------------------------
// GET /api/projects/[projectId]/specs/[specId]/download — same auth/lookup as
// the content route, but returns the raw file with Content-Disposition so a
// plain <a href=... download> (no client-side JS) triggers a real download.
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

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${spec.filename}"`,
      },
    });
  } catch (err) {
    console.error("Failed to fetch spec content from Blob for download", err);
    return NextResponse.json({ error: "Failed to load spec content" }, { status: 502 });
  }
}