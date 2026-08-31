import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_KEY } from "@/lib/token";

/**
 * Next 16 renamed this convention from `middleware.ts` to `proxy.ts`.
 *
 * Edge-level redirect on the PRESENCE of the auth cookie.
 *
 * Deliberately does not verify the JWT: the signing secret lives on the Express
 * backend and must never be copied into this project. This exists purely so a
 * logged-out visitor hitting /discover gets a redirect before any JS ships,
 * instead of a flash of the app shell. <AuthGuard> does the real check.
 */

const PROTECTED_PREFIXES = [
  "/discover",
  "/matches",
  "/chat",
  "/campus",
  "/profile",
  "/premium",
  "/analytics",
  "/settings",
];

const AUTH_PAGES = ["/login", "/signup", "/forgot-password"];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasToken = Boolean(request.cookies.get(TOKEN_KEY)?.value);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected && !hasToken) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // Already signed in? The auth pages have nothing to offer.
  if (hasToken && AUTH_PAGES.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/discover";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Skip static assets and the image optimizer — this only guards pages.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico)$).*)"],
};
