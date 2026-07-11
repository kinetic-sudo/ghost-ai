"use client";

import { useCallback, useEffect, useState } from "react";
import type { Collaborator } from "@/types/Collaborator";

export function useShareDialog(projectId: string | null) {
  const [isOpen, setIsOpen] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState<Collaborator | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchCollaborators = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCollaborators(data.collaborators ?? []);
      setIsOwner(data.isOwner ?? false);
      setOwnerInfo(data.owner ?? null);
    } catch {
      // silent fail
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (isOpen) fetchCollaborators();
  }, [isOpen, fetchCollaborators]);

  async function handleInvite() {
    if (!projectId || !inviteEmail.trim()) return;
    setInviteError(null);
    setIsInviting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setInviteError(data.error ?? "Failed to invite");
        return;
      }
      const added: Collaborator = await res.json();
      setCollaborators((prev) =>
        prev.some((c) => c.email === added.email) ? prev : [...prev, added],
      );
      setInviteEmail("");
    } catch {
      setInviteError("Something went wrong");
    } finally {
      setIsInviting(false);
    }
  }

  async function handleRemove(email: string) {
    if (!projectId) return;
    try {
      const res = await fetch(
        `/api/projects/${projectId}/collaborators/${encodeURIComponent(email)}`,
        { method: "DELETE" },
      );
      if (!res.ok) return;
      setCollaborators((prev) => prev.filter((c) => c.email !== email));
    } catch {
      // silent fail
    }
  }

  function handleCopyLink() {
    if (!projectId) return;
    const url = `${window.location.origin}/editor/${projectId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function openDialog() {
    setInviteEmail("");
    setInviteError(null);
    setIsOpen(true);
  }

  return {
    isOpen,
    openDialog,
    closeDialog: () => setIsOpen(false),
    collaborators,
    isOwner,
    ownerInfo,
    isLoading,
    inviteEmail,
    setInviteEmail,
    inviteError,
    isInviting,
    handleInvite,
    handleRemove,
    copied,
    handleCopyLink,
  };
}