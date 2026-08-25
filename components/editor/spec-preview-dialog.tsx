"use client";

import { useEffect, useState } from "react";
import { X, Download, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import type { ProjectSpecSummary } from "@/hooks/use-project-spec";

interface SpecPreviewDialogProps {
  projectId: string;
  spec: ProjectSpecSummary | null;
  onClose: () => void;
}

export function SpecPreviewDialog({ projectId, spec, onClose }: SpecPreviewDialogProps) {
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!spec) {
      // Reset on close so a re-open of a different spec never briefly shows
      // stale content — spec content is fetched fresh every open, never
      // held onto beyond this dialog's own lifetime.
      setContent(null);
      setError(null);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetch(`/api/projects/${projectId}/specs/${spec.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load spec content");
        const data = (await res.json()) as { content: string };
        if (!cancelled) setContent(data.content);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load spec content");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [spec, projectId]);

  return (
    <Dialog open={spec !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0F0E17] p-0 text-white shadow-2xl">
        <DialogHeader className="flex-row items-center justify-between border-b border-white/5 px-6 py-4 space-y-0">
          <DialogTitle className="truncate pr-8 text-sm font-semibold text-white">
            {spec?.filename ?? "Spec"}
          </DialogTitle>
          <div className="flex items-center gap-1.5">
            {spec && (
              <a
                href={`/api/projects/${projectId}/specs/${spec.id}/download`}
                download
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                title="Download"
              >
                <Download className="h-4 w-4" />
              </a>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full text-white/40 hover:bg-white/5 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-5">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-xs text-white/50">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading spec…
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-[#FF6166]/20 bg-[#3C1618]/40 px-4 py-3 text-xs text-[#FF6166]">
              {error}
            </div>
          )}
          {!isLoading && !error && content && (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-white prose-p:text-white/80 prose-strong:text-white prose-code:text-[#B8A6FC] prose-pre:bg-[#151422] prose-pre:border prose-pre:border-white/5 prose-a:text-[#8B5CF6]">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}