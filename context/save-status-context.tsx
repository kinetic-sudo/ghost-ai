"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveStatusContextValue {
  status: SaveStatus;
  setStatus: (status: SaveStatus) => void;
}

const SaveStatusContext = createContext<SaveStatusContextValue | null>(null);

export function SaveStatusProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SaveStatus>("idle");

  return (
    <SaveStatusContext.Provider value={{ status, setStatus }}>
      {children}
    </SaveStatusContext.Provider>
  );
}

export function useSaveStatus() {
  const ctx = useContext(SaveStatusContext);
  if (!ctx) {
    throw new Error("useSaveStatus must be used within SaveStatusProvider");
  }
  return ctx;
}