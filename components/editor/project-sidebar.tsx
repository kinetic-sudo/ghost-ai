"use client";

import Link from "next/link";
import { X, Plus, Pencil, Trash2, Folder, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useProjectDialogsContext } from "@/components/editor/project-dialog-context";
import type { Project } from "@/types/project";
import { useState, useEffect } from "react";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  ownedProjects: Project[];
  sharedProjects: Project[];
  activeProjectId?: string;
  className?: string;
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onOpen,
  ownedProjects = [],
  sharedProjects = [],
  activeProjectId,
  className,
}: ProjectSidebarProps) {
  const actions = useProjectDialogsContext();
  const [activeTab, setActiveTab] = useState<"my-projects" | "shared">("my-projects");

  useEffect(() => {
    if (activeProjectId && sharedProjects.some((p) => p.id === activeProjectId)) {
      setActiveTab("shared");
    } else if (activeProjectId && ownedProjects.some((p) => p.id === activeProjectId)) {
      setActiveTab("my-projects");
    }
  }, [activeProjectId, ownedProjects, sharedProjects]);

  return (
    <div
      className={cn(
        "h-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] z-40 shrink-0",
        isOpen ? "w-[260px]" : "w-[68px]",
        className
      )}
    >
      <div
        className={cn(
          "h-full w-full rounded-2xl border border-white/[0.08] bg-[#09090B] overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col relative transition-all duration-300",
          !isOpen && "hover:bg-white/[0.02] hover:border-white/20 cursor-pointer"
        )}
        onClick={!isOpen ? onOpen : undefined}
      >
        {/* --- COLLAPSED STATE --- */}
        <div
          className={cn(
            "absolute top-0 left-0 w-[68px] h-full flex flex-col items-center pt-5 transition-all duration-300",
            isOpen ? "opacity-0 pointer-events-none scale-95" : "opacity-100 scale-100"
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-white/[0.07] to-transparent border border-white/10 text-[#00E5FF] shadow-md transition-transform active:scale-95 hover:border-[#00E5FF]/40">
            <span className="text-sm font-black tracking-tighter">N</span>
          </div>
        </div>

        {/* --- EXPANDED STATE --- */}
        <div
          className={cn(
            "flex flex-col h-full w-[260px] transition-all duration-300 layout-sidebar",
            isOpen ? "opacity-100 scale-100" : "opacity-0 pointer-events-none scale-95"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Workspace</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="h-6 w-6 rounded-md text-white/40 hover:text-white hover:bg-white/5 shrink-0 transition-all"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Navigation / Tabs */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "my-projects" | "shared")} className="flex min-h-0 flex-1 flex-col">
            <TabsList className="mx-4 flex bg-white/[0.03] border border-white/[0.05] p-1 rounded-xl h-9 shrink-0">
              <TabsTrigger 
                value="my-projects" 
                className="flex-1 rounded-lg py-1 text-[12px] font-medium data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 data-[state=active]:shadow-sm transition-all"
              >
                My Projects
              </TabsTrigger>
              <TabsTrigger 
                value="shared" 
                className="flex-1 rounded-lg py-1 text-[12px] font-medium data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-white/40 data-[state=active]:shadow-sm transition-all"
              >
                Shared
              </TabsTrigger>
            </TabsList>

            {/* List Containers */}
            <TabsContent value="my-projects" className="mt-3 flex min-h-0 flex-1 flex-col outline-none overflow-hidden">
              <ScrollArea className="flex-1 px-2.5">
                {ownedProjects.length === 0 ? (
                  <EmptyState message="No projects yet" />
                ) : (
                  <div className="flex flex-col gap-0.5 pb-4">
                    {ownedProjects.map((project) => (
                      <ProjectItem key={project.id} project={project} isActive={project.id === activeProjectId} onRename={actions.openRename} onDelete={actions.openDelete} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="shared" className="mt-3 flex min-h-0 flex-1 flex-col outline-none overflow-hidden">
              <ScrollArea className="flex-1 px-2.5">
                {sharedProjects.length === 0 ? (
                  <EmptyState message="No shared projects" />
                ) : (
                  <div className="flex flex-col gap-0.5 pb-4">
                    {sharedProjects.map((project) => (
                      <ProjectItem key={project.id} project={project} isActive={project.id === activeProjectId} onRename={actions.openRename} onDelete={actions.openDelete} />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Footer Action Button */}
          <div className="p-3 mt-auto shrink-0 border-t border-white/[0.04] bg-gradient-to-t from-black/20 to-transparent">
            <Button 
              className="w-full h-11 bg-[#00E5FF] hover:bg-[#26eaff] text-black font-semibold rounded-xl flex items-center justify-between pl-1.5 pr-4 shadow-[0_4px_20px_rgba(0,229,255,0.2)] transition-all duration-200 hover:translate-y-[-1px] active:translate-y-[0px] active:scale-[0.99]" 
              onClick={(e) => { e.stopPropagation(); actions.openCreate(); }}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-black text-[#00E5FF] shadow-inner font-black text-xs tracking-tighter">
                N
              </div>
              <div className="flex items-center gap-1.5 text-[13px] font-bold tracking-tight">
                <Plus className="h-4 w-4" strokeWidth={2.5} />
                New Project
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- SUBCOMPONENTS --- */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 px-4 text-center border border-dashed border-white/[0.04] rounded-xl mx-1.5 bg-white/[0.01]">
      <p className="text-[12px] font-medium text-white/30">{message}</p>
    </div>
  );
}

interface ProjectItemProps {
  project: Project;
  isActive?: boolean;
  onRename: (project: Project) => void;
  onDelete: (project: Project) => void;
}

function ProjectItem({ project, onRename, onDelete, isActive }: ProjectItemProps) {
  const isOwner = project.role === "owner";

  return (
    <Link
      href={`/editor/${project.id}`}
      className={cn(
        "group relative flex items-center justify-between rounded-xl px-3 py-2 cursor-pointer transition-all duration-200 border",
        isActive 
          ? "border-white/[0.08] bg-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]" 
          : "border-transparent hover:bg-white/[0.02]"
      )}
    >
      {/* Left indicator accent line */}
      {isActive && (
        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-md bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
      )}

      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className={cn(
          "transition-colors duration-200 shrink-0", 
          isActive ? "text-[#00E5FF]" : "text-white/30 group-hover:text-white/50"
        )}>
          {isActive ? <FolderOpen className="h-4 w-4" /> : <Folder className="h-4 w-4" />}
        </div>
        <span className={cn(
          "text-[13px] font-medium truncate transition-colors duration-200", 
          isActive ? "text-white font-semibold" : "text-white/60 group-hover:text-white/90"
        )}>
          {project.name}
        </span>
      </div>

      {isOwner && (
        <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-0.5 shrink-0 ml-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-md text-white/40 hover:text-white hover:bg-white/10" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename(project); }}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10" 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project); }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </Link>
  );
}