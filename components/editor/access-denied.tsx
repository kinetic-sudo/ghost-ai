import Link from "next/link";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AccessDenied() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="flex max-w-md flex-col items-center text-center">
        <Lock className="mb-4 size-10 text-copy-muted" />

        <h1 className="text-xl font-semibold">
          Access denied
        </h1>

        <p className="mt-2 text-sm text-copy-muted">
          This project does not exist or you do not have access to it.
        </p>

        <Button asChild className="mt-6">
          <Link href="/editor">
            Back to editor
          </Link>
        </Button>
      </div>
    </div>
  );
}