/**
 * Two-language routing helpers.
 *
 * Spanish owns the bare routes ("/", "/blog/…") so nothing already indexed
 * moves; English mirrors them under "/en". Post twins pair by slug alone —
 * the English copy of `<slug>` lives in Ghost as `<slug>-en` — so both sides
 * can build their hreflang links with string manipulation, no lookups.
 *
 * Copy itself lives next to each component as a local { es, en } object:
 * colocated, typed, and reviewed together with the markup that uses it.
 */
export type Lang = "es" | "en";

export const EN_SLUG_SUFFIX = "-en";

export function homeHref(lang: Lang): string {
  return lang === "en" ? "/en" : "/";
}

export function blogHref(lang: Lang): string {
  return lang === "en" ? "/en/blog" : "/blog";
}

/** URL for a post given the SPANISH slug, in either language. */
export function postHrefFor(esSlug: string, lang: Lang): string {
  return lang === "en" ? `/en/blog/${esSlug}` : `/blog/${esSlug}`;
}

/** The Ghost slug backing a post URL in the given language. */
export function ghostSlugFor(esSlug: string, lang: Lang): string {
  return lang === "en" ? `${esSlug}${EN_SLUG_SUFFIX}` : esSlug;
}

export const htmlLang: Record<Lang, string> = { es: "es", en: "en" };
export const dateLocale: Record<Lang, string> = { es: "es-AR", en: "en-US" };
export const ogLocale: Record<Lang, string> = { es: "es_AR", en: "en_US" };
