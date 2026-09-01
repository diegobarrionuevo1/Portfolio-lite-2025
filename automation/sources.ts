/**
 * Verified RSS/Atom feed catalogue for the daily blog pipeline.
 *
 * Every URL here was curl-checked (HTTP 200 + XML body). Feeds that were found
 * broken are listed at the bottom as `BROKEN_SOURCES` so nobody re-adds them.
 *
 * `fullContent: true` means the feed ships the whole article (content:encoded or
 * Atom xhtml content). Those are worth more to the selector, because the model
 * gets real material to react to instead of a two-line teaser.
 */

export type SourceCategory = 'ai' | 'webdev' | 'devtools' | 'aggregator' | 'startups' | 'es';

export type SourceLang = 'en' | 'es';

export interface Source {
  readonly name: string;
  readonly url: string;
  readonly category: SourceCategory;
  /** Feed ships the full article body, not just a summary. */
  readonly fullContent: boolean;
  readonly lang: SourceLang;
}

export const SOURCES: readonly Source[] = [
  // ---------------------------------------------------------------- full text
  {
    name: 'Vercel News',
    url: 'https://vercel.com/atom',
    category: 'webdev',
    fullContent: true,
    lang: 'en',
  },
  {
    name: 'GitHub Blog',
    url: 'https://github.blog/feed/',
    category: 'devtools',
    fullContent: true,
    lang: 'en',
  },
  {
    name: 'GitHub Changelog',
    url: 'https://github.blog/changelog/feed/',
    category: 'devtools',
    fullContent: true,
    lang: 'en',
  },
  {
    name: 'Cloudflare Blog',
    url: 'https://blog.cloudflare.com/rss/',
    category: 'devtools',
    fullContent: true,
    lang: 'en',
  },
  {
    name: 'Docker Blog',
    url: 'https://www.docker.com/blog/feed/',
    category: 'devtools',
    fullContent: true,
    lang: 'en',
  },
  {
    name: 'Hipertextual',
    url: 'https://hipertextual.com/feed',
    category: 'es',
    fullContent: true,
    lang: 'es',
  },
  {
    name: 'La Nación Tecno',
    url: 'https://www.lanacion.com.ar/arc/outboundfeeds/rss/category/tecnologia/',
    category: 'es',
    fullContent: true,
    lang: 'es',
  },

  // ------------------------------------------------------------- summary only
  {
    name: 'OpenAI News',
    url: 'https://openai.com/news/rss.xml',
    category: 'ai',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    category: 'ai',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'Google DeepMind',
    url: 'https://deepmind.google/blog/rss.xml',
    category: 'ai',
    fullContent: false,
    lang: 'en',
  },
  {
    // Best single source of Claude / LLM practitioner coverage.
    name: 'Simon Willison',
    url: 'https://simonwillison.net/atom/everything/',
    category: 'ai',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    category: 'ai',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'Next.js Blog',
    url: 'https://nextjs.org/feed.xml',
    category: 'webdev',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'React Blog',
    url: 'https://react.dev/rss.xml',
    category: 'webdev',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'Lobsters',
    url: 'https://lobste.rs/rss',
    category: 'aggregator',
    fullContent: false,
    lang: 'en',
  },
  {
    // points filter is the noise control — unfiltered HN front page is unusable.
    name: 'Hacker News (200+)',
    url: 'https://hnrss.org/frontpage?points=200',
    category: 'aggregator',
    fullContent: false,
    lang: 'en',
  },
  {
    // Substack newsletters ship the full body in the feed. Import AI is Jack
    // Clark (Anthropic co-founder) and covers Chinese AI labs every week —
    // the closest verifiable thing to following the industry's executives.
    name: 'Import AI',
    url: 'https://importai.substack.com/feed',
    category: 'ai',
    fullContent: true,
    lang: 'en',
  },
  {
    name: 'ChinAI',
    url: 'https://chinai.substack.com/feed',
    category: 'ai',
    fullContent: true,
    lang: 'en',
  },
  {
    name: 'Interconnects',
    url: 'https://www.interconnects.ai/feed',
    category: 'ai',
    fullContent: true,
    lang: 'en',
  },
  {
    name: 'Latent Space',
    url: 'https://www.latent.space/feed',
    category: 'ai',
    fullContent: true,
    lang: 'en',
  },
  {
    name: 'One Useful Thing',
    url: 'https://www.oneusefulthing.org/feed',
    category: 'ai',
    fullContent: true,
    lang: 'en',
  },
  {
    name: 'Hugging Face Blog',
    url: 'https://huggingface.co/blog/feed.xml',
    category: 'ai',
    fullContent: false,
    lang: 'en',
  },
  {
    // Alibaba's Qwen team — first-party feed from a Chinese lab.
    name: 'Qwen Blog',
    url: 'https://qwenlm.github.io/blog/index.xml',
    category: 'ai',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'The Verge AI',
    url: 'https://www.theverge.com/rss/ai-artificial-intelligence/index.xml',
    category: 'ai',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'Ars Technica AI',
    url: 'https://arstechnica.com/ai/feed/',
    category: 'ai',
    fullContent: false,
    lang: 'en',
  },
  {
    // Executive announcements made on X surface here within hours.
    name: 'Techmeme',
    url: 'https://www.techmeme.com/feed.xml',
    category: 'aggregator',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'TechCrunch Startups',
    url: 'https://techcrunch.com/category/startups/feed/',
    category: 'startups',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'Y Combinator Blog',
    url: 'https://www.ycombinator.com/blog/rss',
    category: 'startups',
    fullContent: false,
    lang: 'en',
  },
  {
    // Weekly articles are free and in the feed; daily updates are paywalled.
    name: 'Stratechery',
    url: 'https://stratechery.com/feed/',
    category: 'startups',
    fullContent: false,
    lang: 'en',
  },
  {
    name: 'Xataka',
    url: 'https://www.xataka.com/feedburner.xml',
    category: 'es',
    fullContent: false,
    lang: 'es',
  },
  {
    name: 'WIRED en Español',
    url: 'https://es.wired.com/feed/rss',
    category: 'es',
    fullContent: false,
    lang: 'es',
  },
];

/**
 * Feeds that were verified BROKEN. Documented so they do not get re-added.
 * Anthropic publishes no news/blog RSS feed at all — every path 404s.
 */
export const BROKEN_SOURCES: ReadonlyArray<{ name: string; reason: string }> = [
  { name: 'Genbeta (feedburner)', reason: 'abandoned, newest item is from Dec 2025' },
  { name: 'Infobae america/tecno', reason: '404' },
  { name: 'LangChain blog', reason: 'returns text/html, not XML' },
  { name: 'DesdeLinux', reason: 'connection times out' },
  { name: 'Anthropic news/blog', reason: 'no RSS feed exists — every path 404s' },
  { name: 'Meta AI blog', reason: 'ai.meta.com/blog/rss/ serves HTML, no feed' },
  { name: 'Microsoft AI blog', reason: 'blogs.microsoft.com/ai/feed/ serves HTML' },
  { name: 'Mistral', reason: 'no feed found — mistral.ai/feed.xml serves HTML' },
  { name: 'a16z', reason: 'a16z.com/feed/ serves HTML, likely UA-gated' },
];

export function sourceByName(name: string): Source | undefined {
  return SOURCES.find((s) => s.name === name);
}
