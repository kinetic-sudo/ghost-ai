import Link from "next/link";
import { Lock } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0D0D0D] px-4">
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04]">
          <Lock className="size-6 text-white/40" />
        </div>

        <h1 className="text-base font-semibold text-white">
          You don&apos;t have access to this workspace.
        </h1>
        <p className="mt-2 text-sm text-white/40">
          Head back to your editor home to open a project you can access.
        </p>

        <Link
          href="/editor"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-xl bg-[#00E5FF] px-5 text-sm font-semibold text-black transition-all hover:bg-[#00E5FF]/90 active:scale-[0.98]"
        >
          Back to Editor
        </Link>
      </div>
    </div>
  );
}