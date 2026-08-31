"use client";

import { Toaster } from "sonner";

/**
 * Root-level providers. Deliberately LIGHT.
 *
 * Everything that reaches for the session — authStore, and through it axios,
 * socket.io-client and the other stores — lives in <SessionProvider>, which is
 * mounted by the (app) and (auth) layouts instead of here.
 *
 * Why: the public landing page at `/` is the only page an anonymous visitor
 * sees and the entire SEO surface of the product. Mounting the app runtime in
 * the root layout shipped a websocket client and an HTTP stack to a page that
 * makes no requests at all.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: "1rem",
            fontFamily: "var(--font-body), system-ui, sans-serif",
          },
        }}
      />
    </>
  );
}
