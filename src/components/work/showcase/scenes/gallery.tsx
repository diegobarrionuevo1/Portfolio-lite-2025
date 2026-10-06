"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Lang } from "@/lib/i18n";
import type { GalleryItem } from "../types";
import { ShowcaseMediaFrame } from "./media";
import { kicker, mono, pad2 } from "./typography";

const UI = {
  es: { region: "Galería del proyecto", hint: "Desplazá con las flechas" },
  en: { region: "Project gallery", hint: "Scroll with the arrow keys" },
} as const;

/** Landscape items cap at 880px; portrait ones share the strip's height. */
const STRIP_SIZES = "(min-width: 1222px) 880px, 72vw";

/**
 * Film strip: native horizontal scrolling with snap points, full-bleed, items
 * at their natural aspect sharing one height, captions in mono. The strip is
 * focusable and the arrow keys move one item; a mono counter follows the
 * item that is most in view.
 */
export function ShowcaseGallery({
  kicker: kickerText,
  items,
  lang,
}: {
  kicker: string;
  items: GalleryItem[];
  lang: Lang;
}) {
  const ui = UI[lang];
  const stripRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const figures = Array.from(strip.querySelectorAll<HTMLElement>("[data-index]"));
    if (!figures.length) return;

    // The counter follows whichever item shows the most of itself.
    const ratios = new Map<number, number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const index = Number((entry.target as HTMLElement).dataset.index);
          ratios.set(index, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best = 0;
        let bestRatio = -1;
        ratios.forEach((ratio, index) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = index;
          }
        });
        setCurrent(best);
      },
      { root: strip, threshold: [0.25, 0.5, 0.75, 1] }
    );
    figures.forEach((figure) => io.observe(figure));
    return () => io.disconnect();
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const strip = stripRef.current;
    if (!strip) return;
    event.preventDefault();
    const first = strip.querySelector<HTMLElement>("[data-index]");
    const step = first ? first.offsetWidth + 24 : strip.clientWidth * 0.7;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    strip.scrollBy({ left: event.key === "ArrowRight" ? step : -step, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section className="showcase-gallery" lang={lang} aria-label={kickerText}>
      <div className="showcase-gallery__head">
        <span data-reveal style={kicker}>
          {kickerText}
        </span>
        <span data-reveal data-delay="70" data-numeric style={{ ...mono, color: "var(--text-muted)" }} aria-live="polite">
          {pad2(current + 1)} / {pad2(items.length)}
        </span>
      </div>

      <div
        ref={stripRef}
        className="showcase-strip"
        role="region"
        aria-label={ui.region}
        aria-describedby="showcase-strip-hint"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {items.map((item, i) => {
          const aspect = item.media.kind === "live" ? item.media.aspect ?? 1.6 : item.media.width / item.media.height;
          return (
            <figure
              key={item.media.id ?? i}
              className="showcase-strip__item"
              data-index={i}
              style={{ ["--aspect" as string]: aspect.toFixed(4) }}
            >
              <ShowcaseMediaFrame media={item.media} alt={item.alt} lang={lang} sizes={STRIP_SIZES} />
              {item.caption ? (
                <figcaption style={{ ...mono, color: "var(--text-muted)" }}>{item.caption}</figcaption>
              ) : null}
            </figure>
          );
        })}
      </div>
      <span id="showcase-strip-hint" hidden>
        {ui.hint}
      </span>
    </section>
  );
}
