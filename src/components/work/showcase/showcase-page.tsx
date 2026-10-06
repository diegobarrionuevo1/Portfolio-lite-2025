import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site/nav";
import { Night } from "@/components/site/night";
import { RevealObserver } from "@/components/reveal";
import { Badge, Button, Tag } from "@/components/ds";
import { Contact } from "@/components/sections/contact";
import { mono, siteUrl } from "@/components/blog/shared";
import { homeHref, ogLocale, workHref, type Lang } from "@/lib/i18n";
import { isShowcaseSlug, resolveShowcase } from "./registry";
import type { Atmosphere, Chapter, Showcase, ShowcaseStatus } from "./types";
import "./showcase.css";

export { showcaseStaticParams } from "./registry";

const UI = {
  es: { back: "← Trabajo seleccionado", notFoundTitle: "Proyecto no encontrado" },
  en: { back: "← Selected work", notFoundTitle: "Project not found" },
} as const;

const STATUS_BADGE: Record<ShowcaseStatus, { tone: "positive" | "neutral" | "caution"; dot: boolean }> = {
  production: { tone: "positive", dot: true },
  archived: { tone: "neutral", dot: false },
  "in-development": { tone: "caution", dot: false },
};

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

export function ShowcaseView({ slug, lang }: { slug: string; lang: Lang }) {
  if (!isShowcaseSlug(slug)) notFound();
  const showcase = resolveShowcase(slug, lang);
  const next = resolveShowcase(showcase.next, lang);
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
            Contact footer, which sits outside this wrapper on purpose. */}
        <div
          className="showcase band-bleed"
          data-band={dark ? "true" : undefined}
          data-theme={dark ? "dark" : undefined}
          style={{
            ...atmosphereStyle(showcase.atmosphere),
            ["--band-bg" as string]: "var(--surface-canvas)",
            background: "var(--surface-canvas)",
            color: "var(--text-primary)",
          }}
        >
          <ShowcaseHero showcase={showcase} lang={lang} />

          {/* T3 adds the media frame per chapter layout; until then every
              chapter renders as its text block. */}
          {showcase.chapters.map((chapter) => (
            <ShowcaseChapter key={chapter.id} chapter={chapter} />
          ))}

          <NextProject label={showcase.nextLabel} next={next} lang={lang} />
        </div>

        <Contact lang={lang} />
      </main>
    </>
  );
}

function ShowcaseHero({ showcase, lang }: { showcase: Showcase; lang: Lang }) {
  const ui = UI[lang];
  const badge = STATUS_BADGE[showcase.status];
  const sceneLabel = showcase.hero.mediaAlt ?? showcase.name;

  return (
    <header
      className="showcase-hero"
      style={{ padding: "var(--section-y) var(--page-margin) var(--section-y-tight)" }}
    >
      <div
        data-reveal
        style={{
          ...mono,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "var(--space-3) var(--space-4)",
        }}
      >
        <Link href={`${homeHref(lang)}#work`} className="showcase-back">
          {ui.back}
        </Link>
        <span aria-hidden="true" style={{ color: "var(--text-muted)" }}>·</span>
        <span style={{ color: "var(--text-muted)" }}>{showcase.kicker}</span>
        <Badge tone={badge.tone} dot={badge.dot}>
          {showcase.statusLabel}
        </Badge>
      </div>

      <h1
        data-reveal
        data-delay="70"
        style={{
          margin: 0,
          maxWidth: "22ch",
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-display-2)",
          fontWeight: 500,
          letterSpacing: "var(--ls-display-2)",
          lineHeight: "var(--lh-display)",
          textWrap: "balance",
        }}
      >
        {showcase.hero.headline}
      </h1>

      <p
        data-reveal
        data-delay="140"
        style={{
          margin: 0,
          maxWidth: "var(--measure-lede)",
          fontSize: "var(--fs-body-lg)",
          lineHeight: "var(--lh-body)",
          letterSpacing: "var(--ls-lede)",
          color: "var(--text-secondary)",
        }}
      >
        {showcase.hero.sub}
      </p>

      <div data-reveal data-delay="210" className="showcase-hero__meta">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div style={{ ...mono, display: "flex", flexWrap: "wrap", gap: "var(--space-2) var(--space-3)" }}>
            <span style={{ color: "var(--text-accent)" }}>{showcase.role}</span>
            <span aria-hidden="true" style={{ color: "var(--text-muted)" }}>·</span>
            <span style={{ color: "var(--text-muted)" }}>{showcase.period}</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
            {showcase.stack.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </div>
        </div>
        {showcase.links.length ? (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
            {showcase.links.map((link) => (
              <Button
                key={link.href}
                variant={link.variant}
                arrow
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Hero scene. Real media (T2) replaces the labelled slot. */}
      <figure data-reveal className="showcase-scene" aria-label={sceneLabel}>
        <div className="showcase-scene__frame">
          <span style={{ ...mono, color: "var(--text-muted)" }}>{sceneLabel}</span>
        </div>
      </figure>
    </header>
  );
}

function ShowcaseChapter({ chapter }: { chapter: Chapter }) {
  return (
    <section
      data-reveal
      className="showcase-chapter"
      style={{
        padding: "var(--section-y-tight) var(--page-margin)",
        borderTop: "1px solid var(--border-hairline)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <span style={{ ...mono, color: "var(--text-accent)" }}>{chapter.kicker}</span>
        <h2
          style={{
            margin: 0,
            maxWidth: "18ch",
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-title-1)",
            fontWeight: 500,
            letterSpacing: "var(--ls-title)",
            lineHeight: "var(--lh-snug)",
            textWrap: "balance",
          }}
        >
          {chapter.title}
        </h2>
      </div>

      <div className="showcase-chapter__prose">
        {chapter.body.map((paragraph) => (
          <p
            key={paragraph}
            style={{
              margin: 0,
              maxWidth: "var(--measure-prose)",
              fontSize: "var(--fs-body)",
              lineHeight: "var(--lh-body)",
              color: "var(--text-secondary)",
              textWrap: "pretty",
            }}
          >
            {paragraph}
          </p>
        ))}

        {chapter.facts?.length ? (
          <dl className="showcase-facts">
            {chapter.facts.map((fact) => (
              <div key={fact.label} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                <dt
                  data-numeric
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--fs-title-2)",
                    fontWeight: 500,
                    letterSpacing: "var(--ls-title)",
                    lineHeight: "var(--lh-snug)",
                  }}
                >
                  {fact.value}
                </dt>
                <dd style={{ margin: 0, fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" }}>
                  {fact.label}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}

function NextProject({ label, next, lang }: { label: string; next: Showcase; lang: Lang }) {
  return (
    <div
      data-reveal
      style={{
        padding: "var(--section-y-tight) var(--page-margin) var(--section-y)",
        borderTop: "1px solid var(--border-hairline)",
      }}
    >
      <Link href={workHref(next.slug, lang)} className="showcase-next">
        <span style={{ ...mono, color: "var(--text-muted)" }}>{label}</span>
        <span
          className="showcase-next__name"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-display-3)",
            fontWeight: 500,
            letterSpacing: "var(--ls-display-3)",
            lineHeight: "var(--lh-tight)",
            textWrap: "balance",
          }}
        >
          {next.name}{" "}
          <span className="showcase-next__arrow" aria-hidden="true">→</span>
        </span>
        <span
          style={{
            maxWidth: "var(--measure-lede)",
            fontSize: "var(--fs-body)",
            lineHeight: "var(--lh-body)",
            color: "var(--text-secondary)",
          }}
        >
          {next.tagline}
        </span>
      </Link>
    </div>
  );
}
