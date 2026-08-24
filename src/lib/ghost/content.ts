import type {
  GhostBrowseResponse,
  GhostErrorBody,
  GhostPagination,
  GhostPost,
  GhostTag,
} from "./types";

/**
 * Ghost Content API client (read-only).
 *
 * Verified contract notes:
 *  - The key travels as a `?key=` query param and is safe to expose publicly.
 *  - `limit` is capped at 100 since Ghost 6.0; `limit=all` was removed and now
 *    silently truncates, so anything unbounded must paginate.
 *  - `include=tags,authors` is required or those keys are absent entirely.
 *  - `formats` REPLACES the default, so ask for `html` explicitly when adding
 *    `plaintext`.
 *  - Read-by-slug returns a single-element array, not a bare object.
 *  - A missing key returns 403; only a present-but-wrong key returns 401.
 */

export const POSTS_PER_PAGE = 12;
const MAX_LIMIT = 100;

/** Cache tag used by the Ghost webhook to flush blog data on publish. */
export const GHOST_CACHE_TAG = "ghost-content";

function ghostUrl(): string {
  const url = process.env.GHOST_CONTENT_API_URL || process.env.GHOST_URL;
  if (!url) throw new Error("GHOST_URL is not configured");
  return url.replace(/\/$/, "");
}

function contentKey(): string {
  const key = process.env.GHOST_CONTENT_API_KEY;
  if (!key) throw new Error("GHOST_CONTENT_API_KEY is not configured");
  return key;
}

function describeError(status: number, body: GhostErrorBody | null): string {
  const first = body?.errors?.[0];
  // Live Ghost sends `type`; the docs claim `errorType`. Accept both.
  const kind = first?.type ?? first?.errorType ?? "UnknownError";
  const message = first?.message ?? "no message";
  return `${status} ${kind}: ${message}`;
}

type RequestOptions = {
  /** ISR window in seconds. */
  revalidate?: number;
};

async function request<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  { revalidate = 300 }: RequestOptions = {}
): Promise<T> {
  const url = new URL(`${ghostUrl()}/ghost/api/content${path}`);
  url.searchParams.set("key", contentKey());
  for (const [name, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(name, String(value));
  }

  const response = await fetch(url.toString(), {
    headers: { "Accept-Version": "v5.0" },
    // Tagged so a Ghost webhook can flush every blog fetch at once.
    next: { revalidate, tags: [GHOST_CACHE_TAG] },
  });

  if (!response.ok) {
    let body: GhostErrorBody | null = null;
    try {
      body = (await response.json()) as GhostErrorBody;
    } catch {
      // Non-JSON error body — fall through with what we have.
    }
    throw new GhostRequestError(describeError(response.status, body), response.status);
  }

  return (await response.json()) as T;
}

export class GhostRequestError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(`[Ghost Content API] ${message}`);
    this.name = "GhostRequestError";
  }
}

export type PostsPage = {
  posts: GhostPost[];
  pagination: GhostPagination | null;
};

/** Newest first unless asked otherwise. */
export type PostOrder = "newest" | "oldest";

/** One page of published posts. */
export async function getPosts({
  page = 1,
  limit = POSTS_PER_PAGE,
  tag,
  order = "newest",
}: {
  page?: number;
  limit?: number;
  tag?: string;
  order?: PostOrder;
} = {}): Promise<PostsPage> {
  const data = await request<GhostBrowseResponse<"posts", GhostPost>>("/posts/", {
    limit: Math.min(limit, MAX_LIMIT),
    page,
    include: "tags,authors",
    // No `fields` here: combining it with `excerpt` suppresses Ghost's
    // auto-generated excerpt for posts without a custom one.
    filter: tag ? `tag:${tag}` : undefined,
    order: order === "oldest" ? "published_at asc" : "published_at desc",
  });

  return { posts: data.posts ?? [], pagination: data.meta?.pagination ?? null };
}

/** A single post by slug, or null when it does not exist. */
export async function getPostBySlug(slug: string): Promise<GhostPost | null> {
  try {
    const data = await request<GhostBrowseResponse<"posts", GhostPost>>(
      `/posts/slug/${encodeURIComponent(slug)}/`,
      { include: "tags,authors" }
    );
    // Read-by-slug still wraps the post in an array.
    return data.posts?.[0] ?? null;
  } catch (error) {
    if (error instanceof GhostRequestError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Every published slug, paginated.
 *
 * Ghost 6 caps `limit` at 100 and silently truncates `limit=all`, so this walks
 * `meta.pagination.next` instead. Used by generateStaticParams and the sitemap.
 */
export async function getAllPostSlugs(): Promise<
  Array<{ slug: string; updated_at: string | null; published_at: string | null }>
> {
  const slugs: Array<{ slug: string; updated_at: string | null; published_at: string | null }> = [];
  let page: number | null = 1;

  while (page !== null) {
    const data: GhostBrowseResponse<"posts", GhostPost> = await request<
      GhostBrowseResponse<"posts", GhostPost>
    >("/posts/", { limit: MAX_LIMIT, page, fields: "slug,updated_at,published_at" });

    for (const post of data.posts ?? []) {
      slugs.push({
        slug: post.slug,
        updated_at: post.updated_at,
        published_at: post.published_at,
      });
    }
    page = data.meta?.pagination.next ?? null;
  }

  return slugs;
}

/**
 * Public tags that actually carry a post, for the blog index filter row.
 *
 * `count.posts` is what makes the filter honest: the allow-list in the
 * generator holds twenty tags, so without this the row would advertise
 * verticals that lead to an empty page.
 */
export async function getTags(): Promise<GhostTag[]> {
  const data = await request<GhostBrowseResponse<"tags", GhostTag>>("/tags/", {
    limit: MAX_LIMIT,
    filter: "visibility:public",
    include: "count.posts",
  });

  return (data.tags ?? [])
    .filter((tag) => (tag.count?.posts ?? 0) > 0)
    .sort((a, b) => (b.count?.posts ?? 0) - (a.count?.posts ?? 0));
}
