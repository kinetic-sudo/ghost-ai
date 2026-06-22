"use client";

import { useState } from "react";
import { useProjectDialogsContext } from "@/components/editor/project-dialog-context";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";
import {
  CreateProjectDialog,
  RenameProjectDialog,
  DeleteProjectDialog,
} from "@/components/editor/project-dialogs";

interface EditorLayoutProps {
  children: React.ReactNode;
}



export function EditorLayout({ children }: EditorLayoutProps) {
  const dialogs = useProjectDialogsContext();
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
      />
      <main className="flex-1 overflow-hidden">{children}</main>

      <CreateProjectDialog {...dialogs} />
      <RenameProjectDialog {...dialogs} />
      <DeleteProjectDialog {...dialogs} />
    </div>
  );
}
