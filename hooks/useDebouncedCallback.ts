"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Trailing-edge debounce that cancels itself on unmount.
 *
 * The callback is kept in a ref so the returned function stays referentially
 * stable across renders — otherwise every keystroke in the chat composer would
 * rebuild the debouncer and the `stop typing` emit would never fire.
 */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay: number
) {
  const fnRef = useRef(fn);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return useCallback(
    (...args: A) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fnRef.current(...args), delay);
    },
    [delay]
  );
}
