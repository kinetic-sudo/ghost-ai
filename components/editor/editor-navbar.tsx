"use client";

import { UserButton } from "@clerk/nextjs";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorNavbarProps {
  isSidebarOpen: boolean;
  onSidebarToggle: () => void;
  title?: string;
  className?: string;
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  title,
  className,
}: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "flex h-12 shrink-0 items-center bg-[#0A0A0A] px-3",
        className,
      )}
    >
      {/* Left — sidebar toggle */}
      <div className="flex w-10 items-center">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onSidebarToggle}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          className="text-white/40 hover:text-white"
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="size-5" />
          ) : (
            <PanelLeftOpen className="size-5" />
          )}
        </Button>
      </div>

      {/* Center — app name or project title */}
      <div className="flex flex-1 items-center justify-center">
        {title ? (
          <span className="text-sm font-medium text-white/80 truncate max-w-xs">
            {title}
          </span>
        ) : (
          <span className="text-sm font-semibold tracking-tight text-white/60">
            ghost<span className="text-[#00E5FF]">.</span>ai
          </span>
        )}
      </div>

      {/* Right — user button */}
      <div className="flex w-10 items-center justify-end">
        <UserButton />
      </div>
    </header>
  );
}