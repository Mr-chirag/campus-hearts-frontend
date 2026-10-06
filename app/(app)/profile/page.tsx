"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { BarChart3, Crown, LogOut, Pencil, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, PremiumBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ProfileIdBadge } from "@/components/profile/ProfileIdBadge";
import { ProfileStrengthRing, STRENGTH_TIPS } from "@/components/profile/ProfileStrengthRing";
import cloudinaryLoader, { isCloudinary } from "@/lib/cloudinary-loader";
import { useAuthStore } from "@/store/authStore";
import { usePaymentStore } from "@/store/paymentStore";

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const fetchStatus = usePaymentStore((s) => s.fetchStatus);

  // The server downgrades an expired subscription on read, so this is what
  // keeps a lapsed premium badge from lingering.
  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <Skeleton className="h-48 w-full rounded-card" />
      </main>
    );
  }

  const tips = STRENGTH_TIPS.filter((tip) => tip.test(user));

  return (
    <>
      <AppHeader title="Profile" mobileOnly />

      <main className="mx-auto w-full max-w-2xl px-4 py-4 lg:py-8">
        <h1 className="mb-6 hidden font-display text-3xl font-bold text-ink lg:block">
          Profile
        </h1>

        <Card>
          <div className="flex items-center gap-4">
            <Avatar src={user.photos?.[0]} name={user.full_name} size={80} priority />
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-xl font-bold text-ink">
                {user.full_name}
              </h2>
              <p className="truncate text-sm text-subtext">{user.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>Semester {user.semester}</Badge>
                <Badge>{user.branch}</Badge>
                {user.is_premium && <PremiumBadge />}
              </div>
              {user.profile_id && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <ProfileIdBadge profileId={user.profile_id} />
                  <span className="text-xs text-subtext">
                    Share it so people can find you on Discover
                  </span>
                </div>
              )}
            </div>
          </div>

          {user.bio && (
            <p className="mt-5 whitespace-pre-wrap leading-relaxed text-ink">{user.bio}</p>
          )}

          {!!user.interests?.length && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {user.interests.map((interest) => (
                <li
                  key={interest}
                  className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary-ink"
                >
                  {interest}
                </li>
              ))}
            </ul>
          )}

          <Button asChild size="md" variant="outline" block className="mt-6">
            <Link href="/profile/edit">
              <Pencil className="size-4" aria-hidden />
              Edit profile
            </Link>
          </Button>
        </Card>

        {!!user.photos?.length && (
          <Card className="mt-4">
            <CardTitle className="mb-3">Your photos</CardTitle>
            <ul className="grid grid-cols-3 gap-2">
              {user.photos.map((photo, i) => (
                <li
                  key={photo}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-accent/30"
                >
                  <Image
                    loader={cloudinaryLoader}
          unoptimized={!isCloudinary(photo)}
                    src={photo}
                    alt={`Your photo ${i + 1}`}
                    fill
                    sizes="(min-width: 640px) 200px, 33vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card className="mt-4">
          <div className="flex items-center gap-5">
            <ProfileStrengthRing value={user.profile_strength} />
            <div className="min-w-0 flex-1">
              <CardTitle>Profile strength</CardTitle>
              {tips.length === 0 ? (
                <p className="mt-1 text-sm text-subtext">
                  Your profile is as complete as it gets. 🎉
                </p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {tips.map((tip) => (
                    <li key={tip.text} className="text-sm text-subtext">
                      · {tip.text}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Card>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <LinkCard href="/analytics" icon={BarChart3} label="Analytics" />
          <LinkCard href="/premium" icon={Crown} label={user.is_premium ? "Manage premium" : "Go premium"} />
          <LinkCard href="/settings" icon={Settings} label="Settings" />

          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            className="flex items-center gap-3 rounded-card border border-border bg-surface px-5 py-4 text-left font-semibold text-danger transition-colors hover:bg-danger/5"
          >
            <LogOut className="size-5" aria-hidden />
            Log out
          </button>
        </div>
      </main>
    </>
  );
}

function LinkCard({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-card border border-border bg-surface px-5 py-4 font-semibold text-ink transition-colors hover:border-primary"
    >
      <Icon className="size-5 text-primary-ink" aria-hidden />
      {label}
    </Link>
  );
}
