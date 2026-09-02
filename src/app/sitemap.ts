import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/ghost/content";
import { siteUrl } from "@/components/blog/shared";
import { EN_SLUG_SUFFIX } from "@/lib/i18n";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${site}/en`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${site}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${site}/en/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
  ];

  let posts: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllPostSlugs();
    // English twins live in Ghost as `<slug>-en` but are served at /en/blog/<slug>.
    posts = slugs.map(({ slug, updated_at, published_at }) => {
      const isEn = slug.endsWith(EN_SLUG_SUFFIX);
      const path = isEn
        ? `/en/blog/${slug.slice(0, -EN_SLUG_SUFFIX.length)}`
        : `/blog/${slug}`;
      return {
        url: `${site}${path}`,
        lastModified: new Date(updated_at ?? published_at ?? Date.now()),
        changeFrequency: "monthly" as const,
        priority: isEn ? 0.5 : 0.6,
      };
    });
  } catch {
    // A Ghost outage should still yield a valid sitemap for the static routes.
  }

  return [...staticRoutes, ...posts];
}
