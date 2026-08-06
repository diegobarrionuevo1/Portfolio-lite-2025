"use client";

import { useEffect, useRef, useState } from "react";
import { Button, ScrollCue, Marquee } from "@/components/ds";

const MONO_ROW: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase",
};

const clipWrap: React.CSSProperties = {
  display: "inline-block",
  overflow: "hidden",
  verticalAlign: "bottom",
};

export const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const start = () => !cancelled && setReady(true);
    // Wait for fonts so there is no metric jump on the display type.
    if ("fonts" in document) {
      (document as Document).fonts.ready.then(start);
    } else {
      start();
    }
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <header
      ref={ref}
      id="top"
      className={`hero${ready ? " is-ready" : ""}`}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        gap: "var(--space-8)",
        minHeight: "calc(100svh - var(--nav-h))",
        padding: "var(--space-10) var(--page-margin) var(--space-8)",
      }}
    >
      {/* 1 — mono meta row, staggered clip reveal */}
      <div
        style={{
          ...MONO_ROW,
          display: "flex",
          gap: "var(--space-5)",
          flexWrap: "wrap",
          color: "var(--text-muted)",
        }}
      >
        <span style={clipWrap}>
          <span data-hero style={{ color: "var(--text-accent)" }}>
            2022 — 2026
          </span>
        </span>
        <span style={clipWrap}>
          <span data-hero style={{ transitionDelay: "70ms" }}>
            Córdoba, Argentina
          </span>
        </span>
        <span style={clipWrap}>
          <span data-hero style={{ transitionDelay: "140ms" }}>
            Remoto
          </span>
        </span>
      </div>

      {/* 2 — the wordmark: grotesque + serif italic on the same block */}
      <h1
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-display-1)",
          fontWeight: 500,
          letterSpacing: "var(--ls-display-1)",
          lineHeight: "var(--lh-display)",
          textWrap: "balance",
        }}
      >
        <span
          style={{
            display: "block",
            overflow: "hidden",
            paddingBottom: "0.06em",
            marginBottom: "-0.06em",
          }}
        >
          <span data-hero style={{ display: "block", transitionDelay: "120ms" }}>
            Diego
          </span>
        </span>
        <span
          style={{
            display: "block",
            overflow: "hidden",
            paddingBottom: "0.06em",
            marginBottom: "-0.06em",
          }}
        >
          <span
            data-hero
            style={{
              display: "block",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              letterSpacing: 0,
              transitionDelay: "200ms",
            }}
          >
            Barrionuevo
          </span>
        </span>
      </h1>

      {/* 3 — role, lede, CTAs */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "var(--space-9)",
        }}
      >
        <div
          style={{
            flex: "1 1 420px",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-5)",
          }}
        >
          <div
            data-hero-rise
            style={{
              ...MONO_ROW,
              color: "var(--text-secondary)",
              transitionDelay: "260ms",
            }}
          >
            Desarrollador de software full stack
          </div>
          <p
            data-hero-rise
            style={{
              margin: 0,
              maxWidth: "var(--measure-lede)",
              fontSize: "var(--fs-body-lg)",
              lineHeight: "var(--lh-body)",
              letterSpacing: "var(--ls-lede)",
              color: "var(--text-secondary)",
              textWrap: "pretty",
              transitionDelay: "320ms",
            }}
          >
            Construyo productos, automatizaciones e integraciones que resuelven
            procesos reales de negocio — del relevamiento al deploy.
          </p>
        </div>
        <div
          data-hero-rise
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--space-3)",
            transitionDelay: "380ms",
          }}
        >
          <Button variant="primary" arrow href="#work">
            Ver trabajo
          </Button>
          <Button variant="outline" href="/cv-diego-barrionuevo.pdf" download="Diego Barrionuevo - CV.pdf">
            Descargar CV
          </Button>
        </div>
      </div>

      {/* 4 — hairline + 5 — cue and socials */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-5)",
          paddingTop: "var(--space-6)",
        }}
      >
        <span
          aria-hidden="true"
          data-hero-line
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: "var(--border-hairline)",
          }}
        />
        <span data-hero-rise style={{ display: "inline-block", transitionDelay: "460ms" }}>
          <ScrollCue href="#work">Resultados e impacto</ScrollCue>
        </span>
        <div
          data-hero-rise
          style={{
            ...MONO_ROW,
            display: "flex",
            gap: "var(--space-5)",
            color: "var(--text-muted)",
            transitionDelay: "520ms",
          }}
        >
          <a
            href="https://github.com/diegobarrionuevo1"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--text-muted)" }}
          >
            GitHub ↗
          </a>
          <a
            href="https://www.linkedin.com/in/diegobarrionuevo11/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--text-muted)" }}
          >
            LinkedIn ↗
          </a>
        </div>
      </div>

      {/* Stack marquee — bridges hero into the impact band */}
      <div
        style={{
          padding: "var(--space-7) 0",
          borderTop: "1px solid var(--border-hairline)",
          borderBottom: "1px solid var(--border-hairline)",
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-title-2)",
          fontWeight: 500,
          letterSpacing: "var(--ls-display-3)",
          color: "var(--text-primary)",
        }}
      >
        <Marquee
          speed={34}
          gap="var(--space-9)"
          items={[
            "TypeScript",
            "Node.js",
            "React",
            "Next.js",
            "PostgreSQL",
            "Docker",
            "Redis",
            "Directus",
          ]}
        />
      </div>
    </header>
  );
};
