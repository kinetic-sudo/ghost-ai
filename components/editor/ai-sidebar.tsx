"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { 
  Bot, 
  X, 
  Send, 
  FileText, 
  Download, 
  Sparkles,
  Code2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AiSidebarProps {
  open: boolean;
  onClose: () => void;
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
];

export function AiSidebar({ open, onClose }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea between 72px and 160px
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "72px";
    const scrollHeight = textarea.scrollHeight;
    textarea.style.height = `${Math.min(Math.max(scrollHeight, 72), 160)}px`;
  }, [input]);

  const handleSend = (textToSend?: string) => {
    const content = textToSend || input;
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "72px";
    }

    // Static mock assistant reply for UI demonstration
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I've analyzed your request for "${content.trim()}". Here is a structural breakdown and recommended architecture pattern tailored for your canvas workspace.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }, 600);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!open) return null;

  return (
    <aside className="absolute right-4 top-20 bottom-6 z-40 flex w-96 flex-col rounded-2xl border border-surface-border bg-base/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-primary-text">AI Workspace</h2>
            <p className="text-xs text-muted-text">Collaborate with Ghost AI</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-muted-text hover:text-primary-text"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Tabbed Layout */}
      <Tabs defaultValue="architect" className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-surface-border px-5 py-3">
          <TabsList className="grid w-full grid-cols-2 bg-elevated p-1">
            <TabsTrigger 
              value="architect"
              className="text-xs font-medium text-muted-text data-[state=active]:bg-accent data-[state=active]:text-accent"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger 
              value="specs"
              className="text-xs font-medium text-muted-text data-[state=active]:bg-accent data-[state=active]:text-accent"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* AI Architect Tab */}
        <TabsContent value="architect" className="flex flex-1 flex-col overflow-hidden data-[state=active]:flex">
          <ScrollArea className="flex-1 px-5 py-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-medium text-primary-text">How can Ghost AI help?</h3>
                <p className="mt-1 max-w-[260px] text-xs text-muted-text">
                  Ask questions about your architecture or pick a starter prompt below.
                </p>
                
                {/* Starter Chips */}
                <div className="mt-6 flex flex-col gap-2 w-full">
                  {STARTER_CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => handleSend(chip)}
                      className="rounded-xl bg-subtle px-3.5 py-2.5 text-left text-xs font-medium text-accent-text transition-colors hover:bg-subtle/80"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex max-w-[85%] flex-col rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm",
                      msg.role === "user"
                        ? "ml-auto bg-brand-dim border-2 border-brand/50 text-copy-primary"
                        : "mr-auto bg-elevated border border-surface-border text-accent-text"
                    )}
                  >
                    <span className="mb-1 font-semibold opacity-70">
                      {msg.role === "user" ? "You" : "Ghost AI"}
                    </span>
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-surface-border p-4">
            <div className="relative flex items-end gap-2 rounded-2xl bg-elevated p-2 border border-surface-border">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask AI Architect..."
                className="max-h-[160px] min-h-[72px] w-full resize-none border-0 bg-transparent p-2 text-xs text-primary-text focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <Button
                size="icon"
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="h-9 w-9 shrink-0 rounded-xl bg-accent text-white transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-center text-[10px] text-muted-text">
              Enter submits, Shift+Enter adds a newline
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex flex-1 flex-col overflow-hidden p-5 data-[state=active]:flex">
          <div className="flex flex-col gap-4">
            <Button 
              onClick={() => {}}
              className="w-full rounded-xl bg-accent text-white font-medium shadow-lg hover:opacity-90"
            >
              Generate Spec
            </Button>

            <div className="mt-2">
              <h4 className="text-xs font-semibold text-muted-text uppercase tracking-wider mb-3">Generated Specifications</h4>
              
              {/* Demo Spec Card */}
              <div className="group relative flex flex-col gap-3 rounded-2xl border border-surface-border bg-elevated p-4 shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-primary-text">System Architecture Spec</h5>
                      <p className="text-xs text-muted-text">Updated 5m ago</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    className="h-8 w-8 text-muted-text opacity-50 cursor-not-allowed"
                    title="Download unavailable in demo mode"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-text line-clamp-2 leading-relaxed">
                  Comprehensive specification document detailing microservice boundaries, API contracts, and event-driven data flow pipelines.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </aside>
  );
}