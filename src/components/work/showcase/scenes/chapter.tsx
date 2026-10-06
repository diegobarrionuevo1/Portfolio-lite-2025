import type { Lang } from "@/lib/i18n";
import type { Chapter } from "../types";
import { ShowcaseMediaFrame } from "./media";
import {
  chapterTitle,
  countAttrs,
  cx,
  factLabel,
  factValue,
  kicker,
  mono,
  prose,
  toArray,
} from "./typography";

/** `sizes` per layout: the 7/12 column, the full column, or a 2-up cell. */
const SIZES = {
  split: "(min-width: 860px) 54vw, 92vw",
  full: "(min-width: 1760px) 1520px, 92vw",
  pair: "(min-width: 1760px) 740px, (min-width: 700px) 45vw, 92vw",
} as const;

/**
 * One chapter of the presentation. Layouts:
 *
 *   media-right / media-left   two columns from 860px: the text (5/12) sticks
 *                              under the nav while the media (7/12) scrolls
 *                              past it with a slight parallax; stacked below.
 *   media-full                 text block, then the media across the column;
 *                              an array of media becomes a 2-up grid.
 *   live-full                  same as media-full with a motion-graphic stage.
 *   text-only                  the text block alone.
 *
 * Every text block reveals through `data-reveal` with the house stagger; media
 * frames stage in through the ScrollDriver (`data-scene-in`).
 */
export function ShowcaseChapter({ chapter, index, lang }: { chapter: Chapter; index: number; lang: Lang }) {
  const media = toArray(chapter.media);
  const alts = toArray(chapter.mediaAlt);
  const captions = toArray(chapter.caption);
  const id = `chapter-${chapter.id}`;
  const split = (chapter.layout === "media-right" || chapter.layout === "media-left") && media.length > 0;

  const frames = (sizes: string, parallax: number) =>
    media.map((item, i) => (
      <figure key={i} className="showcase-chapter__figure">
        <ShowcaseMediaFrame
          media={item}
          alt={alts[i] ?? alts[0] ?? chapter.title}
          lang={lang}
          sizes={sizes}
          parallax={parallax}
          enter
        />
        {captions[i] ? (
          <figcaption style={{ ...mono, color: "var(--text-muted)" }}>{captions[i]}</figcaption>
        ) : null}
      </figure>
    ));

  if (chapter.layout === "media-cinema" && media[0]) {
    return (
      <CinemaChapter
        id={id}
        index={index}
        lang={lang}
        chapter={chapter}
        media={media[0]}
        alt={alts[0] ?? chapter.title}
        caption={captions[0]}
      />
    );
  }

  if (split) {
    return (
      <section
        id={id}
        lang={lang}
        data-index={index + 1}
        className={cx("showcase-chapter", "showcase-chapter--split", `showcase-chapter--${chapter.layout}`)}
      >
        <div className="showcase-chapter__sticky">
          <ChapterText chapter={chapter} />
        </div>
        <div className="showcase-chapter__media">{frames(SIZES.split, 28)}</div>
      </section>
    );
  }

  return (
    <section
      id={id}
      lang={lang}
      data-index={index + 1}
      className={cx("showcase-chapter", media.length ? "showcase-chapter--full" : "showcase-chapter--text")}
    >
      <ChapterText chapter={chapter} columns />
      {media.length ? (
        <div className="showcase-chapter__strip" data-items={media.length}>
          {frames(media.length > 1 ? SIZES.pair : SIZES.full, 0)}
        </div>
      ) : null}
    </section>
  );
}

/**
 * The cinema layout: the showcase's authored peak. One video (or image)
 * opens from an inset, rounded card into a full-bleed, sharp-cornered screen
 * as the reader scrolls it in (clip-path + scale follow `--p`, no easing: the
 * reader's hand is the timeline), the title sits on the picture over a scrim
 * from 860px, and the prose and facts follow in two columns. Server HTML and
 * reduced motion render the open state (see showcase.css, "Cinema").
 */
function CinemaChapter({
  id,
  index,
  lang,
  chapter,
  media,
  alt,
  caption,
}: {
  id: string;
  index: number;
  lang: Lang;
  chapter: Chapter;
  media: Chapter["media"] extends infer M ? (M extends Array<infer I> ? I : NonNullable<M>) : never;
  alt: string;
  caption?: string;
}) {
  const facts = chapter.facts ?? [];
  const factBase = (chapter.body.length + 1) * 70;

  return (
    <section
      id={id}
      lang={lang}
      data-index={index + 1}
      className="showcase-chapter showcase-chapter--cinema"
    >
      <div className="showcase-cinema" data-scene>
        <div className="showcase-cinema__frame">
          <ShowcaseMediaFrame media={media} alt={alt} lang={lang} sizes="100vw" />
          <span className="showcase-cinema__scrim" aria-hidden="true" />
        </div>
        <div className="showcase-cinema__title">
          <span data-reveal className="showcase-cinema__kicker" style={mono}>
            {chapter.kicker}
          </span>
          <h2 data-reveal data-delay="70" className="showcase-cinema__heading">
            {chapter.title}
          </h2>
        </div>
      </div>

      <div className="showcase-cinema__after">
        <div className="showcase-cinema__aside">
          {caption ? (
            <p data-reveal style={{ ...mono, margin: 0, color: "var(--text-muted)" }}>
              {caption}
            </p>
          ) : null}
          {facts.length ? (
            <dl className="showcase-facts">
              {facts.map((fact, i) => (
                <div key={fact.label} data-reveal data-delay={String(factBase + i * 70)} className="showcase-fact">
                  <dt data-numeric style={factValue} {...countAttrs(fact.value)}>
                    {fact.value}
                  </dt>
                  <dd style={factLabel}>{fact.label}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
        <div className="showcase-chapter__prose">
          {chapter.body.map((paragraph, i) => (
            <p key={paragraph} data-reveal data-delay={String((i + 1) * 70)} style={prose}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Kicker, title, paragraphs and facts. `columns` puts the head on the left
 * and the prose on the right (the T1 two-column rhythm) from 860px; the split
 * layouts keep it as one column so it can stick beside the media.
 */
function ChapterText({ chapter, columns = false }: { chapter: Chapter; columns?: boolean }) {
  const facts = chapter.facts ?? [];
  // Head reveals first, then each paragraph, then the facts, 70ms apart.
  const factBase = (chapter.body.length + 1) * 70;

  return (
    <div className={cx("showcase-chapter__text", columns && "showcase-chapter__text--columns")}>
      <div data-reveal className="showcase-chapter__head">
        <span style={kicker}>{chapter.kicker}</span>
        <h2 style={chapterTitle}>{chapter.title}</h2>
      </div>

      <div className="showcase-chapter__prose">
        {chapter.body.map((paragraph, i) => (
          <p key={paragraph} data-reveal data-delay={String((i + 1) * 70)} style={prose}>
            {paragraph}
          </p>
        ))}

        {facts.length ? (
          <dl className="showcase-facts">
            {facts.map((fact, i) => (
              <div key={fact.label} data-reveal data-delay={String(factBase + i * 70)} className="showcase-fact">
                <dt data-numeric style={factValue} {...countAttrs(fact.value)}>
                  {fact.value}
                </dt>
                <dd style={factLabel}>{fact.label}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </div>
  );
}
