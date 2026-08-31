"use client";

import { ResponsiveSheet } from "@/components/ui/ResponsiveSheet";
import { Badge, PremiumBadge } from "@/components/ui/Badge";
import type { SwipeProfile } from "@/types";
import Image from "next/image";
import cloudinaryLoader, { isCloudinary } from "@/lib/cloudinary-loader";

/**
 * The full profile behind the top card — opened by Space, by "View full
 * profile", or by the desktop rail's own layout.
 *
 * Deliberately NOT a link to /profile/[userId]: that route records a profile
 * view, and merely peeking at a card in the deck shouldn't tell someone you
 * looked. Viewing is an intentional act from Top Profiles or Analytics.
 */
export function ProfileDetailSheet({
  profile,
  open,
  onOpenChange,
}: {
  profile: SwipeProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!profile) return null;

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title={profile.full_name}
      description={`Semester ${profile.semester} · ${profile.branch}`}
    >
      <ProfileDetailBody profile={profile} />
    </ResponsiveSheet>
  );
}

/** Shared with the xl desktop rail, which shows the same content unwrapped. */
export function ProfileDetailBody({ profile }: { profile: SwipeProfile }) {
  return (
    <div className="space-y-5">
      {!!profile.photos?.length && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {profile.photos.map((photo, i) => (
            <div
              key={photo}
              className="relative aspect-[3/4] w-32 shrink-0 overflow-hidden rounded-2xl bg-accent/30"
            >
              <Image
                loader={cloudinaryLoader}
          unoptimized={!isCloudinary(photo)}
                src={photo}
                alt={`${profile.full_name}, photo ${i + 1}`}
                fill
                sizes="128px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Badge>Semester {profile.semester}</Badge>
        <Badge>{profile.branch}</Badge>
        {profile.is_premium && <PremiumBadge />}
      </div>

      {profile.bio ? (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-subtext">About</h4>
          <p className="mt-1.5 leading-relaxed text-ink">{profile.bio}</p>
        </div>
      ) : (
        <p className="text-sm italic text-subtext">No bio yet.</p>
      )}

      {!!profile.interests?.length && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wide text-subtext">
            Interests
          </h4>
          <ul className="mt-2 flex flex-wrap gap-2">
            {profile.interests.map((interest) => (
              <li
                key={interest}
                className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary-ink"
              >
                {interest}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
