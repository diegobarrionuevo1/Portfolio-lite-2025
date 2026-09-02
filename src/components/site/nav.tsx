"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Badge, Button } from "@/components/ds";
import { nightState } from "./night";

import { blogHref, homeHref, type Lang } from "@/lib/i18n";

const COPY = {
  es: {
    sections: [
      { label: "Trabajo", id: "work" },
      { label: "Stack", id: "stack" },
      { label: "Sobre mí", id: "about" },
    ],
    blog: "Blog",
    badge: "Disponible para proyectos",
    cta: "Contactame",
    menu: "Menú",
    close: "Cerrar",
    switchLabel: "EN",
    switchAria: "Read in English",
  },
  en: {
    sections: [
      { label: "Work", id: "work" },
      { label: "Stack", id: "stack" },
      { label: "About", id: "about" },
    ],
    blog: "Blog",
    badge: "Available for projects",
    cta: "Contact me",
    menu: "Menu",
    close: "Close",
    switchLabel: "ES",
    switchAria: "Leer en español",
  },
} as const;

/** The same page in the other language, by URL shape alone. */
function switchHref(pathname: string, lang: Lang): string {
  if (lang === "en") {
    const stripped = pathname.replace(/^\/en(?=\/|$)/, "");
    return stripped === "" ? "/" : stripped;
  }
  return pathname === "/" ? "/en" : `/en${pathname}`;
}

const wordmark = (
  <>
    Diego
    <em
      style={{
        fontFamily: "var(--font-serif)",
        fontStyle: "italic",
        fontWeight: 400,
        letterSpacing: 0,
        color: "inherit",
      }}
    >
      Barrionuevo
    </em>
  </>
);

const wordmarkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontFamily: "var(--font-display)",
  fontSize: "1.375rem",
  fontWeight: 600,
  letterSpacing: "-0.03em",
};

export function Nav({ lang = "es" }: { lang?: Lang } = {}) {
  const barRef = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const hovered = useRef<Set<number>>(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  // The section links are in-page anchors that only exist on the home page.
  // Anywhere else they must become absolute links back to it, and the
  // scroll-spy has nothing to observe.
  const pathname = usePathname();
  const copy = COPY[lang];
  // Stable per language so the scroll-spy effect can list it as a dependency
  // without re-subscribing on every render.
  const LINKS = useMemo(
    () => [...copy.sections, { label: copy.blog, id: "blog" }],
    [copy],
  );
  const home = homeHref(lang);
  const isHome = pathname === home;
  const href = (id: string) =>
    id === "blog" ? blogHref(lang) : isHome ? `#${id}` : `${home}#${id}`;

  // Below 860px the inline links are hidden and this sheet is the only way to
  // reach anything but the contact CTA. It lives outside the blend layer: the
  // nav paints with mix-blend-mode: difference, which would invert the sheet
  // against whatever happens to sit behind it.
  useEffect(() => {
    if (!menuOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // A same-page anchor does not remount anything, so the sheet has to be told
  // to close on navigation as well as on tap.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const bar = barRef.current;
    const header = headerRef.current;
    const badge = badgeRef.current;
    const band = document.querySelector<HTMLElement>("[data-band]");
    const sections = LINKS.map((l) => document.getElementById(l.id));

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;

        const stuck = y > 40;
        if (header) {
          const navH = header.getBoundingClientRect().height || 72;
          const bandR = band?.getBoundingClientRect();
          const overBand = !!bandR && bandR.top <= navH * 0.5 && bandR.bottom >= navH * 0.5;
          const onDark = (nightState.p > 0.5) !== overBand;
          header.setAttribute("data-theme", onDark ? "dark" : "light");
          header.style.borderBottomColor = stuck ? "var(--border-hairline)" : "transparent";
        }

        const badgeOn = !stuck && window.innerWidth >= 1180;
        if (badge) badge.style.display = badgeOn ? "inline-flex" : "none";

        let active = -1;
        sections.forEach((s, i) => {
          if (s && s.getBoundingClientRect().top <= window.innerHeight * 0.4) active = i;
        });
        linkRefs.current.forEach((l, i) => {
          if (!l) return;
          const on = i === active;
          l.style.color = on ? "var(--bone-50)" : "#b8b8b8";
          const w = l.querySelector<HTMLElement>(".nav-link__wipe");
          if (w && !hovered.current.has(i)) w.style.right = on ? "0%" : "100%";
          if (on) l.setAttribute("aria-current", "true");
          else l.removeAttribute("aria-current");
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [LINKS]);

  const onEnter = (i: number) => {
    hovered.current.add(i);
    const l = linkRefs.current[i];
    if (!l) return;
    l.style.color = "var(--bone-50)";
    const w = l.querySelector<HTMLElement>(".nav-link__wipe");
    if (w) w.style.right = "0%";
  };
  const onLeave = (i: number) => {
    hovered.current.delete(i);
    const l = linkRefs.current[i];
    if (!l) return;
    if (!l.hasAttribute("aria-current")) {
      l.style.color = "#b8b8b8";
      const w = l.querySelector<HTMLElement>(".nav-link__wipe");
      if (w) w.style.right = "100%";
    }
  };

  return (
    <>
      {/* Progress bar */}
      <div
        aria-hidden="true"
        style={{ position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 70, pointerEvents: "none" }}
      >
        <span
          ref={barRef}
          style={{
            display: "block",
            height: "100%",
            background: "var(--border-accent)",
            transform: "scaleX(0)",
            transformOrigin: "0 50%",
          }}
        />
      </div>

      {/* Inverted blend layer — real wordmark + links */}
      <div
        data-navblend
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 51,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-6)",
          height: "var(--nav-h)",
          padding: "0 var(--page-margin)",
          color: "var(--bone-50)",
          mixBlendMode: "difference",
          pointerEvents: "none",
        }}
      >
        <a
          href={isHome ? "#top" : home}
          style={{ ...wordmarkStyle, pointerEvents: "auto", color: "var(--bone-50)" }}
        >
          {wordmark}
        </a>
        <div className="nav-links">
          {LINKS.map((l, i) => (
            <a
              key={l.id}
              href={href(l.id)}
              className="nav-link"
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              onMouseEnter={() => onEnter(i)}
              onFocus={() => onEnter(i)}
              onMouseLeave={() => onLeave(i)}
              onBlur={() => onLeave(i)}
            >
              {l.label}
              <span className="nav-link__wipe" aria-hidden="true" />
            </a>
          ))}
        </div>
        {/* Ghost of the right cluster — keeps the blend layer balanced */}
        <span aria-hidden="true" style={{ visibility: "hidden", display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--space-2)",
              minHeight: 36,
              padding: "0 var(--space-4)",
              fontFamily: "var(--font-sans)",
              fontSize: "var(--fs-label)",
              fontWeight: 500,
            }}
          >
            {copy.cta} ↗
          </span>
        </span>
      </div>

      {/* Real sticky header — invisible ghosts reserve layout, CTA is visible & outside the blend */}
      <nav
        ref={headerRef}
        data-header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-6)",
          height: "var(--nav-h)",
          padding: "0 var(--page-margin)",
          borderBottom: "1px solid transparent",
          transition: "background 320ms cubic-bezier(.16,1,.3,1),border-color 320ms ease",
        }}
      >
        <span aria-hidden="true" style={{ ...wordmarkStyle, alignItems: "baseline", visibility: "hidden" }}>
          {wordmark}
        </span>
        <div aria-hidden="true" className="nav-links-ghost" style={{ visibility: "hidden" }}>
          {LINKS.map((l) => (
            <span key={l.id}>{l.label}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <span ref={badgeRef} style={{ display: "none" }}>
            <Badge tone="accent" live>{copy.badge}</Badge>
          </span>
          <a
            className="nav-lang"
            href={switchHref(pathname, lang)}
            aria-label={copy.switchAria}
          >
            {copy.switchLabel}
          </a>
          <button
            type="button"
            className="nav-menu-btn"
            aria-expanded={menuOpen}
            aria-controls="nav-sheet"
            onClick={() => setMenuOpen(true)}
          >
            {copy.menu}
          </button>
          <span className="nav-cta">
            <Button size="sm" variant="accent" arrow href="#contact">{copy.cta}</Button>
          </span>
        </div>
      </nav>

      <div
        id="nav-sheet"
        className="nav-sheet"
        data-open={menuOpen ? "true" : undefined}
        hidden={!menuOpen}
      >
        <div className="nav-sheet__top">
          <button type="button" className="nav-menu-btn" onClick={() => setMenuOpen(false)}>
            {copy.close}
          </button>
        </div>
        <div className="nav-sheet__links">
          {LINKS.map((l) => (
            <a key={l.id} href={href(l.id)} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
        </div>
        <div className="nav-sheet__foot">
          <Badge tone="accent" live>{copy.badge}</Badge>
          <Button
            size="lg"
            variant="accent"
            arrow
            href="#contact"
            onClick={() => setMenuOpen(false)}
          >{copy.cta}</Button>
        </div>
      </div>
    </>
  );
}
