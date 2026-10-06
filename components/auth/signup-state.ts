/**
 * Wizard progress that survives a page refresh.
 *
 * The app kept all four steps in component state because a native screen never
 * reloads. On the web it can — F5, a restored tab, a dropped connection — and
 * losing a verified email plus its registration ticket would mean redoing the
 * OTP for no reason.
 *
 * WHAT IS PERSISTED, AND WHY IT IS SAFE
 *   email, full_name, semester, branch  — the user typed them; not secrets.
 *   photo URL                           — already a public Cloudinary URL.
 *   registrationToken                   — a purpose-scoped 30-minute ticket
 *     that can only create an account for an email that was ALREADY verified
 *     by whoever is sitting at this browser. It cannot log in, cannot read
 *     anything, and expires on its own.
 *
 * WHAT IS NEVER PERSISTED
 *   the password. It stays in component state only. If a refresh loses it, the
 *   final step asks for it again rather than storing a credential at rest.
 *
 * sessionStorage, not localStorage: it dies with the tab.
 */

import type { Gender } from "@/types";

export interface SignupProgress {
  email: string;
  registrationToken: string;
  fullName: string;
  semester: string;
  branch: string;
  gender: Gender | null;
  photoUrl: string | null;
}

export const EMPTY_PROGRESS: SignupProgress = {
  email: "",
  registrationToken: "",
  fullName: "",
  semester: "",
  branch: "",
  gender: null,
  photoUrl: null,
};

const KEY = "signup_progress";

export const loadProgress = (): SignupProgress => {
  if (typeof window === "undefined") return EMPTY_PROGRESS;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return EMPTY_PROGRESS;
    return { ...EMPTY_PROGRESS, ...(JSON.parse(raw) as Partial<SignupProgress>) };
  } catch {
    return EMPTY_PROGRESS;
  }
};

export const saveProgress = (progress: SignupProgress): void => {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(progress));
  } catch {
    // Private mode, or storage full. The wizard still works in-memory.
  }
};

export const clearProgress = (): void => {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
};

/**
 * The furthest step this progress actually supports. Deep-linking to ?step=4
 * with nothing filled in lands on step 1 instead of a broken form.
 */
export const highestReachableStep = (p: SignupProgress): number => {
  if (!p.email) return 1;
  if (!p.registrationToken) return 2;
  if (!p.fullName.trim() || !p.semester || !p.branch.trim() || !p.gender) return 3;
  return 4;
};
