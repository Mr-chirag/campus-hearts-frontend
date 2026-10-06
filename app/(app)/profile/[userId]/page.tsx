"use client";

import Image from "next/image";
import { use, useEffect } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { Avatar } from "@/components/ui/Avatar";
import { ProfileIdBadge } from "@/components/profile/ProfileIdBadge";
import { Badge, PremiumBadge } from "@/components/ui/Badge";
import { Card, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import cloudinaryLoader, { isCloudinary } from "@/lib/cloudinary-loader";
import { useProfileStore } from "@/store/profileStore";

/**
 * Another student's profile.
 *
 * Loading this page is what RECORDS a profile view — the backend upserts a
 * ProfileView on every GET where the viewer isn't the owner. That is why
 * profileStore.fetchProfile deliberately re-requests even on a cache hit, and
 * why this effect must not be short-circuited on `profiles[userId]` already
 * being present. Skip the request and "Who Viewed You" silently goes empty.
 */
export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const { profiles, isLoadingProfile, fetchProfile } = useProfileStore();

  useEffect(() => {
    void fetchProfile(userId);
  }, [userId, fetchProfile]);

  const profile = profiles[userId];

  if (!profile) {
    return (
      <>
        <AppHeader title="Profile" back />
        <main className="mx-auto w-full max-w-2xl px-4 py-4">
          {isLoadingProfile ? (
            <Skeleton className="h-64 w-full rounded-card" />
          ) : (
            <p className="py-20 text-center text-sm text-subtext">
              This profile isn&apos;t available.
            </p>
          )}
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader title={profile.full_name} back />

      <main className="mx-auto w-full max-w-2xl space-y-4 px-4 py-4 lg:py-8">
        <Card>
          <div className="flex items-center gap-4">
            <Avatar
              src={profile.photos?.[0]}
              name={profile.full_name}
              size={80}
              priority
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-xl font-bold text-ink">
                {profile.full_name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge>Semester {profile.semester}</Badge>
                <Badge>{profile.branch}</Badge>
                {profile.is_premium && <PremiumBadge />}
                <ProfileIdBadge profileId={profile.profile_id} />
              </div>
            </div>
          </div>

          {profile.bio ? (
            <p className="mt-5 whitespace-pre-wrap leading-relaxed text-ink">
              {profile.bio}
            </p>
          ) : (
            <p className="mt-5 text-sm italic text-subtext">No bio yet.</p>
          )}

          {!!profile.interests?.length && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {profile.interests.map((interest) => (
                <li
                  key={interest}
                  className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary-ink"
                >
                  {interest}
                </li>
              ))}
            </ul>
          )}
        </Card>

        {(profile.photos?.length ?? 0) > 1 && (
          <Card>
            <CardTitle className="mb-3">Photos</CardTitle>
            <ul className="grid grid-cols-3 gap-2">
              {profile.photos!.map((photo, i) => (
                <li
                  key={photo}
                  className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-accent/30"
                >
                  <Image
                    loader={cloudinaryLoader}
          unoptimized={!isCloudinary(photo)}
                    src={photo}
                    alt={`${profile.full_name}, photo ${i + 1}`}
                    fill
                    sizes="(min-width: 640px) 200px, 33vw"
                    className="object-cover"
                  />
                </li>
              ))}
            </ul>
          </Card>
        )}
      </main>
    </>
  );
}
