import type { ShowcaseDefinition } from "../types";

/**
 * DonWeb Cloud, content platform (P/01). Text-only stub: later tasks add the
 * captures, the pipeline motion graphic and the gallery.
 */
export const donwebContenidos: ShowcaseDefinition = {
  shared: {
    slug: "donweb-contenidos",
    order: 1,
    status: "production",
    atmosphere: {
      scheme: "dark",
      canvas: "#071226",
      sunken: "#001C3A",
      raised: "#0E1C2F",
      card: "#0A1628",
      ink: "#FFFFFF",
      secondary: "rgba(255,255,255,0.72)",
      muted: "rgba(255,255,255,0.5)",
      accent: "#58E55B",
      accentFg: "#071226",
      hairline: "rgba(255,255,255,0.12)",
    },
    stack: ["Ghost", "Handlebars", "Next.js", "PostgreSQL", "Docker", "Caddy"],
    hero: {},
    chapters: [
      { id: "editorial", layout: "text-only" },
      { id: "dashboard", layout: "text-only" },
    ],
    next: "donweb-talleres",
  },
  copy: {
    es: {
      name: "DonWeb Cloud — Plataforma de contenidos",
      kicker: "P/01",
      tagline:
        "La plataforma editorial de DonWeb Cloud: Ghost como núcleo, un theme a medida y un dashboard propio que alimenta series, hubs y portadas.",
      role: "Arquitectura, desarrollo y soporte",
      period: "2026",
      statusLabel: "Producción",
      hero: {
        headline: "Un medio técnico que publica solo.",
        sub: "Ghost como núcleo editorial, un theme a medida y un dashboard propio que alimenta series, hubs y portadas.",
        mediaAlt: "Portada de cloud.donweb.com",
      },
      chapters: {
        editorial: {
          kicker: "Núcleo editorial",
          title: "Ghost escribe, el theme compone.",
          body: [
            "Ghost resuelve lo que un medio necesita todos los días: editor, autores, etiquetas, newsletters y una API de contenido estable. Sobre esa base construí un theme en Handlebars que entiende la estructura del sitio: series, hubs temáticos y portadas que se arman solas a partir de las etiquetas.",
            "El equipo editorial publica desde el editor de Ghost sin tocar código. Cada nota llega a la portada, a su serie y a los hubs por sus etiquetas, no por un paso manual.",
          ],
        },
        dashboard: {
          kicker: "Dashboard",
          title: "Un panel propio alimenta el theme.",
          body: [
            "Lo que Ghost no modela (series con orden, hubs con curaduría, portadas con criterio editorial) vive en un dashboard en Next.js con PostgreSQL. El theme lo consulta por API al renderizar y mezcla ese contexto con el contenido de Ghost.",
            "Todo corre en contenedores con Docker detrás de Caddy, en un servidor que también administro: despliegue, TLS, backups y el soporte diario del medio.",
          ],
        },
      },
      links: [{ label: "Ver el sitio", href: "https://cloud.donweb.com", variant: "accent" }],
      nextLabel: "Siguiente proyecto",
    },
    en: {
      name: "DonWeb Cloud — Content platform",
      kicker: "P/01",
      tagline:
        "DonWeb Cloud's editorial platform: Ghost at the core, a custom theme and an in-house dashboard that feeds series, hubs and front pages.",
      role: "Architecture, development and support",
      period: "2026",
      statusLabel: "Production",
      hero: {
        headline: "A technical publication that runs itself.",
        sub: "Ghost as the editorial core, a custom theme and an in-house dashboard that feeds series, hubs and front pages.",
        mediaAlt: "cloud.donweb.com front page",
      },
      chapters: {
        editorial: {
          kicker: "Editorial core",
          title: "Ghost writes, the theme composes.",
          body: [
            "Ghost covers what a publication needs every day: an editor, authors, tags, newsletters and a stable content API. On that base I built a Handlebars theme that understands how the site is structured: series, topic hubs and front pages assembled from tags.",
            "The editorial team publishes from Ghost's editor without touching code. Each article reaches the front page, its series and the hubs through its tags, never through a manual step.",
          ],
        },
        dashboard: {
          kicker: "Dashboard",
          title: "An in-house panel feeds the theme.",
          body: [
            "What Ghost does not model (ordered series, curated hubs, front pages with editorial judgment) lives in a Next.js dashboard backed by PostgreSQL. The theme queries it over an API at render time and blends that context with Ghost's content.",
            "Everything runs in Docker containers behind Caddy, on a server I also operate: deployment, TLS, backups and the day-to-day support of the publication.",
          ],
        },
      },
      links: [{ label: "Visit the site", href: "https://cloud.donweb.com", variant: "accent" }],
      nextLabel: "Next project",
    },
  },
};
