import { revalidatePath, revalidateTag } from "next/cache";
import { GHOST_CACHE_TAG } from "@/lib/ghost/content";

/**
 * Cache-flush webhook.
 *
 * Ghost calls this on publish/update so a new post appears immediately instead
 * of waiting out the ISR window. Point a Ghost webhook (Settings → Integrations
 * → your integration → Add webhook, event "Post published") at
 *   POST https://<site>/api/revalidate
 * and send the shared secret in the `x-revalidate-secret` header.
 *
 * The daily pipeline calls it too, right after it writes a post.
 */
export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;

  // Fail closed: with no secret configured the endpoint is disabled outright,
  // otherwise anyone could force cache churn.
  if (!expected) {
    return Response.json({ revalidated: false, reason: "not_configured" }, { status: 503 });
  }

  const provided =
    request.headers.get("x-revalidate-secret") ??
    new URL(request.url).searchParams.get("secret");

  if (provided !== expected) {
    return Response.json({ revalidated: false, reason: "unauthorized" }, { status: 401 });
  }

  // One tag covers every Ghost fetch; the paths cover the statically rendered
  // shells that do not go through that fetch cache.
  revalidateTag(GHOST_CACHE_TAG);
  revalidatePath("/blog");
  revalidatePath("/blog/[slug]", "page");
  revalidatePath("/sitemap.xml");
  revalidatePath("/rss.xml");

  return Response.json({ revalidated: true, at: new Date().toISOString() });
}
