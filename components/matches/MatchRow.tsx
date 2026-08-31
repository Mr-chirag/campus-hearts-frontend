"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { formatRelativeTime } from "@/lib/time";
import { cn } from "@/lib/cn";
import type { Match } from "@/types";

/**
 * ANONYMITY IS ENFORCED HERE, not assumed from upstream.
 *
 * The server already masks anonymous confession matches — `user._id` arrives as
 * the sentinel string 'anonymous' and the name is replaced. But this component
 * re-derives what to render from `isAnonymous` rather than trusting whatever
 * happens to be in `user`, so a future upstream slip cannot leak a real name or
 * photo through this row. The <Avatar anonymous> prop makes the same guarantee
 * structurally: it renders a mask regardless of what src it was handed.
 */
export function MatchRow({
  match,
  href,
  active,
}: {
  match: Match;
  href: string;
  active?: boolean;
}) {
  const anonymous = match.isAnonymous ?? false;

  const name = anonymous ? "Anonymous 💌" : (match.user?.full_name ?? "Match");
  const photo = anonymous ? undefined : match.user?.photos?.[0];

  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors",
          active ? "bg-primary/10" : "hover:bg-surface-muted"
        )}
      >
        <Avatar src={photo} name={name} anonymous={anonymous} size={56} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold text-ink">{name}</span>
            {anonymous && (
              <span className="shrink-0 rounded-full bg-accent/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary-ink">
                Secret
              </span>
            )}
          </span>
          <span className="mt-0.5 block truncate text-sm text-subtext">
            {match.iAmAnonymous
              ? "They don't know it's you yet"
              : `Matched ${formatRelativeTime(match.createdAt).toLowerCase()}`}
          </span>
        </span>
      </Link>
    </li>
  );
}
