import { Button, SectionLabel } from "@/components/ds";
import type { Lang } from "@/lib/i18n";
import { Clock } from "@/components/site/clock";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps-tight)",
  textTransform: "uppercase",
  color: "var(--text-muted)",
};

const em: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontStyle: "italic",
  fontWeight: 400,
  letterSpacing: 0,
};


const COPY = {
  es: {
    aside: "Ingeniero en Sistemas",
    heading: "Sobre mí",
    h2a: "Convierto procesos manuales en ",
    h2em: "sistemas que un equipo usa todos los días",
    p1: "Soy desarrollador full stack con formación en Ingeniería en Sistemas y experiencia construyendo aplicaciones para empresas, startups y productos propios.",
    p2: "Me interesan los proyectos donde tengo que entender el problema, diseñar la solución, conectar servicios y llevar el producto hasta producción. Puedo trabajar solo o integrarme a un equipo y hacerme cargo de una parte completa del producto.",
    degree: "Ingeniería en Sistemas de Información",
    uni: "Universidad Tecnológica Nacional — Córdoba · 2018 — 2022",
  },
  en: {
    aside: "Systems Engineer",
    heading: "About me",
    h2a: "I turn manual processes into ",
    h2em: "systems a team uses every day",
    p1: "I'm a full-stack developer with a Systems Engineering background and experience building applications for companies, startups and my own products.",
    p2: "I'm drawn to projects where I have to understand the problem, design the solution, connect services and take the product all the way to production. I can work solo, or join a team and own a complete part of the product.",
    degree: "Information Systems Engineering",
    uni: "Universidad Tecnológica Nacional — Córdoba · 2018 — 2022",
  },
} as const;

export function About({ lang = "es" }: { lang?: Lang } = {}) {
  const copy = COPY[lang];
  return (
    <section
      id="about"
      className="band-bleed"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))",
        gap: "var(--space-9)",
        alignItems: "start",
        padding: "var(--section-y) var(--page-margin)",
        ["--band-bg" as string]: "var(--surface-sunken)",
      }}
    >
      <div data-reveal style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 400 }}>
        <figure className="media-frame" style={{ margin: 0, aspectRatio: "4 / 5" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/me.jpeg" alt="Diego Barrionuevo" />
          <span className="media-frame__grain" aria-hidden="true" />
        </figure>
        <div style={{ ...mono, display: "flex", justifyContent: "space-between", gap: "var(--space-4)" }}>
          <span>Córdoba, Argentina</span>
          <span>
            GMT−3 · <Clock />
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <SectionLabel index="05" aside={copy.aside}>
          {copy.heading}
        </SectionLabel>
        <p
          data-reveal
          style={{
            margin: 0,
            maxWidth: "var(--measure-display)",
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-display-3)",
            fontWeight: 500,
            letterSpacing: "var(--ls-display-3)",
            lineHeight: "var(--lh-tight)",
            textWrap: "balance",
          }}
        >
          {copy.h2a}
          <em style={em}>{copy.h2em}</em>
        </p>
        <p
          data-reveal
          data-delay="80"
          style={{
            margin: 0,
            maxWidth: "var(--measure-prose)",
            fontSize: "var(--fs-body-lg)",
            lineHeight: "var(--lh-body)",
            letterSpacing: "var(--ls-lede)",
            color: "var(--text-secondary)",
            textWrap: "pretty",
          }}
        >
          {copy.p1}
        </p>
        <p
          data-reveal
          data-delay="140"
          style={{
            margin: 0,
            maxWidth: "var(--measure-prose)",
            fontSize: "var(--fs-body)",
            lineHeight: "var(--lh-body)",
            color: "var(--text-secondary)",
            textWrap: "pretty",
          }}
        >
          {copy.p2}
        </p>
        <div
          data-reveal
          data-delay="200"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--space-3)",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--border-hairline)",
          }}
        >
          <Button variant="outline" arrow href="https://github.com/diegobarrionuevo1">
            GitHub
          </Button>
          <Button variant="outline" arrow href="https://www.linkedin.com/in/diegobarrionuevo11/">
            LinkedIn
          </Button>
        </div>
        <div
          data-reveal
          data-delay="260"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "var(--space-4)",
            paddingTop: "var(--space-4)",
            borderTop: "1px solid var(--border-hairline)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/UTN_logo.jpg"
            alt="Universidad Tecnológica Nacional"
            style={{
              width: 36,
              height: 36,
              objectFit: "contain",
              background: "var(--surface-card)",
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--r-xs)",
              flex: "none",
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: "var(--fs-body-sm)", color: "var(--text-primary)" }}>
              {copy.degree}
            </div>
            <div style={{ ...mono, marginTop: "var(--space-1)" }}>
              {copy.uni}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
