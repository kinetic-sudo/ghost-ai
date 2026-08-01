"use client";

import { useState } from "react";
import { useEventListener } from "@liveblocks/react/suspense";

export interface AiStatusState {
  status: "start" | "processing" | "applying" | "complete" | "error";
  message: string;
}

export function useAiStatus() {
  const [status, setStatus] = useState<AiStatusState | null>(null);

  useEventListener(({ event }) => {
    if (event.type === "AI_STATUS") {
      setStatus({ status: event.status, message: event.message });

      if (event.status === "complete" || event.status === "error") {
        setTimeout(() => setStatus(null), 4000);
      }
    }
  });

  return status;
}