"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Whether a CSS media query matches right now. Returns `false` on the server and on the first
 * client render, so use it to choose between two working behaviours — never to decide whether
 * something renders at all.
 *
 * @example
 * const isDesktop = useMediaQuery("(min-width: 48rem)");
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

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}
