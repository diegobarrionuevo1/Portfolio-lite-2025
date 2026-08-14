/**
 * Feed ingestion: fetch every source concurrently, parse it, and return a flat,
 * recency-filtered list of items.
 *
 * Hard rule: one dead feed must never kill the run. Every fetch has its own
 * timeout and its own try/catch, and failures are collected as diagnostics
 * instead of thrown.
 */

import Parser from 'rss-parser';

import { SOURCES, type Source, type SourceCategory, type SourceLang } from './sources';

export interface FeedItem {
  title: string;
  link: string;
  /** ISO-8601 publication timestamp. Items without a usable date are dropped. */
  isoDate: string;
  contentSnippet: string;
  content: string;
  /** Source display name, e.g. "Vercel News". */
  source: string;
  lang: SourceLang;
  // Extra context the selector needs; harmless for consumers that ignore it.
  category: SourceCategory;
  fullContent: boolean;
}

export interface FeedError {
  source: string;
  url: string;
  message: string;
}

export interface IngestResult {
  items: FeedItem[];
  errors: FeedError[];
  /** Feeds that answered with at least one item. */
  okCount: number;
}

export interface IngestOptions {
  /** Per-feed timeout in ms. */
  timeoutMs?: number;
  /** Only keep items published within this many days. */
  windowDays?: number;
  sources?: readonly Source[];
}

const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_WINDOW_DAYS = 3;
const USER_AGENT =
  'diegobarrionuevo.dev daily-post bot (+https://github.com/diegobarrionuevo1)';

/** rss-parser exposes content:encoded under its raw namespaced key. */
interface RawItem {
  'content:encoded'?: string;
  'content:encodedSnippet'?: string;
  published?: string;
  updated?: string;
  [key: string]: unknown;
}

const parser: Parser<Record<string, unknown>, RawItem> = new Parser<
  Record<string, unknown>,
  RawItem
>({
  // content:encoded is already a default field, but Atom feeds that use a
  // <summary> element need it mapped explicitly.
  customFields: {
    item: [['content:encoded', 'content:encoded', { keepArray: false }], 'summary'],
  },
});

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

function toIsoDate(raw: unknown): string | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) return null;
  return new Date(ms).toISOString();
}

/** Fetch a single feed with a hard timeout. Never throws for HTTP-level issues. */
async function fetchFeedText(url: string, timeoutMs: number): Promise<string> {
  const response = await fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(timeoutMs),
    headers: {
      'user-agent': USER_AGENT,
      accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}`);
  }
  return await response.text();
}

async function ingestSource(
  source: Source,
  timeoutMs: number,
): Promise<{ items: FeedItem[]; error: FeedError | null }> {
  try {
    const xml = await fetchFeedText(source.url, timeoutMs);
    const parsed = await parser.parseString(xml);

    const seen = new Set<string>();
    const items: FeedItem[] = [];

    for (const raw of parsed.items ?? []) {
      const link = typeof raw.link === 'string' ? raw.link.trim() : '';
      const title = typeof raw.title === 'string' ? raw.title.trim() : '';
      if (link === '' || title === '') continue;
      if (seen.has(link)) continue;
      seen.add(link);

      const isoDate =
        toIsoDate(raw.isoDate) ??
        toIsoDate(raw.pubDate) ??
        toIsoDate(raw.published) ??
        toIsoDate(raw.updated);
      if (isoDate === null) continue;

      // content:encoded (RSS full text) beats the plain description/Atom content.
      const encoded = raw['content:encoded'];
      const body =
        typeof encoded === 'string' && encoded.trim() !== ''
          ? encoded
          : typeof raw.content === 'string'
            ? raw.content
            : '';

      const snippetSource =
        (typeof raw.contentSnippet === 'string' && raw.contentSnippet.trim() !== ''
          ? raw.contentSnippet
          : undefined) ??
        (typeof raw['content:encodedSnippet'] === 'string'
          ? raw['content:encodedSnippet']
          : undefined) ??
        stripHtml(body);

      items.push({
        title,
        link,
        isoDate,
        contentSnippet: truncate(snippetSource.replace(/\s+/g, ' ').trim(), 600),
        content: body,
        source: source.name,
        lang: source.lang,
        category: source.category,
        fullContent: source.fullContent,
      });
    }

    return { items, error: null };
  } catch (error) {
    return {
      items: [],
      error: {
        source: source.name,
        url: source.url,
        message: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

/**
 * Fetch every source concurrently and return items published within the window.
 * Feed-level failures are reported, never thrown.
 */
export async function ingestFeeds(options: IngestOptions = {}): Promise<IngestResult> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const windowDays = options.windowDays ?? DEFAULT_WINDOW_DAYS;
  const sources = options.sources ?? SOURCES;

  const settled = await Promise.allSettled(
    sources.map((source) => ingestSource(source, timeoutMs)),
  );

  const cutoff = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const items: FeedItem[] = [];
  const errors: FeedError[] = [];
  let okCount = 0;

  settled.forEach((outcome, index) => {
    const source = sources[index]!;
    if (outcome.status === 'rejected') {
      // ingestSource swallows its own errors, so this only fires on a bug.
      errors.push({
        source: source.name,
        url: source.url,
        message:
          outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason),
      });
      return;
    }

    const { items: sourceItems, error } = outcome.value;
    if (error !== null) {
      errors.push(error);
      return;
    }

    const fresh = sourceItems.filter((item) => Date.parse(item.isoDate) >= cutoff);
    if (fresh.length > 0) okCount += 1;
    items.push(...fresh);
  });

  items.sort((a, b) => Date.parse(b.isoDate) - Date.parse(a.isoDate));
  return { items, errors, okCount };
}
