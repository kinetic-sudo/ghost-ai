import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { AccessDenied } from "@/components/editor/access-denied";
import { getAccessibleProject } from "@/lib/project-acess";
import { WorkspaceShell } from "@/components/editor/workspace-shell";

interface PageProps {
  params: Promise<{ roomId: string }>;
}

export default async function WorkspacePage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { roomId } = await params;
  const project = await getAccessibleProject(roomId);
  if (!project) return <AccessDenied />;

  return <WorkspaceShell projectName={project.name} />;
}