import { Nav } from "@/components/site/nav";
import { Night } from "@/components/site/night";
import { RevealObserver } from "@/components/reveal";
import { SectionLabel } from "@/components/ds";
import { Contact } from "@/components/sections/contact";
import { getPosts } from "@/lib/ghost/content";
import { PostExplorer, type ExplorerPost } from "@/components/blog/post-explorer";
import { EN_SLUG_SUFFIX, type Lang } from "@/lib/i18n";

const COPY = {
  es: {
    aside: "Lo que voy publicando",
    label: "Blog",
    h1a: "Notas de",
    h1em: "taller",
    lede: "Desarrollo de software, IA y las herramientas que uso todos los días. Análisis propio sobre lo que va pasando — qué cambia en la práctica y cuándo no vale la pena.",
  },
  en: {
    aside: "What I keep publishing",
    label: "Blog",
    h1a: "Workshop",
    h1em: "notes",
    lede: "Software, AI and the tools I use every day. First-hand analysis of what's happening — what changes in practice, and when it isn't worth it.",
  },
} as const;

/** Shared blog index: each language route renders this with its own lang. */
export async function BlogIndexView({ lang }: { lang: Lang }) {
  const copy = COPY[lang];

  // A Ghost outage (or a missing key at build time) must degrade to an empty
  // index, never break the page or fail the build.
  let posts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  try {
    ({ posts } = await getPosts({ limit: 24, lang }));
  } catch (error) {
    console.error("[blog] could not load posts:", error);
  }

  const explorerPosts: ExplorerPost[] = posts.map((post) => ({
    id: post.id,
    // The explorer links by SPANISH slug in both languages; the EN route adds
    // the -en suffix back when it fetches. Stripping here keeps URLs clean.
    slug:
      lang === "en" && post.slug.endsWith(EN_SLUG_SUFFIX)
        ? post.slug.slice(0, -EN_SLUG_SUFFIX.length)
        : post.slug,
    title: post.title ?? "",
    excerpt: post.excerpt ?? null,
    publishedAt: post.published_at ?? null,
    readingTime: post.reading_time ?? 1,
    tags: (post.tags ?? [])
      // The pipeline's #src-<hash> and #lang-en tags are bookkeeping, not verticals.
      .filter((tag) => !tag.name.startsWith("#"))
      .map((tag) => ({ slug: tag.slug, name: tag.name })),
  }));

  return (
    <>
      <Nav lang={lang} />
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
          <SectionLabel index="—" aside={copy.aside}>
            {copy.label}
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
            {copy.h1a}{" "}
            <em
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontWeight: 400,
                letterSpacing: 0,
              }}
            >
              {copy.h1em}
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
            {copy.lede}
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
          <PostExplorer posts={explorerPosts} lang={lang} />
        </section>

        <Contact lang={lang} />
      </main>
    </>
  );
}
