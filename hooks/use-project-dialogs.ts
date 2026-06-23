import { useEffect, useState } from "react";

import { MOCK_PROJECTS, nameToSlug, type Project } from "@/lib/mock-projects";

export type DialogType = "create" | "rename" | "delete" | null;

interface DialogState {
  type: DialogType;
  project: Project | null;
}

interface FormState {
  name: string;
  slug: string;
  slugError: string | null;
}

export function useProjectDialogs() {
  const [dialog, setDialog] = useState<DialogState>({
    type: null,
    project: null,
  });
  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    slugError: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState(MOCK_PROJECTS);

  const ownedProjects = projects.filter((p) => p.role === "owner");
  const sharedProjects = projects.filter((p) => p.role === "collaborator");

  useEffect(() => {
    console.log("projects state changed", projects.length);
  }, [projects]);

  // ---------------------------------------------------------------------------
  // Slug validation
  // ---------------------------------------------------------------------------

  function validateSlug(slug: string, currentProjectId?: string): string | null {
    if (!slug) return "Name must produce a valid slug.";

    const duplicate = projects.find(
      (p) => p.slug === slug && p.id !== currentProjectId,
    );
    if (duplicate) return `Slug "${slug}" is already taken.`;

    return null;
  }

  // ---------------------------------------------------------------------------
  // Openers
  // ---------------------------------------------------------------------------

  function openCreate() {
    setForm({ name: "", slug: "", slugError: null });
    setDialog({ type: "create", project: null });
  }

  function openRename(project: Project) {
    setForm({ name: project.name, slug: project.slug, slugError: null });
    setDialog({ type: "rename", project });
  }

  function openDelete(project: Project) {
    setForm({ name: "", slug: "", slugError: null });
    setDialog({ type: "delete", project });
  }

  function closeDialog() {
    setDialog({ type: null, project: null });
    setForm({ name: "", slug: "", slugError: null });
  }

  // ---------------------------------------------------------------------------
  // Form handlers
  // ---------------------------------------------------------------------------

  function handleNameChange(value: string) {
    const slug = nameToSlug(value);
    const slugError = value.trim()
      ? validateSlug(slug, dialog.project?.id)
      : null;
    setForm({ name: value, slug, slugError });
  }

  // ---------------------------------------------------------------------------
  // Submit handlers
  // ---------------------------------------------------------------------------

  function handleCreate() {
    if (!form.name.trim()) return;

    const slugError = validateSlug(form.slug);
    if (slugError) {
      setForm((prev) => ({ ...prev, slugError }));
      return;
    }

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      slug: form.slug,
      role: "owner",
      updatedAt: new Date().toISOString(),
    };

    setIsLoading(true);
    setTimeout(() => {
      setProjects((prev) => [...prev, newProject]);
      setIsLoading(false);
      closeDialog();
    }, 400);
  }

  function handleRename() {
    if (!form.name.trim() || !dialog.project) return;

    const slugError = validateSlug(form.slug, dialog.project.id);
    if (slugError) {
      setForm((prev) => ({ ...prev, slugError }));
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setProjects((prev) =>
        prev.map((p) =>
          p.id === dialog.project!.id
            ? { ...p, name: form.name.trim(), slug: form.slug }
            : p,
        ),
      );
      setIsLoading(false);
      closeDialog();
    }, 400);
  }

  function handleDelete() {
    if (!dialog.project) return;
    setIsLoading(true);
    setTimeout(() => {
      setProjects((prev) => prev.filter((p) => p.id !== dialog.project!.id));
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