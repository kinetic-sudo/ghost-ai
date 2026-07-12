"use client";

import { Check, Link2, Loader2, Mail, Trash2 } from "lucide-react";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useShareDialog } from "@/hooks/use-share-dialogs";
import type { Collaborator } from "@/types/collaborator";

interface ShareDialogProps {
  projectId: string;
  projectName: string;
  isOpen: boolean;
  onClose: () => void;
  isOwner?: boolean;
}

// ---------------------------------------------------------------------------
// Avatar
// ---------------------------------------------------------------------------
function Avatar({ person }: { person: Collaborator }) {
  const initials = person.name
    ? person.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : person.email[0].toUpperCase();

  if (person.imageUrl) {
    return (
      <Image
        src={person.imageUrl}
        alt={person.name ?? person.email}
        width={40}
        height={40}
        className="size-10 rounded-full object-cover shrink-0"
      />
    );
  }
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-sm font-semibold text-white/60">
      {initials}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Person row
// ---------------------------------------------------------------------------
function PersonRow({
  person,
  badge,
  onRemove,
  canRemove,
}: {
  person: Collaborator;
  badge?: string;
  onRemove?: () => void;
  canRemove?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <Avatar person={person} />
      <div className="flex min-w-0 flex-1 flex-col">
        {person.name && (
          <div className="flex items-center gap-2 mb-[6px]">
            <span className="truncate text-sm font-semibold text-white">
              {person.name}
            </span>
            {badge && (
              <span className="shrink-0 rounded-full border border-[#00E5FF]/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00E5FF]">
                {badge}
              </span>
            )}
          </div>
        )}
        <span className="truncate text-xs text-white/40">{person.email}</span>
      </div>
      {canRemove && onRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="size-7 shrink-0 text-white/20 hover:text-red-400"
        >
          <Trash2 className="size-3.5" />
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dialog content
// ---------------------------------------------------------------------------
export function ShareDialog({
  projectId,
  projectName,
  isOpen,
  onClose,
}: ShareDialogProps) {
  const {
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
  } = useShareDialog(isOpen ? projectId : null);

  const totalPeople = 1 + collaborators.length; // owner + collaborators

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="gap-0 border border-white/[0.08] bg-[#0F0F10] p-0 shadow-2xl sm:max-w-lg [&>button]:text-white/30 [&>button]:hover:text-white">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
          <DialogTitle className="text-lg font-semibold text-white">
            Share project
          </DialogTitle>
          <DialogDescription className="text-sm text-white/40 mt-1">
            Invite collaborators, copy the workspace link, and manage access.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-6">
          {/* Workspace link card */}
          <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3.5">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-white">
                Workspace link
              </span>
              <span className="text-xs text-white/40">
                Share a direct link with teammates after you grant them access.
              </span>
            </div>
            <Button
              onClick={handleCopyLink}
              className="ml-4 shrink-0 h-9 gap-2 rounded-xl bg-[#1A1A1C] border border-white/[0.08] px-4 text-xs font-semibold text-white hover:bg-white/[0.08] transition-all"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-[#00E5FF]" />
                  <span className="text-[#00E5FF]">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="size-3.5" />
                  Copy link
                </>
              )}
            </Button>
          </div>

          {/* Invite input — owners only */}
          {isOwner && (
            <div className="flex flex-col gap-1.5">
              <div className="flex gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 items-center">
                <Input
                  type="email"
                  placeholder="teammate@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === "Enter") handleInvite();
                    }}
                  className="flex-1 border-none bg-transparent p-0 text-sm text-white placeholder:text-white/25 focus-visible:ring-0 focus-visible:outline-none shadow-none"
                />
                <Button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || isInviting}
                  className="shrink-0 h-8 rounded-lg bg-[#00E5FF] px-4 text-sm font-bold text-black hover:bg-[#00E5FF]/90 disabled:opacity-40"
                >
                  {isInviting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    "Invite"
                  )}
                </Button>
              </div>
              {inviteError && (
                <p className="px-1 text-xs text-red-400">{inviteError}</p>
              )}
            </div>
          )}

          {/* People with access */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">
                People with access
              </span>
              <span className="text-xs text-white/30">
                {totalPeople} total
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-4 animate-spin text-white/30" />
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Owner row */}
                {ownerInfo && (
                  <PersonRow person={ownerInfo} badge="Owner" />
                )}

                {/* Collaborator rows */}
                {collaborators.map((c) => (
                  <PersonRow
                    key={c.email}
                    person={c}
                    canRemove={isOwner}
                    onRemove={() => handleRemove(c.email)}
                  />
                ))}

                {collaborators.length === 0 && !isLoading && (
                  <p className="py-2 text-center text-xs text-white/25">
                    {isOwner
                      ? "No collaborators yet — invite someone above."
                      : "No other collaborators on this project."}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}