"use client";

import imageCompression from "browser-image-compression";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/cn";

interface PhotoPickerProps {
  /** Cloudinary URL once uploaded, or null. */
  value: string | null;
  onChange: (url: string | null) => void;
  /** Uploads the file and resolves with the hosted URL. */
  upload: (file: File) => Promise<string>;
  className?: string;
}

/** The upload route caps at 5MB; compress well under it before we ever send. */
const COMPRESSION = { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true };
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

/**
 * File input + drag-and-drop, with client-side compression.
 *
 * Compressing in the browser is a straight win the app didn't have: a 6MB phone
 * photo becomes ~400kB before it leaves the device, so the upload succeeds on
 * bad campus wifi instead of timing out — and it can no longer trip the
 * server's 5MB multer limit.
 */
export function PhotoPicker({ value, onChange, upload, className }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = async (file: File) => {
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
      onChange(url);
    } catch {
      // The store surfaces upload failures; compression failures land here.
      onChange(null);
    } finally {
      setBusy(false);
      // Reset so picking the SAME file again still fires a change event.
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {value ? (
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[16rem] overflow-hidden rounded-card border border-border bg-surface-muted">
          <Image
            src={value}
            alt="Your profile photo"
            fill
            sizes="256px"
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Remove photo"
            className="absolute right-2 top-2 flex size-9 items-center justify-center rounded-full bg-ink/60 text-white backdrop-blur transition-colors hover:bg-ink/80"
          >
            <X className="size-5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) void handleFile(file);
          }}
          disabled={busy}
          className={cn(
            "mx-auto flex aspect-[3/4] w-full max-w-[16rem] flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed bg-surface px-6 text-center transition-colors",
            dragging ? "border-primary bg-primary/5" : "border-accent hover:border-primary",
            busy && "opacity-60"
          )}
        >
          {busy ? (
            <>
              <Loader2 className="size-8 animate-spin text-primary" aria-hidden />
              <span className="text-sm font-semibold text-ink">Uploading…</span>
            </>
          ) : (
            <>
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Camera className="size-7 text-primary-ink" aria-hidden />
              </span>
              <span className="font-semibold text-ink">Add a photo</span>
              <span className="text-xs text-subtext">
                {/* Drag-and-drop is desktop-only in practice, so it's phrased
                    as a bonus rather than the primary instruction. */}
                Tap to choose — or drop an image here
              </span>
            </>
          )}
        </button>
      )}
    </div>
  );
}
