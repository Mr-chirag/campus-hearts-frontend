import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * HONESTY NOTE — read before "finishing" this page.
 *
 * The app's forgot-password screen renders an email field, a "Send reset link"
 * button, and then a "Check your mail" confirmation. None of it does anything:
 * the handler is `const handleReset = () => setIsSent(true)` with a comment
 * reading "Simulate reset email".
 *
 * There is no password-reset endpoint anywhere in the backend — `userRoutes.js`
 * exposes send-otp, verify-otp, register, login, profile and :id, and nothing
 * else. So a working form is not possible to build from this side, and a form
 * that lies is worse than no form: someone locked out would wait for an email
 * that is never coming instead of asking for help.
 *
 * This page therefore says what is true. When `POST /api/users/forgot-password`
 * and `POST /api/users/reset-password` exist, replace this with the real flow —
 * it can reuse OtpInput and the existing OTP infrastructure almost verbatim.
 */

export const metadata: Metadata = {
  title: "Password help",
  description: "How to get back into your Campus Hearts account.",
  robots: { index: false, follow: true },
};

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

export default function ForgotPasswordPage() {
  return (
    <div>
      <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
        <KeyRound className="size-7 text-primary-ink" aria-hidden />
      </span>

      <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-ink">
        Locked out?
      </h1>

      <p className="mt-3 leading-relaxed text-subtext">
        We can&apos;t reset passwords automatically yet — that feature isn&apos;t
        built. We&apos;re telling you straight rather than sending you off to wait
        for an email that won&apos;t arrive.
      </p>

      <div className="mt-6 rounded-card border border-border bg-surface p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink">
          <Mail className="size-4 text-primary-ink" aria-hidden />
          What to do instead
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-subtext">
          Get in touch from your college email address and we&apos;ll sort it out
          manually.
          {SUPPORT_EMAIL && (
            <>
              {" "}
              Write to{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="font-semibold text-primary-ink hover:underline"
              >
                {SUPPORT_EMAIL}
              </a>
              .
            </>
          )}
        </p>
      </div>

      <Button asChild block className="mt-7">
        <Link href="/login">Back to log in</Link>
      </Button>

      <p className="mt-6 text-center text-sm text-subtext">
        Remembered it, or never had an account?{" "}
        <Link href="/signup" className="font-semibold text-primary-ink hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
