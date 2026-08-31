"use client";

import { useSyncExternalStore } from "react";

/** Never fires — the value flips once, when React swaps snapshots. */
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * `false` on the server and during the hydration render, `true` afterwards.
 *
 * This is the sanctioned way to render something that can only be known in the
 * browser (sessionStorage, matchMedia, Date.now) without a hydration mismatch
 * and without the `setState` -in-an-effect pattern React 19 flags as a
 * cascading render.
 *
 * Gate the browser-only branch on this and render the server-safe branch
 * (usually a skeleton) until it turns true.
 */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
