import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site/nav";
import { Night } from "@/components/site/night";
import { RevealObserver } from "@/components/reveal";
import { Contact } from "@/components/sections/contact";
import { siteUrl } from "@/components/blog/shared";
import { ogLocale, workHref, type Lang } from "@/lib/i18n";
import { isShowcaseSlug, resolveShowcase } from "./registry";
import { ShowcaseChapter } from "./scenes/chapter";
import { ShowcaseGallery } from "./scenes/gallery";
import { ShowcaseHero } from "./scenes/hero";
import { ShowcaseMetrics } from "./scenes/metrics";
import { NextProject } from "./scenes/next-project";
import { ScrollDriver } from "./scenes/scroll-driver";
import type { Atmosphere } from "./types";
import "./showcase.css";

export { showcaseStaticParams } from "./registry";

const UI = {
  es: { notFoundTitle: "Proyecto no encontrado" },
  en: { notFoundTitle: "Project not found" },
} as const;

/**
 * Remaps the design-system semantic tokens to the project's own palette, the
 * same set `[data-theme="dark"]` overrides in globals.css. Applied inline on
 * the showcase wrapper, so it beats the dark-scope rule and every primitive
 * inside keeps reading tokens. Derived tones use color-mix so the atmosphere
 * only has to declare its brand values.
 */
export function atmosphereStyle(a: Atmosphere): React.CSSProperties {
  const dark = a.scheme === "dark";
  return {
    ["--surface-canvas" as string]: a.canvas,
    ["--surface-sunken" as string]: a.sunken,
    ["--surface-raised" as string]: a.raised,
    ["--surface-card" as string]: a.card,
    ["--surface-field" as string]: a.raised,
    ["--surface-inverse" as string]: a.ink,
    ["--text-primary" as string]: a.ink,
    ["--text-secondary" as string]: a.secondary,
    ["--text-muted" as string]: a.muted,
    ["--text-accent" as string]: a.accent,
    ["--text-inverse" as string]: a.canvas,
    ["--text-on-accent" as string]: a.accentFg,
    ["--text-link" as string]: a.accent,
    ["--text-link-hover" as string]: a.ink,
    ["--action-primary-bg" as string]: a.ink,
    ["--action-primary-fg" as string]: a.canvas,
    ["--action-primary-bg-hover" as string]: a.secondary,
    ["--action-accent-bg" as string]: a.accent,
    ["--action-accent-fg" as string]: a.accentFg,
    ["--action-accent-bg-hover" as string]: `color-mix(in srgb, ${a.accent} 86%, ${a.ink})`,
    ["--action-quiet-fill" as string]: `color-mix(in srgb, ${a.ink} 6%, transparent)`,
    ["--action-quiet-fill-hover" as string]: `color-mix(in srgb, ${a.ink} 10%, transparent)`,
    ["--border-hairline" as string]: a.hairline,
    ["--border-mid" as string]: `color-mix(in srgb, ${a.ink} 22%, transparent)`,
    ["--border-strong" as string]: `color-mix(in srgb, ${a.ink} 42%, transparent)`,
    ["--border-accent" as string]: a.accent,
    ["--focus-ring" as string]: a.accent,
    ["--grain-blend" as string]: dark ? "overlay" : "multiply",
    ["--grain-opacity" as string]: String(a.grainOpacity ?? (dark ? 0.34 : 0.3)),
  };
}

export function buildShowcaseMetadata(slug: string, lang: Lang): Metadata {
  if (!isShowcaseSlug(slug)) return { title: UI[lang].notFoundTitle };
  const showcase = resolveShowcase(slug, lang);
  const url = workHref(slug, lang);

  return {
    title: showcase.name,
    description: showcase.tagline,
    alternates: {
      canonical: url,
      languages: { es: workHref(slug, "es"), en: workHref(slug, "en") },
    },
    openGraph: {
      type: "website",
      title: showcase.name,
      description: showcase.tagline,
      url,
      locale: ogLocale[lang],
      images: [`/api/og?title=${encodeURIComponent(showcase.name)}&lang=${lang}`],
    },
    twitter: {
      card: "summary_large_image",
      title: showcase.name,
      description: showcase.tagline,
    },
  };
}

/**
 * The presentation, scene by scene: hero, chapters in order, the numbers
 * band and the gallery when the project has them, the next-project card,
 * and the site's Contact footer outside the atmosphere.
 */
export function ShowcaseView({ slug, lang }: { slug: string; lang: Lang }) {
  if (!isShowcaseSlug(slug)) notFound();
  const showcase = resolveShowcase(slug, lang);
  const dark = showcase.atmosphere.scheme === "dark";

  const site = siteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: showcase.name,
    headline: showcase.hero.headline,
    description: showcase.tagline,
    url: `${site}${workHref(slug, lang)}`,
    inLanguage: lang,
    author: { "@type": "Person", name: "Diego Barrionuevo", url: site },
    keywords: showcase.stack.join(", "),
  };

  return (
    <>
      <Nav lang={lang} />
      <Night />
      <RevealObserver />

      {/* JSON-LD. The payload is our own data, and `<` is escaped so the
          closing tag can never be broken out of. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <main className="flex flex-col">
        {/* Atmosphere scope. `data-band` + `data-theme="dark"` only for a dark
            project: the sticky nav reads the first [data-band] to flip its own
            theme, so it renders dark over the scenes and light again over the
            Contact footer, which sits outside this wrapper on purpose.
            The nav is sticky and in flow, so the wrapper is pulled up under it:
            the band then starts at the top of the page (no strip of page
            canvas above a dark project) and the nav sees itself over the band
            from the first frame. The hero pads for the nav height. */}
        <div
          className="showcase band-bleed"
          data-band={dark ? "true" : undefined}
          data-theme={dark ? "dark" : undefined}
          style={{
            ...atmosphereStyle(showcase.atmosphere),
            ["--band-bg" as string]: "var(--surface-canvas)",
            marginTop: "calc(var(--nav-h) * -1)",
            background: "var(--surface-canvas)",
            color: "var(--text-primary)",
          }}
        >
          {/* Protection strip under the transparent nav: scenes scroll beneath it
              instead of colliding with the wordmark. Lives inside the atmosphere
              scope so it takes the project's own canvas colour. */}
          <div className="showcase-navguard" aria-hidden="true" />

          <ScrollDriver />

          <ShowcaseHero showcase={showcase} />

          {showcase.chapters.map((chapter, index) => (
            <ShowcaseChapter key={chapter.id} chapter={chapter} index={index} lang={lang} />
          ))}

          {showcase.metrics ? <ShowcaseMetrics metrics={showcase.metrics} lang={lang} /> : null}

          {showcase.gallery ? (
            <ShowcaseGallery kicker={showcase.gallery.kicker} items={showcase.gallery.items} lang={lang} />
          ) : null}

          <NextProject showcase={showcase} lang={lang} />
        </div>

        <Contact lang={lang} />
      </main>
    </>
  );
}
