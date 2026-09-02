/**
 * Daily publishing pipeline orchestrator.
 *
 *   ingest -> select -> generate -> verify -> publish -> mark covered -> revalidate
 *
 * Publishing policy, deliberately conservative:
 *   status = 'published'  <=>  the quality gate passed AND BLOG_AUTO_PUBLISH === 'true'
 *   otherwise              ->  'draft'
 *
 * With the env var unset the pipeline ALWAYS produces a draft. A gate failure is
 * a successful run that produced a draft for review — it exits 0. Only genuine
 * errors (no API key, Ghost unreachable, model failure) exit non-zero.
 */

import { ingestFeeds } from './feed';
import { filterByTopic } from './focus';
import { generatePost, GenerationError, type GeneratedPost } from './generate';
import {
  createPost,
  findPostBySlug,
  findPostBySourceKey,
  GhostError,
  resolveConfig,
  sourceKey,
  sourceTagName,
  type GhostConfig,
  type GhostPost,
  type PostStatus,
} from './publish';
import { MAX_POSTS_PER_RUN, selectTopics, type Selection } from './select';
import { canonicalizeUrl, loadCovered, markCovered } from './state';
import { ensureEnglishTwin } from './translate';
import { verifyPost, type VerifyResult } from './verify';

const REVALIDATE_TIMEOUT_MS = 10_000;

interface Cli {
  dryRun: boolean;
  /** On-demand topic: the run hunts material about this instead of the day's best signal. */
  tema?: string;
}

/** News runs use a short window; a requested topic is rarely breaking news. */
const TOPIC_WINDOW_DAYS = 14;

function parseArgs(argv: readonly string[]): Cli {
  const temaIndex = argv.indexOf('--tema');
  const tema = temaIndex !== -1 ? argv[temaIndex + 1]?.trim() : undefined;
  if (temaIndex !== -1 && (tema === undefined || tema === '' || tema.startsWith('--'))) {
    throw new Error('--tema requiere un valor: pnpm blog:post "tu tema"');
  }
  return { dryRun: argv.includes('--dry-run'), tema };
}

function line(text = ''): void {
  process.stdout.write(`${text}\n`);
}

function heading(text: string): void {
  line();
  line(text);
  line('─'.repeat(Math.min(text.length, 72)));
}

/**
 * Strict equality on purpose: anything other than the literal string "true"
 * (unset, "1", "yes", "TRUE") keeps the post as a draft.
 */
export function autoPublishEnabled(raw = process.env.BLOG_AUTO_PUBLISH): boolean {
  return raw === 'true';
}

/**
 * The whole safety policy in one place: publishing for real requires BOTH a
 * passing gate and an explicit opt-in. Every other combination is a draft.
 */
export function decideStatus(gatePassed: boolean, autoPublish: boolean): PostStatus {
  return gatePassed && autoPublish ? 'published' : 'draft';
}

/**
 * Cover image for a post: a URL, not an upload.
 *
 * The site renders the card on demand from the title, so nothing is rasterised
 * here, nothing is stored in Ghost, and Ghost's /content/ path can stay closed
 * to the internet. Returns undefined when the site origin is unknown, because a
 * half-built URL would be worse than no cover at all.
 */
export function coverImageUrl(
  title: string,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL,
  lang: 'es' | 'en' = 'es',
): string | undefined {
  const base = (siteUrl ?? '').trim().replace(/\/+$/, '');
  if (base === '') return undefined;
  const suffix = lang === 'en' ? '&lang=en' : '';
  return `${base}/api/og?title=${encodeURIComponent(title)}${suffix}`;
}

async function triggerRevalidate(): Promise<string> {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim().replace(/\/+$/, '');
  const secret = (process.env.REVALIDATE_SECRET ?? '').trim();

  if (siteUrl === '' || secret === '') {
    return 'omitido (faltan NEXT_PUBLIC_SITE_URL y/o REVALIDATE_SECRET)';
  }

  try {
    const response = await fetch(`${siteUrl}/api/revalidate`, {
      method: 'POST',
      signal: AbortSignal.timeout(REVALIDATE_TIMEOUT_MS),
      headers: {
        'x-revalidate-secret': secret,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ source: 'automation/run.ts' }),
    });
    return response.ok
      ? `ok (HTTP ${response.status})`
      : `falló con HTTP ${response.status} (no bloquea la publicación)`;
  } catch (error) {
    return `falló: ${error instanceof Error ? error.message : String(error)} (no bloquea la publicación)`;
  }
}

function printSelection(selection: Selection): void {
  heading('2. Selección del tema');
  line(`Elegido:   ${selection.chosen.title}`);
  line(`Fuente:    ${selection.chosen.source} — ${selection.chosen.link}`);
  line(`Publicado: ${selection.chosen.isoDate}`);
  line(`Señal:     ${selection.reason}`);
  line(`Score:     ${selection.score} (candidatos: ${selection.candidatesConsidered}, clusters: ${selection.clustersConsidered})`);
  if (selection.related.length === 0) {
    line('Apoyo:     (ninguno)');
  } else {
    line('Apoyo:');
    for (const item of selection.related) {
      line(`  - [${item.source}] ${item.title}`);
    }
  }
}

function printPost(post: GeneratedPost): void {
  heading('3. Post generado');
  line(`Título:  ${post.title}`);
  line(`Slug:    ${post.slug}`);
  line(`Bajada:  ${post.customExcerpt}`);
  line(`Tags:    ${post.tags.join(', ')}`);
  line(`HTML:    ${post.html.length} caracteres`);
  // One glance at the log answers "did the visual rule hold today?".
  const visuals = [post.html.includes('<table') && 'tabla', post.html.includes('<pre') && 'diagrama']
    .filter(Boolean)
    .join(' + ');
  line(`Visual:  ${visuals || 'ninguno'}`);
  line('Fuentes citadas:');
  for (const source of post.sourcesCited) {
    line(`  - ${source.title} — ${source.url}`);
  }
}

function printGate(gate: VerifyResult): void {
  heading('4. Quality gate');
  if (gate.pass) {
    line('PASA: todas las verificaciones dieron OK.');
    return;
  }
  line(`FALLA: ${gate.failures.length} problema(s) detectado(s).`);
  for (const failure of gate.failures) {
    line(`  - ${failure}`);
  }
}

function printSummary(params: {
  label: string;
  status: PostStatus | 'ninguno';
  gate: VerifyResult;
  autoPublish: boolean;
  dryRun: boolean;
  ghostPost: GhostPost | null;
  markedUrls: readonly string[];
}): void {
  heading(`Resumen — ${params.label}`);
  line(`Modo:            ${params.dryRun ? 'DRY RUN (sin escritura en Ghost)' : 'real'}`);
  line(`Gate:            ${params.gate.pass ? 'PASA' : 'FALLA'}`);
  line(`BLOG_AUTO_PUBLISH: ${process.env.BLOG_AUTO_PUBLISH ?? '(sin definir)'} -> ${params.autoPublish ? 'habilitado' : 'deshabilitado'}`);
  line(`Estado en Ghost: ${params.status}`);

  if (params.status === 'draft') {
    const reasons: string[] = [];
    if (!params.gate.pass) {
      reasons.push(
        `el quality gate falló (${params.gate.failures.length} problema(s)): ${params.gate.failures
          .map((failure) => `\n    · ${failure}`)
          .join('')}`,
      );
    }
    if (!params.autoPublish) {
      reasons.push(
        'BLOG_AUTO_PUBLISH no es exactamente "true"; el default seguro del pipeline es borrador',
      );
    }
    line('Por qué quedó como BORRADOR:');
    for (const reason of reasons) line(`  - ${reason}`);
  }

  if (params.ghostPost !== null) {
    line(`Post en Ghost:   ${params.ghostPost.id} (${params.ghostPost.url ?? 'sin url'})`);
  }
  line(`URLs marcadas:   ${params.markedUrls.length === 0 ? '(ninguna)' : params.markedUrls.join(', ')}`);
}

async function main(): Promise<number> {
  const cli = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();

  line(`Pipeline diario del blog — ${new Date(startedAt).toISOString()}`);
  if (cli.dryRun) line('Modo --dry-run: se hace todo menos escribir en Ghost.');

  // ---------------------------------------------------------------- 1. ingest
  heading('1. Ingesta de feeds');
  if (cli.tema !== undefined) {
    line(`Modo tema: "${cli.tema}" — ventana ampliada a ${TOPIC_WINDOW_DAYS} días.`);
  }
  const ingest = await ingestFeeds(
    cli.tema !== undefined ? { windowDays: TOPIC_WINDOW_DAYS } : {},
  );
  line(`Items dentro de la ventana: ${ingest.items.length} (feeds con datos: ${ingest.okCount})`);
  if (ingest.errors.length > 0) {
    line(`Feeds caídos (no bloquean la corrida): ${ingest.errors.length}`);
    for (const error of ingest.errors) {
      line(`  - ${error.source}: ${error.message}`);
    }
  }
  if (ingest.items.length === 0) {
    line();
    line('Ningún feed devolvió items recientes. No hay nada que publicar hoy.');
    return 0;
  }

  // ---------------------------------------------------------------- 2. select
  const covered = await loadCovered();
  line(`URLs ya cubiertas en memoria: ${covered.size}`);

  let candidates = ingest.items;
  if (cli.tema !== undefined) {
    heading('1b. Curaduría por tema');
    candidates = await filterByTopic(ingest.items, cli.tema);
    line(`Relevantes al tema: ${candidates.length} de ${ingest.items.length} items.`);
    if (candidates.length === 0) {
      line();
      line('Ninguna fuente tiene material fresco sobre ese tema. El pipeline no');
      line('escribe sin material verificable: probá con otro ángulo o en unos días.');
      return 0;
    }
  }

  // A requested topic produces one directed note; the daily run fans out.
  const selections = selectTopics(candidates, covered, {
    maxPosts: cli.tema !== undefined ? 1 : MAX_POSTS_PER_RUN,
  });
  if (selections.length === 0) {
    line();
    line(
      cli.tema !== undefined
        ? 'Lo relevante al tema ya estaba cubierto por notas anteriores.'
        : 'Todos los items recientes ya estaban cubiertos. Nada que hacer hoy.',
    );
    return 0;
  }
  line(
    selections.length === 1
      ? 'Historias para hoy: 1.'
      : `Historias para hoy: ${selections.length} — las extra tienen señal cruzada de 2+ feeds.`,
  );

  let config: GhostConfig | null = null;
  if (!cli.dryRun) {
    // Resolved up front: missing Ghost credentials should fail before we pay for
    // a generation we could never publish.
    config = resolveConfig();
  }

  let createdCount = 0;

  // Sequential on purpose. A failure mid-list exits non-zero so the runner
  // retries; stories already published are covered by then and skip, so the
  // retry picks up exactly where this run died.
  for (let index = 0; index < selections.length; index += 1) {
    const selection = selections[index]!;
    const label = `nota ${index + 1} de ${selections.length}`;
    heading(`═ Nota ${index + 1} de ${selections.length} ═`);
    printSelection(selection);

    // The URLs this story is allowed to burn: the chosen article and the other
    // feeds carrying the SAME story. `selection.related` may also hold merely
    // adjacent stories from other clusters — marking those would silently stop
    // the pipeline from ever writing about them.
    const coverableUrls = [
      selection.chosen.link,
      ...selection.sameStory.map((item) => item.link),
    ];

    // The slug is model output, so it differs run to run and cannot identify a
    // story. This key is derived from the source URL, so a re-run of a failed
    // job still recognises the story. Checked before generating so a duplicate
    // run costs no tokens.
    const storyKey = sourceKey(canonicalizeUrl(selection.chosen.link));

    if (config !== null) {
      const alreadyPublished = await findPostBySourceKey(storyKey, config);
      if (alreadyPublished !== null) {
        line(
          `Esta historia ya tiene un post en Ghost (id ${alreadyPublished.id}, slug "${alreadyPublished.slug}", estado ${alreadyPublished.status ?? 'n/d'}).`,
        );
        // Repair the dedup memory, which is what got lost in the first place.
        await markCovered(coverableUrls);
        line(`Memoria de dedup actualizada con ${coverableUrls.length} URL(s).`);
        continue;
      }
    }

    const generated = await generatePost(selection, { focus: cli.tema });
    printPost(generated.post);
    line(
      `Tokens: ${generated.usage.inputTokens} entrada / ${generated.usage.outputTokens} salida (stop: ${generated.stopReason ?? 'n/d'})`,
    );

    const gate = await verifyPost(generated.post);
    printGate(gate);

    const autoPublish = autoPublishEnabled();
    const status: PostStatus = decideStatus(gate.pass, autoPublish);

    let ghostPost: GhostPost | null = null;
    let markedUrls: string[] = [];

    if (cli.dryRun || config === null) {
      line(`DRY RUN: se habría creado el post como "${status}". No se tocó Ghost.`);
    } else {
      // Second idempotency layer: exact slug. Ghost would happily create a -2.
      const existing = await findPostBySlug(generated.post.slug, config);
      if (existing !== null) {
        line(`Ya existe un post con el slug "${generated.post.slug}" (id ${existing.id}, estado ${existing.status ?? 'n/d'}).`);
        line('Se omite la creación para no duplicar.');
        ghostPost = existing;
      } else {
        ghostPost = await createPost(
          {
            title: generated.post.title,
            slug: generated.post.slug,
            html: generated.post.html,
            featureImage: coverImageUrl(generated.post.title),
            // The internal #src-<hash> tag is what makes the next run idempotent.
            // Ghost keeps it on the post but never renders it on the front-end.
            tags: [...generated.post.tags, sourceTagName(storyKey)],
            customExcerpt: generated.post.customExcerpt,
            metaTitle: generated.post.title,
            metaDescription: generated.post.customExcerpt,
          },
          { status, config },
        );
        createdCount += 1;
        line(`Post creado con estado "${status}" (id ${ghostPost.id}).`);
        line(
          `Portada: ${coverImageUrl(generated.post.title) ?? 'omitida (falta NEXT_PUBLIC_SITE_URL)'}`,
        );

        // English twin: same story, deterministic `-en` slug, #lang-en tag.
        // A failure here must not undo the Spanish post — it logs, and the
        // backfill script (translate-existing) repairs the pair later.
        try {
          const twin = await ensureEnglishTwin(
            {
              title: generated.post.title,
              slug: generated.post.slug,
              html: generated.post.html,
              customExcerpt: generated.post.customExcerpt,
              tags: generated.post.tags,
              internalTags: [sourceTagName(storyKey)],
            },
            {
              status,
              config,
              featureImageFor: (titleEn) => coverImageUrl(titleEn, undefined, 'en'),
            },
          );
          if (twin.created !== null) {
            line(`Versión EN creada con estado "${status}" (id ${twin.created.id}, slug ${twin.created.slug ?? ''}).`);
          }
        } catch (error) {
          line(
            `Versión EN falló (la nota ES quedó bien): ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      }

      // Mark covered even when we skipped a duplicate: the story is handled.
      markedUrls = coverableUrls;
      await markCovered(markedUrls);
      line(`Memoria de dedup actualizada con ${markedUrls.length} URL(s).`);
    }

    printSummary({
      label,
      status: cli.dryRun ? 'ninguno' : status,
      gate,
      autoPublish,
      dryRun: cli.dryRun,
      ghostPost,
      markedUrls,
    });
  }

  // One flush at the end covers every post created above.
  if (!cli.dryRun && createdCount > 0) {
    line();
    line(`Revalidate: ${await triggerRevalidate()}`);
  }

  line();
  line(`Notas creadas: ${createdCount} de ${selections.length}.`);
  line(`Terminado en ${((Date.now() - startedAt) / 1000).toFixed(1)}s.`);
  return 0;
}

// Guarded so the module can be imported (and its policy helpers tested)
// without kicking off a real run.
if (require.main === module) {
  main()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error: unknown) => {
      line();
      if (error instanceof GenerationError) {
        line(`ERROR de generación: ${error.message}`);
      } else if (error instanceof GhostError) {
        line(`ERROR de Ghost: ${error.message}`);
        if (error.body !== undefined) line(`Respuesta: ${error.body}`);
      } else {
        line(
          `ERROR inesperado: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`,
        );
      }
      line('El pipeline no pudo completarse. No se publicó nada.');
      process.exitCode = 1;
    });
}
