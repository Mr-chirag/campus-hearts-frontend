"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

interface AppHeaderProps {
  title: string;
  /** Renders a back affordance. On desktop the sidebar makes this redundant. */
  back?: string | true;
  action?: React.ReactNode;
  className?: string;
  /** Hide the whole bar at lg+ (for screens whose desktop layout has its own). */
  mobileOnly?: boolean;
}

export function AppHeader({ title, back, action, className, mobileOnly }: AppHeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-bg/90 px-3 backdrop-blur-lg",
        mobileOnly && "lg:hidden",
        className
      )}
    >
      {back ? (
        typeof back === "string" ? (
          <Link
            href={back}
            aria-label="Go back"
            className="flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted"
          >
            <ChevronLeft className="size-6" />
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="flex size-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted"
          >
            <ChevronLeft className="size-6" />
          </button>
        )
      ) : null}

      <h1 className="min-w-0 flex-1 truncate font-display text-lg font-bold text-ink">
        {title}
      </h1>

      {action}
    </header>
  );
}
