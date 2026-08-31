/**
 * Where the backend lives.
 *
 * The app derived this from Expo's `hostUri` because the Metro bundler and the
 * API shared a LAN machine whose DHCP address kept changing. On the web there
 * is no bundler host to borrow from and no moving IP — the origin is plain
 * configuration, so it comes straight from the environment.
 *
 * NEXT_PUBLIC_* is inlined into the browser bundle at build time. That is
 * correct for these two values (they are public endpoints) and is exactly why
 * no secret may ever be added to this file.
 */

const DEFAULT_SERVER = "http://localhost:5000";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

/** Origin only — no trailing slash, no /api suffix. Used by Socket.io. */
export const SERVER_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_SERVER_URL?.trim() || DEFAULT_SERVER
);

/** REST base. Defaults to SERVER_URL + /api. */
export const API_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL?.trim() || `${SERVER_URL}/api`
);

export const IS_DEV = process.env.NODE_ENV !== "production";

/**
 * Domains permitted to register, mirroring ALLOWED_EMAIL_DOMAINS in the
 * backend .env. `null` means no client-side restriction (the server still
 * enforces its own). The server remains the authority — this only exists so a
 * student sees the problem on the field they are typing in.
 */
export const ALLOWED_EMAIL_DOMAINS: string[] | null = (() => {
  const raw = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS?.trim() || "rungta.org";
  if (raw === "*") return null;
  return raw
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
})();

/**
 * The domain to show in user-facing copy. Institution-neutral by construction:
 * the value is interpolated from configuration, never written into a string.
 */
export const PRIMARY_EMAIL_DOMAIN = ALLOWED_EMAIL_DOMAINS?.[0] ?? null;
