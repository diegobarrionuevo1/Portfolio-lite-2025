import { workImage, workVideo } from "../scenes/media-src";
import type { ShowcaseDefinition } from "../types";

/**
 * DonWeb Cloud, content platform (P/01). The reference showcase: every scene
 * primitive is exercised here with the real captures and clips from
 * public/work/donweb-contenidos/ (dimensions from public/work/manifest.json).
 * A later task adds the "pipeline Ghost → theme → dashboard" motion graphic.
 */
const SLUG = "donweb-contenidos";

/** 2400w desktop captures, with their 1200w siblings for srcSet. */
const capture = (name: string, id?: string) => workImage(SLUG, name, 2400, 1500, { variants: [1200], id });
/** 3x phone captures, portrait, single file. */
const phone = (name: string, id?: string) => workImage(SLUG, name, 1170, 2532, { id });
/** Screen recordings transcoded to mp4 + webm with a poster frame. */
const clip = (name: string) => workVideo(SLUG, name, 1920, 1080);

export const donwebContenidos: ShowcaseDefinition = {
  shared: {
    slug: SLUG,
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
    hero: { media: capture("home") },
    chapters: [
      { id: "editorial", layout: "media-right", media: clip("clip-home") },
      { id: "cinema", layout: "media-left", media: clip("clip-episode") },
      { id: "hubs", layout: "media-full", media: [capture("pildoras"), capture("academia")] },
      { id: "dashboard", layout: "media-right", media: capture("hub") },
    ],
    gallery: [
      capture("episode", "episode"),
      capture("tutorial", "tutorial"),
      capture("tag-tutorial", "tag-tutorial"),
      capture("roadmap", "roadmap"),
      phone("home-mobile", "home-mobile"),
      phone("short-mobile", "short-mobile"),
      phone("pildoras-mobile", "pildoras-mobile"),
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
        mediaAlt: "Portada de cloud.donweb.com con el slider de series y las últimas notas",
      },
      chapters: {
        editorial: {
          kicker: "Núcleo editorial",
          title: "Ghost escribe, el theme compone.",
          body: [
            "Ghost resuelve lo que un medio necesita todos los días: editor, autores, etiquetas, newsletters y una API de contenido estable. Sobre esa base construí un theme en Handlebars que entiende la estructura del sitio: series, hubs temáticos y portadas que se arman solas a partir de las etiquetas.",
            "El equipo editorial publica desde el editor de Ghost sin tocar código. Cada nota llega a la portada, a su serie y a los hubs por sus etiquetas, no por un paso manual.",
          ],
          facts: [
            { value: "257", label: "posts publicados" },
            { value: "268", label: "tags" },
            { value: "603", label: "URLs en el sitemap" },
          ],
          mediaAlt: "Recorrido por la portada de cloud.donweb.com: el slider de series y las notas recientes",
          caption: "Portada: el slider de series y las últimas notas",
        },
        cinema: {
          kicker: "Modo cine",
          title: "Cada episodio se ve como se ve una serie.",
          body: [
            "Las series tienen su propia página de episodio: el video ocupa la pantalla, el texto acompaña abajo y la navegación lleva al capítulo anterior y al siguiente sin volver al índice. Es un modo cine pensado para quedarse viendo, no para rebotar.",
            "El theme arma esa navegación a partir del orden que define el dashboard. Si el equipo reordena una serie, la página del episodio lo refleja en el próximo render, sin tocar una sola nota.",
          ],
          mediaAlt: "Página de un episodio en modo cine, con la navegación entre capítulos de la serie",
          caption: "Episodio de una serie en modo cine",
        },
        hubs: {
          kicker: "Hubs",
          title: "Píldoras y Academia: dos puertas al mismo contenido.",
          body: [
            "Píldoras reúne los videos cortos: una respuesta por video, para quien llega desde una búsqueda con una pregunta concreta. Academia ordena las series largas por nivel y tema, para quien quiere recorrer un camino completo.",
            "Las dos portadas se arman solas a partir de etiquetas y del orden curado en el dashboard. Publicar una nota nueva la ubica en el hub correcto sin un paso manual.",
          ],
          mediaAlt: ["Hub de Píldoras con la grilla de videos cortos", "Hub de Academia con las series ordenadas por nivel"],
          caption: ["Píldoras: respuestas cortas en video", "Academia: series ordenadas por nivel"],
        },
        dashboard: {
          kicker: "Dashboard",
          title: "Un panel propio alimenta el theme.",
          body: [
            "Lo que Ghost no modela (series con orden, hubs con curaduría, portadas con criterio editorial) vive en un dashboard en Next.js con PostgreSQL. El theme lo consulta por API al renderizar y mezcla ese contexto con el contenido de Ghost.",
            "Todo corre en contenedores con Docker detrás de Caddy, en un servidor que también administro: despliegue, TLS, backups y el soporte diario del medio.",
          ],
          mediaAlt: "Hub de tutoriales, con las secciones y el orden que define el dashboard",
          caption: "Hub de tutoriales, curado desde el dashboard",
        },
      },
      metrics: {
        kicker: "En números",
        stats: [
          { value: "257", label: "posts publicados" },
          { value: "268", label: "tags en uso" },
          { value: "603", label: "URLs en el sitemap, todas con respuesta 200" },
          { value: "4", label: "autores publicando" },
        ],
        closer:
          "Un sitemap sano es la prueba de que la estructura funciona: cada serie, hub y etiqueta tiene su URL, y ninguna devuelve un error.",
        note: "Baseline SEO del 3 de octubre de 2026",
      },
      gallery: {
        kicker: "Recorrido",
        items: {
          episode: { alt: "Página de episodio de una serie", caption: "Episodio de una serie" },
          tutorial: { alt: "Un tutorial publicado en cloud.donweb.com", caption: "Tutorial" },
          "tag-tutorial": { alt: "Listado de notas con la etiqueta tutorial", caption: "Etiqueta: tutorial" },
          roadmap: { alt: "Roadmap de contenidos de DonWeb Cloud", caption: "Roadmap de contenidos" },
          "home-mobile": { alt: "Portada de cloud.donweb.com en el celular", caption: "Portada, móvil" },
          "short-mobile": { alt: "Un video corto reproduciéndose en el celular", caption: "Píldora, móvil" },
          "pildoras-mobile": { alt: "Hub de Píldoras en el celular", caption: "Hub de Píldoras, móvil" },
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
        mediaAlt: "cloud.donweb.com front page with the series slider and the latest articles",
      },
      chapters: {
        editorial: {
          kicker: "Editorial core",
          title: "Ghost writes, the theme composes.",
          body: [
            "Ghost covers what a publication needs every day: an editor, authors, tags, newsletters and a stable content API. On that base I built a Handlebars theme that understands how the site is structured: series, topic hubs and front pages assembled from tags.",
            "The editorial team publishes from Ghost's editor without touching code. Each article reaches the front page, its series and the hubs through its tags, never through a manual step.",
          ],
          facts: [
            { value: "257", label: "published posts" },
            { value: "268", label: "tags" },
            { value: "603", label: "URLs in the sitemap" },
          ],
          mediaAlt: "A walk through the cloud.donweb.com front page: the series slider and the recent articles",
          caption: "Front page: the series slider and the latest articles",
        },
        cinema: {
          kicker: "Cinema mode",
          title: "Every episode plays the way a series should.",
          body: [
            "Series get their own episode page: the video fills the screen, the text follows below and the navigation leads to the previous and next chapter without going back to the index. A cinema mode built for staying, not bouncing.",
            "The theme builds that navigation from the order defined in the dashboard. If the team reorders a series, the episode page reflects it on the next render, without touching a single article.",
          ],
          mediaAlt: "An episode page in cinema mode, with the navigation between the chapters of the series",
          caption: "A series episode in cinema mode",
        },
        hubs: {
          kicker: "Hubs",
          title: "Píldoras and Academia: two doors into the same content.",
          body: [
            "Píldoras gathers the short videos: one answer per video, for people who arrive from a search with a concrete question. Academia orders the long series by level and topic, for people who want to walk a full path.",
            "Both front pages assemble themselves from tags and from the order curated in the dashboard. Publishing a new article places it in the right hub without a manual step.",
          ],
          mediaAlt: ["The Píldoras hub with its grid of short videos", "The Academia hub with the series ordered by level"],
          caption: ["Píldoras: short answers on video", "Academia: series ordered by level"],
        },
        dashboard: {
          kicker: "Dashboard",
          title: "An in-house panel feeds the theme.",
          body: [
            "What Ghost does not model (ordered series, curated hubs, front pages with editorial judgment) lives in a Next.js dashboard backed by PostgreSQL. The theme queries it over an API at render time and blends that context with Ghost's content.",
            "Everything runs in Docker containers behind Caddy, on a server I also operate: deployment, TLS, backups and the day-to-day support of the publication.",
          ],
          mediaAlt: "The tutorials hub, with the sections and order defined in the dashboard",
          caption: "Tutorials hub, curated from the dashboard",
        },
      },
      metrics: {
        kicker: "By the numbers",
        stats: [
          { value: "257", label: "published posts" },
          { value: "268", label: "tags in use" },
          { value: "603", label: "sitemap URLs, every one returning 200" },
          { value: "4", label: "publishing authors" },
        ],
        closer:
          "A healthy sitemap is the proof that the structure works: every series, hub and tag has its URL, and none of them returns an error.",
        note: "SEO baseline from October 3, 2026",
      },
      gallery: {
        kicker: "Walkthrough",
        items: {
          episode: { alt: "A series episode page", caption: "Series episode" },
          tutorial: { alt: "A tutorial published on cloud.donweb.com", caption: "Tutorial" },
          "tag-tutorial": { alt: "The list of articles tagged tutorial", caption: "Tag: tutorial" },
          roadmap: { alt: "The DonWeb Cloud content roadmap", caption: "Content roadmap" },
          "home-mobile": { alt: "The cloud.donweb.com front page on a phone", caption: "Front page, mobile" },
          "short-mobile": { alt: "A short video playing on a phone", caption: "Píldora, mobile" },
          "pildoras-mobile": { alt: "The Píldoras hub on a phone", caption: "Píldoras hub, mobile" },
        },
      },
      links: [{ label: "Visit the site", href: "https://cloud.donweb.com", variant: "accent" }],
      nextLabel: "Next project",
    },
  },
};
