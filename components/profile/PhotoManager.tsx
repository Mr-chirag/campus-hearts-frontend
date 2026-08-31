"use client";

import imageCompression from "browser-image-compression";
import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, X } from "lucide-react";
import { toast } from "sonner";
import cloudinaryLoader, { isCloudinary } from "@/lib/cloudinary-loader";
import { cn } from "@/lib/cn";

/** The server rejects more than this (validateStringArray maxItems: 6). */
export const MAX_PHOTOS = 6;

const COMPRESSION = { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true };
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * Photo grid with reordering.
 *
 * Order matters: photos[0] is the face of your card in the deck and your avatar
 * everywhere else, so being able to promote one is the whole point.
 *
 * Reordering is offered THREE ways on purpose. Native drag-and-drop is lovely
 * with a mouse and completely unavailable to a touch user or a keyboard user,
 * so the arrow buttons are not a fallback — they are the primary control on a
 * phone, and the only one a screen reader can drive.
 */
export function PhotoManager({
  photos,
  onChange,
  upload,
}: {
  photos: string[];
  onChange: (next: string[]) => void;
  upload: (file: File) => Promise<string>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return;
    const next = [...photos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const remove = (index: number) => onChange(photos.filter((_, i) => i !== index));

  const addFile = async (file: File) => {
    if (photos.length >= MAX_PHOTOS) {
      toast.error(`You can have at most ${MAX_PHOTOS} photos`);
      return;
    }
    if (!ACCEPTED.includes(file.type)) {
      toast.error("That file type isn't supported", {
        description: "Use a JPG, PNG or WebP image.",
      });
      return;
    }

    setBusy(true);
    try {
      const compressed = await imageCompression(file, COMPRESSION);
      const url = await upload(compressed as File);
      onChange([...photos, url]);
    } catch {
      // Upload failures are surfaced by the store.
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void addFile(file);
        }}
      />

      <ul className="grid grid-cols-3 gap-2">
        {photos.map((photo, index) => (
          <li
            key={photo}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={cn(
              "group relative aspect-[3/4] overflow-hidden rounded-2xl bg-accent/30",
              dragIndex === index && "opacity-40"
            )}
          >
            <Image
              loader={cloudinaryLoader}
          unoptimized={!isCloudinary(photo)}
              src={photo}
              alt={`Photo ${index + 1}${index === 0 ? " — your main photo" : ""}`}
              fill
              sizes="(min-width: 640px) 200px, 33vw"
              className="object-cover"
              draggable={false}
            />

            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                <Star className="size-3" fill="white" aria-hidden />
                Main
              </span>
            )}

            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={`Remove photo ${index + 1}`}
              className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur transition-colors hover:bg-danger"
            >
              <X className="size-4" />
            </button>

            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between gap-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label={`Move photo ${index + 1} earlier`}
                className="flex size-7 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur transition-opacity hover:bg-ink/80 disabled:opacity-0"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === photos.length - 1}
                aria-label={`Move photo ${index + 1} later`}
                className="flex size-7 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur transition-opacity hover:bg-ink/80 disabled:opacity-0"
              >
                <ArrowRight className="size-4" />
              </button>
            </div>
          </li>
        ))}

        {photos.length < MAX_PHOTOS && (
          <li>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) void addFile(file);
              }}
              disabled={busy}
              className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-accent bg-surface text-subtext transition-colors hover:border-primary hover:text-primary-ink disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
              ) : (
                <ImagePlus className="size-6" aria-hidden />
              )}
              <span className="text-xs font-semibold">
                {busy ? "Uploading…" : "Add photo"}
              </span>
            </button>
          </li>
        )}
      </ul>

      <p className="mt-3 text-xs text-subtext">
        Your first photo is what people see in the deck. Drag to reorder, or use
        the arrows. {photos.length}/{MAX_PHOTOS} used.
      </p>
    </div>
  );
}
