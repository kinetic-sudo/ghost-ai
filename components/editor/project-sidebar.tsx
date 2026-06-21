"use client";

import { FolderOpen, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MOCK_PROJECTS, type Project } from "@/lib/mock-projects";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

function ProjectItem({ project }: { project: Project }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border border-surface-border bg-subtle/40 px-4 py-3 hover:bg-subtle/80 cursor-pointer transition-colors">
      <span className="text-sm font-medium text-copy-primary">{project.name}</span>
      <span className="text-xs text-copy-muted">/editor/{project.slug}</span>
    </div>
  );
}

function EmptyProjectsPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
      <p className="text-sm text-copy-muted">No projects yet</p>
    </div>
  );
}

export function ProjectSidebar({
  isOpen,
  onClose,
  className,
}: ProjectSidebarProps) {
  const ownedProjects = MOCK_PROJECTS.filter((p) => p.role === "owner");
  const sharedProjects = MOCK_PROJECTS.filter((p) => p.role === "collaborator");

  return (
    <div
      className={cn(
        "fixed top-18 left-0 bottom-0 z-40 w-90 p-4 transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
      aria-hidden={!isOpen}
    >
      <div
        className={cn(
          "flex h-full flex-col rounded-2xl border border-surface-border bg-surface overflow-hidden",
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <FolderOpen className="size-4 text-brand" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-brand">
                Projects
              </h2>
            </div>
            <p className="text-sm text-copy-muted leading-snug">
              Create a project or jump into an existing room.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close sidebar"
            className="mt-0.5 shrink-0"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Create button */}
        <div className="px-4 pb-3">
          <Button className="w-full">
            <Plus className="size-4" />
            Create project
          </Button>
        </div>

        {/* Tabs + list */}
        <Tabs
          defaultValue="my-projects"
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <TabsList className="mx-4 shrink-0 self-start w-[calc(100%-2rem)]">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>

          <TabsContent
            value="my-projects"
            className="mt-0 flex min-h-0 flex-1 flex-col"
          >
            <ScrollArea className="flex-1">
              {ownedProjects.length === 0 ? (
                <EmptyProjectsPlaceholder />
              ) : (
                <div className="flex flex-col gap-2 px-4 py-3">
                  {ownedProjects.map((project) => (
                    <ProjectItem key={project.id} project={project} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="shared"
            className="mt-0 flex min-h-0 flex-1 flex-col"
          >
            <ScrollArea className="flex-1">
              {sharedProjects.length === 0 ? (
                <EmptyProjectsPlaceholder />
              ) : (
                <div className="flex flex-col gap-2 px-4 py-3">
                  {sharedProjects.map((project) => (
                    <ProjectItem key={project.id} project={project} />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}