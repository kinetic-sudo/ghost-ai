"use client";

import { useState } from "react";
import { PanelRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/editor/share-dialog";
import { CanvasRoom } from "@/components/editor/canvas/canvas-room";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import { cn } from "@/lib/utils";

interface WorkspaceShellProps {
  projectId: string;
  projectName: string;
}

export function WorkspaceShell({ projectId, projectName }: WorkspaceShellProps) {
  const [aiOpen, setAiOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    // Full-area flex row — no padding, no gap so canvas fills edge-to-edge
    <div className="flex h-full w-full min-w-0 bg-[#0A0A0A] relative">

      {/* Canvas area — fills all remaining space, no card styling */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">

        {/* Workspace inner navbar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.05] bg-[#0A0A0A] px-5 z-20">
          <h1 className="text-sm font-medium text-white/80 truncate">
            {projectName}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAiOpen((v) => !v)}
              className={cn(
                "h-8 w-8 bg-white/[0.03] hover:bg-white/[0.08] rounded-lg transition-colors",
                aiOpen ? "text-[#00E5FF]" : "text-white/50 hover:text-white",
              )}
              aria-label={aiOpen ? "Close AI sidebar" : "Open AI sidebar"}
            >
              <PanelRight className="size-4" />
            </Button>
          </div>
        </header>

        {/* Canvas — flush fill, passing aiOpen so avatars hide when sidebar is open */}
        <div className="flex-1 overflow-hidden relative">
          <CanvasRoom roomId={projectId} aiOpen={aiOpen} />
        </div>
      </div>

      {/* Floating AI Sidebar Component */}
      <AiSidebar open={aiOpen} onClose={() => setAiOpen(false)} />

      <ShareDialog
        projectId={projectId}
        projectName={projectName}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}