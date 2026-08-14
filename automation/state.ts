/**
 * Dedup memory.
 *
 * We persist the canonical URLs of every source article we have already written
 * about, so the pipeline never covers the same story twice. The file is committed
 * back to the repo by the GitHub Action, which is why it must stay small and
 * self-healing: entries older than 90 days are pruned on every write, and a
 * missing or corrupt file degrades to "nothing covered yet" instead of crashing
 * the run.
 */

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const STATE_DIR = path.join(__dirname, 'state');
export const COVERED_PATH = path.join(STATE_DIR, 'covered.json');

const RETENTION_DAYS = 90;
const STATE_VERSION = 1;

export interface CoveredEntry {
  url: string;
  coveredAt: string;
}

interface CoveredFile {
  version: number;
  entries: CoveredEntry[];
}

/** Tracking params that change per-referrer but not per-article. */
const TRACKING_PARAM_PREFIXES = ['utm_', 'mc_', 'ref_'];
const TRACKING_PARAMS = new Set([
  'ref',
  'source',
  'fbclid',
  'gclid',
  'igshid',
  'mkt_tok',
  'cmpid',
  'sh',
  '_hsenc',
  '_hsmi',
]);

/**
 * Reduce a link to a stable identity so the same article arriving from two
 * feeds (or with different tracking params) collapses to one key.
 */
export function canonicalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return trimmed.toLowerCase();
  }

  url.hash = '';
  url.protocol = 'https:';
  url.hostname = url.hostname.toLowerCase().replace(/^www\./, '');
  url.port = '';

  for (const key of Array.from(url.searchParams.keys())) {
    const lower = key.toLowerCase();
    if (TRACKING_PARAMS.has(lower) || TRACKING_PARAM_PREFIXES.some((p) => lower.startsWith(p))) {
      url.searchParams.delete(key);
    }
  }
  url.searchParams.sort();

  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.replace(/\/+$/, '');
  }

  const query = url.searchParams.toString();
  return `${url.hostname}${url.pathname}${query === '' ? '' : `?${query}`}`;
}

function isEntry(value: unknown): value is CoveredEntry {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.url === 'string' &&
    candidate.url !== '' &&
    typeof candidate.coveredAt === 'string' &&
    !Number.isNaN(Date.parse(candidate.coveredAt))
  );
}

function prune(entries: CoveredEntry[], now: number): CoveredEntry[] {
  const cutoff = now - RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const byUrl = new Map<string, CoveredEntry>();

  for (const entry of entries) {
    if (Date.parse(entry.coveredAt) < cutoff) continue;
    const existing = byUrl.get(entry.url);
    if (existing === undefined || Date.parse(entry.coveredAt) > Date.parse(existing.coveredAt)) {
      byUrl.set(entry.url, entry);
    }
  }

  return Array.from(byUrl.values()).sort(
    (a, b) => Date.parse(a.coveredAt) - Date.parse(b.coveredAt),
  );
}

/**
 * Read the state file. A missing, unreadable, or malformed file is treated as
 * an empty history — losing dedup memory is recoverable, crashing the cron is not.
 */
export async function readCoveredFile(): Promise<CoveredEntry[]> {
  let text: string;
  try {
    text = await readFile(COVERED_PATH, 'utf8');
  } catch {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(text);
    if (Array.isArray(parsed)) {
      // Tolerate an older bare-array format.
      return parsed.filter(isEntry);
    }
    if (typeof parsed === 'object' && parsed !== null) {
      const entries = (parsed as Partial<CoveredFile>).entries;
      if (Array.isArray(entries)) return entries.filter(isEntry);
    }
    return [];
  } catch {
    return [];
  }
}

/** Canonical URLs already covered, pruned to the retention window. */
export async function loadCovered(): Promise<Set<string>> {
  const entries = prune(await readCoveredFile(), Date.now());
  return new Set(entries.map((entry) => entry.url));
}

async function writeCoveredFile(entries: CoveredEntry[]): Promise<void> {
  await mkdir(STATE_DIR, { recursive: true });
  const payload: CoveredFile = { version: STATE_VERSION, entries };
  const tmp = `${COVERED_PATH}.tmp`;
  // Write-then-rename so an interrupted run cannot leave a half-written file
  // that the next run would have to discard.
  await writeFile(tmp, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  await rename(tmp, COVERED_PATH);
}

/** Record URLs as covered and prune anything past the retention window. */
export async function markCovered(urls: readonly string[]): Promise<CoveredEntry[]> {
  const now = Date.now();
  const nowIso = new Date(now).toISOString();
  const existing = await readCoveredFile();

  const additions: CoveredEntry[] = urls
    .map((url) => canonicalizeUrl(url))
    .filter((url) => url !== '')
    .map((url) => ({ url, coveredAt: nowIso }));

  const merged = prune([...existing, ...additions], now);
  await writeCoveredFile(merged);
  return merged;
}

/** Prune the file without adding anything. Exposed for maintenance/tests. */
export async function pruneCovered(): Promise<CoveredEntry[]> {
  const merged = prune(await readCoveredFile(), Date.now());
  await writeCoveredFile(merged);
  return merged;
}
