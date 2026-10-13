import Link from "next/link";
import { workHref, type Lang } from "@/lib/i18n";
import { resolveShowcase } from "../registry";
import type { Showcase } from "../types";
import { mono } from "./typography";

/**
 * Closing card: the whole block links to the next showcase, with its name,
 * tagline and hero image as a thumbnail when it is an image. On hover the
 * thumbnail scales by the house media factor and the arrow slides.
 */
export function NextProject({ showcase, lang }: { showcase: Showcase; lang: Lang }) {
  const next = resolveShowcase(showcase.next, lang);
  const thumb = next.hero.media?.kind === "image" ? next.hero.media : null;

  return (
    <div style={{ padding: "var(--section-y-tight) var(--page-margin) var(--section-y)" }}>
      <Link href={workHref(next.slug, lang)} className="showcase-next" data-reveal>
        {thumb ? (
          <span className="showcase-next__thumb" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumb.src}
              srcSet={thumb.srcSet}
              sizes={thumb.srcSet ? "240px" : undefined}
              alt=""
              width={thumb.width}
              height={thumb.height}
              decoding="async"
              loading="lazy"
            />
          </span>
        ) : null}

        <span className="showcase-next__body">
          <span style={{ ...mono, color: "var(--text-muted)" }}>{showcase.nextLabel}</span>
          <span
            className="showcase-next__name"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--fs-display-3)",
              fontWeight: "var(--fw-display)",
              letterSpacing: "var(--ls-display-3)",
              lineHeight: "var(--lh-tight)",
              textWrap: "balance",
            }}
          >
            {next.name}
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
        </span>

        <span className="showcase-next__arrow" aria-hidden="true">
          →
        </span>
      </Link>
    </div>
  );
}
