"use client";

import { useEffect } from "react";

/**
 * Scroll reveals for `[data-reveal]` elements (Behaviour: Reveals de scroll).
 * 24px rise + fade, once, via IntersectionObserver. Per-element stagger is
 * declared with `data-delay="70|140|210"`. The visible state is the `.is-in`
 * class; the transition itself lives in globals.css.
 */
export function RevealObserver() {
  useEffect(() => {
    const els = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (!els.length) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const delay = el.dataset.delay;
          if (delay) el.style.transitionDelay = `${delay}ms`;
          el.classList.add("is-in");
          const counter = el.querySelector<HTMLElement>("[data-count]");
          if (counter) countUp(counter);
          io.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -6% 0px" }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}

/** 900ms cubic ease count-up for [data-count] (with optional data-prefix). */
function countUp(el: HTMLElement) {
  if (el.dataset.counted) return;
  el.dataset.counted = "1";
  const target = parseFloat(el.getAttribute("data-count") || "0");
  const prefix = el.getAttribute("data-prefix") || "";
  const t0 = performance.now();
  const tick = (now: number) => {
    const p = Math.min(1, (now - t0) / 900);
    el.textContent = prefix + Math.round(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
