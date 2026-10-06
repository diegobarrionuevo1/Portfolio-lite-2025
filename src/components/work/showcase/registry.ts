/**
 * Showcase registry: the one place that knows every project page.
 *
 * Content modules live in ./content/<slug>.ts, one per project. The order of
 * SHOWCASE_SLUGS comes from each definition's `order`, so adding a showcase
 * is one new content file plus one line in DEFINITIONS.
 */
import type { Lang } from "@/lib/i18n";
import { ada13 } from "./content/ada13";
import { donwebContenidos } from "./content/donweb-contenidos";
import { donwebTalleres } from "./content/donweb-talleres";
import { finanzasIa } from "./content/finanzas-ia";
import { hermes } from "./content/hermes";
import type {
  Chapter,
  GalleryItem,
  Showcase,
  ShowcaseDefinition,
  ShowcaseSlug,
} from "./types";

const DEFINITIONS: Record<ShowcaseSlug, ShowcaseDefinition> = {
  "donweb-contenidos": donwebContenidos,
  "donweb-talleres": donwebTalleres,
  ada13,
  hermes,
  "finanzas-ia": finanzasIa,
};

/** Every showcase slug, in presentation order. */
export const SHOWCASE_SLUGS: readonly ShowcaseSlug[] = (
  Object.keys(DEFINITIONS) as ShowcaseSlug[]
).sort((a, b) => DEFINITIONS[a].shared.order - DEFINITIONS[b].shared.order);

export function isShowcaseSlug(value: string): value is ShowcaseSlug {
  return Object.prototype.hasOwnProperty.call(DEFINITIONS, value);
}

export function getShowcaseDefinition(slug: ShowcaseSlug): ShowcaseDefinition {
  return DEFINITIONS[slug];
}

export function nextShowcase(slug: ShowcaseSlug): ShowcaseSlug {
  return DEFINITIONS[slug].shared.next;
}

/** `generateStaticParams` payload: all slugs are known at build time. */
export function showcaseStaticParams(): { slug: ShowcaseSlug }[] {
  return SHOWCASE_SLUGS.map((slug) => ({ slug }));
}

/**
 * Shared data plus one language's copy, merged for rendering. Chapters and
 * gallery items pair by id in both directions, and a mismatch throws so the
 * static build fails instead of shipping a page with a silent hole.
 */
export function resolveShowcase(slug: ShowcaseSlug, lang: Lang): Showcase {
  const { shared, copy } = DEFINITIONS[slug];
  const text = copy[lang];

  const chapters: Chapter[] = shared.chapters.map((chapter) => {
    const chapterCopy = text.chapters[chapter.id];
    if (!chapterCopy) {
      throw new Error(`[showcase] "${slug}" (${lang}) has no copy for chapter "${chapter.id}"`);
    }
    return { ...chapter, ...chapterCopy };
  });

  for (const id of Object.keys(text.chapters)) {
    if (!shared.chapters.some((chapter) => chapter.id === id)) {
      throw new Error(`[showcase] "${slug}" (${lang}) has copy for unknown chapter "${id}"`);
    }
  }

  const { gallery: sharedGallery, ...sharedRest } = shared;
  const { gallery: galleryCopy, ...textRest } = text;

  let gallery: Showcase["gallery"];
  if (sharedGallery?.length) {
    if (!galleryCopy) {
      throw new Error(`[showcase] "${slug}" (${lang}) has gallery media but no gallery copy`);
    }
    const items: GalleryItem[] = sharedGallery.map((media, index) => {
      const id = media.id ?? String(index);
      const itemCopy = galleryCopy.items[id];
      if (!itemCopy) {
        throw new Error(`[showcase] "${slug}" (${lang}) has no copy for gallery item "${id}"`);
      }
      return { media, ...itemCopy };
    });
    gallery = { kicker: galleryCopy.kicker, items };
  }

  return {
    ...sharedRest,
    ...textRest,
    lang,
    hero: { ...shared.hero, ...text.hero },
    chapters,
    gallery,
  };
}
