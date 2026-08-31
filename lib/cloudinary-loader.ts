"use client";

import type { ImageLoaderProps } from "next/image";

/**
 * Rewrites a Cloudinary delivery URL to request the exact width next/image
 * asked for, in the best format the browser accepts.
 *
 * The upload route already caps originals at 800x800 (`crop: limit`), so this
 * is about shipping a 200px avatar as 200px instead of 800px — the single
 * biggest bandwidth win on the feed and matches list.
 *
 * Any non-Cloudinary URL passes through untouched.
 */
/**
 * next/image requires a custom loader to actually USE the `width` it is given.
 * This one can't for a non-Cloudinary host — there is no generic way to ask an
 * arbitrary server for a resized image — so those must be passed
 * `unoptimized`, or Next warns and silently ships the full-size original.
 *
 * In production every user photo is Cloudinary; this only matters for dev seed
 * data (randomuser.me).
 */
export const isCloudinary = (src: string): boolean =>
  src.includes("res.cloudinary.com") && src.includes("/upload/");

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  if (!isCloudinary(src)) {
    return src;
  }

  const params = [
    "f_auto", // AVIF/WebP negotiation
    `q_${quality ?? "auto"}`,
    `w_${width}`,
    "c_limit", // never upscale past the stored original
    "dpr_auto",
  ].join(",");

  // .../image/upload/<existing transforms>/v123/campus_hearts/abc.jpg
  return src.replace("/upload/", `/upload/${params}/`);
}
