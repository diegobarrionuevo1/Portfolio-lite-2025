import { Button, SectionLabel, Tag } from "@/components/ds";
import type { Lang } from "@/lib/i18n";

const mono: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "var(--fs-micro)",
  letterSpacing: "var(--ls-caps)",
  textTransform: "uppercase",
};

/**
 * One employer or product team. The section is data-driven: a new entry is
 * one more object per language, no markup changes.
 */
type Entry = {
  company: string;
  href: string;
  kind: string;
  period: string;
  role: string;
  body: string;
  bullets: string[];
  tags: string[];
  media: { src: string; alt: string; width: number; height: number };
};

const ENTRIES: Record<Lang, Entry[]> = {
  es: [
    {
      company: "Somos Hashi",
      href: "https://hashiapp.com",
      kind: "Plataforma de contenido con IA",
      period: "Sep 2024 — Ene 2025",
      role: "Desarrollador full stack en un equipo de producto de cuatro personas",
      body: "Construí el núcleo de generación de guiones con IA (server actions sobre OpenAI), los componentes de Hashi Studio y de creación de contenido, el contexto de organización del dashboard y el panel de apariencia del admin de la plataforma educativa.",
      bullets: [
        "Generación y edición de guiones con OpenAI",
        "Componentes de Hashi Studio (atomic design)",
        "Panel de apariencia del admin",
      ],
      tags: ["Next.js", "TypeScript", "tRPC", "PostgreSQL", "OpenAI", "Clerk"],
      media: {
        src: "/work/experience/hashi-composer-crop.webp",
        alt: "Compositor de guiones de Hashi Studio",
        width: 1600,
        height: 918,
      },
    },
  ],
  en: [
    {
      company: "Somos Hashi",
      href: "https://hashiapp.com",
      kind: "AI content platform",
      period: "Sep 2024 — Jan 2025",
      role: "Full-stack developer on a four-person product team",
      body: "I built the AI script-generation core (server actions on top of OpenAI), the Hashi Studio and content-creation components, the dashboard's organization context and the appearance panel of the learning platform's admin.",
      bullets: [
        "Script generation and editing with OpenAI",
        "Hashi Studio components (atomic design)",
        "Admin appearance panel",
      ],
      tags: ["Next.js", "TypeScript", "tRPC", "PostgreSQL", "OpenAI", "Clerk"],
      media: {
        src: "/work/experience/hashi-composer-crop.webp",
        alt: "The Hashi Studio script composer",
        width: 1600,
        height: 918,
      },
    },
  ],
};

const COPY = {
  es: {
    heading: "Experiencia en equipo",
    asideOne: "empresa",
    asideMany: "empresas",
    lede: "Lo que construí dentro de equipos de producto, además de los proyectos que llevé solo.",
    visit: "Ver el sitio",
  },
  en: {
    heading: "Team experience",
    asideOne: "company",
    asideMany: "companies",
    lede: "What I built inside product teams, alongside the projects I shipped on my own.",
    visit: "Visit the site",
  },
} as const;

export function Experience({ lang = "es" }: { lang?: Lang } = {}) {
  const copy = COPY[lang];
  const entries = ENTRIES[lang];
  const count = entries.length;
  const aside = `${count.toString().padStart(2, "0")} ${count === 1 ? copy.asideOne : copy.asideMany}`;

  return (
    <section
      id="experience"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-8)",
        padding: "var(--section-y) var(--page-margin)",
      }}
    >
      <SectionLabel index="03" aside={aside}>
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

      {entries.map((entry, i) => (
        <article
          key={entry.company}
          data-reveal
          data-delay={i ? "90" : undefined}
          style={{
            border: "1px solid var(--border-hairline)",
            borderRadius: "var(--r-card)",
            padding: "var(--space-6)",
            background: "var(--surface-card)",
            // Two columns when both fit (media left, text right); one below.
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,380px),1fr))",
            gap: "var(--space-7)",
            alignItems: "center",
          }}
        >
          <figure
            className="media-frame"
            style={{ margin: 0, aspectRatio: "16 / 10", border: "1px solid var(--border-hairline)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={entry.media.src}
              alt={entry.media.alt}
              width={entry.media.width}
              height={entry.media.height}
            />
            <span className="media-frame__grain" aria-hidden="true" />
          </figure>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", minWidth: 0 }}>
            <div style={{ ...mono, display: "flex", flexWrap: "wrap", gap: "var(--space-2) var(--space-3)", color: "var(--text-muted)" }}>
              <span>{entry.kind}</span>
              <span aria-hidden="true">·</span>
              <span>{entry.period}</span>
            </div>
            <h3
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "var(--fs-title-2)",
                fontWeight: "var(--fw-display)",
                letterSpacing: "var(--ls-title)",
                lineHeight: "var(--lh-title)",
              }}
            >
              {entry.company}
            </h3>
            <div style={{ ...mono, color: "var(--text-accent)" }}>{entry.role}</div>
            <p
              style={{
                margin: 0,
                maxWidth: "var(--measure-prose)",
                fontSize: "var(--fs-body-sm)",
                lineHeight: "var(--lh-body)",
                color: "var(--text-secondary)",
              }}
            >
              {entry.body}
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
              {entry.bullets.map((bullet) => (
                <li key={bullet} style={{ display: "flex", gap: "var(--space-3)" }}>
                  <span aria-hidden="true" style={{ color: "var(--text-accent)", flex: "none" }}>
                    —
                  </span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", paddingTop: "var(--space-2)" }}>
              {entry.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
            <div style={{ paddingTop: "var(--space-2)" }}>
              <Button
                size="sm"
                variant="outline"
                arrow
                href={entry.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.visit}
              </Button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
