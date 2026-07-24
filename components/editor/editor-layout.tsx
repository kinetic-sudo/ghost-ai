"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { AiSidebar } from "@/components/editor/ai-sidebar";
import { AiSidebarProvider, useAiSidebar } from "@/components/editor/ai-sidebar-context";
import type { Project } from "@/types/project";

interface EditorLayoutProps {
  children: React.ReactNode;
  ownedProjects: Project[];
  sharedProjects: Project[];
  activeProjectId?: string;
  projectName?: string;
}

function EditorLayoutInner({
  children,
  ownedProjects = [],
  sharedProjects = [],
  projectName,
  activeProjectId,
}: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { aiOpen, toggleAi, closeAi } = useAiSidebar();

  const pathname = usePathname();
  const pathSegments = pathname ? pathname.split("/") : [];
  const idFromPath = pathSegments[1] === "editor" ? pathSegments[2] : undefined;
  const currentProjectId = activeProjectId || idFromPath;

  const activeProject =
    ownedProjects.find((p) => p.id === currentProjectId) ||
    sharedProjects.find((p) => p.id === currentProjectId);

  const resolvedProjectName = currentProjectId
    ? projectName || activeProject?.name || "Loading..."
    : "Overview";

  const isOwner = ownedProjects.some((p) => p.id === currentProjectId);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#0A0A0A]">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        projectName={resolvedProjectName}
        projectId={currentProjectId}
        isOwner={isOwner}
        aiOpen={aiOpen}
        onAiToggle={toggleAi}
      />

      <main className="relative flex-1 overflow-hidden">
        {children}

        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpen={() => setIsSidebarOpen(true)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={currentProjectId}
        />

        {/* Single AI Sidebar instance, controlled by the navbar above */}
        <AiSidebar open={aiOpen} onClose={closeAi} />
      </main>

      <ProjectDialogs />
    </div>
  );
}

export function EditorLayout(props: EditorLayoutProps) {
  return (
    <AiSidebarProvider>
      <EditorLayoutInner {...props} />
    </AiSidebarProvider>
  );
}