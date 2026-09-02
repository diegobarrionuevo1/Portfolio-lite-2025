/**
 * English twins for posts.
 *
 * Every Spanish note gets an English sibling in Ghost: same story, same
 * structure, deterministic slug (`<es-slug>-en`) and the internal #lang-en
 * tag the site uses to keep each language's index to itself. Translation runs
 * through the same subscription-backed CLI transport as everything else.
 *
 * The slug is derived, never model output, so the pair can always find each
 * other without a lookup table — the site builds hreflang links by string
 * manipulation alone.
 */
import { z } from 'zod';

import { extractJsonObject, GenerationError, runClaudeCli, type CliRunner } from './generate';
import {
  createPost,
  findPostBySlug,
  type GhostConfig,
  type GhostPost,
  type PostStatus,
} from './publish';

export const EN_SLUG_SUFFIX = '-en';
export const LANG_EN_TAG = '#lang-en';

/**
 * Vertical names mirrored into English. Ghost matches tags BY NAME and
 * auto-creates unknowns, so this map is the only thing standing between the
 * English index and a tag list polluted with Spanish.
 */
const TAG_EN: Record<string, string> = {
  IA: 'AI',
  Seguridad: 'Security',
  Arquitectura: 'Architecture',
  Carrera: 'Career',
  Producto: 'Product',
};

export function tagToEnglish(name: string): string {
  return TAG_EN[name] ?? name;
}

const TranslationSchema = z.object({
  title: z.string().describe('The title in natural, professional English. Max 90 characters.'),
  customExcerpt: z
    .string()
    .describe('The excerpt in English, one or two sentences, max 260 characters.'),
  html: z
    .string()
    .describe(
      'The full body translated to English. IDENTICAL HTML structure: same elements in the ' +
        'same order, same href values untouched, tables and <pre> diagrams kept (translate ' +
        'their labels and cell text). No content added or removed.',
    ),
});

const SYSTEM = [
  'You translate blog posts from Rioplatense Spanish to English for a professional',
  "software engineering blog. The author's voice is a senior practitioner: direct,",
  'opinionated, concrete. Translate meaning and tone, not word by word.',
  '',
  'Hard rules:',
  '- Keep the HTML structure IDENTICAL: same elements, same order, same attributes.',
  '- Never change an href. Never add or drop a link, figure, table or diagram.',
  '- Translate table headers/cells and ASCII-diagram labels; keep box characters aligned.',
  '- No new facts, numbers or claims. If the Spanish is wrong, the English is equally wrong.',
  '- Respond EXCLUSIVELY with one JSON object matching the schema. First character "{".',
].join('\n');

export interface EsPostInput {
  title: string;
  slug: string;
  html: string;
  customExcerpt: string;
  /** Spanish vertical tag names, WITHOUT internal # tags. */
  tags: readonly string[];
  /** Internal tags to carry over verbatim (e.g. #src-<hash>). */
  internalTags: readonly string[];
}

export async function translatePost(
  post: Pick<EsPostInput, 'title' | 'customExcerpt' | 'html'>,
  runner: CliRunner = runClaudeCli,
): Promise<z.infer<typeof TranslationSchema>> {
  const prompt = [
    `TITLE:\n${post.title}`,
    `EXCERPT:\n${post.customExcerpt}`,
    `BODY HTML:\n${post.html}`,
  ].join('\n\n');

  const envelope = await runner(`${SYSTEM}\n\n## Exact JSON schema\n${JSON.stringify(z.toJSONSchema(TranslationSchema), null, 2)}`, prompt);
  if (envelope.is_error === true) {
    throw new GenerationError(`El traductor reportó error (subtype: ${envelope.subtype ?? 'n/d'}).`);
  }
  return TranslationSchema.parse(JSON.parse(extractJsonObject(envelope.result ?? '')));
}

/**
 * Create the English twin unless it already exists. Returns the twin, or null
 * when it was already there. Idempotent by construction: the deterministic
 * slug is the identity check.
 */
export async function ensureEnglishTwin(
  post: EsPostInput,
  options: {
    status: PostStatus;
    config: GhostConfig;
    /** Builds the cover URL from the TRANSLATED title, which only exists here. */
    featureImageFor?: (titleEn: string) => string | undefined;
    runner?: CliRunner;
  },
): Promise<{ created: GhostPost | null; existing: GhostPost | null }> {
  const twinSlug = `${post.slug}${EN_SLUG_SUFFIX}`;
  const existing = await findPostBySlug(twinSlug, options.config);
  if (existing !== null) return { created: null, existing };

  const translated = await translatePost(post, options.runner);

  const created = await createPost(
    {
      title: translated.title,
      slug: twinSlug,
      html: translated.html,
      customExcerpt: translated.customExcerpt,
      metaTitle: translated.title,
      metaDescription: translated.customExcerpt,
      featureImage: options.featureImageFor?.(translated.title),
      tags: [...post.tags.map(tagToEnglish), ...post.internalTags, LANG_EN_TAG],
    },
    { status: options.status, config: options.config },
  );
  return { created, existing: null };
}
