import { useLayoutEffect, useRef } from "react";

/**
 * Preserves an element's scrollTop across route remounts using sessionStorage.
 * Keyed globally so switching between sibling category pages keeps the exact
 * sidebar scroll position.
 */
export function useStickyScroll<T extends HTMLElement>(storageKey: string) {
  const ref = useRef<T | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) el.scrollTop = parseInt(saved, 10) || 0;
    } catch {
      /* ignore */
    }
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        try {
          sessionStorage.setItem(storageKey, String(el.scrollTop));
        } catch {
          /* ignore */
        }
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [storageKey]);

  return ref;
}
