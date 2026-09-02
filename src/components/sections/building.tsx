import { Badge, SectionLabel, Tag } from "@/components/ds";
import type { Lang } from "@/lib/i18n";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase",
};

const PRODUCTS = {
  es: [
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
  ],
  en: [
    {
      title: "Hermes",
      kind: "SaaS for local businesses",
      body: "A platform for a business to manage its catalog, orders, cash and customer service. Customers build their order in a web store and send it over WhatsApp.",
      bullets: [
        "Catalog and cart",
        "Order management and business dashboard",
        "Hours, business status and automated replies",
      ],
      tags: ["Next.js", "PostgreSQL", "Cloud Run", "WhatsApp"],
    },
    {
      title: "Personal finance with AI",
      kind: "Mobile-first application",
      body: "An app to record and analyze financial movements from text, audio or receipt photos.",
      bullets: [
        "Receipt reading and assisted classification",
        "Accounts, cards, installments and debts",
        "Available balance, reserved money and reports",
      ],
      tags: ["React Native", "TypeScript", "AI APIs", "OCR"],
    },
  ],
} as const;

const COPY = {
  es: {
    aside: "02 en curso",
    heading: "Productos propios",
    lede: "Proyectos que estoy construyendo por mi cuenta. Todavía en desarrollo: no tienen usuarios ni facturación.",
    badge: "En desarrollo",
  },
  en: {
    aside: "02 in progress",
    heading: "Own products",
    lede: "Projects I'm building on my own. Still in development: no users or revenue yet.",
    badge: "In development",
  },
} as const;

export function Building({ lang = "es" }: { lang?: Lang } = {}) {
  const copy = COPY[lang];
  const products = PRODUCTS[lang];
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
      <SectionLabel index="04" aside={copy.aside}>
        {copy.heading}
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
        {copy.lede}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "var(--space-6)" }}>
        {products.map((p, i) => (
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
              <Badge tone="caution">{copy.badge}</Badge>
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
