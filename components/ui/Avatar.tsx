"use client";

import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/cn";
import cloudinaryLoader, { isCloudinary } from "@/lib/cloudinary-loader";

interface AvatarProps {
  src?: string | null;
  /** Used for the initial fallback and the alt text. */
  name?: string;
  size?: number;
  className?: string;
  /** Anonymous parties render a mask instead of initials — never a real name. */
  anonymous?: boolean;
  priority?: boolean;
}

const initialsOf = (name?: string) =>
  (name ?? "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

/**
 * A single place where a user photo becomes pixels. Centralising it means the
 * anonymity rule is enforced structurally: pass `anonymous` and no src or name
 * can leak through, whatever the caller was holding.
 */
export function Avatar({
  src,
  name,
  size = 48,
  className,
  anonymous = false,
  priority = false,
}: AvatarProps) {
  const [failed, setFailed] = React.useState(false);

  const showImage = !anonymous && src && !failed;

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-accent/40",
        className
      )}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          loader={cloudinaryLoader}
          unoptimized={!isCloudinary(src)}
          src={src}
          alt={name ? `${name}'s photo` : "Profile photo"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          priority={priority}
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex size-full items-center justify-center bg-gradient-to-br from-secondary to-accent font-semibold text-white"
          style={{ fontSize: Math.max(11, size * 0.36) }}
          aria-hidden
        >
          {anonymous ? "?" : initialsOf(name)}
        </div>
      )}
    </div>
  );
}
