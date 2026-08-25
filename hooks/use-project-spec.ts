"use client";

import { useCallback, useEffect, useState } from "react";

export interface ProjectSpecSummary {
  id: string;
  filename: string;
  createdAt: string;
}

export function useProjectSpecs(projectId: string) {
  const [specs, setSpecs] = useState<ProjectSpecSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}/specs`);
      if (!res.ok) throw new Error("Failed to load specs");
      const data = (await res.json()) as ProjectSpecSummary[];
      setSpecs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load specs");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { specs, isLoading, error, refresh };
}