import { Badge, SectionLabel, Tag } from "@/components/ds";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase",
};

const PRODUCTS = [
  {
    title: "Hermes",
    kind: "SaaS para comercios",
    body: "Plataforma para que un comercio administre catálogo, pedidos, caja y atención. El cliente arma el pedido en una tienda web y lo envía por WhatsApp.",
    bullets: [
      "Catálogo y carrito",
      "Gestión de pedidos y panel del comercio",
      "Horarios, estado del negocio y atención automatizada",
    ],
    tags: ["Next.js", "PostgreSQL", "Cloud Run", "WhatsApp"],
  },
  {
    title: "Finanzas personales con IA",
    kind: "Aplicación mobile-first",
    body: "App para registrar y analizar movimientos financieros desde texto, audio o fotos de comprobantes.",
    bullets: [
      "Lectura de comprobantes y clasificación asistida",
      "Cuentas, tarjetas, cuotas y deudas",
      "Saldo disponible, dinero reservado y reportes",
    ],
    tags: ["React Native", "TypeScript", "APIs de IA", "OCR"],
  },
];

export function Building() {
  return (
    <section
      id="building"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-8)",
        padding: "var(--section-y) var(--page-margin)",
      }}
    >
      <SectionLabel index="04" aside="02 en curso">
        Productos propios
      </SectionLabel>
      <p
        data-reveal
        style={{
          margin: 0,
          maxWidth: "var(--measure-lede)",
          fontSize: "var(--fs-body-lg)",
          lineHeight: "var(--lh-body)",
          letterSpacing: "var(--ls-lede)",
          color: "var(--text-secondary)",
        }}
      >
        Proyectos que estoy construyendo por mi cuenta. Todavía en desarrollo: no tienen usuarios ni facturación.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "var(--space-6)" }}>
        {PRODUCTS.map((p, i) => (
          <article
            key={p.title}
            data-reveal
            data-delay={i ? "90" : undefined}
            style={{
              border: "1px solid var(--border-hairline)",
              borderRadius: "var(--r-card)",
              padding: "var(--space-7) var(--space-6)",
              background: "var(--surface-card)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", flexWrap: "wrap" }}>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--fs-title-2)",
                  fontWeight: 500,
                  letterSpacing: "var(--ls-title)",
                  lineHeight: "var(--lh-title)",
                }}
              >
                {p.title}
              </h3>
              <Badge tone="caution">En desarrollo</Badge>
            </div>
            <div style={{ ...mono, color: "var(--text-accent)" }}>{p.kind}</div>
            <p style={{ margin: 0, fontSize: "var(--fs-body-sm)", lineHeight: "var(--lh-body)", color: "var(--text-secondary)" }}>
              {p.body}
            </p>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-2)",
                fontSize: "var(--fs-body-sm)",
                lineHeight: "var(--lh-body)",
                color: "var(--text-secondary)",
              }}
            >
              {p.bullets.map((b) => (
                <li key={b} style={{ display: "flex", gap: "var(--space-3)" }}>
                  <span aria-hidden="true" style={{ color: "var(--text-accent)", flex: "none" }}>
                    —
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "auto", paddingTop: "var(--space-3)" }}>
              {p.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
