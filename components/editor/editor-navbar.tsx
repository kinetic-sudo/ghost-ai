"use client";

import { UserButton } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  projectName: string; // Firmly receives resolved name text from smart layout parent
  className?: string;
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectName,
  className,
}: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "flex h-14 shrink-0 items-center justify-between bg-[#0A0A0A] px-4 border-b border-white/[0.04]",
        className,
      )}
    >
      {/* Left Section — Sidebar Toggle & Automatic Project Title */}
      <div className="flex items-center gap-3.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>

        {/* Dynamic Project Title Stack */}
        <div className="flex flex-col justify-center select-none">
          <span className="text-sm font-semibold text-white tracking-tight leading-tight truncate max-w-[300px]">
            {projectName}
          </span>
          <span className="text-[11px] font-medium text-white/30 leading-none mt-0.5">
            Workspace
          </span>
        </div>
      </div>

      {/* Right Section — Quick Action Controls & Identity Menu */}
      <div className="flex items-center gap-2">
        {/* Share Button */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 rounded-lg border-white/10 bg-white/[0.02] px-3 text-xs font-medium text-white/80 hover:bg-white/[0.06] hover:text-white transition-all"
        >
          <Share2 className="h-3.5 w-3.5 text-white/40" />
          Share
        </Button>

        {/* Premium AI Action Button */}
        <Button
          size="sm"
          className="h-8 gap-1.5 rounded-lg bg-[#00E5FF] px-3 text-xs font-bold text-black hover:bg-[#00E5FF]/90 shadow-[0_2px_12px_rgba(0,229,255,0.15)] transition-all active:scale-[0.98]"
        >
          <Sparkles className="h-3.5 w-3.5" fill="currentColor" />
          AI
        </Button>

        {/* User Identity Menu */}
        <div className="pl-1.5 flex items-center justify-center">
          <UserButton 
            appearance={{
              elements: {
                avatarBox: "h-7 w-7 rounded-full border border-white/10 shadow-sm"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}