/**
 * "Trabajo seleccionado" — three projects, one horizontal carousel each.
 * Content ported verbatim from the v3 design reference. Each project links
 * to its showcase page by `slug`.
 */
import type { ShowcaseSlug } from "./showcase/types";

export type Slide =
  | {
      kind: "media";
      src?: string;
      placeholder: string;
      caption: string;
    }
  | {
      kind: "plate";
      numeral: string;
      caption: string;
    }
  | {
      kind: "ficha";
      title: string;
      role: string;
      body: string;
      tags: string[];
      link?: { label: string; href: string; variant: "accent" | "outline" };
    }
  | {
      kind: "metrics";
      kicker: string;
      stats: { value: string; label: string }[];
      closer: string;
    };

export type Project = {
  id: string;
  /** Showcase route: /work/<slug> and /en/work/<slug>. */
  slug: ShowcaseSlug;
  name: string;
  badge?: { label: string; tone?: "neutral" | "positive"; dot?: boolean };
  slides: Slide[];
};

const PROJECTS_ES: Project[] = [
  {
    id: "P/01",
    slug: "donweb-contenidos",
    name: "DonWeb Cloud — Plataforma de contenidos",
    badge: { label: "Producción", tone: "positive", dot: true },
    slides: [
      {
        kind: "media",
        src: "/work/donweb-contenidos/home.webp",
        placeholder: "Captura de DonWeb Cloud",
        caption: "Plataforma editorial · Ghost",
      },
      {
        kind: "ficha",
        title: "DonWeb Cloud — Plataforma de contenidos",
        role: "Arquitectura, desarrollo y soporte",
        body: "Construí una plataforma editorial con dashboard, plantillas personalizadas y un theme para Ghost, simplificando la publicación. Alcanzó más de 200.000 visualizaciones orgánicas en sus primeros 3 meses y dio visibilidad a los servicios de DonWeb. También produzco tutoriales y videos técnicos para sus canales oficiales.",
        tags: ["Ghost 6", "Handlebars", "MySQL", "Caddy", "Docker"],
      },
      {
        kind: "metrics",
        kicker: "Impacto",
        stats: [
          { value: "+200.000", label: "visualizaciones orgánicas en los primeros 3 meses" },
        ],
        closer: "Publicación simplificada para el equipo editorial.",
      },
    ],
  },
  {
    id: "P/02",
    slug: "donweb-talleres",
    name: "DonWeb Cloud — Talleres y certificación",
    badge: { label: "Producción", tone: "positive", dot: true },
    slides: [
      {
        kind: "media",
        src: "/work/donweb-talleres/registro-real.webp",
        placeholder: "Captura de la plataforma de talleres",
        caption: "Multi-servicio · desde 2023",
      },
      {
        kind: "ficha",
        title: "DonWeb Cloud — Talleres y certificación",
        role: "Desarrollo y liderazgo técnico",
        body: "En 05/2023 desarrollé la versión inicial y en 2026 lideré su renovación integral con arquitectura multi-servicio, CI/CD y más de 1.700 tests. A julio de 2026 administra 218 cursos, talleres y webinars, 138.109 registros y 123.253 certificados. Migré sin downtime, preservé datos y URLs históricas, y automaticé comunicaciones y operación.",
        tags: ["Node.js", "TypeScript", "React", "PostgreSQL", "Directus", "Docker", "CI/CD"],
        link: { label: "Ver el sitio", href: "https://certificados.donweb.com", variant: "accent" },
      },
      {
        kind: "metrics",
        kicker: "A julio de 2026",
        stats: [
          { value: "218", label: "cursos, talleres y webinars" },
          { value: "138.109", label: "registros" },
          { value: "123.253", label: "certificados emitidos" },
        ],
        closer: "Más de 1.700 tests automatizados y migración sin downtime.",
      },
      {
        kind: "media",
        src: "/work/donweb-talleres/certificate.webp",
        placeholder: "Captura de un certificado público",
        caption: "Certificado público",
      },
    ],
  },
  {
    id: "P/03",
    slug: "ada13",
    name: "Ada13 — Plataforma web",
    slides: [
      {
        kind: "media",
        src: "/work/ada13/home-2023.webp",
        placeholder: "Captura de ada13.tech (archivo, 2023)",
        caption: "Plataforma web · mantenimiento continuo",
      },
      {
        kind: "plate",
        numeral: "03",
        caption: "Plataforma web · mantenimiento continuo",
      },
      {
        kind: "ficha",
        title: "Ada13 — Plataforma web",
        role: "Desarrollo full stack y mantenimiento",
        body: "Refactoricé frontend y backend, procesé datos e implementé correos transaccionales. Sumé mantenimiento de servicios, soporte correctivo y seguimiento de incidencias.",
        tags: [
          "Refactor frontend",
          "Refactor backend",
          "Procesamiento de datos",
          "Correos transaccionales",
          "Soporte",
        ],
      },
    ],
  },
];


/**
 * English mirror of PROJECTS_ES. Hand-written, not machine-run at build time:
 * project copy is marketing surface and deserves a human-reviewed translation.
 * Figures keep their value but switch to English number formatting.
 */
const PROJECTS_EN: Project[] = [
  {
    id: "P/01",
    slug: "donweb-contenidos",
    name: "DonWeb Cloud — Content platform",
    badge: { label: "Production", tone: "positive", dot: true },
    slides: [
      {
        kind: "media",
        src: "/work/donweb-contenidos/home.webp",
        placeholder: "DonWeb Cloud screenshot",
        caption: "Editorial platform · Ghost",
      },
      {
        kind: "ficha",
        title: "DonWeb Cloud — Content platform",
        role: "Architecture, development and support",
        body: "I built an editorial platform with a dashboard, custom templates and a Ghost theme, simplifying publishing. It reached 200,000+ organic views in its first 3 months and gave DonWeb's services real visibility. I also produce tutorials and technical videos for their official channels.",
        tags: ["Ghost 6", "Handlebars", "MySQL", "Caddy", "Docker"],
      },
      {
        kind: "metrics",
        kicker: "Impact",
        stats: [
          { value: "200,000+", label: "organic views in the first 3 months" },
        ],
        closer: "Publishing made simple for the editorial team.",
      },
    ],
  },
  {
    id: "P/02",
    slug: "donweb-talleres",
    name: "DonWeb Cloud — Workshops & certification",
    badge: { label: "Production", tone: "positive", dot: true },
    slides: [
      {
        kind: "media",
        src: "/work/donweb-talleres/registro-real.webp",
        placeholder: "Workshops platform screenshot",
        caption: "Multi-service · since 2023",
      },
      {
        kind: "ficha",
        title: "DonWeb Cloud — Workshops & certification",
        role: "Development and technical leadership",
        body: "I built the first version in May 2023 and led its full renewal in 2026: multi-service architecture, CI/CD and 1,700+ tests. As of July 2026 it manages 218 courses, workshops and webinars, 138,109 registrations and 123,253 certificates. I migrated with zero downtime, preserving historic data and URLs, and automated communications and operations.",
        tags: ["Node.js", "TypeScript", "React", "PostgreSQL", "Directus", "Docker", "CI/CD"],
        link: { label: "Visit the site", href: "https://certificados.donweb.com", variant: "accent" },
      },
      {
        kind: "metrics",
        kicker: "As of July 2026",
        stats: [
          { value: "218", label: "courses, workshops and webinars" },
          { value: "138,109", label: "registrations" },
          { value: "123,253", label: "certificates issued" },
        ],
        closer: "1,700+ automated tests and a zero-downtime migration.",
      },
      {
        kind: "media",
        src: "/work/donweb-talleres/certificate.webp",
        placeholder: "Public certificate screenshot",
        caption: "Public certificate",
      },
    ],
  },
  {
    id: "P/03",
    slug: "ada13",
    name: "Ada13 — Web platform",
    slides: [
      {
        kind: "media",
        src: "/work/ada13/home-2023.webp",
        placeholder: "ada13.tech screenshot (archived, 2023)",
        caption: "Web platform · ongoing maintenance",
      },
      {
        kind: "plate",
        numeral: "03",
        caption: "Web platform · ongoing maintenance",
      },
      {
        kind: "ficha",
        title: "Ada13 — Web platform",
        role: "Full-stack development and maintenance",
        body: "I refactored the frontend and backend, processed data and implemented transactional email. I also handle service maintenance, corrective support and issue tracking.",
        tags: [
          "Frontend refactor",
          "Backend refactor",
          "Data processing",
          "Transactional email",
          "Support",
        ],
      },
    ],
  },
];

import type { Lang } from "@/lib/i18n";

export function getProjects(lang: Lang = "es"): readonly Project[] {
  return lang === "en" ? PROJECTS_EN : PROJECTS_ES;
}

/** Kept for existing imports. */
export const PROJECTS = PROJECTS_ES;
