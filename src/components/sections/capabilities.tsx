import type { Lang } from "@/lib/i18n";
import { SectionLabel, Tag } from "@/components/ds";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase",
};

const svcTitle: React.CSSProperties = {
  margin: 0,
  fontFamily: "var(--font-display)",
  fontSize: "var(--fs-title-3)",
  fontWeight: 500,
  letterSpacing: "var(--ls-title)",
  lineHeight: "var(--lh-title)",
};

const svcBody: React.CSSProperties = {
  margin: 0,
  fontSize: "var(--fs-body-sm)",
  lineHeight: "var(--lh-body)",
  color: "var(--text-secondary)",
};

const em: React.CSSProperties = {
  fontFamily: "var(--font-serif)",
  fontStyle: "italic",
  fontWeight: 400,
  letterSpacing: 0,
  color: "var(--text-accent)",
};

const SERVICES = {
  es: [
    { code: "C/01", title: <>Desarrollo de productos</>, body: "Aplicaciones web y SaaS, del análisis inicial hasta producción." },
    { code: "C/02", title: <>Backend e integraciones</>, body: "APIs, bases de datos, auth, webhooks, pagos y servicios externos." },
    { code: "C/03", title: <>Automatización e <em style={em}>IA</em></>, body: "Procesos, documentos, asistentes e integración de modelos." },
    { code: "C/04", title: <>Deploy y operación</>, body: "Docker, servidores, monitoreo, debugging y mantenimiento." },
  ],
  en: [
    { code: "C/01", title: <>Product development</>, body: "Web apps and SaaS, from first analysis to production." },
    { code: "C/02", title: <>Backend & integrations</>, body: "APIs, databases, auth, webhooks, payments and third-party services." },
    { code: "C/03", title: <>Automation & <em style={em}>AI</em></>, body: "Processes, documents, assistants and model integration." },
    { code: "C/04", title: <>Deploy & operations</>, body: "Docker, servers, monitoring, debugging and maintenance." },
  ],
} as const;

const COPY = {
  es: {
    aside: "Cómo trabajo",
    heading: "Capacidades",
    stack: "Stack",
    noteA: "Núcleo en ",
    noteEm: "TypeScript, Node.js, React, Next.js y PostgreSQL",
    noteB: ". El resto son herramientas que usé en proyectos reales.",
    groups: { "IA y agentes": "IA y agentes", Datos: "Datos", Integraciones: "Integraciones", Frontend: "Frontend", Backend: "Backend", Infra: "Infra" } as Record<string, string>,
    agentTag: "Agentes",
  },
  en: {
    aside: "How I work",
    heading: "Capabilities",
    stack: "Stack",
    noteA: "Core in ",
    noteEm: "TypeScript, Node.js, React, Next.js and PostgreSQL",
    noteB: ". The rest are tools I've used in real projects.",
    groups: { "IA y agentes": "AI & agents", Datos: "Data", Integraciones: "Integrations", Frontend: "Frontend", Backend: "Backend", Infra: "Infra" } as Record<string, string>,
    agentTag: "Agents",
  },
} as const;

const STACK: { group: string; tags: { label: string; accent?: boolean }[] }[] = [
  {
    group: "Frontend",
    tags: [
      { label: "TypeScript", accent: true },
      { label: "React", accent: true },
      { label: "Next.js", accent: true },
      { label: "React Native" },
      { label: "Tailwind CSS" },
    ],
  },
  {
    group: "Backend",
    tags: [
      { label: "Node.js", accent: true },
      { label: "Express" },
      { label: "REST APIs" },
      { label: "Webhooks" },
      { label: "Background jobs" },
    ],
  },
  {
    group: "IA y agentes",
    tags: [
      { label: "OpenAI", accent: true },
      { label: "Claude API", accent: true },
      { label: "Agentes" },
      { label: "RAG" },
      { label: "Embeddings" },
    ],
  },
  {
    group: "Datos",
    tags: [
      { label: "PostgreSQL", accent: true },
      { label: "Redis" },
      { label: "Directus" },
      { label: "Supabase" },
      { label: "Prisma" },
    ],
  },
  {
    group: "Infra",
    tags: [
      { label: "Docker" },
      { label: "Ubuntu" },
      { label: "Vercel" },
      { label: "Cloud Run" },
      { label: "Caddy" },
    ],
  },
  {
    group: "Integraciones",
    tags: [
      { label: "Zoom" },
      { label: "YouTube" },
      { label: "Mercado Pago" },
      { label: "Customer.io" },
      { label: "WhatsApp" },
    ],
  },
];

export function Capabilities({ lang = "es" }: { lang?: Lang } = {}) {
  const copy = COPY[lang];
  const services = SERVICES[lang];
  return (
    <section
      id="stack"
      data-band
      data-theme="dark"
      className="band-bleed"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-8)",
        padding: "var(--section-y) var(--page-margin)",
        ["--band-bg" as string]: "var(--surface-canvas)",
        color: "var(--text-primary)",
      }}
    >
      <SectionLabel index="03" aside={copy.aside}>
        {copy.heading}
      </SectionLabel>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))", gap: 1 }}>
        {services.map((s, i) => (
          <div
            key={s.code}
            data-reveal
            data-delay={i ? String(i * 70) : undefined}
            className="svc-card"
            style={{
              outline: "1px solid var(--border-hairline)",
              padding: "var(--space-7) var(--space-5)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-3)",
            }}
          >
            <span style={{ ...mono, color: "var(--text-accent)" }}>{s.code}</span>
            <h3 style={svcTitle}>{s.title}</h3>
            <p style={svcBody}>{s.body}</p>
          </div>
        ))}
      </div>

      <div
        data-reveal
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "var(--space-5)",
          marginTop: "var(--space-6)",
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-display-3)",
            fontWeight: 500,
            letterSpacing: "var(--ls-display-3)",
            lineHeight: "var(--lh-tight)",
          }}
        >
          {copy.stack}
        </h3>
        <p
          style={{
            margin: 0,
            maxWidth: "var(--measure-lede)",
            fontSize: "var(--fs-body-sm)",
            lineHeight: "var(--lh-body)",
            color: "var(--text-secondary)",
          }}
        >
          {copy.noteA}
          <em style={em}>{copy.noteEm}</em>
          {copy.noteB}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,220px),1fr))", gap: "var(--space-6)" }}>
        {STACK.map((col, i) => (
          <div key={col.group} data-reveal data-delay={i ? String(i * 60) : undefined}>
            <div
              style={{
                ...mono,
                color: "var(--text-muted)",
                paddingBottom: "var(--space-3)",
                borderBottom: "1px solid var(--border-hairline)",
                marginBottom: "var(--space-4)",
              }}
            >
              {copy.groups[col.group] ?? col.group}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              {col.tags.map((t) => (
                <Tag key={t.label} variant={t.accent ? "accent" : "outline"}>
                  {t.label === "Agentes" ? copy.agentTag : t.label}
                </Tag>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
