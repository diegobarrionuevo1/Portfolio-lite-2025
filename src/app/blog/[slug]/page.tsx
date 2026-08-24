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

export const revalidate = 300;
// Posts created after the last build must still render. `dynamicParams` is true
// by default in the App Router; stating it makes the intent explicit — a slug
// missing from generateStaticParams is rendered on demand and then cached.
export const dynamicParams = true;

type Props = { params: { slug: string } };

export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    return slugs.map(({ slug }) => ({ slug }));
  } catch {
    // Ghost unreachable at build time must not fail the build — every post
    // still renders on demand thanks to dynamicParams.
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "Nota no encontrada" };

  const title = post.meta_title ?? post.title;
  const description = post.meta_description ?? post.excerpt ?? undefined;
  const url = `/blog/${post.slug}`;
  const image = post.og_image ?? post.feature_image ?? undefined;

  return {
    title,
    description,
    // Ghost's own canonical wins when the post was syndicated from elsewhere.
    alternates: { canonical: post.canonical_url ?? url },
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

export default async function PostPage({ params }: Props) {
  let post = null;
  try {
    post = await getPostBySlug(params.slug);
  } catch (error) {
    // Surface a 404 rather than a 500 when Ghost is unreachable — a broken CMS
    // should not render an error page to a visitor or a crawler.
    console.error(`[blog] could not load post "${params.slug}":`, error);
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
    mainEntityOfPage: { "@type": "WebPage", "@id": `${site}/blog/${post.slug}` },
    keywords: post.tags?.map((t) => t.name).join(", ") || undefined,
  };

  return (
    <>
      <Nav />
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
            // Without this the body was capped at --measure-prose while the
            // feature image spanned the full 1520px content area, so the text
            // hugged the left edge under a much wider image. Type stays
            // left-aligned inside the column, as the rest of the site is.
            width: "100%",
            maxWidth: "calc(var(--measure-prose) + 2 * var(--page-margin))",
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
              <Link href="/blog" style={{ color: "var(--text-accent)" }}>
                ← Blog
              </Link>
              <span aria-hidden="true">·</span>
              <time dateTime={post.published_at ?? undefined}>
                {formatDate(post.published_at)}
              </time>
              <span aria-hidden="true">·</span>
              <span>{post.reading_time} min de lectura</span>
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
                {post.tags.map((tag) => (
                  <Tag key={tag.id}>{tag.name}</Tag>
                ))}
              </div>
            ) : null}
          </div>

          {post.feature_image ? (
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
            <Link href="/blog" style={{ color: "var(--text-accent)" }}>
              ← Volver al blog
            </Link>
          </div>
        </article>

        <Contact />
      </main>
    </>
  );
}
