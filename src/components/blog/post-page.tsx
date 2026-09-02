import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/site/nav";
import { Night } from "@/components/site/night";
import { RevealObserver } from "@/components/reveal";
import { Tag } from "@/components/ds";
import { Contact } from "@/components/sections/contact";
import { getAllPostSlugs, getPostBySlug } from "@/lib/ghost/content";
import { formatDate, mono, siteUrl } from "@/components/blog/shared";
import { blogHref, ghostSlugFor, postHrefFor, EN_SLUG_SUFFIX, type Lang } from "@/lib/i18n";

const UI = {
  es: { back: "← Blog", backFoot: "← Volver al blog", minRead: "min de lectura", notFoundTitle: "Nota no encontrada" },
  en: { back: "← Blog", backFoot: "← Back to the blog", minRead: "min read", notFoundTitle: "Note not found" },
} as const;

/** Static params for one language's route: ES = bare slugs, EN = stripped twins. */
export async function postStaticParams(lang: Lang) {
  try {
    const slugs = await getAllPostSlugs();
    return slugs
      .filter(({ slug }) => (lang === "en") === slug.endsWith(EN_SLUG_SUFFIX))
      .map(({ slug }) => ({ slug: lang === "en" ? slug.slice(0, -EN_SLUG_SUFFIX.length) : slug }));
  } catch {
    // Ghost unreachable at build time must not fail the build — every post
    // still renders on demand thanks to dynamicParams in the route files.
    return [];
  }
}

export async function buildPostMetadata(slug: string, lang: Lang): Promise<Metadata> {
  const post = await getPostBySlug(ghostSlugFor(slug, lang));
  if (!post) return { title: UI[lang].notFoundTitle };

  const title = post.meta_title ?? post.title;
  const description = post.meta_description ?? post.excerpt ?? undefined;
  const url = postHrefFor(slug, lang);

  // hreflang only when the pair actually exists: pointing Google at a 404
  // is worse than no alternate at all. The EN page always has its ES parent
  // by construction; the ES page checks for its twin.
  let hasPair = lang === "en";
  if (lang === "es") {
    try {
      hasPair = (await getPostBySlug(ghostSlugFor(slug, "en"))) !== null;
    } catch {
      hasPair = false;
    }
  }
  const image = post.og_image ?? post.feature_image ?? undefined;

  return {
    title,
    description,
    // Ghost's own canonical wins when the post was syndicated from elsewhere.
    alternates: {
      canonical: post.canonical_url ?? url,
      ...(hasPair
        ? { languages: { es: postHrefFor(slug, "es"), en: postHrefFor(slug, "en") } }
        : {}),
    },
    openGraph: {
      type: "article",
      title: post.og_title ?? title,
      description: post.og_description ?? description,
      url,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: post.primary_author ? [post.primary_author.name] : undefined,
      tags: post.tags?.map((t) => t.name),
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.twitter_title ?? title,
      description: post.twitter_description ?? description,
      images: image ? [post.twitter_image ?? image] : undefined,
    },
  };
}

export async function PostView({ slug, lang }: { slug: string; lang: Lang }) {
  const ui = UI[lang];
  let post = null;
  try {
    post = await getPostBySlug(ghostSlugFor(slug, lang));
  } catch (error) {
    // Surface a 404 rather than a 500 when Ghost is unreachable — a broken CMS
    // should not render an error page to a visitor or a crawler.
    console.error(`[blog] could not load post "${slug}":`, error);
  }
  if (!post) notFound();

  const site = siteUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.meta_description ?? post.excerpt ?? undefined,
    image: post.feature_image ?? undefined,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    author: {
      "@type": "Person",
      name: post.primary_author?.name ?? "Diego Barrionuevo",
      url: site,
    },
    publisher: { "@type": "Person", name: "Diego Barrionuevo", url: site },
    inLanguage: lang,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site}${postHrefFor(slug, lang)}` },
    keywords: post.tags?.map((t) => t.name).join(", ") || undefined,
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
        <article
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-7)",
            padding: "var(--section-y) var(--page-margin) var(--section-y-tight)",
            // One reading column for the whole piece, centred on the page.
            // Sized in rem, not ch: the body text scales up on wide viewports
            // and a ch-based cap would lag behind it, leaving the column
            // needle-thin on large displays. Type stays left-aligned inside,
            // as the rest of the site is.
            width: "100%",
            maxWidth: "min(100%, calc(46rem + 2 * var(--page-margin)))",
            margin: "0 auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            <div
              style={{
                ...mono,
                display: "flex",
                flexWrap: "wrap",
                gap: "var(--space-3)",
                color: "var(--text-muted)",
              }}
            >
              <Link href={blogHref(lang)} style={{ color: "var(--text-accent)" }}>
                {ui.back}
              </Link>
              <span aria-hidden="true">·</span>
              <time dateTime={post.published_at ?? undefined}>
                {formatDate(post.published_at, lang)}
              </time>
              <span aria-hidden="true">·</span>
              <span>{post.reading_time} {ui.minRead}</span>
            </div>

            <h1
              style={{
                margin: 0,
                maxWidth: "20ch",
                fontFamily: "var(--font-display)",
                fontSize: "var(--fs-display-3)",
                fontWeight: 500,
                letterSpacing: "var(--ls-display-3)",
                lineHeight: "var(--lh-tight)",
                textWrap: "balance",
              }}
            >
              {post.title}
            </h1>

            {post.custom_excerpt ? (
              <p
                style={{
                  margin: 0,
                  maxWidth: "var(--measure-lede)",
                  fontSize: "var(--fs-body-lg)",
                  lineHeight: "var(--lh-body)",
                  letterSpacing: "var(--ls-lede)",
                  color: "var(--text-secondary)",
                }}
              >
                {post.custom_excerpt}
              </p>
            ) : null}

            {post.tags?.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
                {/* #src-<hash> is the pipeline's dedup bookkeeping, not a vertical. */}
                {post.tags
                  .filter((tag) => !tag.name.startsWith("#"))
                  .map((tag) => (
                    <Tag key={tag.id}>{tag.name}</Tag>
                  ))}
              </div>
            ) : null}
          </div>

          {/* The generated cover IS the title set in type: on the page it would
              restate the headline right below itself. It still serves the index
              cards and social shares via metadata; only a real, hand-picked
              image earns a place in the body. */}
          {post.feature_image && !post.feature_image.includes("/api/og") ? (
            <figure style={{ margin: 0, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.feature_image}
                alt={post.feature_image_alt ?? ""}
                style={{
                  width: "100%",
                  borderRadius: "var(--r-media)",
                  border: "1px solid var(--border-hairline)",
                }}
              />
              {post.feature_image_caption ? (
                <figcaption
                  style={{ ...mono, color: "var(--text-muted)" }}
                  dangerouslySetInnerHTML={{ __html: post.feature_image_caption }}
                />
              ) : null}
            </figure>
          ) : null}

          {/* Ghost returns sanitised HTML authored through its own editor and
              our pipeline, so this is trusted first-party content. */}
          <div
            className="article-body"
            dangerouslySetInnerHTML={{ __html: post.html ?? "" }}
          />

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-4)",
              paddingTop: "var(--space-5)",
              borderTop: "1px solid var(--border-hairline)",
              ...mono,
              color: "var(--text-muted)",
            }}
          >
            <Link href={blogHref(lang)} style={{ color: "var(--text-accent)" }}>{ui.backFoot}</Link>
          </div>
        </article>

        <Contact lang={lang} />
      </main>
    </>
  );
}
