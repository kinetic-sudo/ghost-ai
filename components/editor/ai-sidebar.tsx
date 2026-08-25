"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import {
  Bot,
  X,
  Send,
  FileText,
  Download,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAiStatusFeed } from "@/hooks/use-ai-status-feed";
import { useAiChatFeed } from "@/hooks/use-ai-chat-feed";
import { useProjectSpecs, type ProjectSpecSummary } from "@/hooks/use-project-spec";
import { SpecPreviewDialog } from "@/components/editor/spec-preview-dialog";
import { useRealtimeRun } from "@trigger.dev/react-hooks";

interface AiSidebarProps {
  open: boolean;
  onClose: () => void;
  /**
   * Prisma project id, which doubles as the Liveblocks roomId
   * (see progress-tracker.md: "the two are identical by design").
   */
  roomId: string;
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

// Trigger.dev run statuses that mean "still in flight" — everything else is terminal.
const ACTIVE_RUN_STATUSES = new Set([
  "QUEUED",
  "EXECUTING",
  "REATTEMPTING",
  "WAITING_FOR_DEPLOY",
  "DELAYED",
  "FROZEN",
]);

// Terminal-but-not-successful statuses that should surface as an error message.
const FAILED_RUN_STATUSES = new Set([
  "FAILED",
  "CRASHED",
  "SYSTEM_FAILURE",
  "TIMED_OUT",
  "CANCELED",
  "EXPIRED",
  "INTERRUPTED",
]);

export function AiSidebar({ open, onClose, roomId }: AiSidebarProps) {
  const { messages, sendMessage, sendAiMessage, sendError, currentUserId } = useAiChatFeed();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { message: aiStatus, isGenerating } = useAiStatusFeed();

  // Specs tab (29-spec-ui-integration).
  const { specs, isLoading: specsLoading, error: specsError } = useProjectSpecs(roomId);
  const [selectedSpec, setSelectedSpec] = useState<ProjectSpecSummary | null>(null);

  // Design-run tracking (this unit): submit -> runId -> publicToken -> useRealtimeRun.
  const [runId, setRunId] = useState<string | null>(null);
  const [publicToken, setPublicToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const finalizedRunRef = useRef<string | null>(null);

  const { run } = useRealtimeRun(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: Boolean(runId && publicToken),
  });

  const isRunActive =
    isSubmitting || Boolean(run && ACTIVE_RUN_STATUSES.has(run.status));
  const disabled = isGenerating || isRunActive;

  // React to the run reaching a terminal state.
  useEffect(() => {
    if (!run || !runId) return;
    if (finalizedRunRef.current === runId) return; // already handled

    if (run.status === "COMPLETED") {
      finalizedRunRef.current = runId;
      sendAiMessage("Design updated — check the canvas for the latest changes.");
      setRunId(null);
      setPublicToken(null);
    } else if (FAILED_RUN_STATUSES.has(run.status)) {
      finalizedRunRef.current = runId;
      sendAiMessage(
        `Something went wrong generating this design (${run.status.toLowerCase()}). Try again.`
      );
      setRunId(null);
      setPublicToken(null);
    }
  }, [run, runId, sendAiMessage]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "72px";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(Math.max(scrollHeight, 72), 160)}px`;
  }, [input]);

  const handleSend = async (textToSend?: string) => {
    const content = textToSend || input;
    if (!content.trim() || disabled) return;

    sendMessage(content);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "72px";
    }

    setRunError(null);
    setIsSubmitting(true);
    try {
      const designRes = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content, roomId, projectId: roomId }),
      });
      if (!designRes.ok) {
        const err = await designRes.json().catch(() => null);
        throw new Error(err?.error || "Failed to start design generation");
      }
      const { runId: newRunId } = (await designRes.json()) as { runId: string };

      const tokenRes = await fetch("/api/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: newRunId }),
      });
      if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => null);
        throw new Error(err?.error || "Failed to authorize run status");
      }
      const { token } = (await tokenRes.json()) as { token: string };

      finalizedRunRef.current = null;
      setRunId(newRunId);
      setPublicToken(token);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong starting the design run.";
      setRunError(message);
      sendAiMessage(`⚠️ ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <aside className="absolute right-4 top-[4.5rem] bottom-4 z-50 flex w-[19rem] flex-col rounded-2xl border border-white/10 bg-[#0F0E17]/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D1B36] text-[#8B5CF6]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Workspace</h2>
            <p className="text-xs text-white/50">Collaborate with Ghost AI</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-full text-white/40 hover:bg-white/5 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabbed Layout */}
      <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden">
        <div className="px-5 pt-3 pb-2">
          <TabsList className="inline-flex h-auto rounded-full border border-white/5 bg-[#181726] p-1">
            <TabsTrigger
              value="architect"
              className="rounded-full px-4 py-1.5 text-xs font-medium text-white/60 transition-all data-[state=active]:bg-[#6E56CF] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="rounded-full px-4 py-1.5 text-xs font-medium text-white/60 transition-all data-[state=active]:bg-[#6E56CF] data-[state=active]:text-white data-[state=active]:shadow-md"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* AI Architect Tab */}
        <TabsContent value="architect" className="flex flex-1 flex-col overflow-hidden data-[state=active]:flex">
          <ScrollArea className="flex-1 px-5 py-2">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#1D1B36] text-[#8B5CF6]">
                  <Bot className="h-6 w-6" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">Ghost AI Architect</h3>
                <p className="mb-6 max-w-[280px] text-xs leading-relaxed text-white/50">
                  Describe your system and I'll help you design the architecture.
                </p>

                {/* Starter Chips */}
                <div className="flex w-full max-w-[320px] flex-col gap-2.5">
                  {STARTER_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSend(chip)}
                      disabled={disabled}
                      className="w-full rounded-full border border-white/5 bg-[#1A182D] py-3 px-4 text-center text-xs font-medium text-[#B8A6FC] shadow-sm transition-colors hover:bg-[#23203B] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 py-2">
                {messages.map((msg) => (
                  <div
                    key={`${msg.senderId}-${msg.timestamp}`}
                    className={cn(
                      "flex max-w-[88%] flex-col rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm",
                      msg.senderId === currentUserId
                        ? "ml-auto bg-[#6E56CF] text-white"
                        : "mr-auto border border-white/5 bg-[#1A182D] text-white/90"
                    )}
                  >
                    <span className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold opacity-70">
                      {msg.senderId === currentUserId ? "You" : msg.senderName}
                      <span className="font-normal opacity-60">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </span>
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4">
            {disabled && (
              <div className="mb-2 flex items-center gap-1.5 px-1 text-[11px] font-medium text-[#B8A6FC]">
                <Loader2 className="h-3 w-3 animate-spin" />
                {aiStatus?.text ?? "Ghost AI is working…"}
              </div>
            )}
            {(sendError || runError) && (
              <div className="mb-2 px-1 text-[11px] font-medium text-[#FF6166]">
                {sendError || runError}
              </div>
            )}
            <div className="relative flex flex-col rounded-2xl border border-white/10 bg-[#151422] p-3 shadow-inner">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder="Describe your system..."
                className="min-h-[72px] max-h-[160px] w-full resize-none border-0 bg-transparent p-1 text-xs text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-50"
              />
              <div className="flex items-center justify-between pt-2">
                <span className="select-none text-[10px] text-white/30">
                  {disabled ? "Generating architecture…" : "Shift+Enter for newline"}
                </span>
                <Button
                  size="icon"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || disabled}
                  className="h-8 w-8 shrink-0 rounded-full bg-[#6E56CF] text-white transition-all hover:bg-[#5b48bd] disabled:bg-white/10 disabled:opacity-30"
                >
                  {disabled ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex flex-1 flex-col overflow-hidden p-5 data-[state=active]:flex">
          <div className="flex flex-1 flex-col gap-4 overflow-hidden">
            <Button
              onClick={() => {}}
              disabled={disabled}
              className="w-full rounded-full bg-[#6E56CF] font-medium text-white shadow-lg transition-all hover:bg-[#5b48bd] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {disabled ? (
                <span className="flex items-center justify-center gap-1.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating…
                </span>
              ) : (
                "Generate Spec"
              )}
            </Button>

            <div className="flex flex-1 flex-col overflow-hidden">
              <h4 className="mb-3 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Generated Specifications
              </h4>

              <ScrollArea className="flex-1">
                <div className="flex flex-col gap-2.5 pr-1">
                  {specsLoading ? (
                    <div className="flex items-center gap-2 py-6 text-xs text-white/40">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading specs…
                    </div>
                  ) : specsError ? (
                    <p className="py-6 text-xs font-medium text-[#FF6166]">{specsError}</p>
                  ) : specs.length === 0 ? (
                    <div className="flex flex-col items-center py-8 text-center">
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#1D1B36] text-[#8B5CF6]">
                        <FileText className="h-5 w-5" />
                      </div>
                      <p className="max-w-[220px] text-xs leading-relaxed text-white/40">
                        No specs generated yet for this project.
                      </p>
                    </div>
                  ) : (
                    specs.map((spec) => (
                      <button
                        key={spec.id}
                        onClick={() => setSelectedSpec(spec)}
                        className="group relative flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#151422] p-4 text-left shadow-md transition-all hover:bg-[#1A182D]"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D1B36] text-[#8B5CF6]">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="truncate text-sm font-semibold text-white">
                                {spec.filename}
                              </h5>
                              <p className="text-xs text-white/40">
                                {new Date(spec.createdAt).toLocaleString([], {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 shrink-0 rounded-full text-white/40 hover:bg-white/5 hover:text-white"
                            title="Download"
                          >
                            <a
                              href={`/api/projects/${roomId}/specs/${spec.id}/download`}
                              download
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <SpecPreviewDialog roomId={roomId} spec={selectedSpec} onClose={() => setSelectedSpec(null)} />
    </aside>
  );
}