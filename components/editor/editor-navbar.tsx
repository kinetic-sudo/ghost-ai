"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen, Share2, Sparkles, LayoutTemplate } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/editor/share-dialog";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen?: boolean;
  onSidebarToggle?: () => void;
  projectName?: string;
  projectId?: string;   // present on workspace pages, absent on /editor home
  onOpenTemplates?: () => void;
  className?: string;
}

export function EditorNavbar({
  isSidebarOpen = false,
  onSidebarToggle,
  projectName = "Untitled Workspace",
  projectId,
  onOpenTemplates,
  className,
}: EditorNavbarProps) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "flex h-14 shrink-0 items-center justify-between bg-[#0A0A0A] px-4 border-b border-white/[0.04]",
          className,
        )}
      >
        {/* Left — toggle + project name */}
        <div className="flex items-center gap-3.5">
          {onSidebarToggle && (
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
          )}

          <div className="flex flex-col justify-center select-none">
            <span className="text-sm font-semibold text-white tracking-tight leading-tight truncate max-w-[300px]">
              {projectName}
            </span>
            <span className="text-[11px] font-medium text-white/30 leading-none mt-0.5">
              Workspace
            </span>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-2">
          {/* Templates Trigger */}
          {onOpenTemplates && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenTemplates}
              className="h-8 gap-1.5 rounded-lg border-white/10 bg-white/[0.02] px-3 text-xs font-medium text-white/80 hover:bg-white/[0.06] hover:text-white transition-all"
            >
              <LayoutTemplate className="h-3.5 w-3.5 text-[#00E5FF]" />
              <span className="hidden sm:inline">Templates</span>
            </Button>
          )}

          {/* Share — only shown on workspace pages */}
          {projectId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="h-8 gap-1.5 rounded-lg border-white/10 bg-white/[0.02] px-3 text-xs font-medium text-white/80 hover:bg-white/[0.06] hover:text-white transition-all"
            >
              <Share2 className="h-3.5 w-3.5 text-white/40" />
              Share
            </Button>
          )}

          {/* AI */}
          <Button
            size="sm"
            className="h-8 gap-1.5 rounded-lg bg-[#00E5FF] px-3 text-xs font-bold text-black hover:bg-[#00E5FF]/90 shadow-[0_2px_12px_rgba(0,229,255,0.15)] transition-all active:scale-[0.98]"
          >
            <Sparkles className="h-3.5 w-3.5" fill="currentColor" />
            AI
          </Button>

          <div className="pl-1.5 flex items-center justify-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7 rounded-full border border-white/10 shadow-sm",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Share dialog — only mounted when projectId is available */}
      {projectId && (
        <ShareDialog
          projectId={projectId}
          projectName={projectName}
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
        />
      )}
    </>
  );
}