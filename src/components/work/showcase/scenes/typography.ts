/**
 * Shared text styles and small helpers for the showcase scenes. Every value
 * is a design-system token; the atmosphere scope resolves the colours.
 */
import type { CSSProperties } from "react";
import { mono } from "@/components/blog/shared";

export { mono };

/** Mono caps in the accent: the one strong colour a scene gets. */
export const kicker: CSSProperties = { ...mono, color: "var(--text-accent)" };

export const chapterTitle: CSSProperties = {
  margin: 0,
  maxWidth: "18ch",
  fontFamily: "var(--font-display)",
  fontSize: "var(--fs-title-1)",
  fontWeight: "var(--fw-display)",
  letterSpacing: "var(--ls-title)",
  lineHeight: "var(--lh-snug)",
  textWrap: "balance",
};

export const prose: CSSProperties = {
  margin: 0,
  maxWidth: "var(--measure-prose)",
  fontSize: "var(--fs-body)",
  lineHeight: "var(--lh-body)",
  color: "var(--text-secondary)",
  textWrap: "pretty",
};

/** A chapter fact: display face at title-2. */
export const factValue: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: "var(--fs-title-2)",
  fontWeight: "var(--fw-display)",
  letterSpacing: "var(--ls-title)",
  lineHeight: "var(--lh-snug)",
};

/** A metrics-band stat: display face at display-3. */
export const statValue: CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: "var(--fs-display-3)",
  fontWeight: "var(--fw-display)",
  letterSpacing: "var(--ls-display-3)",
  lineHeight: "var(--lh-tight)",
};

export const factLabel: CSSProperties = { ...mono, margin: 0, color: "var(--text-muted)" };

/**
 * reveal.tsx's countUp writes `prefix + Math.round(n)` with no thousands
 * separator, so only values that render identically are animated: an
 * optional "+" and up to three digits. Everything else (1.700, 100%, text)
 * renders static. Returns the attributes to spread on the value element.
 */
export function countAttrs(value: string): { "data-count": string; "data-prefix"?: string } | undefined {
  const match = /^(\+?)(\d{1,3})$/.exec(value.trim());
  if (!match) return undefined;
  return match[1] ? { "data-count": match[2], "data-prefix": match[1] } : { "data-count": match[2] };
}

export function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** "01", "07": the gallery counter format. */
export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}
