/**
 * Post generation.
 *
 * The model writes Diego's ORIGINAL analysis of the day's story — not a
 * translation or rewrite of the source, which Google penalises as scaled content
 * abuse. Structured outputs guarantee the shape; the post-parse normalisation
 * below guarantees Ghost's hard limits are respected before we ever hit the API.
 */

import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { z } from 'zod';

import type { FeedItem } from './feed';
import type { Selection } from './select';

export const MODEL = 'claude-opus-5';
export const MAX_TOKENS = 16_000;

export const TITLE_MAX = 255;
export const EXCERPT_MAX = 300;
export const SLUG_MAX = 191;
export const TAGS_MIN = 2;
export const TAGS_MAX = 5;

/**
 * Ghost matches tags BY NAME and silently auto-creates anything it does not
 * recognise, so a single model typo permanently pollutes the tag list. Locking
 * the schema to an enum makes that impossible.
 */
export const ALLOWED_TAGS = [
  'IA',
  'LLMs',
  'Claude',
  'OpenAI',
  'Frontend',
  'Backend',
  'Next.js',
  'React',
  'TypeScript',
  'Node.js',
  'DevTools',
  'DevOps',
  'Cloud',
  'Open Source',
  'Performance',
  'Seguridad',
  'Arquitectura',
  'Testing',
  'Carrera',
  'Producto',
] as const;

export type AllowedTag = (typeof ALLOWED_TAGS)[number];

const PostSchema = z.object({
  title: z
    .string()
    .describe('Titular en español rioplatense. Concreto, sin clickbait. Máximo 90 caracteres.'),
  slug: z
    .string()
    .describe('Slug kebab-case, solo a-z, 0-9 y guiones. Sin acentos ni eñes. Máximo 70 caracteres.'),
  customExcerpt: z
    .string()
    .describe('Bajada de 1 o 2 oraciones, máximo 260 caracteres. Dice qué cambia, no qué se anunció.'),
  tags: z
    .array(z.enum(ALLOWED_TAGS))
    .describe('Entre 2 y 5 etiquetas, elegidas exclusivamente de la lista permitida.'),
  html: z
    .string()
    .describe(
      'Cuerpo del post en HTML bien formado: solo elementos de bloque en el nivel superior ' +
        '(<p>, <h2>, <h3>, <ul>, <ol>, <blockquote>, <pre>, <figure>). Sin <html>, <body>, <script> ni <style>. ' +
        'Incluye al menos un <a href="..."> a una de las fuentes citadas.',
    ),
  sourcesCited: z
    .array(
      z.object({
        title: z.string().describe('Titular original de la fuente.'),
        url: z.string().describe('URL absoluta http(s) de la fuente. Copiada tal cual, sin inventar.'),
      }),
    )
    .describe('Todas las fuentes usadas. Copiá las URLs exactas provistas; no inventes ninguna.'),
});

export type GeneratedPost = z.infer<typeof PostSchema>;

export interface GenerateResult {
  post: GeneratedPost;
  usage: {
    inputTokens: number;
    outputTokens: number;
  };
  stopReason: string | null;
}

export class GenerationError extends Error {
  readonly cause?: unknown;
  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'GenerationError';
    this.cause = cause;
  }
}

const SYSTEM_PROMPT = [
  'Sos el asistente editorial de Diego Barrionuevo, desarrollador full-stack senior argentino.',
  'Escribís las entradas de su blog profesional: es su cara pública frente a clientes potenciales.',
  '',
  '## Idioma y voz',
  '- Español rioplatense con voseo (vos, tenés, podés, mirá). Nunca "tú" ni "usted".',
  '- Voz de dev senior: práctica, opinada, concreta. Primera persona cuando corresponde.',
  '- Prohibido: hype, emojis, signos de exclamación, y aperturas de relleno tipo',
  '  "en el vertiginoso mundo de la tecnología" o "en los últimos años hemos visto".',
  '- Arrancá directo por la tesis. La primera oración ya tiene que decir algo.',
  '',
  '## Qué es este post (y qué no)',
  '- Es el ANÁLISIS ORIGINAL de Diego sobre la noticia. No es una traducción, un resumen',
  '  ni una reescritura del artículo fuente. Republicar contenido reescrito es "scaled content',
  '  abuse" y Google lo penaliza.',
  '- La noticia es el disparador; el valor está en la lectura práctica que aporta Diego.',
  '- Citá y enlazá las fuentes explícitamente con <a href="...">, usando las URLs exactas',
  '  que te paso. No inventes URLs, cifras, benchmarks ni citas textuales.',
  '- Si un dato no está en el material provisto, no lo afirmes. Decí que falta información.',
  '',
  '## Estructura obligatoria (así se diferencia de los demás)',
  '1. Apertura corta: qué pasó, en dos o tres oraciones, con el enlace a la fuente.',
  '2. "Por qué importa": la tesis de Diego. Qué señal esconde el anuncio.',
  '3. "Qué cambia en la práctica": impacto concreto para alguien que trabaja todos los días',
  '   con esto. Código, flujo de trabajo, costos, decisiones de arquitectura.',
  '4. "Cuándo NO usarlo": tradeoffs honestos, límites, casos donde conviene esperar.',
  '   Esta sección es el diferencial. Nunca la omitas ni la conviertas en un elogio disfrazado.',
  '5. Cierre breve: qué haría Diego hoy con esta información.',
  '',
  '## Formato HTML',
  '- Solo elementos de bloque en el nivel superior: <p>, <h2>, <h3>, <ul>, <ol>, <blockquote>,',
  '  <pre>, <figure>. Los inline (<a>, <strong>, <em>, <code>) van siempre adentro de un bloque.',
  '- Cerrá todas las etiquetas. HTML mal formado rompe el conversor de Ghost y aborta la publicación.',
  '- Escapá los "<" literales como &lt;. Nada de <script>, <style>, <iframe>, <html> ni <body>.',
  '- Los bloques de código van como <pre><code>...</code></pre> con el contenido escapado.',
  '- Extensión: entre 600 y 1100 palabras de texto real. Ni recortado ni inflado con relleno.',
  '',
  '## Metadatos',
  '- title: máximo 90 caracteres, sin comillas envolventes.',
  '- slug: kebab-case ASCII, sin acentos ni eñes, derivado del título.',
  '- customExcerpt: máximo 260 caracteres.',
  '- tags: entre 2 y 5, exclusivamente de la lista permitida.',
  '- sourcesCited: todas las URLs que enlazaste, copiadas literalmente del material provisto.',
].join('\n');

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Cut on a word boundary and append an ellipsis so we never emit a half word. */
export function clampText(raw: string, max: number): string {
  const text = raw.replace(/\s+/g, ' ').trim();
  if (text.length <= max) return text;
  const hard = text.slice(0, max - 1);
  const lastSpace = hard.lastIndexOf(' ');
  const body = lastSpace > max * 0.6 ? hard.slice(0, lastSpace) : hard;
  return `${body.trimEnd()}…`;
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, '');
}

/**
 * Force a Ghost-safe slug: lowercase ASCII, digits and single hyphens only.
 *
 * A model slug that survives `trim()` can still normalise to nothing (pure
 * punctuation, emoji, CJK). Falling straight through to the dated slug in that
 * case would throw away the title AND invite a same-day collision, so try the
 * fallback before giving up.
 */
export function normalizeSlug(raw: string, fallback: string): string {
  const fromRaw = slugify(raw);
  if (fromRaw !== '') return fromRaw;

  const fromFallback = slugify(fallback);
  if (fromFallback !== '') return fromFallback;

  return `post-${new Date().toISOString().slice(0, 10)}`;
}

/**
 * Dedupe and clamp the tag count (JSON Schema cannot express either). Values are
 * already constrained to the enum by the schema.
 *
 * Deliberately does NOT pad up to TAGS_MIN: padding used to append the first
 * unused entries of ALLOWED_TAGS, which tagged a Next.js post "IA" and made the
 * gate's `tags.length < TAGS_MIN` check unreachable. Too few tags is now a real
 * gate failure, i.e. a draft for review.
 */
function normalizeTags(raw: readonly AllowedTag[]): AllowedTag[] {
  const seen = new Set<AllowedTag>();
  const tags: AllowedTag[] = [];

  for (const tag of raw) {
    if (seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
    if (tags.length >= TAGS_MAX) break;
  }

  return tags;
}

function normalizeSources(
  raw: readonly { title: string; url: string }[],
): { title: string; url: string }[] {
  const seen = new Set<string>();
  const sources: { title: string; url: string }[] = [];

  for (const entry of raw) {
    const url = entry.url.trim();
    if (!/^https?:\/\//i.test(url)) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({ title: entry.title.trim() || url, url });
  }

  return sources;
}

/** Apply every Ghost limit that the JSON schema is not allowed to express. */
export function normalizePost(post: GeneratedPost): GeneratedPost {
  const title = clampText(post.title, TITLE_MAX);
  return {
    title,
    slug: normalizeSlug(post.slug, title),
    customExcerpt: clampText(post.customExcerpt, EXCERPT_MAX),
    tags: normalizeTags(post.tags),
    html: post.html.trim(),
    sourcesCited: normalizeSources(post.sourcesCited),
  };
}

function renderItem(item: FeedItem, label: string): string {
  const body = stripHtmlTags(item.content);
  const excerpt = body.length > 2500 ? `${body.slice(0, 2500)}…` : body;
  return [
    `### ${label}`,
    `- Fuente: ${item.source} (${item.lang})`,
    `- Titular: ${item.title}`,
    `- URL: ${item.link}`,
    `- Publicado: ${item.isoDate}`,
    `- Resumen: ${item.contentSnippet || '(sin resumen)'}`,
    excerpt === '' ? '' : `- Contenido:\n${excerpt}`,
  ]
    .filter((line) => line !== '')
    .join('\n');
}

export function buildUserPrompt(selection: Selection): string {
  const parts = [
    'Material de hoy. Usá SOLO estas URLs al citar; están verificadas.',
    '',
    renderItem(selection.chosen, 'Noticia principal'),
  ];

  selection.related.forEach((item, index) => {
    parts.push('', renderItem(item, `Contexto de apoyo ${index + 1}`));
  });

  parts.push(
    '',
    `Señal de selección: ${selection.reason}.`,
    '',
    'Escribí el post siguiendo la estructura obligatoria del system prompt.',
    'Recordá: análisis original de Diego, no un resumen de la nota. La sección',
    '"cuándo NO usarlo" es obligatoria y tiene que ser honesta.',
  );

  return parts.join('\n');
}

/** Per-request cap. With MAX_RETRIES this bounds the whole step at ~15 min. */
export const REQUEST_TIMEOUT_MS = 5 * 60_000;
export const MAX_RETRIES = 2;

export function createClient(apiKey = process.env.ANTHROPIC_API_KEY): Anthropic {
  if (apiKey === undefined || apiKey.trim() === '') {
    throw new GenerationError('ANTHROPIC_API_KEY no está definida.');
  }
  // The SDK default is a 10-minute timeout with no explicit retry ceiling here,
  // which can outlive the Actions job budget and get killed mid-run.
  return new Anthropic({ apiKey, maxRetries: MAX_RETRIES, timeout: REQUEST_TIMEOUT_MS });
}

export async function generatePost(
  selection: Selection,
  client: Anthropic = createClient(),
): Promise<GenerateResult> {
  let message: Awaited<ReturnType<typeof client.messages.parse>>;

  try {
    message = await client.messages.parse({
      model: MODEL,
      // Thinking is on by default on claude-opus-5 and shares this budget with
      // the response text, so keep real headroom above the expected body size.
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      output_config: {
        effort: 'medium',
        format: zodOutputFormat(PostSchema),
      },
      messages: [{ role: 'user', content: buildUserPrompt(selection) }],
    });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      throw new GenerationError('Claude devolvió rate limit tras los reintentos del SDK.', error);
    }
    if (error instanceof Anthropic.APIError) {
      throw new GenerationError(`Claude API error ${error.status ?? '?'}: ${error.message}`, error);
    }
    throw new GenerationError(
      `Fallo inesperado llamando a Claude: ${error instanceof Error ? error.message : String(error)}`,
      error,
    );
  }

  // A refusal is HTTP 200 with empty/partial content — check before reading it.
  if (message.stop_reason === 'refusal') {
    const category = message.stop_details?.category ?? 'desconocida';
    throw new GenerationError(`Claude rechazó la solicitud (categoría: ${category}).`);
  }
  if (message.stop_reason === 'max_tokens') {
    throw new GenerationError('La respuesta se truncó por max_tokens; el JSON quedó incompleto.');
  }

  const parsed = message.parsed_output;
  if (parsed === null || parsed === undefined) {
    throw new GenerationError('Claude respondió sin parsed_output utilizable.');
  }

  return {
    post: normalizePost(parsed),
    usage: {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    },
    stopReason: message.stop_reason,
  };
}
