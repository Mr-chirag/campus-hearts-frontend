"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { normalizeEmail, validateCollegeEmail } from "@/lib/validation";
import { PRIMARY_EMAIL_DOMAIN } from "@/services/config";

/** Only same-origin paths are honoured — an absolute URL here is an open redirect. */
const safeNext = (value: string | null): string => {
  if (!value) return "/discover";
  if (!value.startsWith("/") || value.startsWith("//")) return "/discover";
  return value;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const emailError = validateCollegeEmail(email);
    // Deliberately NOT validatePassword() here — a rule change would lock out
    // anyone whose existing password predates it. The server decides.
    const passwordError = password ? undefined : "Password is required";

    setErrors({ email: emailError ?? undefined, password: passwordError });
    if (emailError || passwordError) return;

    setSubmitting(true);
    try {
      await login(normalizeEmail(email), password);
      router.replace(safeNext(searchParams.get("next")));
    } catch {
      // The store already surfaced it through <ErrorModal />.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="mt-2 text-subtext">Log in to get back to your campus.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="College email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          placeholder={PRIMARY_EMAIL_DOMAIN ? `yourname@${PRIMARY_EMAIL_DOMAIN}` : "you@college.edu"}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
          }}
          error={errors.email}
        />

        <Input
          label="Password"
          revealable
          autoComplete="current-password"
          placeholder="Your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
          }}
          error={errors.password}
        />

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-primary-ink hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" block loading={submitting} className="mt-2">
          Log in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-subtext">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-primary-ink hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}
