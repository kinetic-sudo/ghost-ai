"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import type { Project } from "@/types/project";

interface EditorLayoutProps {
  children: React.ReactNode;
  ownedProjects: Project[];
  sharedProjects: Project[];
  activeProjectId?: string;
  projectName?: string;
}

export function EditorLayout({
  children,
  ownedProjects = [],
  sharedProjects = [],
  projectName,
  activeProjectId,
}: EditorLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    <div className="flex h-screen flex-col overflow-hidden bg-[#0A0A0A]">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        projectName={resolvedProjectName}
        projectId={currentProjectId}
        isOwner={isOwner}
      />

      {/* Sidebar + main — no padding, canvas fills flush */}
      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpen={() => setIsSidebarOpen(true)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={currentProjectId}
        />

        <main className="flex flex-1 overflow-hidden min-w-0">
          {children}
        </main>
      </div>

      <ProjectDialogs />
    </div>
  );
}