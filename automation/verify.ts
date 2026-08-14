/**
 * Quality gate: decides publish-vs-draft.
 *
 * Everything here is a pure function except the link resolver, which is the one
 * check that genuinely needs the network. A gate failure is not a pipeline
 * failure — it downgrades the post to a draft for human review.
 */

import { EXCERPT_MAX, SLUG_MAX, TAGS_MAX, TAGS_MIN, TITLE_MAX, type GeneratedPost } from './generate';
import { canonicalizeUrl } from './state';

export interface VerifyResult {
  pass: boolean;
  failures: string[];
}

export interface VerifyOptions {
  /** Timeout per link check, ms. */
  linkTimeoutMs?: number;
  /** Skip network checks (used by --dry-run smoke tests). */
  skipLinkChecks?: boolean;
  minWords?: number;
  maxWords?: number;
}

const DEFAULT_LINK_TIMEOUT_MS = 10_000;
const DEFAULT_MIN_WORDS = 350;
const DEFAULT_MAX_WORDS = 2_200;
/** Ceiling on outbound requests per gate run. */
const MAX_LINK_CHECKS = 16;
const USER_AGENT =
  'diegobarrionuevo.dev daily-post link-check (+https://github.com/diegobarrionuevo1)';

/** Elements allowed at the top level of a Ghost HTML body. */
const BLOCK_TAGS = new Set([
  'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'blockquote', 'pre', 'figure', 'table', 'hr', 'div',
]);

/** Elements allowed anywhere inside a block. */
const INLINE_TAGS = new Set([
  'a', 'strong', 'em', 'b', 'i', 'code', 'span', 'br', 'small', 'sup', 'sub', 'del', 'mark',
  'li', 'figcaption', 'thead', 'tbody', 'tr', 'td', 'th', 'img', 'picture', 'source', 'caption',
  'h5', 'h6', 'cite', 'kbd', 'abbr', 'time', 'u', 's', 'q', 'dl', 'dt', 'dd',
]);

const VOID_TAGS = new Set(['br', 'hr', 'img', 'source', 'wbr', 'col', 'input', 'meta', 'link']);

const FORBIDDEN_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'html', 'body', 'head', 'form', 'noscript',
]);

interface HtmlToken {
  kind: 'open' | 'close' | 'self' | 'comment' | 'text';
  name: string;
  raw: string;
  index: number;
}

/**
 * Minimal HTML scanner. Quote-aware so an attribute containing '>' does not
 * terminate the tag early, which a naive /<[^>]*>/ would get wrong.
 */
export function tokenizeHtml(html: string): { tokens: HtmlToken[]; errors: string[] } {
  const tokens: HtmlToken[] = [];
  const errors: string[] = [];
  let i = 0;

  while (i < html.length) {
    const next = html.indexOf('<', i);
    if (next === -1) {
      tokens.push({ kind: 'text', name: '', raw: html.slice(i), index: i });
      break;
    }
    if (next > i) {
      tokens.push({ kind: 'text', name: '', raw: html.slice(i, next), index: i });
    }

    if (html.startsWith('<!--', next)) {
      const end = html.indexOf('-->', next + 4);
      if (end === -1) {
        errors.push(`comentario HTML sin cerrar en la posición ${next}`);
        break;
      }
      tokens.push({ kind: 'comment', name: '', raw: html.slice(next, end + 3), index: next });
      i = end + 3;
      continue;
    }

    const nameMatch = /^<\s*(\/?)([a-zA-Z][a-zA-Z0-9-]*)/.exec(html.slice(next));
    if (nameMatch === null) {
      errors.push(
        `carácter "<" sin escapar en la posición ${next} (usá &lt;): ` +
          `"${html.slice(next, next + 30).replace(/\s+/g, ' ')}"`,
      );
      i = next + 1;
      continue;
    }

    // Walk to the closing '>', skipping over quoted attribute values.
    let cursor = next + nameMatch[0].length;
    let quote: string | null = null;
    let end = -1;
    // Self-closing detection. `raw.endsWith('/>')` gets `<a href=/foo/>` wrong:
    // per HTML5 a '/' inside an UNQUOTED attribute value is part of the value,
    // so that tag is not self-closing and its </a> is not unbalanced.
    const attrsStart = next + nameMatch[0].length;
    let selfClosing = false;
    let slashIndex = -1;
    while (cursor < html.length) {
      const ch = html[cursor]!;
      if (quote !== null) {
        if (ch === quote) quote = null;
        slashIndex = -1;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
        slashIndex = -1;
      } else if (ch === '>') {
        end = cursor;
        if (slashIndex !== -1) {
          const before = slashIndex > 0 ? html[slashIndex - 1]! : '';
          selfClosing = slashIndex === attrsStart || /[\s"']/.test(before);
        }
        break;
      } else if (ch === '/') {
        slashIndex = cursor;
      } else if (!/\s/.test(ch)) {
        slashIndex = -1;
      }
      cursor += 1;
    }
    if (end === -1) {
      errors.push(`etiqueta <${nameMatch[2]}> sin cerrar en la posición ${next}`);
      break;
    }

    const raw = html.slice(next, end + 1);
    const name = nameMatch[2]!.toLowerCase();
    const isClose = nameMatch[1] === '/';
    const isSelf = selfClosing || VOID_TAGS.has(name);

    tokens.push({
      kind: isClose ? 'close' : isSelf ? 'self' : 'open',
      name,
      raw,
      index: next,
    });
    i = end + 1;
  }

  return { tokens, errors };
}

/** Structural checks Ghost's html→lexical converter cares about. */
export function checkHtmlWellFormed(html: string): string[] {
  const failures: string[] = [];
  const { tokens, errors } = tokenizeHtml(html);
  failures.push(...errors);

  const stack: string[] = [];

  for (const token of tokens) {
    if (token.kind === 'comment') continue;

    if (token.kind === 'text') {
      if (stack.length === 0 && token.raw.trim() !== '') {
        failures.push(
          `texto suelto fuera de un bloque: "${token.raw.trim().slice(0, 60)}"`,
        );
      }
      continue;
    }

    if (FORBIDDEN_TAGS.has(token.name)) {
      failures.push(`etiqueta prohibida <${token.name}>`);
      continue;
    }

    const known = BLOCK_TAGS.has(token.name) || INLINE_TAGS.has(token.name);
    if (!known) {
      failures.push(`etiqueta desconocida <${token.name}>`);
      continue;
    }

    if (token.kind === 'open' || token.kind === 'self') {
      if (stack.length === 0 && !BLOCK_TAGS.has(token.name)) {
        failures.push(`<${token.name}> aparece en el nivel superior; solo se permiten bloques`);
      }
      if (token.kind === 'open') stack.push(token.name);
      continue;
    }

    // close
    const open = stack.pop();
    if (open === undefined) {
      failures.push(`</${token.name}> cierra una etiqueta que nunca se abrió`);
    } else if (open !== token.name) {
      failures.push(`etiquetas cruzadas: se abrió <${open}> y se cerró </${token.name}>`);
    }
  }

  if (stack.length > 0) {
    failures.push(`etiquetas sin cerrar: ${stack.map((tag) => `<${tag}>`).join(', ')}`);
  }

  return failures;
}

/**
 * Every href on an <a>. Built on the quote-aware tokenizer rather than a
 * `<a\b[^>]*?href=…>` regex: that form stops at the first '>' anywhere in the
 * tag, so `<a title="a>b" href="…">` silently yields no href — which would fail
 * the "links a cited source" check on a perfectly good post.
 */
export function extractHrefs(html: string): string[] {
  const hrefs: string[] = [];
  const attr = /\bhref\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i;

  for (const token of tokenizeHtml(html).tokens) {
    if (token.name !== 'a') continue;
    if (token.kind !== 'open' && token.kind !== 'self') continue;
    const match = attr.exec(token.raw);
    if (match === null) continue;
    const value = match[2] ?? match[3] ?? match[4];
    if (value !== undefined && value.trim() !== '') hrefs.push(value.trim());
  }

  return hrefs;
}

export function countWords(html: string): number {
  const text = html
    .replace(/<pre[\s\S]*?<\/pre>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text === '' ? 0 : text.split(' ').length;
}

/** HEAD first; some hosts reject it, so fall back to a ranged GET. */
async function resolvesOk(url: string, timeoutMs: number): Promise<boolean> {
  const attempt = async (method: 'HEAD' | 'GET'): Promise<number | null> => {
    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(timeoutMs),
        headers:
          method === 'GET'
            ? { 'user-agent': USER_AGENT, range: 'bytes=0-2047' }
            : { 'user-agent': USER_AGENT },
      });
      // Drain so the socket is released promptly.
      if (method === 'GET') await response.arrayBuffer().catch(() => undefined);
      return response.status;
    } catch {
      return null;
    }
  };

  const headStatus = await attempt('HEAD');
  if (headStatus !== null && headStatus >= 200 && headStatus < 400) return true;

  const getStatus = await attempt('GET');
  return getStatus !== null && getStatus >= 200 && getStatus < 400;
}

export async function checkLinks(
  urls: readonly string[],
  timeoutMs: number,
): Promise<string[]> {
  const results = await Promise.all(
    urls.map(async (url) => ({ url, ok: await resolvesOk(url, timeoutMs) })),
  );
  return results.filter((result) => !result.ok).map((result) => `la fuente no resuelve: ${result.url}`);
}

/** Run the full gate. `pass: false` means "publish as draft", never "crash". */
export async function verifyPost(
  post: GeneratedPost,
  options: VerifyOptions = {},
): Promise<VerifyResult> {
  const failures: string[] = [];
  const linkTimeoutMs = options.linkTimeoutMs ?? DEFAULT_LINK_TIMEOUT_MS;
  const minWords = options.minWords ?? DEFAULT_MIN_WORDS;
  const maxWords = options.maxWords ?? DEFAULT_MAX_WORDS;

  // (e) Ghost metadata limits.
  if (post.title.trim() === '') failures.push('el título está vacío');
  if (post.title.length > TITLE_MAX) {
    failures.push(`el título supera ${TITLE_MAX} caracteres (${post.title.length})`);
  }
  if (post.customExcerpt.length > EXCERPT_MAX) {
    failures.push(`custom_excerpt supera ${EXCERPT_MAX} caracteres (${post.customExcerpt.length})`);
  }
  if (post.customExcerpt.trim() === '') failures.push('custom_excerpt está vacío');
  if (!/^[a-z0-9-]+$/.test(post.slug)) {
    failures.push(`el slug tiene caracteres inválidos: "${post.slug}"`);
  }
  if (post.slug.length > SLUG_MAX) {
    failures.push(`el slug supera ${SLUG_MAX} caracteres (${post.slug.length})`);
  }
  if (post.tags.length < TAGS_MIN || post.tags.length > TAGS_MAX) {
    failures.push(`hay ${post.tags.length} tags; se esperan entre ${TAGS_MIN} y ${TAGS_MAX}`);
  }

  // (d) HTML well-formedness.
  if (post.html.trim() === '') {
    failures.push('el html del cuerpo está vacío');
  } else {
    failures.push(...checkHtmlWellFormed(post.html));
  }

  // (c) Body length.
  const words = countWords(post.html);
  if (words < minWords) failures.push(`el cuerpo tiene ${words} palabras; el mínimo es ${minWords}`);
  if (words > maxWords) failures.push(`el cuerpo tiene ${words} palabras; el máximo es ${maxWords}`);

  // (b) At least one anchor pointing at a cited source.
  const bodyHrefs = extractHrefs(post.html);
  if (post.sourcesCited.length === 0) {
    failures.push('sourcesCited está vacío: el post no atribuye ninguna fuente');
  } else {
    const citedKeys = new Set(post.sourcesCited.map((source) => canonicalizeUrl(source.url)));
    const linked = bodyHrefs.some((href) => citedKeys.has(canonicalizeUrl(href)));
    if (!linked) {
      failures.push('el html no enlaza ninguna de las fuentes citadas con <a href>');
    }
  }

  // (a) Every URL actually resolves — the cited ones AND every absolute link the
  // model put in the body. Checking only sourcesCited left hallucinated in-body
  // links unverified, which is exactly the failure mode the prompt warns about.
  if (!(options.skipLinkChecks ?? false)) {
    const toCheck = new Map<string, string>();
    for (const url of [...post.sourcesCited.map((source) => source.url), ...bodyHrefs]) {
      if (!/^https?:\/\//i.test(url)) continue;
      const key = canonicalizeUrl(url);
      if (!toCheck.has(key)) toCheck.set(key, url);
    }
    if (toCheck.size > 0) {
      failures.push(
        ...(await checkLinks(Array.from(toCheck.values()).slice(0, MAX_LINK_CHECKS), linkTimeoutMs)),
      );
    }
  }

  return { pass: failures.length === 0, failures };
}
