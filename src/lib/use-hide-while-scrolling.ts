"use client";

import { useEffect, useState } from "react";

const SETTLE_MS = 220;

// True while the page is being scrolled; flips back shortly after scrolling stops.
export function useHideWhileScrolling(): boolean {
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function onScroll() {
      setScrolling(true);
      clearTimeout(timer);
      timer = setTimeout(() => setScrolling(false), SETTLE_MS);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  return scrolling;
}
