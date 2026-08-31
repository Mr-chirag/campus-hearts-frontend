import { Crown } from "lucide-react";
import { cn } from "@/lib/cn";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-accent/40 px-2.5 py-1 text-xs font-semibold text-primary-ink",
        className
      )}
    >
      {children}
    </span>
  );
}

/** Uses the darkened gold ink — #FFD700 on white is unreadable as text. */
export function PremiumBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-gold/25 px-2.5 py-1 text-xs font-bold text-gold-ink",
        className
      )}
    >
      <Crown className="size-3.5" aria-hidden />
      Premium
    </span>
  );
}
