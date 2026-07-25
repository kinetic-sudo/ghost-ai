import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

import { prisma } from "@/lib/prisma";
import { getAccessibleProject } from "@/lib/project-acess";

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

// ---------------------------------------------------------------------------
// PUT /api/projects/[projectId]/canvas — save canvas JSON
// ---------------------------------------------------------------------------

export async function PUT(request: Request, { params }: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId } = await params;
  const project = await getAccessibleProject(projectId);

  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.nodes) || !Array.isArray(body.edges)) {
    return NextResponse.json(
      { error: "Expected { nodes: [], edges: [] }" },
      { status: 400 },
    );
  }

  const { nodes, edges } = body;

  try {
    const blob = await put(
      `canvas/${projectId}.json`,
      JSON.stringify({ nodes, edges }),
      {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false,
        allowOverwrite: true,
      },
    );

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Failed to save canvas to Blob", err);
    return NextResponse.json(
      { error: "Failed to save canvas" },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// GET /api/projects/[projectId]/canvas — load saved canvas JSON
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

  const record = await prisma.project.findUnique({
    where: { id: projectId },
    select: { canvasJsonPath: true },
  });

  if (!record?.canvasJsonPath) {
    return NextResponse.json({ nodes: [], edges: [] });
  }

  try {
    const blobRes = await fetch(record.canvasJsonPath, { cache: "no-store" });
    if (!blobRes.ok) {
      return NextResponse.json({ nodes: [], edges: [] });
    }
    const data = await blobRes.json();
    return NextResponse.json({
      nodes: Array.isArray(data.nodes) ? data.nodes : [],
      edges: Array.isArray(data.edges) ? data.edges : [],
    });
  } catch (err) {
    console.error("Failed to fetch saved canvas from Blob", err);
    return NextResponse.json({ nodes: [], edges: [] });
  }
}