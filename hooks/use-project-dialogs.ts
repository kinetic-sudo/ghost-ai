"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { nameToSlug } from "@/lib/mock-projects";
import type { Project } from "@/types/project";

export type ActionDialogType = "create" | "rename" | "delete" | null;

interface DialogState {
  type: ActionDialogType;
  project: Project | null;
}

interface FormState {
  name: string;
  roomId: string; // slugified name + short suffix
}

// Generates a short random suffix to keep room IDs unique
function shortSuffix(): string {
  return Math.random().toString(36).slice(2, 7);
}

function buildRoomId(name: string): string {
  const slug = nameToSlug(name);
  return slug ? `${slug}-${shortSuffix()}` : `untitled-${shortSuffix()}`;
}

export function useProjectActions(activeProjectId?: string) {
  const router = useRouter();

  const [dialog, setDialog] = useState<DialogState>({
    type: null,
    project: null,
  });
  const [form, setForm] = useState<FormState>({ name: "", roomId: "" });
  const [isLoading, setIsLoading] = useState(false);

  // ---------------------------------------------------------------------------
  // Openers
  // ---------------------------------------------------------------------------

  function openCreate() {
    const roomId = buildRoomId("");
    setForm({ name: "", roomId });
    setDialog({ type: "create", project: null });
  }

  function openRename(project: Project) {
    setForm({ name: project.name, roomId: "" });
    setDialog({ type: "rename", project });
  }

  function openDelete(project: Project) {
    setForm({ name: "", roomId: "" });
    setDialog({ type: "delete", project });
  }

  function closeDialog() {
    setDialog({ type: null, project: null });
    setForm({ name: "", roomId: "" });
  }

  // ---------------------------------------------------------------------------
  // Form
  // ---------------------------------------------------------------------------

  function handleNameChange(value: string) {
    const slug = nameToSlug(value);
    const suffix = form.roomId.split("-").pop() ?? shortSuffix();
    const roomId = slug ? `${slug}-${suffix}` : `untitled-${suffix}`;
    setForm({ name: value, roomId });
  }

  // ---------------------------------------------------------------------------
  // Create — POST /api/projects → navigate to workspace
  // ---------------------------------------------------------------------------

  async function handleCreate() {
    const name = form.name.trim() || "Untitled Project";
    setIsLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const project: Project = await res.json();
      closeDialog();
      router.push(`/editor/${project.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Rename — PATCH /api/projects/[id] → refresh
  // ---------------------------------------------------------------------------

  async function handleRename() {
    if (!dialog.project || !form.name.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${dialog.project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to rename project");
      closeDialog();
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  // ---------------------------------------------------------------------------
  // Delete — DELETE /api/projects/[id] → redirect or refresh
  // ---------------------------------------------------------------------------

  async function handleDelete() {
    if (!dialog.project) return;
    const targetId = dialog.project.id;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${targetId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete project");
      closeDialog();
      if (activeProjectId === targetId) {
        router.push("/editor");
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    dialog,
    form,
    isLoading,
    openCreate,
    openRename,
    openDelete,
    closeDialog,
    handleNameChange,
    handleCreate,
    handleRename,
    handleDelete,
  };
}