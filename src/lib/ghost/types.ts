/**
 * Ghost Content API types.
 *
 * Field availability is not uniform — it depends on the request:
 *   - `tags` / `primary_tag`   require `include=tags`
 *   - `authors` / `primary_author` require `include=authors`
 *   - `plaintext`              requires `formats=html,plaintext`
 * Without those params the keys are absent entirely (not null), which is why
 * they are optional here.
 */

export type GhostTag = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  feature_image: string | null;
  visibility: "public" | "internal";
  url: string;
};

export type GhostAuthor = {
  id: string;
  name: string;
  slug: string;
  profile_image: string | null;
  bio: string | null;
  website: string | null;
  twitter: string | null;
  url: string;
};

export type GhostPost = {
  id: string;
  uuid: string;
  title: string;
  slug: string;
  html: string | null;
  plaintext?: string | null;
  comment_id: string;
  feature_image: string | null;
  feature_image_alt: string | null;
  feature_image_caption: string | null;
  featured: boolean;
  visibility: string;
  created_at: string;
  updated_at: string | null;
  published_at: string | null;
  custom_excerpt: string | null;
  excerpt: string | null;
  reading_time: number;
  url: string;
  canonical_url: string | null;

  // SEO fields — returned by default, no `fields` param needed.
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;

  codeinjection_head: string | null;
  codeinjection_foot: string | null;

  tags?: GhostTag[];
  primary_tag?: GhostTag | null;
  authors?: GhostAuthor[];
  primary_author?: GhostAuthor | null;
};

export type GhostPagination = {
  page: number;
  limit: number;
  pages: number;
  total: number;
  next: number | null;
  prev: number | null;
};

export type GhostBrowseResponse<K extends string, T> = {
  [key in K]: T[];
} & {
  meta?: { pagination: GhostPagination };
};

/**
 * Ghost error payload. NOTE: the published docs show `errorType`, but live
 * Ghost 5.x/6.x actually returns `type`. Both are declared so callers can key
 * on whichever the server sends.
 */
export type GhostErrorBody = {
  errors?: Array<{
    message: string;
    type?: string;
    errorType?: string;
    context?: string | null;
  }>;
};
