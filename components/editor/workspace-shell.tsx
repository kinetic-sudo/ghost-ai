"use client";

import { useState } from "react";
import { Bot, PanelRight, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CanvasRoom } from "../canvas/canvas-room";

interface WorkspaceShellProps {
  projectName: string;
  roomId: string;
}

export function WorkspaceShell({ projectName, roomId }: WorkspaceShellProps) {
  const [aiOpen, setAiOpen] = useState(true);

  return (
    <div className="flex h-full w-full gap-3 min-w-0">
      {/* Canvas panel */}
      <div className="flex flex-1 flex-col rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl relative min-w-0">
        {/* Inner workspace navbar */}
        <header className="flex h-14 shrink-0 items-center justify-between px-5 border-b border-white/[0.05] bg-[#0A0A0A] z-10">
          <h1 className="text-sm font-medium text-white/80 truncate">{projectName}</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-white/50 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] rounded-lg"
            >
              <Share2 className="size-3.5 mr-1.5" />
              Share
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setAiOpen((v) => !v)}
              className={cn(
                "h-8 w-8 bg-white/[0.03] hover:bg-white/[0.08] rounded-lg transition-colors",
                aiOpen ? "text-[#00E5FF]" : "text-white/50 hover:text-white",
              )}
              aria-label={aiOpen ? "Close AI sidebar" : "Open AI sidebar"}
            >
              <PanelRight className="size-4" />
            </Button>
          </div>
        </header>

        {/* Canvas */}
        <main className="relative flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden">
          <CanvasRoom roomId={roomId} />
        </main>
      </div>

      {/* AI Copilot panel */}
      <aside
        className={cn(
          "shrink-0 flex flex-col rounded-2xl border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          aiOpen ? "w-[300px] opacity-100" : "w-0 opacity-0 border-none",
        )}
        aria-hidden={!aiOpen}
      >
        <div className="w-[300px] flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 shrink-0">
            <div>
              <h3 className="text-[13px] font-medium text-white">AI Copilot</h3>
              <p className="text-[11px] text-white/40 mt-0.5">Placeholder panel</p>
            </div>
            <Sparkles className="size-4 text-[#8B5CF6]" />
          </div>

          {/* Chat pending card */}
          <div className="px-4 shrink-0">
            <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.02] p-4 flex gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Bot className="size-3.5" />
              </div>
              <div>
                <h4 className="text-[13px] font-medium text-white/90">Chat surface pending</h4>
                <p className="text-[11px] text-white/40 mt-1.5 leading-relaxed">
                  The toggle is wired. Messaging and generation are
                  intentionally out of scope here.
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Future hooks */}
          <div className="p-4 shrink-0">
            <div className="rounded-[14px] border border-white/[0.05] bg-white/[0.02] p-4">
              <h4 className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-2">
                Future Hooks
              </h4>
              <p className="text-[11px] text-white/40 leading-relaxed">
                Prompt composer, run status, and architecture guidance will
                attach to this sidebar.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}