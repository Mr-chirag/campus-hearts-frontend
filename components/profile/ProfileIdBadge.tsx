"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

/**
 * Shows a profile's short public ID with one-tap copy, so people can share it
 * and others can find them with Discover's "Search by profile ID".
 */
export function ProfileIdBadge({
  profileId,
  className,
}: {
  profileId?: string;
  className?: string;
}) {
  // Accounts get an ID on the next server boot after this shipped; until then
  // there is nothing to show.
  if (!profileId) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profileId);
      toast.success("Profile ID copied");
    } catch {
      toast.error("Couldn't copy — select the ID and copy it manually.");
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Profile ID ${profileId}. Copy to clipboard`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 font-mono text-xs font-semibold text-ink transition-colors hover:border-accent",
        className
      )}
    >
      <span className="font-sans font-medium text-subtext">ID</span>
      <span className="select-all">{profileId}</span>
      <Copy className="size-3.5 text-subtext" aria-hidden />
    </button>
  );
}
