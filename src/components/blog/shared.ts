/** Small helpers shared by the blog index and the article page. */

import { dateLocale, postHrefFor, type Lang } from "@/lib/i18n";

export const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase",
};

export function postHref(slug: string, lang: Lang = "es"): string {
  return postHrefFor(slug, lang);
}

/** "10 de agosto de 2026" / "August 10, 2026" — stable between server and client (UTC). */
export function formatDate(iso: string | null, lang: Lang = "es"): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString(dateLocale[lang], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Absolute site URL, used for canonicals, OG tags, RSS and JSON-LD. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://diegobarrionuevo.com").replace(/\/$/, "");
}
