import { ALLOWED_EMAIL_DOMAINS, PRIMARY_EMAIL_DOMAIN } from "@/services/config";

/**
 * Client-side mirror of `backend/utils/validate.js`.
 *
 * The server is still the authority — this exists so a student sees the problem
 * on the field they are typing in, instead of after a round trip that surfaces
 * as a modal. Keep the rules in step with the backend when either side changes.
 *
 * The domain is INTERPOLATED FROM CONFIGURATION, never written into a string.
 * Copy stays institution-neutral: "your authorized college email".
 */

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** trim + lowercase, matching `normalizeEmail` on the server. */
export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const validateCollegeEmail = (email: string): string | null => {
  const value = normalizeEmail(email);
  if (!value) return "Email is required";
  if (!EMAIL_SHAPE.test(value)) return "Enter a valid email address";

  // `*` disables the restriction; the server still enforces its own.
  if (!ALLOWED_EMAIL_DOMAINS) return null;

  const domain = value.split("@")[1];
  const ok = ALLOWED_EMAIL_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));

  if (!ok) {
    const suffix = PRIMARY_EMAIL_DOMAIN ? ` (@${PRIMARY_EMAIL_DOMAIN})` : "";
    return `Please use your authorized college email address${suffix}.`;
  }

  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain at least one letter and one number";
  }
  return null;
};

export const validateFullName = (name: string): string | null => {
  const value = name.trim();
  if (!value) return "Name is required";
  if (value.length < 2) return "Please enter your full name";
  return null;
};
