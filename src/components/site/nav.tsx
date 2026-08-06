"use client";

import { useEffect, useRef } from "react";
import { Badge, Button } from "@/components/ds";
import { nightState } from "./night";

const LINKS = [
  { href: "#work", label: "Trabajo", id: "work" },
  { href: "#stack", label: "Stack", id: "stack" },
  { href: "#about", label: "Sobre mí", id: "about" },
];

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

export function Nav() {
  const barRef = useRef<HTMLSpanElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const hovered = useRef<Set<number>>(new Set());

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
  }, []);

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
        <a href="#top" style={{ ...wordmarkStyle, pointerEvents: "auto", color: "var(--bone-50)" }}>
          {wordmark}
        </a>
        <div className="nav-links">
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
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
            Contactame ↗
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
            <span key={l.href}>{l.label}</span>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-4)" }}>
          <span ref={badgeRef} style={{ display: "none" }}>
            <Badge tone="accent" live>
              Disponible para proyectos
            </Badge>
          </span>
          <Button size="sm" variant="accent" arrow href="#contact">
            Contactame
          </Button>
        </div>
      </nav>
    </>
  );
}
