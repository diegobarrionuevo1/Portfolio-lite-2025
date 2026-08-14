/** Small helpers shared by the blog index and the article page. */

export const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase",
};

export function postHref(slug: string): string {
  return `/blog/${slug}`;
}

/** "10 de agosto de 2026" — es-AR, stable between server and client (UTC). */
export function formatDate(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-AR", {
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
