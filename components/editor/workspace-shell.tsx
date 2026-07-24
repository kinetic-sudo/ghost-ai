"use client";

import { useState } from "react";

import { CanvasRoom } from "@/components/editor/canvas/canvas-room";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import { EditorNavbar } from "@/components/editor/editor-navbar";

interface WorkspaceShellProps {
  projectId: string;
  projectName: string;
}

export function WorkspaceShell({ projectId, projectName }: WorkspaceShellProps) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <div className="flex h-full w-full min-w-0 bg-[#0A0A0A] relative overflow-hidden">
      {/* Main workspace column */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden relative">
        {/* Single Navbar instance with integrated AI toggle */}
        <EditorNavbar
          projectName={projectName}
          projectId={projectId}
          aiOpen={aiOpen}
          onAiToggle={() => setAiOpen((v) => !v)}
        />

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden relative">
          <CanvasRoom roomId={projectId} aiOpen={aiOpen} />
        </div>
      </div>

      {/* Floating AI Sidebar Component */}
      <AiSidebar open={aiOpen} onClose={() => setAiOpen(false)} />
    </div>
  );
}