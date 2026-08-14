import { getPosts } from "@/lib/ghost/content";
import { siteUrl } from "@/components/blog/shared";

export const revalidate = 900;

/** Minimal XML escaping for text nodes and attribute values. */
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const site = siteUrl();

  // Ghost being unreachable must still yield a valid (empty) feed rather than
  // a 500 — and must not fail the production build during prerender.
  let posts: Awaited<ReturnType<typeof getPosts>>["posts"] = [];
  try {
    ({ posts } = await getPosts({ limit: 30 }));
  } catch (error) {
    console.error("[rss] could not load posts:", error);
  }

  const items = posts
    .map((post) => {
      const url = `${site}/blog/${post.slug}`;
      const pubDate = post.published_at
        ? new Date(post.published_at).toUTCString()
        : new Date().toUTCString();

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid isPermaLink="true">${escapeXml(url)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.excerpt ?? "")}</description>
${(post.tags ?? []).map((t) => `      <category>${escapeXml(t.name)}</category>`).join("\n")}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Diego Barrionuevo — Blog</title>
    <link>${escapeXml(`${site}/blog`)}</link>
    <description>Desarrollo de software, IA y las herramientas que uso todos los días.</description>
    <language>es-AR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${site}/rss.xml`)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=900, stale-while-revalidate=3600",
    },
  });
}
