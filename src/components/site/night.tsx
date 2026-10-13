"use client";

import { useEffect, useRef } from "react";

/**
 * Behaviour 1 — "Se hace de noche". The whole palette tweens from the light
 * neutral ramp to the near-black ink ramp and back. Scroll only triggers; the
 * 500ms tween runs on its own and is reversible. Three treatments avoid the
 * mid-grey blind spot at p=0.5:
 *   A. surfaces interpolate (steep centre curve)
 *   B. text/action/accent-border hard-swap at p>=0.5
 *   C. support greys/accents converge toward --text-primary near the crossing
 * Curves are ported verbatim from the reference. Each pair's dark end mirrors
 * the [data-theme="dark"] scope in globals.css, so p=1 equals the dark theme.
 */

const SURF: [string, string, string][] = [
  ["surface-canvas", "var(--bone-200)", "var(--ink-900)"],
  ["surface-sunken", "var(--bone-300)", "var(--ink-950)"],
  ["surface-raised", "var(--bone-100)", "var(--ink-800)"],
  ["surface-card", "var(--bone-50)", "var(--ink-800)"],
  ["surface-field", "var(--bone-50)", "var(--ink-700)"],
  ["action-quiet-fill", "rgba(9,9,9,.06)", "rgba(245,245,245,.08)"],
  ["action-quiet-fill-hover", "rgba(9,9,9,.10)", "rgba(245,245,245,.13)"],
  ["border-hairline", "rgba(9,9,9,.13)", "rgba(245,245,245,.12)"],
  ["border-mid", "rgba(9,9,9,.22)", "rgba(245,245,245,.20)"],
  ["border-strong", "rgba(9,9,9,.42)", "rgba(245,245,245,.36)"],
  ["scrim-strong", "rgba(9,9,9,.42)", "rgba(5,5,6,.78)"],
  ["scrim-soft", "rgba(9,9,9,.18)", "rgba(5,5,6,.42)"],
];

const FG: [string, string, string][] = [
  ["text-primary", "var(--ink-900)", "var(--bone-50)"],
  ["text-disabled", "var(--ink-200)", "var(--ink-300)"],
  ["text-inverse", "var(--bone-200)", "var(--ink-900)"],
  ["text-on-accent", "var(--bone-50)", "var(--ink-900)"],
  ["surface-inverse", "var(--ink-900)", "var(--bone-200)"],
  ["action-primary-bg", "var(--ink-900)", "var(--bone-50)"],
  ["action-primary-fg", "var(--bone-100)", "var(--ink-900)"],
  ["action-primary-bg-hover", "var(--ink-700)", "var(--bone-300)"],
  ["border-accent", "var(--ink-900)", "var(--lavender-500)"],
  ["focus-ring", "var(--violet-500)", "var(--lavender-500)"],
  ["action-accent-bg", "var(--violet-500)", "var(--lavender-500)"],
  ["action-accent-fg", "var(--bone-50)", "var(--ink-900)"],
  ["action-accent-bg-hover", "var(--violet-600)", "var(--lavender-300)"],
];

const SOFT: [string, string, string][] = [
  ["text-secondary", "var(--ink-500)", "var(--ink-100)"],
  ["text-muted", "var(--ink-300)", "var(--ink-200)"],
  ["text-accent", "var(--violet-600)", "var(--lavender-500)"],
  ["text-link", "var(--ink-900)", "var(--lavender-500)"],
  ["text-link-hover", "var(--violet-600)", "var(--bone-100)"],
];

const ALL = [...SURF, ...FG, ...SOFT].map((t) => t[0]);

/** Exposed so the nav can read how far into the night we are. */
export const nightState = { p: 0 };

export function Night() {
  const grainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const anchor = document.querySelector<HTMLElement>("[data-slider]");
    if (!anchor) return;
    const band = document.querySelector<HTMLElement>("[data-band]");
    const el = document.documentElement;
    const grain = grainRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let last = -1;
    const apply = (p: number) => {
      if (Math.abs(p - last) < 0.006 && p !== 0 && p !== 1) return;
      last = p;
      nightState.p = p;
      if (p <= 0) {
        ALL.forEach((n) => el.style.removeProperty("--" + n));
        if (grain) {
          grain.style.mixBlendMode = "multiply";
          grain.style.opacity = "0.3";
        }
        return;
      }
      const t = p * 2 - 1;
      const s = 0.5 + 0.5 * Math.sign(t) * Math.pow(Math.abs(t), 0.62);
      const sp = ((1 - s) * 100).toFixed(1) + "%";
      SURF.forEach(([n, a, b]) =>
        el.style.setProperty("--" + n, p >= 1 ? b : `color-mix(in oklab, ${a} ${sp}, ${b})`)
      );
      const dark = p >= 0.5;
      FG.forEach(([n, a, b]) => el.style.setProperty("--" + n, dark ? b : a));
      const conv = (Math.pow(1 - Math.abs(t), 2) * 92).toFixed(1) + "%";
      SOFT.forEach(([n, a, b]) =>
        el.style.setProperty("--" + n, `color-mix(in oklab, var(--text-primary) ${conv}, ${dark ? b : a})`)
      );
      if (grain) {
        grain.style.mixBlendMode = dark ? "overlay" : "multiply";
        grain.style.opacity = (0.3 + p * 0.04).toFixed(3);
      }
    };

    let cur = 0;
    let target = 0;
    let raf: number | null = null;
    const tween = () => {
      if (reduced) {
        cur = target;
        apply(cur);
        return;
      }
      const from = cur;
      const t0 = performance.now();
      if (raf) cancelAnimationFrame(raf);
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 500);
        cur = from + (target - from) * (1 - Math.pow(1 - k, 3));
        apply(cur);
        raf = k < 1 ? requestAnimationFrame(step) : null;
      };
      raf = requestAnimationFrame(step);
    };

    let queued = false;
    const measure = () => {
      const vh = window.innerHeight || 1;
      const r = anchor.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      const on = mid <= vh - (target === 1 ? -40 : 40);
      const th = vh * 0.6;
      const off = band ? band.getBoundingClientRect().bottom <= th + (target === 1 ? 0 : 60) : false;
      const want = on && !off ? 1 : 0;
      if (want !== target) {
        target = want;
        tween();
      }
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          measure();
        });
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    measure();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ALL.forEach((n) => el.style.removeProperty("--" + n));
      nightState.p = 0;
    };
  }, []);

  return <div className="site-grain" data-grain aria-hidden="true" ref={grainRef} />;
}
