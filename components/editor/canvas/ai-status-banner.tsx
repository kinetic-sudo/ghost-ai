"use client";

import { Loader2, Check, AlertTriangle } from "lucide-react";

import { useAiStatusFeed } from "@/hooks/use-ai-status-feed";
import { cn } from "@/lib/utils";

export function AiStatusBanner() {
      const { message } = useAiStatusFeed();
      if (!message) return null;

  const isDone = message.status === "complete";
  const isError = message.status === "error";

  return (
    <div
      className={cn(
        "absolute left-1/2 top-4 z-40 flex -translate-x-1/2 items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-xl transition-all",
        isError
          ? "border-[#FF6166]/30 bg-[#3C1618]/90 text-[#FF6166]"
          : isDone
            ? "border-[#62C073]/30 bg-[#0F2E18]/90 text-[#62C073]"
            : "border-white/10 bg-[#0F0E17]/90 text-white/80",
      )}
    >
      {isDone ? (
        <Check className="h-3.5 w-3.5" />
      ) : isError ? (
        <AlertTriangle className="h-3.5 w-3.5" />
      ) : (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      )}
      {message.text}
    </div>
  );
}