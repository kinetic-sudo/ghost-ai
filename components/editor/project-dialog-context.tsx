
"use client";

import { createContext, useContext } from "react";
import { useProjectDialogs } from "@/hooks/use-project-dialogs";

type ProjectDialogsContextType = ReturnType<typeof useProjectDialogs>;

const ProjectDialogsContext =
  createContext<ProjectDialogsContextType | null>(null);

export function ProjectDialogsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dialogs = useProjectDialogs();

  return (
    <ProjectDialogsContext.Provider value={dialogs}>
      {children}
    </ProjectDialogsContext.Provider>
  );
}

export function useProjectDialogsContext() {
  const context = useContext(ProjectDialogsContext);

  if (!context) {
    throw new Error(
      "useProjectDialogsContext must be used inside ProjectDialogsProvider"
    );
  }

  return context;
}