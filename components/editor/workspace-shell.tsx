"use client";

import { CanvasRoom } from "@/components/editor/canvas/canvas-room";
import { useAiSidebar } from "@/components/editor/ai-sidebar-context";

interface WorkspaceShellProps {
  projectId: string;
  projectName: string;
}

export function WorkspaceShell({ projectId }: WorkspaceShellProps) {
  const { aiOpen } = useAiSidebar();

  return (
    <div className="flex h-full w-full min-w-0 overflow-hidden relative">
      <CanvasRoom roomId={projectId} aiOpen={aiOpen} />
    </div>
  );
}