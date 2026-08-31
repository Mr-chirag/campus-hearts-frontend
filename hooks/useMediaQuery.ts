"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-safe media query, backed by useSyncExternalStore — the correct primitive
 * for reading from an external source like matchMedia. An effect + setState
 * would render twice on every mount and trip React 19's cascading-render rule.
 *
 * Returns `false` during SSR and hydration, then settles. So never use it to
 * decide whether to render content that must exist for SEO or for a non-JS
 * reader. Layout that differs between mobile and desktop belongs in Tailwind
 * classes; this hook is only for behaviour CSS cannot express — which
 * component to mount, which event to bind.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onStoreChange);
      return () => list.removeEventListener("change", onStoreChange);
    },
    [query]
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);

  // The server has no viewport. Mobile-first means false is the safe default.
  const getServerSnapshot = useCallback(() => false, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** The mobile↔desktop pivot. Must stay in step with Tailwind's `lg`. */
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)");
