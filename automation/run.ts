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
import { selectTopic, type Selection } from './select';
import { canonicalizeUrl, loadCovered, markCovered } from './state';
import { verifyPost, type VerifyResult } from './verify';

const REVALIDATE_TIMEOUT_MS = 10_000;

interface Cli {
  dryRun: boolean;
}

function parseArgs(argv: readonly string[]): Cli {
  return { dryRun: argv.includes('--dry-run') };
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
): string | undefined {
  const base = (siteUrl ?? '').trim().replace(/\/+$/, '');
  if (base === '') return undefined;
  return `${base}/api/og?title=${encodeURIComponent(title)}`;
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
  status: PostStatus | 'ninguno';
  gate: VerifyResult;
  autoPublish: boolean;
  dryRun: boolean;
  ghostPost: GhostPost | null;
  revalidate: string;
  markedUrls: readonly string[];
}): void {
  heading('Resumen');
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
  line(`Revalidate:      ${params.revalidate}`);
  line(`URLs marcadas:   ${params.markedUrls.length === 0 ? '(ninguna)' : params.markedUrls.join(', ')}`);
}

async function main(): Promise<number> {
  const cli = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();

  line(`Pipeline diario del blog — ${new Date(startedAt).toISOString()}`);
  if (cli.dryRun) line('Modo --dry-run: se hace todo menos escribir en Ghost.');

  // ---------------------------------------------------------------- 1. ingest
  heading('1. Ingesta de feeds');
  const ingest = await ingestFeeds();
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

  const selection = selectTopic(ingest.items, covered);
  if (selection === null) {
    line();
    line('Todos los items recientes ya estaban cubiertos. Nada que hacer hoy.');
    return 0;
  }
  printSelection(selection);

  // The URLs this run is allowed to burn: the chosen article and the other feeds
  // carrying the SAME story. `selection.related` may also hold merely adjacent
  // stories from other clusters — marking those would silently stop us from ever
  // writing about them.
  const coverableUrls = [
    selection.chosen.link,
    ...selection.sameStory.map((item) => item.link),
  ];

  // ------------------------------------------------- 2b. idempotencia en Ghost
  // The slug is model output, so it differs run to run and cannot identify a
  // story. This key is derived from the source URL, so a re-run of a failed job
  // (which checks out the repo BEFORE the covered.json commit, i.e. with an empty
  // dedup memory) still recognises the story. Checked before generating so a
  // duplicate run costs no API tokens.
  const storyKey = sourceKey(canonicalizeUrl(selection.chosen.link));
  let config: GhostConfig | null = null;

  if (!cli.dryRun) {
    // Resolved up front: missing Ghost credentials should fail before we pay for
    // a generation we could never publish.
    config = resolveConfig();
    const alreadyPublished = await findPostBySourceKey(storyKey, config);
    if (alreadyPublished !== null) {
      line();
      line(
        `Esta historia ya tiene un post en Ghost (id ${alreadyPublished.id}, slug "${alreadyPublished.slug}", estado ${alreadyPublished.status ?? 'n/d'}).`,
      );
      line('Corrida idempotente: no se genera ni se publica nada.');
      // Repair the dedup memory, which is what got lost in the first place.
      await markCovered(coverableUrls);
      line(`Memoria de dedup actualizada con ${coverableUrls.length} URL(s).`);
      return 0;
    }
  }

  // -------------------------------------------------------------- 3. generate
  const generated = await generatePost(selection);
  printPost(generated.post);
  line(
    `Tokens: ${generated.usage.inputTokens} entrada / ${generated.usage.outputTokens} salida (stop: ${generated.stopReason ?? 'n/d'})`,
  );

  // ---------------------------------------------------------------- 4. verify
  const gate = await verifyPost(generated.post);
  printGate(gate);

  const autoPublish = autoPublishEnabled();
  const status: PostStatus = decideStatus(gate.pass, autoPublish);

  // --------------------------------------------------------------- 5. publish
  heading('5. Publicación');
  let ghostPost: GhostPost | null = null;
  let markedUrls: string[] = [];
  let revalidate = 'omitido (dry run)';

  if (cli.dryRun || config === null) {
    line(`DRY RUN: se habría creado el post como "${status}". No se tocó Ghost.`);
    line('DRY RUN: no se marcaron URLs como cubiertas.');
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
      line(`Post creado con estado "${status}" (id ${ghostPost.id}).`);
      line(
        `Portada: ${coverImageUrl(generated.post.title) ?? 'omitida (falta NEXT_PUBLIC_SITE_URL)'}`,
      );
    }

    // Mark covered even when we skipped a duplicate: the story is handled.
    markedUrls = coverableUrls;
    await markCovered(markedUrls);
    line(`Memoria de dedup actualizada con ${markedUrls.length} URL(s).`);

    revalidate = await triggerRevalidate();
    line(`Revalidate: ${revalidate}`);
  }

  printSummary({
    status: cli.dryRun ? 'ninguno' : status,
    gate,
    autoPublish,
    dryRun: cli.dryRun,
    ghostPost,
    revalidate,
    markedUrls,
  });

  line();
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
