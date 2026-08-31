import { cn } from "@/lib/cn";

/**
 * Skeletons, not spinners. A skeleton reserves the final layout, so content
 * arriving does not shift the page — which is both nicer and what keeps CLS
 * inside the Phase 7 Lighthouse budget.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-accent/30", className)} />;
}
