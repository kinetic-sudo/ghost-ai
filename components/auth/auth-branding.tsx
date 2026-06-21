import { FileText, Sparkles, Users } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Architecture Generation",
    description:
      "Describe your system, AI maps it to nodes and edges on a live canvas.",
  },
  {
    icon: Users,
    title: "Real-time Collaboration",
    description:
      "Live cursors, presence indicators, and shared node editing across your team.",
  },
  {
    icon: FileText,
    title: "Instant Spec Generation",
    description:
      "Export a complete Markdown technical spec directly from the canvas graph.",
  },
];

export function AuthBranding() {
  return (
    <>
      <div className="flex items-center gap-2.5">
        <div className="size-7 shrink-0 rounded-lg bg-brand" aria-hidden />
        <span className="text-sm font-medium text-copy-primary">Ghost AI</span>
      </div>

      <div className="flex flex-1 flex-col justify-center py-12">
        <h1 className="max-w-md text-3xl font-semibold tracking-tight text-copy-primary xl:text-4xl">
          Design systems at the speed of thought.
        </h1>
        <p className="mt-4 max-w-md text-lg leading-relaxed text-gray-300">
          Describe your architecture in plain English. Ghost AI maps it to a
          shared canvas your whole team can refine in real time.
        </p>

        <ul className="mt-12 space-y-6">
          {features.map(({ icon: Icon, title, description }) => (
            <li key={title} className="flex gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-surface-border bg-base">
                <Icon className="size-4 text-brand" strokeWidth={1.75} />
              </div>
              <div>
                <p className="text-sm font-medium text-copy-primary">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-copy-muted">
                  {description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-xs text-copy-faint">
        © 2026 Ghost AI. All rights reserved.
      </p>
    </>
  );
}
