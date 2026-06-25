import { redirect } from "next/navigation";
import { PanelRight, Share2 } from "lucide-react";

import { auth } from "@clerk/nextjs/server";

import { Button } from "@/components/ui/button";
import { AccessDenied } from "@/components/editor/access-denied";
import { getAccessibleProject } from "@/lib/project-acess";

interface PageProps {
  params: Promise<{
    roomId: string;
  }>;
}

export default async function WorkspacePage({
  params,
}: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { roomId } = await params;

  const project = await getAccessibleProject(roomId);

  if (!project) {
    return <AccessDenied />;
  }

  return (
    <div className="flex h-[calc(100vh-48px)]">
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-surface-border px-6">
          <h1 className="font-medium">
            {project.name}
          </h1>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Share2 className="size-4" />
              Share
            </Button>

            <Button variant="outline" size="icon">
              <PanelRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 bg-background">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-medium">
                Canvas Coming Soon
              </h2>

              <p className="mt-2 text-sm text-copy-muted">
                Workspace shell is ready.
              </p>
            </div>
          </div>
        </div>
      </div>

      <aside className="w-80 border-l border-surface-border bg-surface">
        <div className="flex h-full items-center justify-center text-sm text-copy-muted">
          AI sidebar placeholder
        </div>
      </aside>
    </div>
  );
}