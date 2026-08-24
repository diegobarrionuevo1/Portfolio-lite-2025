import type { Metadata } from "next";
import Link from "next/link";
import { Nav } from "@/components/site/nav";
import { Night } from "@/components/site/night";
import { RevealObserver } from "@/components/reveal";
import { SectionLabel, Tag } from "@/components/ds";
import { Contact } from "@/components/sections/contact";
import { getPosts } from "@/lib/ghost/content";
import { formatDate, mono, postHref } from "@/components/blog/shared";

// Posts are published daily by the automation, so the index must refresh
// without a redeploy. The Ghost webhook also flushes this on publish.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Notas sobre desarrollo de software, IA y las herramientas que uso todos los días. Análisis propio, sin humo.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Diego Barrionuevo",
    description:
      "Notas sobre desarrollo de software, IA y las herramientas que uso todos los días.",
    url: "/blog",
    type: "website",
  },
};

export default async function BlogIndex() {
  // A Ghost outage (or a missing key at build time) must degrade to an empty
  // index, never break the page or fail the build.
  let posts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  try {
    ({ posts } = await getPosts({ limit: 24 }));
  } catch (error) {
    console.error("[blog] could not load posts:", error);
  }

  return (
    <>
      <Nav />
      <Night />
      <RevealObserver />

      <main className="flex flex-col">
        <section
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-8)",
            padding: "var(--section-y) var(--page-margin) var(--section-y-tight)",
          }}
        >
          <SectionLabel index="—" aside={`${posts.length} ${posts.length === 1 ? "nota" : "notas"}`}>
            Blog
          </SectionLabel>

          <h1
            style={{
              margin: 0,
              maxWidth: "18ch",
              fontFamily: "var(--font-display)",
              fontSize: "var(--fs-display-2)",
              fontWeight: 500,
              letterSpacing: "var(--ls-display-2)",
              lineHeight: "var(--lh-display)",
              textWrap: "balance",
            }}
          >
            Notas de{" "}
            <em
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 400,
                letterSpacing: 0,
              }}
            >
              taller
            </em>
          </h1>

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
            Desarrollo de software, IA y las herramientas que uso todos los días. Análisis propio
            sobre lo que va pasando — qué cambia en la práctica y cuándo no vale la pena.
          </p>
        </section>

        <section
          className="band-bleed"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-6)",
            padding: "var(--section-y-tight) var(--page-margin) var(--section-y)",
            ["--band-bg" as string]: "var(--surface-sunken)",
          }}
        >
          {posts.length === 0 ? (
            <p style={{ ...mono, color: "var(--text-muted)" }}>
              Todavía no hay notas publicadas.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,360px),1fr))",
                gap: "var(--space-5)",
              }}
            >
              {posts.map((post, i) => (
                <article
                  key={post.id}
                  data-reveal
                  data-delay={i ? String(Math.min(i, 3) * 70) : undefined}
                  className="post-card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-4)",
                    padding: "var(--space-6)",
                    borderRadius: "var(--r-card)",
                    border: "1px solid var(--border-hairline)",
                    background: "var(--surface-card)",
                  }}
                >
                  <div
                    style={{
                      ...mono,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "var(--space-3)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <time dateTime={post.published_at ?? undefined}>
                      {formatDate(post.published_at)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{post.reading_time} min</span>
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--fs-title-2)",
                      fontWeight: 500,
                      letterSpacing: "var(--ls-title)",
                      lineHeight: "var(--lh-snug)",
                      textWrap: "balance",
                    }}
                  >
                    <Link href={postHref(post.slug)} style={{ color: "var(--text-primary)" }}>
                      {post.title}
                    </Link>
                  </h2>

                  {post.excerpt ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: "var(--fs-body-sm)",
                        lineHeight: "var(--lh-body)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {post.excerpt}
                    </p>
                  ) : null}

                  {post.tags?.length ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "var(--space-2)",
                        marginTop: "auto",
                        paddingTop: "var(--space-2)",
                      }}
                    >
                      {post.tags.slice(0, 4).map((tag) => (
                        <Tag key={tag.id}>{tag.name}</Tag>
                      ))}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>

        <Contact />
      </main>
    </>
  );
}
