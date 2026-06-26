"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProjectDialogsContext } from "@/components/editor/project-dialog-context";

export function ProjectDialogs() {
  const {
    dialog,
    form,
    isLoading,
    closeDialog,
    handleNameChange,
    handleCreate,
    handleRename,
    handleDelete,
  } = useProjectDialogsContext();

  const handleOpenChange = (open: boolean) => {
    if (!open) closeDialog();
  };

  return (
    <>
      {/* ── Create ── */}
      <Dialog open={dialog.type === "create"} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 border border-white/[0.08] bg-[#111111] p-0 shadow-2xl sm:max-w-md [&>button]:text-white/40 [&>button]:hover:text-white">
          <DialogHeader className="px-6 pb-4 pt-6">
            <DialogTitle className="text-base font-semibold text-white">
              New Project
            </DialogTitle>
            <DialogDescription className="text-sm text-white/40">
              Give your project a name to get started.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 px-6 pb-6">
            <Input
              placeholder="Project name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && form.name.trim()) handleCreate();
              }}
              autoFocus
              className="border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/20 focus-visible:border-[#00E5FF]/50 focus-visible:ring-0"
            />
            {form.roomId && (
              <p className="font-mono text-xs text-white/30">
                /editor/{form.roomId}
              </p>
            )}
            <Button
              onClick={handleCreate}
              disabled={!form.name.trim() || isLoading}
              className="mt-1 h-10 w-full bg-[#00E5FF] font-semibold text-black hover:bg-[#00E5FF]/90 active:scale-[0.98] disabled:opacity-40"
            >
              {isLoading ? "Creating…" : "Create Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Rename ── */}
      <Dialog open={dialog.type === "rename"} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 border border-white/[0.08] bg-[#111111] p-0 shadow-2xl sm:max-w-md [&>button]:text-white/40 [&>button]:hover:text-white">
          <DialogHeader className="px-6 pb-4 pt-6">
            <DialogTitle className="text-base font-semibold text-white">
              Rename Project
            </DialogTitle>
            <DialogDescription className="text-sm text-white/40">
              Renaming &ldquo;{dialog.project?.name}&rdquo;
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3 px-6 pb-6">
            <Input
              placeholder="Project name"
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && form.name.trim()) handleRename();
              }}
              autoFocus
              className="border-white/[0.08] bg-white/[0.04] text-white placeholder:text-white/20 focus-visible:border-[#00E5FF]/50 focus-visible:ring-0"
            />
            <Button
              onClick={handleRename}
              disabled={!form.name.trim() || isLoading}
              className="mt-1 h-10 w-full bg-[#00E5FF] font-semibold text-black hover:bg-[#00E5FF]/90 active:scale-[0.98] disabled:opacity-40"
            >
              {isLoading ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Delete ── */}
      <Dialog open={dialog.type === "delete"} onOpenChange={handleOpenChange}>
        <DialogContent className="gap-0 border border-white/[0.08] bg-[#111111] p-0 shadow-2xl sm:max-w-md [&>button]:text-white/40 [&>button]:hover:text-white">
          <DialogHeader className="px-6 pb-4 pt-6">
            <DialogTitle className="text-base font-semibold text-white">
              Delete Project
            </DialogTitle>
            <DialogDescription className="text-sm text-white/40">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white/70">
                &ldquo;{dialog.project?.name}&rdquo;
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6">
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
              className="h-10 w-full font-semibold active:scale-[0.98] disabled:opacity-40"
            >
              {isLoading ? "Deleting…" : "Delete Project"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}