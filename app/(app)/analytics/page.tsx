"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Crown, Eye, TrendingUp, Users } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { PremiumBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProfileStrengthRing } from "@/components/profile/ProfileStrengthRing";
import { PremiumUpsell } from "@/components/premium/PremiumUpsell";
import { formatRelativeTime } from "@/lib/time";
import { useAuthStore } from "@/store/authStore";
import { useProfileStore } from "@/store/profileStore";

export default function AnalyticsPage() {
  const user = useAuthStore((s) => s.user);
  const { profileViews, isLoadingViews, fetchProfileViews } = useProfileStore();
  const [upsellOpen, setUpsellOpen] = useState(false);

  useEffect(() => {
    void fetchProfileViews();
  }, [fetchProfileViews]);

  // One ProfileView document per (viewer, viewed) pair with an incrementing
  // count — so rows are distinct people and the sum is total visits.
  const uniqueViewers = profileViews.length;
  const totalViews = profileViews.reduce((sum, view) => sum + view.viewCount, 0);

  // The server masks identities for free accounts but keeps the rows, so the
  // counts above stay truthful — which is exactly what makes upgrading worth it.
  const identitiesHidden = !user?.is_premium && profileViews.some((v) => v.viewerId?.is_hidden);

  return (
    <>
      <AppHeader title="Analytics" back="/profile" />

      <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 lg:py-8">
        <div className="grid grid-cols-2 gap-3">
          <Stat icon={Eye} label="Profile views" value={totalViews} loading={isLoadingViews} />
          <Stat icon={Users} label="Unique viewers" value={uniqueViewers} loading={isLoadingViews} />
        </div>

        <Card className="flex items-center gap-5">
          <ProfileStrengthRing value={user?.profile_strength ?? 0} />
          <div className="min-w-0 flex-1">
            <CardTitle>Profile strength</CardTitle>
            <p className="mt-1 text-sm leading-relaxed text-subtext">
              Stronger profiles rank higher in Top Profiles, which is where most
              views come from.
            </p>
            <Link
              href="/profile/edit"
              className="mt-2 inline-block text-sm font-semibold text-primary-ink hover:underline"
            >
              Improve it →
            </Link>
          </div>
        </Card>

        <Card>
          <CardTitle className="mb-1">Who viewed you</CardTitle>
          <p className="mb-4 text-sm text-subtext">Most recent first.</p>

          {identitiesHidden && (
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 sm:flex-row sm:items-center">
              <Crown className="size-5 shrink-0 text-gold-ink" aria-hidden />
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-ink">
                <strong className="font-semibold">
                  {uniqueViewers} {uniqueViewers === 1 ? "person has" : "people have"} looked at your profile.
                </strong>{" "}
                Premium shows you who.
              </p>
              <Button size="sm" className="shrink-0" onClick={() => setUpsellOpen(true)}>
                Unlock
              </Button>
            </div>
          )}

          {isLoadingViews && profileViews.length === 0 ? (
            <ul className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <li key={i} className="flex items-center gap-3 py-2">
                  <Skeleton className="size-11 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </li>
              ))}
            </ul>
          ) : profileViews.length === 0 ? (
            <p className="py-8 text-center text-sm leading-relaxed text-subtext">
              Nobody yet. Views are recorded when someone opens your full
              profile — usually from Top Profiles.
            </p>
          ) : (
            <ul className="space-y-1">
              {profileViews.map((view) => {
                const viewer = view.viewerId;

                // Null when that account was deleted. Render the visit, not a
                // broken link to a person who no longer exists.
                // Withheld from free accounts — render the visit, never a link.
                if (viewer?.is_hidden) {
                  return (
                    <li key={view._id}>
                      <button
                        type="button"
                        onClick={() => setUpsellOpen(true)}
                        className="flex w-full items-center gap-3 rounded-2xl px-1 py-3 text-left transition-colors hover:bg-surface-muted">
                      <Avatar name="?" anonymous size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-ink">Someone</span>
                        <span className="block text-xs text-subtext">
                          {formatRelativeTime(view.lastViewed)}
                          {view.viewCount > 1 && ` · ${view.viewCount} visits`}
                        </span>
                      </span>
                      <Crown className="size-4 shrink-0 text-gold-ink" aria-hidden />
                      </button>
                    </li>
                  );
                }

                if (!viewer) {
                  return (
                    <li key={view._id} className="flex items-center gap-3 px-1 py-3">
                      <Avatar name="?" size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-subtext">
                          Deleted account
                        </span>
                        <span className="block text-xs text-subtext">
                          {formatRelativeTime(view.lastViewed)}
                        </span>
                      </span>
                    </li>
                  );
                }

                return (
                  <li key={view._id}>
                    <Link
                      href={`/profile/${viewer._id}`}
                      className="flex items-center gap-3 rounded-2xl px-1 py-3 transition-colors hover:bg-surface-muted"
                    >
                      <Avatar src={viewer.photos?.[0]} name={viewer.full_name} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-semibold text-ink">
                            {viewer.full_name}
                          </span>
                          {viewer.is_premium && <PremiumBadge />}
                        </span>
                        <span className="block truncate text-xs text-subtext">
                          {formatRelativeTime(view.lastViewed)}
                          {view.viewCount > 1 && ` · ${view.viewCount} visits`}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/*
          NO INVENTED NUMBERS. There is no endpoint behind weekly likes, so it
          is labelled as unbuilt rather than filled with a plausible-looking
          figure. Replace this only when a real endpoint exists.
        */}
        <PremiumUpsell
          open={upsellOpen}
          onOpenChange={setUpsellOpen}
          trigger="viewers"
        />

        <Card className="border-dashed opacity-75">
          <div className="flex items-center gap-3">
            <TrendingUp className="size-5 shrink-0 text-subtext" aria-hidden />
            <div>
              <CardTitle className="text-base">Likes this week</CardTitle>
              <p className="mt-0.5 text-sm text-subtext">
                Coming soon — we don&apos;t track this yet, so there&apos;s
                nothing honest to show.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
  loading: boolean;
}) {
  return (
    <Card>
      <Icon className="size-5 text-primary-ink" aria-hidden />
      {loading ? (
        <Skeleton className="mt-3 h-8 w-16" />
      ) : (
        <p className="mt-3 font-display text-3xl font-extrabold tabular-nums text-ink">
          {value}
        </p>
      )}
      <p className="mt-1 text-sm text-subtext">{label}</p>
    </Card>
  );
}
