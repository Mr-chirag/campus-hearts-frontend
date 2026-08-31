"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { ResponsiveSheet } from "@/components/ui/ResponsiveSheet";
import { TermsContent, TERMS_LAST_UPDATED } from "./TermsContent";

/**
 * The full terms, readable without leaving the signup wizard.
 *
 * Opening /terms in a new tab would also work, but on a phone that means losing
 * your place mid-signup, so the whole text is available inline. It renders the
 * SAME <TermsContent> as the public page — there is no short version that could
 * drift from the published one.
 */
export function TermsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Terms of Use"
      description={`Last updated ${TERMS_LAST_UPDATED}`}
    >
      <TermsContent />

      <div className="mt-8 border-t border-border pt-4">
        <Link
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-ink hover:underline"
        >
          Open as a page
          <ExternalLink className="size-4" aria-hidden />
        </Link>
      </div>
    </ResponsiveSheet>
  );
}
