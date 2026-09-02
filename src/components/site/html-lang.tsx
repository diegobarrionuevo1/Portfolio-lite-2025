"use client";

import { useEffect } from "react";
import type { Lang } from "@/lib/i18n";

/**
 * Only the root layout may render <html>, and it declares lang="es" — the
 * site's default. The /en subtree corrects the attribute after hydration so
 * assistive tech and translators read the page in the right language, and
 * restores the default when the visitor navigates back out.
 */
export function HtmlLang({ lang }: { lang: Lang }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [lang]);
  return null;
}
