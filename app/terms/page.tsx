import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { TermsContent } from "@/components/legal/TermsContent";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms you agree to when using Campus Hearts — an independent, student-built app that is not affiliated with any college or university.",
  alternates: { canonical: "/terms" },
};

/**
 * Public and indexable on purpose. Terms that live only behind a signup wall
 * are worth very little: anyone — including an institution asking who runs
 * this — should be able to read them without an account.
 */
export default function TermsPage() {
  return (
    <div className="min-h-dvh-safe">
      <header className="mx-auto flex w-full max-w-3xl items-center gap-3 px-5 py-5">
        <Link
          href="/"
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface"
          aria-label="Back to home"
        >
          <ChevronLeft className="size-6" />
        </Link>
        <span className="font-display text-lg font-bold text-primary-ink">
          Campus Hearts
        </span>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-20">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Terms of Use
        </h1>

        <div className="mt-8">
          <TermsContent />
        </div>

        <div className="mt-12 border-t border-border pt-6">
          <Link
            href="/signup"
            className="font-semibold text-primary-ink hover:underline"
          >
            ← Back to signup
          </Link>
        </div>
      </main>
    </div>
  );
}
