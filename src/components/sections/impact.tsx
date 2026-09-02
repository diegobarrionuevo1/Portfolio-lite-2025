import { SectionLabel } from "@/components/ds";
import type { Lang } from "@/lib/i18n";

const COPY = {
  es: {
    heading: "Resultados e impacto",
    h1a: "Construí plataformas usadas por",
    h1em: "miles de personas",
    h1b: ", sistemas internos, integraciones con APIs y productos con IA",
    years: "años desarrollando software, desde 2022",
    reach: "250 mil",
    reachDesc: "usuarios alcanzados por plataformas que construí",
    endToEnd: "Punta a punta",
    endToEndDesc: "del relevamiento al deploy y el mantenimiento",
    remote: "Remoto",
    remoteDesc: "con equipos y clientes de distintos países",
    foot: "Las métricas de cada trabajo están en su ficha",
  },
  en: {
    heading: "Results & impact",
    h1a: "I've built platforms used by",
    h1em: "thousands of people",
    h1b: ", internal systems, API integrations and AI products",
    years: "years building software, since 2022",
    reach: "250K",
    reachDesc: "users reached by platforms I built",
    endToEnd: "End to end",
    endToEndDesc: "from discovery to deploy and maintenance",
    remote: "Remote",
    remoteDesc: "with teams and clients across countries",
    foot: "Each project's metrics live in its own card",
  },
} as const;

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase",
};

const cellStat: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "var(--fs-title-1)",
  fontWeight: 500,
  letterSpacing: "var(--ls-display-3)",
  lineHeight: 1,
};

const cell: React.CSSProperties = {
  outline: "1px solid var(--border-hairline)",
  background: "var(--surface-card)",
  padding: "var(--space-6) var(--space-5)",
  display: "flex",
  flexDirection: "column",
  gap: "var(--space-3)",
};

const desc: React.CSSProperties = { fontSize: "var(--fs-body-sm)", color: "var(--text-secondary)" };

export function Impact({ lang = "es" }: { lang?: Lang } = {}) {
  const copy = COPY[lang];
  return (
    <section
      id="impact"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-8)",
        padding: "var(--section-y) var(--page-margin)",
      }}
    >
      <SectionLabel index="01" aside="2022 — 2026">
        {copy.heading}
      </SectionLabel>
      <p
        data-reveal
        style={{
          margin: 0,
          maxWidth: "22ch",
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-display-3)",
          fontWeight: 500,
          letterSpacing: "var(--ls-display-3)",
          lineHeight: "var(--lh-tight)",
          textWrap: "balance",
        }}
      >
        {copy.h1a}{" "}
        <em
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            letterSpacing: 0,
            color: "var(--text-accent)",
          }}
        >
          {copy.h1em}
        </em>
        {copy.h1b}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 1 }}>
        <div data-reveal style={cell}>
          <div style={cellStat}>
            <span data-count="4" data-prefix="+">
              +4
            </span>
          </div>
          <div style={desc}>{copy.years}</div>
        </div>
        <div data-reveal data-delay="70" style={cell}>
          <div style={cellStat} data-numeric>
            <span style={{ color: "var(--text-accent)" }}>+</span>{copy.reach}
          </div>
          <div style={desc}>{copy.reachDesc}</div>
        </div>
        <div data-reveal data-delay="140" style={cell}>
          <div style={cellStat}>{copy.endToEnd}</div>
          <div style={desc}>{copy.endToEndDesc}</div>
        </div>
        <div data-reveal data-delay="210" style={cell}>
          <div style={cellStat}>{copy.remote}</div>
          <div style={desc}>{copy.remoteDesc}</div>
        </div>
      </div>

      <p data-reveal style={{ ...mono, margin: 0, letterSpacing: "var(--ls-caps-tight)", color: "var(--text-muted)" }}>
        {copy.foot}
      </p>
    </section>
  );
}
