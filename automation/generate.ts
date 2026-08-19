/**
 * Post generation.
 *
 * The model writes Diego's ORIGINAL analysis of the day's story — not a
 * translation or rewrite of the source, which Google penalises as scaled content
 * abuse. Structured outputs guarantee the shape; the post-parse normalisation
 * below guarantees Ghost's hard limits are respected before we ever hit the API.
 */

import { spawn } from 'node:child_process';
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
  '',
  '## Formato de salida (crítico)',
  '- Respondé EXCLUSIVAMENTE con un único objeto JSON válido que cumpla el esquema de abajo.',
  '- Sin texto antes ni después, sin ``` y sin comentarios. El primer carácter es "{".',
  '- El HTML del cuerpo va dentro del campo "html" como string JSON correctamente escapado.',
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

/**
 * Transport: the locally authenticated Claude Code CLI, not the HTTP API.
 *
 * This is the whole point of the file's shape. `claude -p` signs its requests
 * with the OAuth session on this machine, so generation is covered by the
 * subscription instead of being billed per token. The tradeoff is that headless
 * mode has no server-side structured-output guarantee, so the schema contract
 * moves here: we ask for strict JSON, parse it, and validate it with the very
 * same Zod schema. An invalid shape is retried, then becomes a hard error.
 */

/** Per-attempt cap. With MAX_RETRIES this bounds the whole step at ~15 min. */
export const REQUEST_TIMEOUT_MS = 5 * 60_000;
export const MAX_RETRIES = 2;

/**
 * Overridable because launchd and cron start with a minimal PATH where a bare
 * `claude` does not resolve.
 */
export const CLI_BIN = process.env.CLAUDE_CLI_BIN ?? 'claude';

/** stdout ceiling: a long post plus the CLI's JSON envelope, with headroom. */
const MAX_OUTPUT_BYTES = 8 * 1024 * 1024;

/**
 * This step writes prose; it must not touch the filesystem, the network or MCP.
 * Denying the tools outright also means a cron run can never stall waiting for
 * a permission prompt that nobody is there to answer.
 */
const DISALLOWED_TOOLS =
  'Bash Read Write Edit NotebookEdit Glob Grep WebFetch WebSearch Task Agent';

/** Derived from PostSchema so the prompt and the validator cannot drift apart. */
const POST_JSON_SCHEMA = JSON.stringify(z.toJSONSchema(PostSchema), null, 2);

/** Only the envelope fields we consume; the CLI emits many more. */
export interface CliEnvelope {
  is_error?: boolean;
  subtype?: string;
  stop_reason?: string | null;
  result?: string;
  usage?: { input_tokens?: number; output_tokens?: number };
  api_error_status?: number | null;
}

export type CliRunner = (systemPrompt: string, userPrompt: string) => Promise<CliEnvelope>;

/** Spawn the CLI, feed the prompt over stdin, collect the JSON envelope. */
export async function runClaudeCli(
  systemPrompt: string,
  userPrompt: string,
): Promise<CliEnvelope> {
  // Stripped deliberately: if a key is present in the environment, Claude Code
  // prefers it over the OAuth session and every run silently goes back to being
  // billed per token — the exact thing this transport exists to avoid.
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  delete env.ANTHROPIC_AUTH_TOKEN;

  const args = [
    '--print',
    '--output-format', 'json',
    '--model', MODEL,
    '--system-prompt', systemPrompt,
    '--max-turns', '1',
    '--disallowed-tools', DISALLOWED_TOOLS,
    '--strict-mcp-config',
  ];

  const raw = await new Promise<string>((resolve, reject) => {
    const child = spawn(CLI_BIN, args, { env, stdio: ['pipe', 'pipe', 'pipe'] });
    const out: string[] = [];
    const err: string[] = [];
    let size = 0;
    let settled = false;

    const finish = (fn: () => void): void => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };

    const timer = setTimeout(() => {
      finish(() => {
        child.kill('SIGKILL');
        reject(new GenerationError(`El CLI de Claude no respondió en ${REQUEST_TIMEOUT_MS} ms.`));
      });
    }, REQUEST_TIMEOUT_MS);

    child.stdout.setEncoding('utf8');
    child.stdout.on('data', (chunk: string) => {
      size += chunk.length;
      if (size > MAX_OUTPUT_BYTES) {
        finish(() => {
          child.kill('SIGKILL');
          reject(new GenerationError('La salida del CLI superó el límite de buffer.'));
        });
        return;
      }
      out.push(chunk);
    });
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk: string) => err.push(chunk));

    child.on('error', (error) => {
      finish(() =>
        reject(
          new GenerationError(
            `No se pudo ejecutar "${CLI_BIN}". ¿Está instalado y en el PATH? ` +
              `Definí CLAUDE_CLI_BIN con la ruta absoluta si corrés desde cron/launchd.`,
            error,
          ),
        ),
      );
    });

    child.on('close', (code) => {
      finish(() => {
        if (code === 0) {
          resolve(out.join(''));
          return;
        }
        reject(
          new GenerationError(
            `El CLI de Claude terminó con código ${code ?? '?'}: ${err.join('').trim().slice(0, 500)}`,
          ),
        );
      });
    });

    child.stdin.on('error', () => undefined);
    child.stdin.end(userPrompt, 'utf8');
  });

  try {
    return JSON.parse(raw) as CliEnvelope;
  } catch (error) {
    throw new GenerationError(
      `El CLI no devolvió JSON parseable: "${raw.trim().slice(0, 300)}"`,
      error,
    );
  }
}

/**
 * Pull the JSON object out of the model's answer.
 *
 * The prompt forbids prose and fences, but a single stray line would otherwise
 * burn a whole retry, so tolerate both rather than failing on formatting.
 */
export function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed);
  const body = (fenced === null ? trimmed : fenced[1]!).trim();

  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new GenerationError(
      `La respuesta no contiene un objeto JSON: "${body.slice(0, 200)}"`,
    );
  }
  return body.slice(start, end + 1);
}

export async function generatePost(
  selection: Selection,
  runner: CliRunner = runClaudeCli,
): Promise<GenerateResult> {
  const systemPrompt = `${SYSTEM_PROMPT}\n\n## Esquema JSON exacto\n${POST_JSON_SCHEMA}`;
  const basePrompt = buildUserPrompt(selection);

  let repairNote = '';
  let lastError: GenerationError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const envelope = await runner(systemPrompt, `${basePrompt}${repairNote}`);

    // A refusal will not improve by asking again; fail fast and keep the budget.
    if (envelope.stop_reason === 'refusal') {
      throw new GenerationError('Claude rechazó la solicitud.');
    }
    if (envelope.is_error === true) {
      throw new GenerationError(
        `El CLI reportó error (subtype: ${envelope.subtype ?? 'n/d'}, ` +
          `api_error_status: ${envelope.api_error_status ?? 'n/d'}).`,
      );
    }

    try {
      const parsed = PostSchema.parse(JSON.parse(extractJsonObject(envelope.result ?? '')));
      return {
        post: normalizePost(parsed),
        usage: {
          inputTokens: envelope.usage?.input_tokens ?? 0,
          outputTokens: envelope.usage?.output_tokens ?? 0,
        },
        stopReason: envelope.stop_reason ?? null,
      };
    } catch (error) {
      const detail =
        error instanceof z.ZodError
          ? error.issues.map((i) => `${i.path.join('.') || '(raíz)'}: ${i.message}`).join('; ')
          : error instanceof Error
            ? error.message
            : String(error);

      lastError = new GenerationError(
        `La respuesta no cumple el esquema (intento ${attempt + 1}/${MAX_RETRIES + 1}): ${detail}`,
        error,
      );
      repairNote =
        `\n\nTU RESPUESTA ANTERIOR FUE INVÁLIDA: ${detail}\n` +
        'Devolvé SOLO el objeto JSON del esquema, empezando por "{". Sin texto ni fences.';
    }
  }

  throw lastError ?? new GenerationError('No se pudo generar un post válido.');
}
