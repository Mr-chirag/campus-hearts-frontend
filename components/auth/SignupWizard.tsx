"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useIsHydrated } from "@/hooks/useIsHydrated";
import { Check, ChevronLeft, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OtpInput } from "./OtpInput";
import { TermsSheet } from "@/components/legal/TermsSheet";
import { GenderFields } from "@/components/profile/GenderFields";
import { PhotoPicker } from "./PhotoPicker";
import {
  type SignupProgress,
  clearProgress,
  highestReachableStep,
  loadProgress,
  saveProgress,
} from "./signup-state";
import { useAuthStore } from "@/store/authStore";
import { normalizeEmail, validateCollegeEmail, validateFullName, validatePassword } from "@/lib/validation";
import { PRIMARY_EMAIL_DOMAIN } from "@/services/config";
import { TRIAL_DAYS } from "@/types";
import { cn } from "@/lib/cn";

const TOTAL_STEPS = 4;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Signup order: credentials → email verification → who you are → photo.
 *
 * Verification sits second on purpose. The college email is the only proof of
 * enrolment collected, so there is no reason to make someone fill in a profile
 * before finding out their address is not eligible.
 *
 * Because the OTP is checked well before the account exists, step 2 trades it
 * for a 30-minute REGISTRATION TICKET (backend/utils/registrationTicket.js).
 * The 5-minute code would otherwise expire during the Cloudinary upload at
 * step 4. The server reads the email out of that ticket, not out of the
 * request body — so a caller cannot verify one address and register another.
 *
 * The step lives in the URL (?step=N) rather than useState, so Back and
 * Forward behave the way they do everywhere else on the web.
 */
export function SignupWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { sendOtp, verifyOtp, register, uploadImage } = useAuthStore();

  // The lazy initializer reads sessionStorage, which only exists in the
  // browser. Rendering is gated on `hydrated` below, so the hydration pass
  // still renders the same skeleton the server sent.
  const [progress, setProgress] = useState<SignupProgress>(loadProgress);
  const hydrated = useIsHydrated();

  // Never persisted — see signup-state.ts.
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Consent is intentionally NOT persisted to sessionStorage: it must be given
  // deliberately, in this sitting, not restored from a previous one.
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const requestedStep = Number(searchParams.get("step") ?? "1");
  const step = Number.isInteger(requestedStep) ? Math.min(Math.max(requestedStep, 1), TOTAL_STEPS) : 1;

  const patch = useCallback((fields: Partial<SignupProgress>) => {
    setProgress((current) => {
      const next = { ...current, ...fields };
      saveProgress(next);
      return next;
    });
  }, []);

  const goToStep = useCallback(
    (target: number, replace = false) => {
      const url = `/signup?step=${target}`;
      if (replace) router.replace(url);
      else router.push(url);
    },
    [router]
  );

  // Clamp the URL to what the collected data actually supports, so a deep link
  // or a stale Back entry can't render a step that has nothing behind it.
  useEffect(() => {
    if (!hydrated) return;
    const reachable = highestReachableStep(progress);
    if (step > reachable) goToStep(reachable, true);
  }, [hydrated, step, progress, goToStep]);

  /* --------------------------------------------------------------- cooldown */

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = useCallback(() => {
    setCooldown(RESEND_COOLDOWN_SECONDS);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((seconds) => {
        if (seconds <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  }, []);

  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current);
    },
    []
  );

  /* ------------------------------------------------------- step 1: creds --- */

  const submitCredentials = async (event: React.FormEvent) => {
    event.preventDefault();

    const emailError = validateCollegeEmail(progress.email);
    const passwordError = validatePassword(password);
    const termsError = acceptedTerms
      ? undefined
      : "Please accept the Terms of Use to continue";

    setErrors({
      email: emailError ?? undefined,
      password: passwordError ?? undefined,
      terms: termsError,
    });
    if (emailError || passwordError || termsError) return;

    const email = normalizeEmail(progress.email);
    setBusy(true);
    try {
      await sendOtp(email);
      patch({ email });
      startCooldown();
      goToStep(2);
    } catch {
      // Surfaced by the store through <ErrorModal />.
    } finally {
      setBusy(false);
    }
  };

  /* --------------------------------------------------------- step 2: otp --- */

  const submitOtp = async (code?: string) => {
    const value = code ?? otp.join("");
    if (value.length !== 6) return;

    setBusy(true);
    try {
      const ticket = await verifyOtp(progress.email, value);
      patch({ registrationToken: ticket });
      goToStep(3);
    } catch {
      setOtp(Array(6).fill(""));
    } finally {
      setBusy(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0) return;
    setBusy(true);
    try {
      await sendOtp(progress.email);
      setOtp(Array(6).fill(""));
      startCooldown();
    } catch {
      // Surfaced by the store.
    } finally {
      setBusy(false);
    }
  };

  /* ----------------------------------------------------- step 3: details --- */

  const submitDetails = (event: React.FormEvent) => {
    event.preventDefault();

    const nameError = validateFullName(progress.fullName);
    const sem = Number(progress.semester);
    const semesterError =
      !progress.semester || !Number.isInteger(sem) || sem < 1 || sem > 8
        ? "Choose a semester between 1 and 8"
        : undefined;
    const branchError = progress.branch.trim() ? undefined : "Please enter your branch";
    const genderError = progress.gender ? undefined : "Please choose an option";

    setErrors({
      fullName: nameError ?? undefined,
      semester: semesterError,
      branch: branchError,
      gender: genderError,
    });
    if (nameError || semesterError || branchError || genderError) return;

    goToStep(4);
  };

  /* ------------------------------------------------------- step 4: photo --- */

  const completeSignup = async () => {
    if (!progress.photoUrl) {
      setErrors({ photo: "A photo is required to finish." });
      return;
    }
    // Only possible after a refresh wiped the in-memory password.
    if (!password) {
      setErrors({ password: "Please re-enter your password to finish." });
      return;
    }

    setBusy(true);
    try {
      await register({
        full_name: progress.fullName.trim(),
        password,
        semester: Number(progress.semester),
        branch: progress.branch.trim(),
        photos: [progress.photoUrl],
        registrationToken: progress.registrationToken,
        ...(progress.gender ? { gender: progress.gender } : {}),
        interested_in: progress.interestedIn,
      });
      clearProgress();
      router.replace("/discover");
    } catch {
      // Surfaced by the store.
    } finally {
      setBusy(false);
    }
  };

  /* ------------------------------------------------------------- rendering - */

  if (!hydrated) {
    return <div className="h-96 animate-pulse rounded-card bg-accent/20" />;
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              type="button"
              onClick={() => goToStep(step - 1)}
              aria-label="Previous step"
              className="flex size-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-surface-muted"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}
          <p className="text-sm font-semibold text-subtext">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {/* Progress bar. aria-hidden — the "Step N of 4" text above is the
            accessible version of the same information. */}
        <div className="mt-3 flex gap-1.5" aria-hidden>
          {Array.from({ length: TOTAL_STEPS }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                index < step ? "bg-primary" : "bg-accent/50"
              )}
            />
          ))}
        </div>
      </div>

      {step === 1 && (
        <form onSubmit={submitCredentials} noValidate>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Create your account
          </h1>

          <div className="mt-5 flex gap-3 rounded-2xl bg-surface p-4 text-sm leading-relaxed text-subtext">
            <GraduationCap className="mt-0.5 size-5 shrink-0 text-primary-ink" aria-hidden />
            <p>
              Verified students only — sign up with your authorized college email
              {PRIMARY_EMAIL_DOMAIN && (
                <>
                  {" "}ending in{" "}
                  <strong className="font-semibold text-ink">@{PRIMARY_EMAIL_DOMAIN}</strong>
                </>
              )}
              . We&apos;ll send a 6-digit code to confirm it&apos;s yours.
            </p>
          </div>

          <p className="mt-3 flex items-center gap-2 rounded-2xl bg-gold/15 px-4 py-3 text-sm font-medium text-gold-ink">
            <span aria-hidden>🎁</span>
            {/* Stated plainly, including the part people actually worry about:
                no card, no auto-charge. */}
            <span>
              Your first {TRIAL_DAYS} days of Premium are free — no card needed,
              nothing charged automatically.
            </span>
          </p>

          <div className="mt-5 space-y-4">
            <Input
              label="College email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              placeholder={PRIMARY_EMAIL_DOMAIN ? `yourname@${PRIMARY_EMAIL_DOMAIN}` : "you@college.edu"}
              value={progress.email}
              onChange={(e) => {
                patch({ email: e.target.value });
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              error={errors.email}
            />

            <Input
              label="Password"
              revealable
              autoComplete="new-password"
              placeholder="At least 8 characters"
              hint="Must be 8+ characters and include a letter and a number."
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              }}
              error={errors.password}
            />
          </div>

          {/* Mandatory consent gate. The label text is clickable and opens the
              FULL terms inline — a phone user shouldn't have to leave a
              half-filled signup form to read what they're agreeing to. */}
          <div className="mt-6">
            <label className="flex cursor-pointer items-start gap-3">
              <span className="relative mt-0.5 flex size-6 shrink-0 items-center justify-center">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => {
                    setAcceptedTerms(e.target.checked);
                    if (errors.terms) setErrors((p) => ({ ...p, terms: undefined }));
                  }}
                  aria-invalid={errors.terms ? true : undefined}
                  aria-describedby={errors.terms ? "terms-error" : undefined}
                  className="peer size-6 cursor-pointer appearance-none rounded-md border-2 border-accent bg-surface transition-colors checked:border-primary checked:bg-primary"
                />
                <Check
                  className="pointer-events-none absolute size-4 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                  strokeWidth={3}
                  aria-hidden
                />
              </span>

              <span className="text-sm leading-relaxed text-subtext">
                I&apos;m 18 or older and I agree to the{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    // Stop the label from toggling the box when the intent was
                    // clearly to read, not to consent.
                    e.preventDefault();
                    e.stopPropagation();
                    setTermsOpen(true);
                  }}
                  className="font-semibold text-primary-ink underline underline-offset-2 hover:text-primary"
                >
                  Terms of Use
                </button>
                . I understand Campus Hearts is an independent student project,
                not affiliated with any college, and that I&apos;m joining of my
                own free will.
              </span>
            </label>

            {errors.terms && (
              <p id="terms-error" className="ml-9 mt-2 text-xs text-danger">
                {errors.terms}
              </p>
            )}
          </div>

          <Button type="submit" block loading={busy} className="mt-5">
            Send verification code
          </Button>

          <p className="mt-6 text-center text-sm text-subtext">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary-ink hover:underline">
              Log in
            </Link>
          </p>
        </form>
      )}

      <TermsSheet open={termsOpen} onOpenChange={setTermsOpen} />

      {step === 2 && (
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Check your inbox
          </h1>
          <p className="mt-2 text-subtext">
            We sent a 6-digit code to{" "}
            <strong className="font-semibold text-ink">{progress.email}</strong>.
          </p>

          <div className="mt-7">
            <OtpInput
              value={otp}
              onChange={setOtp}
              onComplete={(code) => void submitOtp(code)}
              disabled={busy}
            />
          </div>

          <Button
            block
            loading={busy}
            className="mt-6"
            onClick={() => void submitOtp()}
            disabled={otp.join("").length !== 6}
          >
            Verify email
          </Button>

          <div className="mt-5 text-center text-sm">
            {cooldown > 0 ? (
              <p className="text-subtext">
                Didn&apos;t get it? You can resend in{" "}
                <span className="tabular-nums font-semibold text-ink">{cooldown}s</span>.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => void resendOtp()}
                disabled={busy}
                className="font-semibold text-primary-ink hover:underline disabled:opacity-50"
              >
                Resend the code
              </button>
            )}
          </div>

          <p className="mt-4 text-center text-xs text-subtext">
            Wrong address?{" "}
            <button
              type="button"
              onClick={() => goToStep(1)}
              className="font-semibold text-primary-ink hover:underline"
            >
              Change it
            </button>
          </p>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={submitDetails} noValidate>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Tell us about you
          </h1>
          <p className="mt-2 text-subtext">This is what other students will see.</p>

          <div className="mt-6 space-y-4">
            <Input
              label="Full name"
              autoComplete="name"
              placeholder="Your name"
              value={progress.fullName}
              onChange={(e) => {
                patch({ fullName: e.target.value });
                if (errors.fullName) setErrors((p) => ({ ...p, fullName: undefined }));
              }}
              error={errors.fullName}
            />

            <div className="w-full">
              <label
                htmlFor="semester"
                className="mb-1.5 ml-1 block text-sm font-semibold text-ink"
              >
                Semester
              </label>
              <select
                id="semester"
                value={progress.semester}
                onChange={(e) => {
                  patch({ semester: e.target.value });
                  if (errors.semester) setErrors((p) => ({ ...p, semester: undefined }));
                }}
                aria-invalid={errors.semester ? true : undefined}
                className={cn(
                  "h-14 w-full rounded-2xl border bg-surface px-5 text-base text-ink shadow-sm outline-none transition-colors focus:border-primary",
                  errors.semester ? "border-danger" : "border-primary/10",
                  !progress.semester && "text-subtext"
                )}
              >
                <option value="">Choose your semester</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    Semester {n}
                  </option>
                ))}
              </select>
              {errors.semester && (
                <p className="ml-1 mt-1.5 text-xs text-danger">{errors.semester}</p>
              )}
            </div>

            <Input
              label="Branch"
              placeholder="e.g. CSE, Mechanical, Civil"
              value={progress.branch}
              onChange={(e) => {
                patch({ branch: e.target.value });
                if (errors.branch) setErrors((p) => ({ ...p, branch: undefined }));
              }}
              error={errors.branch}
            />

            <div className="border-t border-border pt-5">
              <GenderFields
                gender={progress.gender}
                interestedIn={progress.interestedIn}
                onGenderChange={(gender) => {
                  patch({ gender });
                  if (errors.gender) setErrors((p) => ({ ...p, gender: undefined }));
                }}
                onInterestedInChange={(interestedIn) => patch({ interestedIn })}
                error={errors.gender}
              />
            </div>
          </div>

          <Button type="submit" block className="mt-6">
            Continue
          </Button>
        </form>
      )}

      {step === 4 && (
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
            Add a photo
          </h1>
          <p className="mt-2 text-subtext">
            At least one photo is required — profiles without one don&apos;t get
            shown to anyone.
          </p>

          <div className="mt-7">
            <PhotoPicker
              value={progress.photoUrl}
              onChange={(url) => {
                patch({ photoUrl: url });
                if (errors.photo) setErrors((p) => ({ ...p, photo: undefined }));
              }}
              upload={uploadImage}
            />
            {errors.photo && (
              <p className="mt-3 text-center text-xs text-danger">{errors.photo}</p>
            )}
          </div>

          {/* Only appears when a refresh cleared the in-memory password. */}
          {!password && (
            <div className="mt-6">
              <Input
                label="Confirm your password"
                revealable
                autoComplete="new-password"
                hint="Your password isn't saved between page reloads, so we need it once more."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                }}
                error={errors.password}
              />
            </div>
          )}

          <Button
            block
            loading={busy}
            className="mt-6"
            onClick={() => void completeSignup()}
            disabled={!progress.photoUrl}
          >
            Create my account
          </Button>
        </div>
      )}
    </div>
  );
}
