import type { Metadata } from "next";
import { Nav } from "@/components/site/nav";
import { Night } from "@/components/site/night";
import { RevealObserver } from "@/components/reveal";
import { SectionLabel } from "@/components/ds";
import { Contact } from "@/components/sections/contact";
import { getPosts } from "@/lib/ghost/content";
import { PostExplorer, type ExplorerPost } from "@/components/blog/post-explorer";

// Posts are published daily by the automation, so the index must refresh
// without a redeploy. The Ghost webhook also flushes this on publish.
//
// The page is static again on purpose: filtering happens in the client (see
// PostExplorer), so it no longer reads searchParams and every visitor gets the
// cached shell instantly instead of a per-request render.
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

  const explorerPosts: ExplorerPost[] = posts.map((post) => ({
    id: post.id,
    slug: post.slug,
    title: post.title ?? "",
    excerpt: post.excerpt ?? null,
    publishedAt: post.published_at ?? null,
    readingTime: post.reading_time ?? 1,
    tags: (post.tags ?? [])
      // The pipeline's #src-<hash> tags are dedup bookkeeping, not verticals.
      .filter((tag) => !tag.name.startsWith("#"))
      .map((tag) => ({ slug: tag.slug, name: tag.name })),
  }));

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
          <SectionLabel index="—" aside="Lo que voy publicando">
            Blog
          </SectionLabel>

          <h1
            style={{
              margin: 0,
              maxWidth: "20ch",
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
          <PostExplorer posts={explorerPosts} />
        </section>

        <Contact />
      </main>
    </>
  );
}
