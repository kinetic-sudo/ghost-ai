"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProjectDialogsContext } from "@/components/editor/project-dialog-context";

export function EditorHomeClient() {
  const actions = useProjectDialogsContext();

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center gap-4"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-semibold text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="max-w-sm text-sm text-copy-muted">
          Start a new architecture workspace, or choose a project from the
          sidebar.
        </p>
      </div>

      <Button onClick={actions.openCreate}>
        <Plus className="size-4" />
        New project
      </Button>
    </div>
  );
}