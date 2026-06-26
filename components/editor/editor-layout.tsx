"use client";

import { useState } from "react";
import {
  CreateProjectDialog,
  DeleteProjectDialog,
  RenameProjectDialog,
} from "@/components/editor/project-dialogs";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogsContext } from "@/components/editor/project-dialog-context";
import type { Project } from "@/types/project";

interface EditorLayoutProps {
  children: React.ReactNode;
  ownedProjects: Project[];
  sharedProjects: Project[];
  activeProjectId?: string;
}

export function EditorLayout({
  children,
  ownedProjects,
  sharedProjects,
  activeProjectId,
}: EditorLayoutProps) {
  const actions = useProjectDialogsContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0A0A0A]">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
      />

      {/* Grid wrapper applying uniform spacing gaps across components */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3">
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpen={() => setIsSidebarOpen(true)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={activeProjectId}
        />

        {/* Clean layout viewport context for children */}
        <main className="flex flex-1 overflow-hidden min-w-0">
          {children}
        </main>
      </div>

      <CreateProjectDialog {...actions} />
      <RenameProjectDialog {...actions} />
      <DeleteProjectDialog {...actions} />
    </div>
  );
}