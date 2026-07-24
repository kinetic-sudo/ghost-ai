"use client";

import { createContext, useContext, useState } from "react";

interface AiSidebarContextValue {
  aiOpen: boolean;
  toggleAi: () => void;
  closeAi: () => void;
}

const AiSidebarContext = createContext<AiSidebarContextValue | null>(null);

export function AiSidebarProvider({ children }: { children: React.ReactNode }) {
  const [aiOpen, setAiOpen] = useState(false);

  return (
    <AiSidebarContext.Provider
      value={{
        aiOpen,
        toggleAi: () => setAiOpen((v) => !v),
        closeAi: () => setAiOpen(false),
      }}
    >
      {children}
    </AiSidebarContext.Provider>
  );
}

export function useAiSidebar() {
  const ctx = useContext(AiSidebarContext);
  if (!ctx) {
    throw new Error("useAiSidebar must be used within AiSidebarProvider");
  }
  return ctx;
}