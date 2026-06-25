"use client";

import { createContext, useContext } from "react";
import { useProjectActions } from "@/hooks/use-project-dialogs";

type ProjectActionsContextType = ReturnType<typeof useProjectActions>;

const ProjectActionsContext =
  createContext<ProjectActionsContextType | null>(null);

interface ProjectDialogsProviderProps {
  children: React.ReactNode;
  activeProjectId?: string;
}

export function ProjectDialogsProvider({
  children,
  activeProjectId,
}: ProjectDialogsProviderProps) {
  const actions = useProjectActions(activeProjectId);

  return (
    <ProjectActionsContext.Provider value={actions}>
      {children}
    </ProjectActionsContext.Provider>
  );
}

export function useProjectDialogsContext() {
  const context = useContext(ProjectActionsContext);
  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used inside ProjectDialogsProvider",
    );
  }
  return context;
}