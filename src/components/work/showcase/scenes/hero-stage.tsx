"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Gates the hero media's entrance on the web fonts, the same way the home
 * hero does, so the frame never settles before the type above it. Sets
 * `data-ready="1"` once `document.fonts.ready` resolves or after a 300ms
 * fallback, whichever comes first; the transition lives in showcase.css.
 */
export function HeroStage({ className, children }: { className?: string; children: ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (!cancelled) setReady(true);
    };
    const fallback = window.setTimeout(start, 300);
    if ("fonts" in document) {
      document.fonts.ready.then(start);
    } else {
      start();
    }
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div className={className} data-ready={ready ? "1" : undefined}>
      {children}
    </div>
  );
}
