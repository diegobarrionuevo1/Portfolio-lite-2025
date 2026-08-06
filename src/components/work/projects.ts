/**
 * "Trabajo seleccionado" — four projects, one horizontal carousel each.
 * Content ported verbatim from the v3 design reference.
 */

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
  name: string;
  badge?: { label: string; tone?: "neutral" | "positive"; dot?: boolean };
  slides: Slide[];
};

export const PROJECTS: Project[] = [
  {
    id: "P/01",
    name: "DonWeb Cloud — Plataforma de contenidos",
    badge: { label: "Producción", tone: "positive", dot: true },
    slides: [
      {
        kind: "media",
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
    name: "DonWeb Cloud — Talleres y certificación",
    badge: { label: "Producción", tone: "positive", dot: true },
    slides: [
      {
        kind: "media",
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
        placeholder: "Captura de un certificado público",
        caption: "Certificado público",
      },
    ],
  },
  {
    id: "P/03",
    name: "Somos Hashi — Contenido con IA",
    badge: { label: "MVP", tone: "neutral" },
    slides: [
      {
        kind: "media",
        src: "/hero-light.png",
        placeholder: "Captura de Somos Hashi",
        caption: "Contenido con IA",
      },
      {
        kind: "ficha",
        title: "Somos Hashi — Contenido con IA",
        role: "Desarrollo full stack",
        body: "Desarrollé el MVP de una plataforma de creación de contenido con IA, cubriendo frontend, backend e integración con modelos de OpenAI.",
        tags: ["Next.js", "TypeScript", "Node.js", "OpenAI", "Docker"],
        link: { label: "Ver el sitio", href: "https://hashiapp.com", variant: "outline" },
      },
    ],
  },
  {
    id: "P/04",
    name: "Ada13 — Plataforma web",
    slides: [
      {
        kind: "plate",
        numeral: "04",
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
