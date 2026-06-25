"use client";

import { useState } from "react";
import { PanelRight, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WorkspaceShellProps {
  projectName: string;
}

export function WorkspaceShell({ projectName }: WorkspaceShellProps) {
  const [aiOpen, setAiOpen] = useState(true);

  return (
    // top-14 accounts for the workspace's own inner navbar (h-14) on top of
    // the global navbar (h-12 = top-12). The project sidebar uses top-18 which
    // only covers the global navbar — so we push the workspace content down by
    // the extra 56px so the sidebar no longer overlaps the inner bar.
    <div className="flex h-[calc(100vh-48px)]">

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">

        {/* Workspace inner navbar */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-surface-border px-6">
          <h1 className="font-medium text-copy-primary truncate">{projectName}</h1>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Share2 className="size-4" />
              Share
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setAiOpen((v) => !v)}
              aria-label={aiOpen ? "Close AI sidebar" : "Open AI sidebar"}
              className={cn(aiOpen && "bg-accent text-accent-foreground")}
            >
              <PanelRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Canvas area */}
        <div className="flex-1 bg-background overflow-hidden">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-lg font-medium text-copy-primary">
                Canvas Coming Soon
              </h2>
              <p className="mt-2 text-sm text-copy-muted">
                Workspace shell is ready.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible AI sidebar */}
      <aside
        className={cn(
          "shrink-0 border-l border-surface-border bg-surface transition-all duration-200 ease-in-out overflow-hidden",
          aiOpen ? "w-80" : "w-0 border-l-0",
        )}
        aria-hidden={!aiOpen}
      >
        <div className="flex h-full w-80 items-center justify-center text-sm text-copy-muted">
          AI sidebar placeholder
        </div>
      </aside>
    </div>
  );
}