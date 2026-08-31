import Cookies from "js-cookie";

/**
 * The single choke point replacing `expo-secure-store` on web.
 *
 * WHY A COOKIE AND NOT localStorage
 * The backend issues a 30-day Bearer JWT and authenticates the Socket.io
 * handshake from `socket.handshake.auth.token`. There is no refresh token and
 * no server-side cookie support, so the client must hold the raw JWT. A cookie
 * (rather than localStorage) is used so `middleware.ts` can do a cheap
 * presence check at the edge and redirect before any JS ships.
 *
 * TRADEOFF, STATED PLAINLY
 * This cookie is readable by JavaScript, so it is XSS-exfiltratable. Mitigated
 * by the strict CSP in Phase 7. The permanent fix is the Phase 9 BFF: an
 * httpOnly cookie set by a Next Route Handler that proxies /api/*. That is
 * deliberately deferred and is not a launch blocker.
 *
 * The async signatures are kept even though cookie access is synchronous — the
 * ported stores `await` every call, and matching the SecureStore contract keeps
 * that code untouched.
 */

export const TOKEN_KEY = "auth_token";

/** Mirrors the backend's 30-day HS256 token lifetime. */
const TOKEN_MAX_AGE_DAYS = 30;

export const getToken = async (): Promise<string | null> => {
  if (typeof document === "undefined") return null;
  return Cookies.get(TOKEN_KEY) ?? null;
};

export const setToken = async (token: string): Promise<void> => {
  Cookies.set(TOKEN_KEY, token, {
    expires: TOKEN_MAX_AGE_DAYS,
    sameSite: "lax",
    // Secure requires HTTPS; omitting it in dev keeps localhost working.
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
    path: "/",
  });
};

export const clearToken = async (): Promise<void> => {
  Cookies.remove(TOKEN_KEY, { path: "/" });
};

/** Synchronous read for render-time guards that cannot await. */
export const getTokenSync = (): string | null => {
  if (typeof document === "undefined") return null;
  return Cookies.get(TOKEN_KEY) ?? null;
};
