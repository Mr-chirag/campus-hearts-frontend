"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Route-level error boundary.
 *
 * NOTE FOR NEXT 16: the recovery prop is `retry`, not `reset` — it was renamed
 * from the Next 15 API. Destructuring `reset` here silently yields undefined
 * and the button does nothing.
 */
export default function RouteError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-dvh-safe flex-col items-center justify-center px-6 text-center">
      <span className="text-5xl" aria-hidden>
        💔
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold text-ink">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-sm text-pretty leading-relaxed text-subtext">
        That&apos;s on us, not you. Try again — and if it keeps happening, come
        back in a few minutes.
      </p>

      {error.digest && (
        <p className="mt-3 font-mono text-xs text-subtext">ref: {error.digest}</p>
      )}

      <Button className="mt-8 w-full max-w-xs" onClick={() => retry()}>
        <RotateCcw className="size-4" aria-hidden />
        Try again
      </Button>
    </main>
  );
}
