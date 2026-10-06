"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { cx } from "./typography";

/**
 * Stage for a motion graphic (`live` media). It only manages playback state;
 * the graphic itself is CSS keyframes keyed on these attributes:
 *
 *   data-playing="1"   while at least half the stage is visible; removed when
 *                      it leaves, so graphics pause (or restart) off screen.
 *   data-reduced="1"   under prefers-reduced-motion: reduce (never plays).
 *   data-mg="<id>"     the registered component id, for scoping styles.
 *
 * The CSS contract (`.mg-run`, `.mg-restart`) is documented in showcase.css.
 */
export function MotionStage({
  id,
  aspect = 1.6,
  className,
  style,
  children,
}: {
  id: string;
  /** width / height; the stage reserves this box so nothing shifts. */
  aspect?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.dataset.reduced = "1";
      return;
    }

    // Half the stage, or whatever fits when the stage is taller than the
    // viewport can show at once; otherwise a tall stage would never play.
    const height = el.getBoundingClientRect().height || 1;
    const threshold = Math.min(0.5, (window.innerHeight * 0.45) / height);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            el.dataset.playing = "1";
          } else {
            delete el.dataset.playing;
          }
        }
      },
      { threshold: [0, threshold] }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cx("mg-stage", className)}
      data-mg={id}
      style={{ aspectRatio: aspect.toFixed(4), ...style }}
    >
      {children}
    </div>
  );
}
