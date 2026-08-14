import type { MetadataRoute } from "next";
import { siteUrl } from "@/components/blog/shared";

export default function robots(): MetadataRoute.Robots {
  const site = siteUrl();
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${site}/sitemap.xml`,
    host: site,
  };
}
