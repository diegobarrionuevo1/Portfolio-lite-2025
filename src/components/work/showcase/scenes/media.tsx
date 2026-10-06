import type { CSSProperties } from "react";
import type { Lang } from "@/lib/i18n";
import type { ShowcaseImage, ShowcaseMedia } from "../types";
import { LiveMedia } from "./live-registry";
import { cx } from "./typography";
import { ShowcaseVideo } from "./video";

export type MediaFrameProps = {
  media: ShowcaseMedia;
  alt: string;
  lang: Lang;
  /** The hero image: eager and high priority. Everything else lazy-loads. */
  priority?: boolean;
  /** `sizes` for the image's srcSet, matching the layout it sits in. */
  sizes?: string;
  /**
   * Parallax travel in px, driven by `--p` from the ScrollDriver. The media
   * is drawn taller than the frame by this amount so the frame never shows
   * a gap; 0 disables it.
   */
  parallax?: number;
  /** Staged entrance (fade + rise) once the ScrollDriver marks the frame in. */
  enter?: boolean;
  /** Film grain overlay, the carousel's treatment for the hero frame. */
  grain?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Frame for any showcase media: hairline, raised surface, `--r-media` and an
 * `aspect-ratio` from the media's dimensions, so nothing shifts while the
 * image, video or motion graphic loads.
 */
export function ShowcaseMediaFrame({
  media,
  alt,
  lang,
  priority = false,
  sizes,
  parallax = 0,
  enter = false,
  grain = false,
  className,
  style,
}: MediaFrameProps) {
  const aspect = media.kind === "live" ? media.aspect ?? 1.6 : media.width / media.height;
  const scene = parallax > 0 || enter;

  return (
    <div
      className={cx(
        "showcase-frame",
        parallax > 0 && "showcase-frame--parallax",
        enter && "showcase-frame--enter",
        className
      )}
      data-scene={scene ? "" : undefined}
      style={{
        aspectRatio: aspect.toFixed(4),
        ["--aspect" as string]: aspect.toFixed(4),
        ["--parallax-range" as string]: `${parallax}px`,
        ...style,
      }}
    >
      {media.kind === "image" ? (
        <FrameImage media={media} alt={alt} priority={priority} sizes={sizes} />
      ) : media.kind === "video" ? (
        <ShowcaseVideo media={media} alt={alt} />
      ) : (
        <LiveMedia media={media} lang={lang} />
      )}
      {grain ? <span className="showcase-frame__grain" aria-hidden="true" /> : null}
    </div>
  );
}

function FrameImage({
  media,
  alt,
  priority,
  sizes,
}: {
  media: ShowcaseImage;
  alt: string;
  priority: boolean;
  sizes?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="showcase-frame__media"
      src={media.src}
      srcSet={media.srcSet}
      sizes={media.srcSet ? sizes ?? media.sizes ?? "100vw" : undefined}
      alt={alt}
      width={media.width}
      height={media.height}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      {...(priority ? HIGH_PRIORITY : {})}
    />
  );
}

// React 18 only knows the lowercase DOM spelling (React 19 switched to
// `fetchPriority`); next/image does the same version split internally.
const HIGH_PRIORITY = { fetchpriority: "high" } as Record<string, string>;
