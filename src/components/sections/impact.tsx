import { SectionLabel } from "@/components/ds";

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

export function Impact() {
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
        Resultados e impacto
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
        Construí plataformas usadas por{" "}
        <em
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            letterSpacing: 0,
            color: "var(--text-accent)",
          }}
        >
          miles de personas
        </em>
        , sistemas internos, integraciones con APIs y productos con IA
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: 1 }}>
        <div data-reveal style={cell}>
          <div style={cellStat}>
            <span data-count="4" data-prefix="+">
              +4
            </span>
          </div>
          <div style={desc}>años desarrollando software, desde 2022</div>
        </div>
        <div data-reveal data-delay="70" style={cell}>
          <div style={cellStat} data-numeric>
            <span style={{ color: "var(--text-accent)" }}>+</span>250 mil
          </div>
          <div style={desc}>usuarios alcanzados por plataformas que construí</div>
        </div>
        <div data-reveal data-delay="140" style={cell}>
          <div style={cellStat}>Punta a punta</div>
          <div style={desc}>del relevamiento al deploy y el mantenimiento</div>
        </div>
        <div data-reveal data-delay="210" style={cell}>
          <div style={cellStat}>Remoto</div>
          <div style={desc}>con equipos y clientes de distintos países</div>
        </div>
      </div>

      <p data-reveal style={{ ...mono, margin: 0, letterSpacing: "var(--ls-caps-tight)", color: "var(--text-muted)" }}>
        Las métricas de cada trabajo están en su ficha
      </p>
    </section>
  );
}
