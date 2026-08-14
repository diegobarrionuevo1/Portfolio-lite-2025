import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/ghost/content";
import { siteUrl } from "@/components/blog/shared";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = siteUrl();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: site, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${site}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  let posts: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllPostSlugs();
    posts = slugs.map(({ slug, updated_at, published_at }) => ({
      url: `${site}/blog/${slug}`,
      lastModified: new Date(updated_at ?? published_at ?? Date.now()),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // A Ghost outage should still yield a valid sitemap for the static routes.
  }

  return [...staticRoutes, ...posts];
}
