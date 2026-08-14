/**
 * Topic selection.
 *
 * Ranking philosophy: a story that shows up in several independent feeds on the
 * same day is genuinely notable, whereas a single-feed item is usually just that
 * outlet's own announcement. So cross-source signal dominates the score, then
 * full-content availability (the model needs real material to react to), then
 * recency.
 */

import type { FeedItem } from './feed';
import { canonicalizeUrl } from './state';

export interface Selection {
  chosen: FeedItem;
  /** Up to 3 supporting items: same story from other feeds first, then adjacent stories. */
  related: FeedItem[];
  /**
   * The chosen story only — every item in its cluster except `chosen`. This, plus
   * `chosen`, is what may be marked as covered. `related` must NOT be: it can
   * contain merely adjacent stories from other clusters, and burning those would
   * silently stop the pipeline from ever writing about them.
   */
  sameStory: FeedItem[];
  /** Distinct feeds that carried the chosen story. */
  crossSourceCount: number;
  score: number;
  reason: string;
  candidatesConsidered: number;
  clustersConsidered: number;
}

interface Cluster {
  items: FeedItem[];
  tokens: Set<string>;
}

const MAX_RELATED = 3;

/** Spanish + English stopwords, plus filler that shows up in every headline. */
const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'into', 'your', 'you', 'are', 'was',
  'has', 'have', 'will', 'new', 'now', 'how', 'why', 'what', 'when', 'its', 'their', 'they',
  'can', 'not', 'but', 'all', 'out', 'get', 'more', 'been', 'about', 'over', 'just', 'than',
  'los', 'las', 'una', 'uno', 'del', 'con', 'por', 'para', 'que', 'como', 'mas', 'sus', 'sobre',
  'este', 'esta', 'esto', 'ser', 'son', 'entre', 'desde', 'hasta', 'nuevo', 'nueva', 'ya',
  'anuncia', 'lanza', 'announces', 'launches', 'introducing', 'presenta',
]);

export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function significantTokens(title: string): Set<string> {
  const tokens = normalizeText(title)
    .replace(/[^a-z0-9+.# ]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^[.#+]+|[.#+]+$/g, ''))
    .filter((token) => token.length >= 3 && !STOPWORDS.has(token));
  return new Set(tokens);
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of Array.from(a)) {
    if (b.has(token)) shared += 1;
  }
  const union = a.size + b.size - shared;
  return union === 0 ? 0 : shared / union;
}

function sharedCount(a: Set<string>, b: Set<string>): number {
  let shared = 0;
  for (const token of Array.from(a)) {
    if (b.has(token)) shared += 1;
  }
  return shared;
}

/** Same canonical URL, or near-identical headline, means same story. */
function isSameStory(cluster: Cluster, item: FeedItem, itemTokens: Set<string>): boolean {
  const itemUrl = canonicalizeUrl(item.link);
  if (cluster.items.some((existing) => canonicalizeUrl(existing.link) === itemUrl)) {
    return true;
  }
  const overlap = jaccard(cluster.tokens, itemTokens);
  return overlap >= 0.45 && sharedCount(cluster.tokens, itemTokens) >= 2;
}

function clusterItems(items: readonly FeedItem[]): Cluster[] {
  const clusters: Cluster[] = [];

  for (const item of items) {
    const tokens = significantTokens(item.title);
    const match = clusters.find((cluster) => isSameStory(cluster, item, tokens));
    if (match === undefined) {
      clusters.push({ items: [item], tokens: new Set(tokens) });
      continue;
    }
    match.items.push(item);
    for (const token of Array.from(tokens)) match.tokens.add(token);
  }

  return clusters;
}

function distinctSources(items: readonly FeedItem[]): number {
  return new Set(items.map((item) => item.source)).size;
}

/** Newest first, full-content feeds ahead of summary-only ones at equal recency. */
function preferForBody(a: FeedItem, b: FeedItem): number {
  if (a.fullContent !== b.fullContent) return a.fullContent ? -1 : 1;
  const bodyDelta = b.content.length - a.content.length;
  if (bodyDelta !== 0) return bodyDelta;
  return Date.parse(b.isoDate) - Date.parse(a.isoDate);
}

function recencyScore(item: FeedItem, now: number): number {
  const hoursOld = Math.max(0, (now - Date.parse(item.isoDate)) / 3_600_000);
  // 30 points at publication, decaying to 0 across the 72h ingest window.
  return Math.max(0, 30 - (hoursOld / 72) * 30);
}

function scoreCluster(cluster: Cluster, now: number): number {
  const sources = distinctSources(cluster.items);
  const newest = cluster.items.reduce((best, item) =>
    Date.parse(item.isoDate) > Date.parse(best.isoDate) ? item : best,
  );
  const crossSource = (sources - 1) * 100;
  const fullContentBonus = cluster.items.some((item) => item.fullContent) ? 25 : 0;
  // Aggregators corroborate a story but are weak as the primary source.
  const aggregatorOnly = cluster.items.every((item) => item.category === 'aggregator');
  return crossSource + fullContentBonus + recencyScore(newest, now) - (aggregatorOnly ? 40 : 0);
}

/**
 * Pick today's topic. Returns null when nothing is left after dedup — the
 * caller treats that as a no-op success, not an error.
 */
export function selectTopic(
  items: readonly FeedItem[],
  covered: ReadonlySet<string>,
  now: number = Date.now(),
): Selection | null {
  const fresh = items.filter((item) => !covered.has(canonicalizeUrl(item.link)));
  if (fresh.length === 0) return null;

  const clusters = clusterItems(fresh);
  const ranked = clusters
    .map((cluster) => ({ cluster, score: scoreCluster(cluster, now) }))
    .sort((a, b) => b.score - a.score);

  const top = ranked[0];
  if (top === undefined) return null;

  const ordered = [...top.cluster.items].sort(preferForBody);
  const chosen = ordered[0]!;

  // Supporting context: first the same story as told by other feeds, then the
  // most topically adjacent items from other clusters.
  const related: FeedItem[] = [];
  const sameStory: FeedItem[] = [];
  const usedLinks = new Set<string>([canonicalizeUrl(chosen.link)]);

  for (const item of ordered.slice(1)) {
    const key = canonicalizeUrl(item.link);
    if (usedLinks.has(key)) continue;
    usedLinks.add(key);
    // Same cluster = same story, so it is safe to mark covered even if we do not
    // have room for it in the prompt context.
    sameStory.push(item);
    if (related.length < MAX_RELATED) related.push(item);
  }

  if (related.length < MAX_RELATED) {
    const chosenTokens = significantTokens(chosen.title);
    const adjacents = ranked
      .slice(1)
      .map((entry) => {
        const representative = [...entry.cluster.items].sort(preferForBody)[0]!;
        return {
          item: representative,
          overlap: sharedCount(chosenTokens, significantTokens(representative.title)),
          score: entry.score,
        };
      })
      .filter((entry) => entry.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap || b.score - a.score);

    for (const adjacent of adjacents) {
      if (related.length >= MAX_RELATED) break;
      const key = canonicalizeUrl(adjacent.item.link);
      if (usedLinks.has(key)) continue;
      usedLinks.add(key);
      related.push(adjacent.item);
    }
  }

  const crossSourceCount = distinctSources(top.cluster.items);
  const reasonParts = [
    crossSourceCount > 1
      ? `cubierta por ${crossSourceCount} feeds distintos`
      : 'única fuente disponible con señal',
    chosen.fullContent ? 'feed con contenido completo' : 'feed con resumen',
    `publicada ${new Date(chosen.isoDate).toISOString()}`,
  ];

  return {
    chosen,
    related,
    sameStory,
    crossSourceCount,
    score: Math.round(top.score * 100) / 100,
    reason: reasonParts.join('; '),
    candidatesConsidered: fresh.length,
    clustersConsidered: clusters.length,
  };
}
