"use client";

import { Plus, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProjectDialogsContext } from "@/components/editor/project-dialog-context";

export function EditorHomeClient() {
  const actions = useProjectDialogsContext();

  return (
    // rounded on right side only — left edge is flush against the sidebar sliver
    <div className="relative flex w-full h-full flex-col items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0D0D0D] overflow-hidden">
      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 0%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 0%, transparent 100%)",
        }}
      />

      {/* Ambient glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[300px] bg-[#00E5FF]/[0.03] blur-[100px] pointer-events-none rounded-full" />

      <div className="relative z-10 flex flex-col items-center gap-4 text-center px-6">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] shadow-xl backdrop-blur-md">
          <Compass className="size-6 text-[#00E5FF]" strokeWidth={1.5} />
        </div>

        <h1 className="text-[22px] font-medium tracking-tight text-white mb-1 leading-snug">
          Create a project or open an existing one
        </h1>
        <p className="max-w-sm text-[13px] text-white/40 leading-relaxed mb-4">
          Start a new architecture workspace, or choose a project from the
          sidebar to begin collaborating.
        </p>

        <Button
          onClick={actions.openCreate}
          className="bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-xl h-10 px-5 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all active:scale-[0.98]"
        >
          <Plus className="size-4 mr-2" strokeWidth={3} />
          New project
        </Button>
      </div>
    </div>
  );
}