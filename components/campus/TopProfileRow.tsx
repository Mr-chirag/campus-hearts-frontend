import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { PremiumBadge } from "@/components/ui/Badge";
import type { TopProfile } from "@/types";
import { cn } from "@/lib/cn";

/**
 * Links to /profile/[userId], and that is deliberate: fetching that route is
 * what RECORDS a profile view server-side, which is what feeds the "Who Viewed
 * You" list in Analytics. Top Profiles is one of only two entry points that
 * generate that data — don't turn this into a modal.
 */
export function TopProfileRow({ profile, rank }: { profile: TopProfile; rank: number }) {
  return (
    <li>
      <Link
        href={`/profile/${profile._id}`}
        className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-surface-muted"
      >
        <span
          className={cn(
            "w-6 shrink-0 text-center font-display text-lg font-extrabold tabular-nums",
            rank === 1 ? "text-gold-ink" : rank <= 3 ? "text-primary-ink" : "text-subtext"
          )}
        >
          {rank}
        </span>

        <Avatar src={profile.photos?.[0]} name={profile.full_name} size={48} />

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-semibold text-ink">{profile.full_name}</span>
            {profile.is_premium && <PremiumBadge />}
          </span>
          <span className="block truncate text-sm text-subtext">
            Semester {profile.semester} · {profile.branch}
          </span>
        </span>

        <span className="shrink-0 text-right">
          <span className="block font-display text-lg font-bold text-primary-ink tabular-nums">
            {profile.profile_strength}
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-subtext">
            strength
          </span>
        </span>
      </Link>
    </li>
  );
}
