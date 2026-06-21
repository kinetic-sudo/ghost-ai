"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EditorDialog } from "@/components/editor/editor-dialog";
import type { useProjectDialogs } from "@/hooks/use-project-dialogs";

type ProjectDialogsProps = ReturnType<typeof useProjectDialogs>;

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
}: ProjectDialogsProps) {
  const isOpen = dialog.type === "create";

  return (
    <EditorDialog
      open={isOpen}
      onOpenChange={(open) => !open && closeDialog()}
      title="New project"
      description="Give your architecture workspace a name."
      footer={
        <>
          <Button variant="ghost" onClick={closeDialog} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!form.name.trim() || isLoading}
          >
            {isLoading ? "Creating…" : "Create project"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Input
          placeholder="Project name"
          value={form.name}
          onChange={(e) => handleNameChange(e.target.value)}
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreate();
          }}
        />
        {form.slug && (
          <p className="text-xs text-copy-muted">
            Slug:{" "}
            <span className="font-mono text-copy-secondary">{form.slug}</span>
          </p>
        )}
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
}: ProjectDialogsProps) {
  const isOpen = dialog.type === "rename";
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Small delay so the dialog finishes mounting before focusing
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
        dialog.project
          ? `Renaming "${dialog.project.name}"`
          : undefined
      }
      footer={
        <>
          <Button variant="ghost" onClick={closeDialog} disabled={isLoading}>
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
}: ProjectDialogsProps) {
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