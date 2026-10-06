"use client";

import { useEffect, useRef } from "react";
import type { ShowcaseVideo as ShowcaseVideoMedia } from "../types";

/**
 * The codebase's one <video>. Muted, looping, inline, poster first; it plays
 * only while about a third of it is on screen and pauses otherwise. Under
 * `prefers-reduced-motion: reduce` it never plays: the poster stays, the
 * sources remain for anyone who wants to use the native controls via the
 * context menu, and nothing moves on its own.
 */
export function ShowcaseVideo({ media, alt }: { media: ShowcaseVideoMedia; alt: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            // Autoplay can be refused by policy; a paused poster is fine.
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(video);
    return () => {
      io.disconnect();
      video.pause();
    };
  }, []);

  return (
    <video
      ref={ref}
      className="showcase-frame__media"
      muted
      loop
      playsInline
      preload="metadata"
      poster={media.poster}
      width={media.width}
      height={media.height}
      aria-label={alt}
      tabIndex={-1}
    >
      {media.webm ? <source src={media.webm} type="video/webm" /> : null}
      <source src={media.src} type="video/mp4" />
    </video>
  );
}
