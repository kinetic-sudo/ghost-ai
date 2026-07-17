import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectDialogsContext } from "@/components/editor/project-dialog-context";
import { cn } from "@/lib/utils";
import type { Project } from "@/types/project";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  ownedProjects: Project[];
  sharedProjects: Project[];
  activeProjectId?: string;
  className?: string;
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
        "group relative flex items-center justify-between rounded-xl px-3 py-2.5 transition-all duration-200 border",
        isActive
          ? "border-white/10 bg-white/[0.04]"
          : "border-transparent hover:bg-white/[0.02]",
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        {isActive && (
          <span className="absolute left-3 size-1.5 shrink-0 rounded-full bg-[#00E5FF]" />
        )}
        <span className={cn(
          "text-sm font-medium truncate",
          isActive ? "text-white ml-4" : "text-white/60",
        )}>
          {project.name}
        </span>
      </div>

      {isOwner && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shrink-0 ml-2">
          <Button
            variant="ghost" size="icon"
            className="size-6 text-white/40 hover:text-white"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRename(project); }}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost" size="icon"
            className="size-6 text-white/40 hover:text-red-400"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(project); }}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      )}
    </Link>
  );
}

function EmptyProjectsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-sm text-white/40">No projects yet</p>
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onOpen,
  ownedProjects,
  sharedProjects,
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
    <>
      {/* Sidebar panel — fixed, floats over canvas, slides fully off-screen when closed */}
      <div
        className={cn(
          // Position: fixed from top of viewport, below the navbar (h-14 = 56px)
          // Width 260px. When closed, translate -260px — fully off screen, no remnant.
          "fixed left-0 top-14 bottom-0 z-40 w-[260px]",
          "flex flex-col",
          // Elevated appearance: semi-transparent dark bg + right shadow
          "bg-[#0D0D0E]/95 backdrop-blur-md border-r border-white/[0.06]",
          "shadow-[4px_0_24px_rgba(0,0,0,0.4)]",
          // Slide transition — translateX(-100%) = exactly -260px, fully hidden
          "transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
          <span className="text-sm font-medium text-white">Projects</span>
          <Button
            variant="ghost" size="icon"
            onClick={onClose}
            className="size-7 text-white/40 hover:text-white shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "my-projects" | "shared")}
          className="flex min-h-0 flex-1 flex-col mt-1"
        >
          <TabsList className="mx-3 flex bg-white/5 p-1 rounded-xl h-auto shrink-0">
            <TabsTrigger
              value="my-projects"
              className="flex-1 rounded-lg py-1.5 text-[13px] data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 transition-all"
            >
              My Projects
            </TabsTrigger>
            <TabsTrigger
              value="shared"
              className="flex-1 rounded-lg py-1.5 text-[13px] data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/40 transition-all"
            >
              Shared
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-projects" className="mt-2 flex min-h-0 flex-1 flex-col outline-none">
            <ScrollArea className="flex-1 px-3">
              {ownedProjects.length === 0 ? <EmptyProjectsPlaceholder /> : (
                <div className="flex flex-col gap-1 pb-4">
                  {ownedProjects.map((project) => (
                    <ProjectItem
                      key={project.id} project={project}
                      isActive={project.id === activeProjectId}
                      onRename={actions.openRename}
                      onDelete={actions.openDelete}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="shared" className="mt-2 flex min-h-0 flex-1 flex-col outline-none">
            <ScrollArea className="flex-1 px-3">
              {sharedProjects.length === 0 ? <EmptyProjectsPlaceholder /> : (
                <div className="flex flex-col gap-1 pb-4">
                  {sharedProjects.map((project) => (
                    <ProjectItem
                      key={project.id} project={project}
                      isActive={project.id === activeProjectId}
                      onRename={actions.openRename}
                      onDelete={actions.openDelete}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-3 mt-auto shrink-0">
          <Button
            className="w-full h-[44px] bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-black font-semibold rounded-xl flex items-center justify-between px-1.5 transition-transform active:scale-[0.98]"
            onClick={actions.openCreate}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-black text-[#00E5FF] shadow-sm shrink-0">
              <span className="text-sm font-extrabold tracking-tighter">N</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Plus className="size-4" strokeWidth={3} />
              New Project
            </div>
            <div className="w-8 shrink-0" />
          </Button>
        </div>
      </div>

      {/* Collapsed N button — shown when sidebar is closed */}
      {!isOpen && (
        <button
          onClick={onOpen}
          className="fixed left-3 bottom-3 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-[#111111]/90 backdrop-blur-md border border-white/[0.08] shadow-xl hover:border-white/20 transition-all"
          aria-label="Open sidebar"
        >
          <span className="text-sm font-extrabold tracking-tighter text-white">N</span>
        </button>
      )}
    </>
  );
}