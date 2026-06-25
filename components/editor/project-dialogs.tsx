"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorDialog } from "@/components/editor/editor-dialog";
import type { useProjectActions } from "@/hooks/use-project-dialogs";

type ProjectActionsProps = ReturnType<typeof useProjectActions>;

// ---------------------------------------------------------------------------
// Create Project Dialog
// ---------------------------------------------------------------------------

export function CreateProjectDialog({
  dialog,
  form,
  isLoading,
  closeDialog,
  handleNameChange,
  handleCreate,
}: ProjectActionsProps) {
  const isOpen = dialog.type === "create";

  return (
    <EditorDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title="Create project"
      description="Enter a project name to create a new room."
      footer={
        <>
          <Button variant="ghost" onClick={closeDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isLoading}>
            {isLoading ? "Creating…" : "Create project"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          className="text-copy-primary"
          placeholder="Realtime architecture map"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        {/* Room ID preview — always shown, updates live */}
        <Input
          readOnly
          value={`/editor/${form.roomId || "untitled-xxxxx"}`}
          className="cursor-default text-copy-muted focus-visible:ring-0 focus-visible:border-surface-border"
          tabIndex={-1}
        />
      </div>
    </EditorDialog>
  );
}

// ---------------------------------------------------------------------------
// Rename Project Dialog
// ---------------------------------------------------------------------------

export function RenameProjectDialog({
  dialog,
  form,
  isLoading,
  closeDialog,
  handleNameChange,
  handleRename,
}: ProjectActionsProps) {
  const isOpen = dialog.type === "rename";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const id = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [isOpen]);

  return (
    <EditorDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title="Rename project"
      description={
        dialog.project ? `Renaming "${dialog.project.name}"` : undefined
      }
      footer={
        <>
          <Button variant="default" onClick={closeDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleRename}
            disabled={!form.name.trim() || isLoading}
          >
            {isLoading ? "Saving…" : "Save"}
          </Button>
        </>
      }
    >
      <Input
        ref={inputRef}
        placeholder="Project name"
        value={form.name}
        className="text-white"
        onChange={(e) => handleNameChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleRename();
        }}
      />
    </EditorDialog>
  );
}

// ---------------------------------------------------------------------------
// Delete Project Dialog
// ---------------------------------------------------------------------------

export function DeleteProjectDialog({
  dialog,
  isLoading,
  closeDialog,
  handleDelete,
}: ProjectActionsProps) {
  const isOpen = dialog.type === "delete";

  return (
    <EditorDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title="Delete project"
      description={
        dialog.project
          ? `"${dialog.project.name}" will be permanently deleted. This cannot be undone.`
          : undefined
      }
      footer={
        <>
          <Button variant="ghost" onClick={closeDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? "Deleting…" : "Delete project"}
          </Button>
        </>
      }
    />
  );
}