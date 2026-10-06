"use client";

import { useEffect } from "react";

/**
 * Scroll progress for the showcase scenes (one instance per page).
 *
 * Contract
 * --------
 * Any element with `data-scene` gets two things written by this driver:
 *
 *   --p             progress in [0, 1] as the element travels through the
 *                   viewport: 0 when its top edge reaches the bottom of the
 *                   viewport, 1 when its bottom edge leaves the top. Formula:
 *                   p = clamp((vh - rect.top) / (vh + rect.height)), so an
 *                   element centred in the viewport sits near 0.5.
 *   data-scene-in   set to "1" the first time roughly 20% of the element is
 *                   visible, never removed; CSS stages entrances off it.
 *
 * Scenes consume `--p` in CSS only, e.g.
 *   transform: translate3d(0, calc((0.5 - var(--p, 0.5)) * 36px), 0);
 * Always read it with the 0.5 fallback: server HTML has no `--p`, and the
 * value is only written for elements within one viewport of the screen, so
 * anything far away keeps its resting position.
 *
 * One rAF-throttled loop serves every scene (passive scroll + resize), the
 * house pattern from project-carousel.tsx. Under `prefers-reduced-motion:
 * reduce` the driver writes `--p: 0.5` and `data-scene-in` once and stops:
 * no parallax, no scroll-driven transforms, entrances already settled.
 */
export function ScrollDriver() {
  useEffect(() => {
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));
    if (!scenes.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of scenes) {
        el.style.setProperty("--p", "0.5");
        el.dataset.sceneIn = "1";
      }
      return;
    }

    let raf = 0;
    const frame = () => {
      raf = 0;
      const vh = window.innerHeight;
      for (const el of scenes) {
        const rect = el.getBoundingClientRect();
        // Skip anything more than a viewport away: it cannot be seen moving.
        if (rect.bottom < -vh || rect.top > vh * 2) continue;

        const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
        el.style.setProperty("--p", p.toFixed(4));

        if (!el.dataset.sceneIn) {
          const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
          // Tall scenes count against the viewport, so they still stage in.
          if (visible / Math.min(rect.height || 1, vh) >= 0.2) el.dataset.sceneIn = "1";
        }
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
