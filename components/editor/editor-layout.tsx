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
}

export function EditorLayout({
  children,
  ownedProjects,
  sharedProjects,
}: EditorLayoutProps) {
  const actions = useProjectDialogsContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
      />
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        ownedProjects={ownedProjects}
        sharedProjects={sharedProjects}
      />
      <main className="flex-1 overflow-hidden">{children}</main>

      <CreateProjectDialog {...actions} />
      <RenameProjectDialog {...actions} />
      <DeleteProjectDialog {...actions} />
    </div>
  );
}