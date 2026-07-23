"use client";

import { useState, useRef, useEffect, type KeyboardEvent } from "react";
import { 
  Bot, 
  X, 
  Send, 
  FileText, 
  Download 
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

  // Auto-resize textarea
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
    <aside className="absolute right-4 top-16 bottom-4 z-50 flex w-[19rem] flex-col rounded-2xl border border-white/10 bg-[#0F0E17]/95 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-in-out">
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
                      className="w-full rounded-full border border-white/5 bg-[#1A182D] py-3 px-4 text-center text-xs font-medium text-[#B8A6FC] shadow-sm transition-colors hover:bg-[#23203B]"
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
                    key={msg.id}
                    className={cn(
                      "flex max-w-[88%] flex-col rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm",
                      msg.role === "user"
                        ? "ml-auto bg-[#6E56CF] text-white"
                        : "mr-auto border border-white/5 bg-[#1A182D] text-white/90"
                    )}
                  >
                    <span className="mb-1 text-[10px] font-semibold opacity-70">
                      {msg.role === "user" ? "You" : "Ghost AI"}
                    </span>
                    {msg.content}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4">
            <div className="relative flex flex-col rounded-2xl border border-white/10 bg-[#151422] p-3 shadow-inner">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your system..."
                className="min-h-[72px] max-h-[160px] w-full resize-none border-0 bg-transparent p-1 text-xs text-white placeholder:text-white/30 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center justify-between pt-2">
                <span className="select-none text-[10px] text-white/30">
                  Shift+Enter for newline
                </span>
                <Button
                  size="icon"
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="h-8 w-8 shrink-0 rounded-full bg-[#6E56CF] text-white transition-all hover:bg-[#5b48bd] disabled:bg-white/10 disabled:opacity-30"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="flex flex-1 flex-col overflow-hidden p-5 data-[state=active]:flex">
          <div className="flex flex-col gap-4">
            <Button 
              onClick={() => {}}
              className="w-full rounded-full bg-[#6E56CF] font-medium text-white shadow-lg transition-all hover:bg-[#5b48bd]"
            >
              Generate Spec
            </Button>

            <div className="mt-2">
              <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-white/40">Generated Specifications</h4>
              
              {/* Demo Spec Card */}
              <div className="group relative flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#151422] p-4 shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D1B36] text-[#8B5CF6]">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-white">System Architecture Spec</h5>
                      <p className="text-xs text-white/40">Updated 5m ago</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled
                    className="h-8 w-8 cursor-not-allowed text-white/30 opacity-50"
                    title="Download unavailable in demo mode"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-white/60">
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