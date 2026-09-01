/**
 * Topic focus for on-demand runs.
 *
 * "quiero un post de ciberseguridad en dispositivos móviles" has to match
 * headlines that are mostly in English. That is a semantics problem, not a
 * grep problem, so relevance is judged by the same subscription-backed CLI
 * transport the writer uses: it crosses languages and costs nothing extra.
 *
 * The judge sees titles only — never bodies — so the call stays small and a
 * single misleading headline cannot poison more than its own slot.
 */
import { z } from 'zod';

import type { FeedItem } from './feed';
import { extractJsonObject, GenerationError, runClaudeCli, type CliRunner } from './generate';

/** Titles are short; beyond this the tail of the window adds noise, not recall. */
const MAX_CANDIDATES = 180;
const MAX_MATCHES = 12;

const MatchSchema = z.object({
  relevantes: z
    .array(z.number().int().nonnegative())
    .max(MAX_MATCHES)
    .describe('Índices de los ítems relevantes al tema, del más al menos pertinente.'),
});

const SYSTEM = [
  'Sos el curador de un blog técnico de software, IA y tecnología aplicada.',
  'Te dan un tema pedido por el editor y una lista numerada de titulares recientes.',
  'Elegí SOLO los ítems directa y sustancialmente relacionados con el tema pedido.',
  'Los titulares pueden estar en otro idioma que el tema: juzgá por significado.',
  'Relación tangencial no alcanza: mejor lista corta que relleno. Si ninguno aplica,',
  'devolvé la lista vacía — el pipeline prefiere no escribir a escribir sin material.',
  '',
  'Respondé EXCLUSIVAMENTE con un objeto JSON: {"relevantes": [índices]},',
  `ordenado del más al menos pertinente, máximo ${MAX_MATCHES}. Sin texto extra.`,
].join('\n');

/** Items that genuinely match the requested topic, most relevant first. */
export async function filterByTopic(
  items: readonly FeedItem[],
  topic: string,
  runner: CliRunner = runClaudeCli,
): Promise<FeedItem[]> {
  const pool = items.slice(0, MAX_CANDIDATES);
  if (pool.length === 0) return [];

  const list = pool.map((item, i) => `${i}. [${item.source}] ${item.title}`).join('\n');
  const envelope = await runner(SYSTEM, `Tema pedido: ${topic}\n\nTitulares:\n${list}`);

  if (envelope.is_error === true) {
    throw new GenerationError(
      `El curador de tema reportó error (subtype: ${envelope.subtype ?? 'n/d'}).`,
    );
  }

  const parsed = MatchSchema.parse(JSON.parse(extractJsonObject(envelope.result ?? '')));
  const seen = new Set<number>();
  const picked: FeedItem[] = [];
  for (const index of parsed.relevantes) {
    if (index >= pool.length || seen.has(index)) continue;
    seen.add(index);
    picked.push(pool[index]!);
  }
  return picked;
}
