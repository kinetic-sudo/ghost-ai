"use client";

import { useEffect, useRef, useCallback } from "react";
import type { Node, Edge } from "@xyflow/react";

import { useSaveStatus } from "@/contexts/save-status-context";

interface UseCanvasAutosaveOptions {
  projectId: string;
  nodes: Node[];
  edges: Edge[];
  debounceMs?: number;
  enabled?: boolean;
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  debounceMs = 1500,
  enabled = true,
}: UseCanvasAutosaveOptions) {
  const { setStatus } = useSaveStatus();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRun = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const save = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setStatus("saving");
    try {
      const res = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes, edges }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      setStatus("saved");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("Canvas autosave failed", err);
      setStatus("error");
    }
  }, [projectId, nodes, edges, setStatus]);

  useEffect(() => {
    if (!enabled) return;

    // Skip the render where autosave first becomes enabled — that's the
    // initial load settling, not a user edit, and would trigger a
    // pointless save of exactly what was just loaded.
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, debounceMs);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [nodes, edges, debounceMs, enabled, save]);

  return { saveNow: save };
}