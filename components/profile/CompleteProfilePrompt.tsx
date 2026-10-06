"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";

/**
 * Nudge for accounts created before gender existed — and for anyone who signed
 * up through the Expo app, which doesn't collect it. Disappears the moment the
 * field is filled in.
 *
 * Gender does NOT filter discovery (everyone sees everyone), so the copy must
 * not promise a "better deck" — it only completes the profile.
 */
export function CompleteProfilePrompt() {
  const user = useAuthStore((s) => s.user);

  // `undefined` means we haven't loaded yet; only `null` means genuinely unset.
  if (!user || user.gender) return null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-card border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
        <Sparkles className="size-5 text-primary-ink" aria-hidden />
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">Finish your profile</p>
        <p className="mt-0.5 text-sm leading-relaxed text-subtext">
          Add your gender — it takes a second. It won&apos;t change who you
          see; Discover shows everyone on campus.
        </p>
      </div>

      <Button asChild size="sm" className="shrink-0">
        <Link href="/profile/edit">Add it</Link>
      </Button>
    </div>
  );
}
