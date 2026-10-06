/**
 * Content model for the project showcases (/work/<slug>, /en/work/<slug>).
 *
 * One definition per project: `shared` holds everything that does not change
 * with the language (slug, status, atmosphere, stack, chapter structure and
 * media), `copy` holds the per-language text. `resolveShowcase` in registry.ts
 * merges both into a flat `Showcase` for rendering, pairing chapters by id.
 */
import type { Lang } from "@/lib/i18n";

export type ShowcaseSlug =
  | "donweb-contenidos"
  | "donweb-talleres"
  | "ada13"
  | "hermes"
  | "finanzas-ia";

export type ShowcaseStatus = "production" | "archived" | "in-development";

/**
 * The project's own reality, expressed as raw CSS colours. These are the only
 * hardcoded colours allowed in the showcase tree: they are the project's
 * brand, not design-system values. `atmosphereStyle` remaps the semantic
 * tokens (--surface-*, --text-*, --action-*, --border-*) from them, so every
 * primitive inside the scope keeps reading tokens as usual.
 */
export type Atmosphere = {
  scheme: "dark" | "light";
  canvas: string;
  sunken: string;
  raised: string;
  card: string;
  /** Text primary. */
  ink: string;
  secondary: string;
  muted: string;
  accent: string;
  /** Text on top of the accent (buttons, filled tags). */
  accentFg: string;
  hairline: string;
  grainOpacity?: number;
};

export type ShowcaseImage = {
  kind: "image";
  src: string;
  width: number;
  height: number;
  srcSet?: string;
  sizes?: string;
};

export type ShowcaseVideo = {
  kind: "video";
  src: string;
  webm?: string;
  poster: string;
  width: number;
  height: number;
};

/** A motion graphic or re-rendered component, registered by id in a later task. */
export type ShowcaseLive = {
  kind: "live";
  component: string;
};

export type ShowcaseMedia = ShowcaseImage | ShowcaseVideo | ShowcaseLive;

export type ChapterLayout =
  | "media-right"
  | "media-left"
  | "media-full"
  | "text-only"
  | "live-full";

export type ChapterShared = {
  id: string;
  layout: ChapterLayout;
  media?: ShowcaseMedia | ShowcaseMedia[];
};

export type ChapterFact = { value: string; label: string };

export type ChapterCopy = {
  kicker: string;
  title: string;
  body: string[];
  facts?: ChapterFact[];
  /** One alt per media entry; a single string when the chapter has one. */
  mediaAlt?: string | string[];
};

export type Chapter = ChapterShared & ChapterCopy;

export type ShowcaseLink = {
  label: string;
  href: string;
  variant: "accent" | "outline";
};

export type ShowcaseMetrics = {
  kicker: string;
  stats: ChapterFact[];
  closer: string;
  note?: string;
};

export type ShowcaseCopy = {
  name: string;
  kicker: string;
  /** One descriptive sentence: metadata description and the next-project card. */
  tagline: string;
  role: string;
  period: string;
  statusLabel: string;
  hero: { headline: string; sub: string; mediaAlt?: string };
  chapters: Record<string, ChapterCopy>;
  metrics?: ShowcaseMetrics;
  links: ShowcaseLink[];
  nextLabel: string;
};

export type ShowcaseShared = {
  slug: ShowcaseSlug;
  /** Position in the showcase sequence (1-based); drives SHOWCASE_SLUGS. */
  order: number;
  status: ShowcaseStatus;
  atmosphere: Atmosphere;
  stack: string[];
  hero: { media?: ShowcaseMedia };
  chapters: ChapterShared[];
  gallery?: ShowcaseMedia[];
  next: ShowcaseSlug;
};

export type ShowcaseDefinition = {
  shared: ShowcaseShared;
  copy: Record<Lang, ShowcaseCopy>;
};

/** Shared data and one language's copy, merged for rendering. */
export type Showcase = Omit<ShowcaseShared, "chapters" | "hero"> &
  Omit<ShowcaseCopy, "chapters" | "hero"> & {
    lang: Lang;
    hero: ShowcaseShared["hero"] & ShowcaseCopy["hero"];
    chapters: Chapter[];
  };
