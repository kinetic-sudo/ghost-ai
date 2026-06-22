"use client";

import { useState } from "react";

import { MOCK_PROJECTS, nameToSlug, type Project } from "@/lib/mock-projects";

export type DialogType = "create" | "rename" | "delete" | null;

interface DialogState {
  type: DialogType;
  project: Project | null;
}

interface FormState {
  name: string;
  slug: string;
}

export function useProjectDialogs() {
  const [dialog, setDialog] = useState<DialogState>({
    type: null,
    project: null,
  });
  const [form, setForm] = useState<FormState>({ name: "", slug: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState(MOCK_PROJECTS);

  const ownedProjects = projects.filter(
    (p) => p.role === "owner"
  );
  
  const sharedProjects = projects.filter(
    (p) => p.role === "collaborator"
  );

  

  // --- Openers ---

  function openCreate() {
    setForm({ name: "", slug: "" });
    setDialog({ type: "create", project: null });
  }

  function openRename(project: Project) {
    setForm({ name: project.name, slug: project.slug });
    setDialog({ type: "rename", project });
  }

  function openDelete(project: Project) {
    setForm({ name: "", slug: "" });
    setDialog({ type: "delete", project });
  }

  function closeDialog() {
    setDialog({ type: null, project: null });
    setForm({ name: "", slug: "" });
  }

  // --- Form handlers ---

  function handleNameChange(value: string) {
    setForm({ name: value, slug: nameToSlug(value) });
  }

  // --- Submit handlers (mock — no persistence) ---

  function handleCreate() {
    if (!form.name.trim()) return;
  
    const newProject: Project = {
      id: crypto.randomUUID(),
      name: form.name,
      slug: form.slug,
      role: "owner",
      updatedAt: new Date().toISOString(),
    };
  
    setIsLoading(true);
  
    setTimeout(() => {
        setProjects((prev) => {
          const next = [...prev, newProject];
      
          console.log("after add", next.length);
      
          return next;
        });
      
        setIsLoading(false);
        closeDialog();
    }, 400);
  }

  function handleRename() {
    if (!form.name.trim() || !dialog.project) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      closeDialog();
    }, 400);
  }

  function handleDelete() {
    if (!dialog.project) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      closeDialog();
    }, 400);
  }

  return {
    dialog,
    form,
    isLoading,
    projects,
    ownedProjects,
    sharedProjects,
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