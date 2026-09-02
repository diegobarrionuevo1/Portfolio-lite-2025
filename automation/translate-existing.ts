/**
 * Backfill: create the English twin for every published Spanish post that
 * does not have one yet.
 *
 *   pnpm blog:translate           # all missing twins, created as drafts
 *
 * Twins arrive as DRAFTS regardless of the Spanish status: a bulk backfill
 * should never publish anything by itself — the author reviews each one, the
 * same deal as every other draft this system produces.
 */
import { runClaudeCli } from './generate';
import { mintToken, resolveConfig } from './publish';
import { coverImageUrl } from './run';
import { EN_SLUG_SUFFIX, ensureEnglishTwin } from './translate';

interface AdminPost {
  id: string;
  title: string;
  slug: string;
  html: string | null;
  custom_excerpt: string | null;
  excerpt?: string | null;
  status: string;
  tags?: Array<{ name: string; visibility: string }>;
}

async function fetchPublishedSpanishPosts(): Promise<AdminPost[]> {
  const config = resolveConfig();
  const posts: AdminPost[] = [];
  let page = 1;
  for (;;) {
    const url =
      `${config.adminUrl}/ghost/api/admin/posts/?formats=html&include=tags` +
      `&filter=${encodeURIComponent('status:published+tag:-hash-lang-en')}&limit=25&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Ghost ${mintToken(config.adminApiKey)}` },
    });
    if (!res.ok) throw new Error(`Admin API ${res.status}: ${await res.text()}`);
    const data = (await res.json()) as {
      posts: AdminPost[];
      meta: { pagination: { next: number | null } };
    };
    posts.push(...data.posts);
    if (data.meta.pagination.next === null) return posts;
    page = data.meta.pagination.next;
  }
}

async function main(): Promise<number> {
  const config = resolveConfig();
  const all = await fetchPublishedSpanishPosts();
  process.stdout.write(`Posts ES publicados: ${all.length}\n`);

  let created = 0;
  let skipped = 0;
  for (const post of all) {
    if (post.slug.endsWith(EN_SLUG_SUFFIX)) continue; // safety, filter should cover it
    const publicTags = (post.tags ?? [])
      .filter((tag) => tag.visibility === 'public')
      .map((tag) => tag.name);
    const internalTags = (post.tags ?? [])
      .filter((tag) => tag.visibility === 'internal' && tag.name.startsWith('#src-'))
      .map((tag) => tag.name);

    process.stdout.write(`\n→ ${post.slug}\n`);
    const twin = await ensureEnglishTwin(
      {
        title: post.title,
        slug: post.slug,
        html: post.html ?? '',
        customExcerpt: post.custom_excerpt ?? post.excerpt ?? '',
        tags: publicTags,
        internalTags,
      },
      {
        status: 'draft',
        config,
        featureImageFor: (titleEn) => coverImageUrl(titleEn, undefined, 'en'),
        runner: runClaudeCli,
      },
    );
    if (twin.existing !== null) {
      skipped += 1;
      process.stdout.write(`  ya tenía gemela (id ${twin.existing.id}) — salteado\n`);
    } else if (twin.created !== null) {
      created += 1;
      process.stdout.write(`  EN creada como borrador: ${twin.created.slug ?? ''} (id ${twin.created.id})\n`);
    }
  }
  process.stdout.write(`\nGemelas creadas: ${created} · salteadas: ${skipped}\n`);
  return 0;
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    process.stderr.write(`ERROR: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  },
);
