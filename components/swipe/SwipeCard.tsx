"use client";

import Image from "next/image";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import cloudinaryLoader, { isCloudinary } from "@/lib/cloudinary-loader";
import { cn } from "@/lib/cn";
import type { SwipeProfile } from "@/types";

/** The app shows a verified tick above this. Kept identical. */
const VERIFIED_STRENGTH = 80;

interface SwipeCardProps {
  profile: SwipeProfile;
  /** Only the top card runs its carousel and reports interaction. */
  interactive?: boolean;
  priority?: boolean;
  onOpenDetail?: () => void;
}

/**
 * Ported from the app's SwipeCard: full-bleed photo, dark gradient foot, name +
 * semester, branch pill, two-line bio, verified tick above 80% strength.
 *
 * Added for the web, because a card that can't be inspected is worse with a
 * mouse than with a thumb: a real photo carousel — tap-zones on touch, arrows
 * and dots on hover — plus interest chips there was no room for on a phone.
 */
export function SwipeCard({
  profile,
  interactive = false,
  priority = false,
  onOpenDetail,
}: SwipeCardProps) {
  const photos = profile.photos?.length ? profile.photos : [];
  const [photoIndex, setPhotoIndex] = useState(0);

  const safeIndex = Math.min(photoIndex, Math.max(photos.length - 1, 0));
  const current = photos[safeIndex];
  const multiple = photos.length > 1;

  const step = (delta: number) => {
    if (!multiple) return;
    setPhotoIndex((i) => (i + delta + photos.length) % photos.length);
  };

  return (
    <article
      className="relative size-full overflow-hidden rounded-card bg-ink shadow-[0_18px_45px_-15px_rgba(0,0,0,0.4)] select-none"
      aria-label={`${profile.full_name}, semester ${profile.semester}, ${profile.branch}`}
    >
      {current ? (
        <Image
          loader={cloudinaryLoader}
          unoptimized={!isCloudinary(current)}
          src={current}
          alt={`${profile.full_name}, photo ${safeIndex + 1} of ${photos.length}`}
          fill
          sizes="(min-width: 1024px) 420px, 100vw"
          className="object-cover"
          priority={priority}
          draggable={false}
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-gradient-to-br from-secondary to-accent">
          <span className="font-display text-6xl font-bold text-white">
            {profile.full_name.charAt(0).toUpperCase()}
          </span>
        </div>
      )}

      {/* Photo progress pips, Instagram-style. */}
      {multiple && (
        <div className="absolute inset-x-3 top-3 flex gap-1.5" aria-hidden>
          {photos.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i === safeIndex ? "bg-white" : "bg-white/35"
              )}
            />
          ))}
        </div>
      )}

      {/* Touch tap-zones. Hidden from the a11y tree — the arrow buttons below
          are the accessible control for the same thing. */}
      {interactive && multiple && (
        <div className="absolute inset-0 flex lg:hidden" aria-hidden>
          <button type="button" className="h-full w-1/3" onClick={() => step(-1)} tabIndex={-1} />
          <span className="h-full w-1/3" />
          <button type="button" className="h-full w-1/3" onClick={() => step(1)} tabIndex={-1} />
        </div>
      )}

      {/* Desktop arrows — revealed on hover, always reachable by keyboard. */}
      {interactive && multiple && (
        <div className="pointer-events-none absolute inset-y-0 hidden w-full items-center justify-between px-2 lg:flex">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous photo"
            className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-ink/45 text-white opacity-0 backdrop-blur transition-opacity hover:bg-ink/65 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next photo"
            className="pointer-events-auto flex size-9 items-center justify-center rounded-full bg-ink/45 text-white opacity-0 backdrop-blur transition-opacity hover:bg-ink/65 focus-visible:opacity-100 group-hover:opacity-100"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold text-white">
          <span className="truncate">{profile.full_name}</span>
          {profile.profile_strength > VERIFIED_STRENGTH && (
            <BadgeCheck
              className="size-5 shrink-0 text-primary"
              fill="white"
              aria-label="Verified profile"
            />
          )}
        </h2>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
            {profile.branch}
          </span>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            Semester {profile.semester}
          </span>
        </div>

        {profile.bio && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/85">
            {profile.bio}
          </p>
        )}

        {!!profile.interests?.length && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {profile.interests.slice(0, 4).map((interest) => (
              <li
                key={interest}
                className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur"
              >
                {interest}
              </li>
            ))}
          </ul>
        )}

        {interactive && onOpenDetail && (
          <button
            type="button"
            onClick={onOpenDetail}
            className="pointer-events-auto mt-4 text-xs font-semibold text-white/80 underline underline-offset-4 hover:text-white"
          >
            View full profile
          </button>
        )}
      </div>
    </article>
  );
}
