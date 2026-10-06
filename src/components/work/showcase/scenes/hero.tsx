import Link from "next/link";
import { Badge, Button, ScrollCue, Tag } from "@/components/ds";
import { homeHref } from "@/lib/i18n";
import type { Showcase, ShowcaseStatus } from "../types";
import { HeroStage } from "./hero-stage";
import { ShowcaseMediaFrame } from "./media";
import { mono } from "./typography";

const UI = {
  es: { back: "← Trabajo seleccionado" },
  en: { back: "← Selected work" },
} as const;

const STATUS_BADGE: Record<ShowcaseStatus, { tone: "positive" | "neutral" | "caution"; dot: boolean }> = {
  production: { tone: "positive", dot: true },
  archived: { tone: "neutral", dot: false },
  "in-development": { tone: "caution", dot: false },
};

/** The hero image spans the content column, capped at the carousel's 88svh rule. */
const HERO_SIZES = "(min-width: 1760px) 1520px, 92vw";

/**
 * Opening scene: the text block fills the first viewport (when there is
 * media) and the media frame peeks in from below, then parallaxes gently as
 * the reader scrolls. Text staggers in through the reveal system; the frame
 * waits for the fonts (HeroStage) and settles from 0.97 to 1.
 */
export function ShowcaseHero({ showcase }: { showcase: Showcase }) {
  const { lang } = showcase;
  const ui = UI[lang];
  const badge = STATUS_BADGE[showcase.status];
  const media = showcase.hero.media;
  const firstChapter = showcase.chapters[0];

  return (
    <header
      className="showcase-hero"
      data-media={media ? "" : undefined}
      // The wrapper sits under the sticky nav (see ShowcaseView), so the hero
      // clears it before the home hero's 56px of air.
      style={{ padding: "calc(var(--nav-h) + var(--space-8)) var(--page-margin) var(--section-y-tight)" }}
    >
      <div className="showcase-hero__text">
        <div data-reveal className="showcase-hero__row" style={mono}>
          <Link href={`${homeHref(lang)}#work`} className="showcase-back">
            {ui.back}
          </Link>
          <span aria-hidden="true" style={{ color: "var(--text-muted)" }}>
            ·
          </span>
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
              <span>{showcase.role}</span>
              <span aria-hidden="true" style={{ color: "var(--text-muted)" }}>
                ·
              </span>
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
      </div>

      {media ? (
        <HeroStage className="showcase-hero__stage">
          {firstChapter ? (
            <ScrollCue href={`#chapter-${firstChapter.id}`} className="showcase-cue">
              {firstChapter.kicker}
            </ScrollCue>
          ) : null}
          <ShowcaseMediaFrame
            media={media}
            alt={showcase.hero.mediaAlt ?? showcase.name}
            lang={lang}
            priority
            sizes={HERO_SIZES}
            parallax={48}
            grain
          />
        </HeroStage>
      ) : null}
    </header>
  );
}
