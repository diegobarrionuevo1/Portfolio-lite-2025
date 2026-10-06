/**
 * Builders for media under public/work/<slug>/, the asset pipeline's output.
 *
 * Dimensions come from public/work/manifest.json. `variants` lists the
 * narrower siblings the pipeline wrote next to a 2400w capture (for example
 * `[1200]` for `<name>-1200.webp`), which become the image's `srcSet`.
 */
import type { ShowcaseImage, ShowcaseVideo } from "../types";

const ROOT = "/work";

export function workImage(
  slug: string,
  name: string,
  width: number,
  height: number,
  options: { variants?: number[]; id?: string } = {}
): ShowcaseImage {
  const src = `${ROOT}/${slug}/${name}.webp`;
  const variants = options.variants ?? [];
  const srcSet = variants.length
    ? [...variants.map((w) => `${ROOT}/${slug}/${name}-${w}.webp ${w}w`), `${src} ${width}w`].join(", ")
    : undefined;
  return { kind: "image", id: options.id, src, width, height, srcSet };
}

/** `<name>.mp4` + `<name>.webm` + `<name>-poster.webp`, the pipeline's clip triplet. */
export function workVideo(
  slug: string,
  name: string,
  width: number,
  height: number,
  options: { id?: string } = {}
): ShowcaseVideo {
  const base = `${ROOT}/${slug}/${name}`;
  return {
    kind: "video",
    id: options.id,
    src: `${base}.mp4`,
    webm: `${base}.webm`,
    poster: `${base}-poster.webp`,
    width,
    height,
  };
}
