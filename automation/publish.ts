/**
 * Ghost Admin API client.
 *
 * Empirically verified contract (do not "simplify" any of this):
 *  - POST /ghost/api/admin/posts/?source=html returns 201, not 200.
 *  - ?source=html is MANDATORY. Without it Ghost stores an EMPTY body and
 *    reports success.
 *  - The JWT secret must be decoded from hex; passing the raw string 401s.
 *  - Duplicate slugs NEVER error — Ghost silently appends -2, -3, … so a retried
 *    or double-fired cron would quietly publish N near-identical posts.
 *  - ?newsletter=<slug> triggers an email blast to every member. Never send it.
 *
 * Idempotency has TWO layers, because the slug alone is not an idempotency key:
 * it is derived from model output, so the same story re-run produces a different
 * slug and slips past a slug-only check.
 *
 *  1. findPostBySourceKey(): a `#src-<hash>` INTERNAL tag derived from the source
 *     article URL. Deterministic, model-independent, and hidden from readers.
 *     This is what protects a re-run / queued double-fire.
 *  2. findPostBySlug(): still checked, and re-checked between create attempts,
 *     because POST /posts/ is NOT idempotent — a blind retry after a timeout
 *     duplicates a post Ghost had already committed.
 */

import { createHash, createHmac } from 'node:crypto';

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_ATTEMPTS = 4;
const BASE_BACKOFF_MS = 1_000;

export type PostStatus = 'draft' | 'published' | 'scheduled';

export interface GhostConfig {
  adminUrl: string;
  adminApiKey: string;
  timeoutMs?: number;
  maxAttempts?: number;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  html: string;
  tags?: readonly string[];
  customExcerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  featureImage?: string;
  canonicalUrl?: string;
  publishedAt?: string;
}

export interface GhostPost {
  id: string;
  uuid?: string;
  title?: string;
  slug: string;
  status?: string;
  url?: string;
  created_at?: string;
  published_at?: string | null;
}

export class GhostError extends Error {
  readonly status?: number;
  readonly body?: string;
  constructor(message: string, status?: number, body?: string) {
    super(message);
    this.name = 'GhostError';
    this.status = status;
    this.body = body;
  }
}

function base64url(input: Buffer): string {
  return input.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * Build a Ghost Admin JWT with node:crypto only (no jsonwebtoken dependency).
 * Tokens are capped at 5 minutes and treated as single-use: mint a fresh one
 * per HTTP attempt.
 */
export function mintToken(adminApiKey: string, now: number = Date.now()): string {
  const separator = adminApiKey.indexOf(':');
  if (separator <= 0 || separator === adminApiKey.length - 1) {
    throw new GhostError('GHOST_ADMIN_API_KEY debe tener el formato "id:secret".');
  }

  const id = adminApiKey.slice(0, separator);
  const secret = adminApiKey.slice(separator + 1);
  if (!/^[0-9a-fA-F]+$/.test(secret) || secret.length % 2 !== 0) {
    throw new GhostError('El secret de GHOST_ADMIN_API_KEY debe ser hexadecimal.');
  }

  const issuedAt = Math.floor(now / 1000);
  const header = { alg: 'HS256', typ: 'JWT', kid: id };
  const payload = { iat: issuedAt, exp: issuedAt + 5 * 60, aud: '/admin/' };

  const encodedHeader = base64url(Buffer.from(JSON.stringify(header), 'utf8'));
  const encodedPayload = base64url(Buffer.from(JSON.stringify(payload), 'utf8'));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  // The secret is hex-encoded; signing the ASCII string 401s on every request.
  const signature = createHmac('sha256', Buffer.from(secret, 'hex')).update(signingInput).digest();

  return `${signingInput}.${base64url(signature)}`;
}

export function resolveConfig(env: NodeJS.ProcessEnv = process.env): GhostConfig {
  const adminUrl = (env.GHOST_ADMIN_API_URL ?? env.GHOST_URL ?? '').trim().replace(/\/+$/, '');
  const adminApiKey = (env.GHOST_ADMIN_API_KEY ?? '').trim();

  if (adminUrl === '') {
    throw new GhostError('Falta GHOST_ADMIN_API_URL (o GHOST_URL).');
  }
  if (adminApiKey === '') {
    throw new GhostError('Falta GHOST_ADMIN_API_KEY.');
  }
  return { adminUrl, adminApiKey };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 408 || status >= 500;
}

function retryDelayMs(attempt: number, retryAfterHeader: string | null): number {
  if (retryAfterHeader !== null) {
    const seconds = Number.parseInt(retryAfterHeader, 10);
    if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, 60_000);
  }
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(BASE_BACKOFF_MS * 2 ** (attempt - 1), 30_000) + jitter;
}

interface GhostRequest {
  path: string;
  method: 'GET' | 'POST' | 'PUT';
  body?: unknown;
  expectStatus: number;
  /**
   * Overrides the client-level attempt budget. Non-idempotent writes pass 1:
   * retrying a POST that Ghost already committed creates a duplicate post.
   */
  maxAttempts?: number;
}

async function ghostFetch<T>(config: GhostConfig, request: GhostRequest): Promise<T> {
  const timeoutMs = config.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxAttempts = request.maxAttempts ?? config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const url = `${config.adminUrl}${request.path}`;

  let lastError: GhostError = new GhostError('La petición a Ghost no se llegó a ejecutar.');

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(url, {
        method: request.method,
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          // Fresh token per attempt: they expire in 5 minutes and Ghost treats
          // them as single-use.
          authorization: `Ghost ${mintToken(config.adminApiKey)}`,
          'content-type': 'application/json',
          accept: 'application/json',
          'accept-version': 'v5.0',
        },
        body: request.body === undefined ? undefined : JSON.stringify(request.body),
      });
    } catch (error) {
      lastError = new GhostError(
        `Fallo de red hablando con Ghost: ${error instanceof Error ? error.message : String(error)}`,
      );
      if (attempt < maxAttempts) {
        await sleep(retryDelayMs(attempt, null));
        continue;
      }
      throw lastError;
    }

    const text = await response.text();

    if (response.status === request.expectStatus) {
      if (text.trim() === '') return {} as T;
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new GhostError('Ghost devolvió una respuesta que no es JSON.', response.status, text);
      }
    }

    lastError = new GhostError(
      `Ghost devolvió ${response.status} (se esperaba ${request.expectStatus}) en ${request.method} ${request.path}`,
      response.status,
      text.slice(0, 800),
    );

    if (isRetryableStatus(response.status) && attempt < maxAttempts) {
      await sleep(retryDelayMs(attempt, response.headers.get('retry-after')));
      continue;
    }
    throw lastError;
  }

  throw lastError;
}

const POST_FIELDS = 'id,slug,status,url,published_at,title';

/**
 * Slug-level idempotency check.
 *
 * Ghost never rejects a duplicate slug — it appends -2, -3, … Slugs are globally
 * unique across draft/published/scheduled, so one query covers every case.
 *
 * NOTE: this only catches a byte-identical slug. The slug comes from model
 * output, so it is NOT stable across runs of the same story — use
 * findPostBySourceKey() for that.
 */
export async function findPostBySlug(
  slug: string,
  config: GhostConfig = resolveConfig(),
): Promise<GhostPost | null> {
  const filter = encodeURIComponent(`slug:'${slug}'`);
  const path = `/ghost/api/admin/posts/?filter=${filter}&limit=1&fields=${POST_FIELDS}`;
  const data = await ghostFetch<{ posts?: GhostPost[] }>(config, {
    path,
    method: 'GET',
    expectStatus: 200,
  });
  return data.posts?.[0] ?? null;
}

/**
 * Stable, model-independent identity for a source story: a short hash of its
 * canonical URL. Two runs over the same story always produce the same key, which
 * a slug never does.
 */
export function sourceKey(canonicalSourceUrl: string): string {
  return createHash('sha256').update(canonicalSourceUrl).digest('hex').slice(0, 12);
}

/**
 * Ghost internal tag carrying the source key. The leading '#' makes it internal:
 * Ghost records it on the post but never renders it on the front-end.
 */
export function sourceTagName(key: string): string {
  return `#src-${key}`;
}

/**
 * Has this story already been published? This is the check that survives a
 * GitHub "re-run failed jobs" or a queued double-fire, where the repo-side
 * covered.json is checked out at the pre-run commit and is therefore empty.
 *
 * Ghost slugifies '#src-x' to 'hash-src-x'; the in-list also accepts the bare
 * form so a change in that convention degrades to "not found" (i.e. today's
 * behaviour) instead of a wrong answer.
 */
export async function findPostBySourceKey(
  key: string,
  config: GhostConfig = resolveConfig(),
): Promise<GhostPost | null> {
  const filter = encodeURIComponent(`tag:[hash-src-${key},src-${key}]`);
  const path = `/ghost/api/admin/posts/?filter=${filter}&limit=1&fields=${POST_FIELDS}`;
  const data = await ghostFetch<{ posts?: GhostPost[] }>(config, {
    path,
    method: 'GET',
    expectStatus: 200,
  });
  return data.posts?.[0] ?? null;
}

/**
 * Create a post. Never retried blindly.
 *
 * POST /posts/ is not idempotent, and a 20s client timeout or a 502 from a proxy
 * says nothing about whether Ghost committed the row. So between attempts we
 * look the slug up: if the previous attempt landed, we return that post instead
 * of creating a second one.
 */
export async function createPost(
  input: CreatePostInput,
  options: { status: PostStatus; config?: GhostConfig },
): Promise<GhostPost> {
  const config = options.config ?? resolveConfig();
  const maxAttempts = config.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;

  const post: Record<string, unknown> = {
    title: input.title,
    slug: input.slug,
    html: input.html,
    status: options.status,
  };

  if (input.tags !== undefined && input.tags.length > 0) post.tags = [...input.tags];
  if (input.customExcerpt !== undefined && input.customExcerpt !== '') {
    post.custom_excerpt = input.customExcerpt;
  }
  if (input.metaTitle !== undefined) post.meta_title = input.metaTitle;
  if (input.metaDescription !== undefined) post.meta_description = input.metaDescription;
  if (input.featureImage !== undefined) post.feature_image = input.featureImage;
  if (input.canonicalUrl !== undefined) post.canonical_url = input.canonicalUrl;
  if (input.publishedAt !== undefined) post.published_at = input.publishedAt;

  let lastError: unknown = new GhostError('La creación en Ghost no se llegó a ejecutar.');

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (attempt > 1) {
      // The previous attempt may have committed the post before the connection
      // dropped. Ghost would happily create a second one under slug-2.
      const landed = await findPostBySlug(input.slug, config).catch(() => null);
      if (landed !== null) return landed;
      await sleep(retryDelayMs(attempt - 1, null));
    }

    try {
      // ?source=html is mandatory. Drop it and Ghost stores an empty body silently.
      // No ?newsletter param — that would email the whole member list.
      const data = await ghostFetch<{ posts?: GhostPost[] }>(config, {
        path: '/ghost/api/admin/posts/?source=html',
        method: 'POST',
        body: { posts: [post] },
        expectStatus: 201,
        maxAttempts: 1,
      });

      const created = data.posts?.[0];
      if (created === undefined) {
        throw new GhostError('Ghost devolvió 201 pero sin post en la respuesta.');
      }
      return created;
    } catch (error) {
      lastError = error;
      // A 4xx (validation, auth) will never succeed on a retry; a 5xx, a 429 or a
      // transport failure might, but only after the slug re-check above.
      const worthRetrying =
        error instanceof GhostError && (error.status === undefined || isRetryableStatus(error.status));
      if (!worthRetrying || attempt === maxAttempts) throw error;
    }
  }

  throw lastError;
}
