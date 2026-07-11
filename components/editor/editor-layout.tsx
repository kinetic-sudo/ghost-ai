"use client";

import { useState } from "react";
import { usePathname } from "next/navigation"; // <-- Changed from useParams to read full URL path
import { ProjectDialogs } from "@/components/editor/project-dialogs";
import { EditorNavbar } from "@/components/editor/editor-navbar";
import { ProjectSidebar } from "@/components/editor/project-sidebar";
import { useProjectDialogsContext } from "@/components/editor/project-dialog-context";
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
  const actions = useProjectDialogsContext();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 1. Get the current browser URL pathname string (e.g., "/editor/your-project-id")
  const pathname = usePathname();
  
  // 2. Extract the project ID directly from the URL segments safely
  // pathSegments example for "/editor/123": ["", "editor", "123"]
  const pathSegments = pathname ? pathname.split("/") : [];
  const idFromPath = pathSegments[1] === "editor" ? pathSegments[2] : undefined;

  // 3. Resolve final ID prioritizing explicit props, falling back to URL parsing
  const currentProjectId = activeProjectId || idFromPath;

  // 4. Look up matching project configuration from data arrays
  const activeProject = 
    ownedProjects.find((p) => String(p.id) === String(currentProjectId)) || 
    sharedProjects.find((p) => String(p.id) === String(currentProjectId));

  // 5. Compute the navbar layout title string dynamically
  let solvedProjectName = "Overview";
  
  if (currentProjectId) {
    // Priority sequence: Page Prop -> Client Array Lookup -> Loading State Fallback
    solvedProjectName = projectName || activeProject?.name || "Loading Project...";
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0A0A0A]">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        projectName={solvedProjectName}
        projectId={currentProjectId}
      />

      {/* Grid wrapper applying uniform spacing gaps across components */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3">
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onOpen={() => setIsSidebarOpen(true)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={currentProjectId}
        />

        {/* Clean layout viewport context for children */}
        <main className="flex flex-1 overflow-hidden min-w-0">
          {children}
        </main>
      </div>

      <ProjectDialogs />
    </div>
  );
}