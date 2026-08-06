import { Button, SectionLabel } from "@/components/ds";
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

export function About() {
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
        <SectionLabel index="05" aside="Ingeniero en Sistemas">
          Sobre mí
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
          Convierto procesos manuales en <em style={em}>sistemas que un equipo usa todos los días</em>
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
          Soy desarrollador full stack con formación en Ingeniería en Sistemas y experiencia construyendo aplicaciones
          para empresas, startups y productos propios.
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
          Me interesan los proyectos donde tengo que entender el problema, diseñar la solución, conectar servicios y
          llevar el producto hasta producción. Puedo trabajar solo o integrarme a un equipo y hacerme cargo de una parte
          completa del producto.
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
              Ingeniería en Sistemas de Información
            </div>
            <div style={{ ...mono, marginTop: "var(--space-1)" }}>
              Universidad Tecnológica Nacional — Córdoba · 2018 — 2022
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
