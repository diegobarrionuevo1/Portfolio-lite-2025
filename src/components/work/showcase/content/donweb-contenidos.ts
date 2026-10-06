import { workImage, workVideo } from "../scenes/media-src";
import type { ShowcaseDefinition, ShowcaseLive } from "../types";

/**
 * DonWeb Cloud, content platform (P/01). The reference showcase: every scene
 * primitive is exercised here with the real captures and clips from
 * public/work/donweb-contenidos/ (dimensions from public/work/manifest.json),
 * plus three motion graphics (scenes/mg/donweb-contenidos.tsx) that explain
 * the system's nature: the hero slider and its hexagon lattice drawn in
 * code, the Ghost → theme ← dashboard pipeline, and the video wall sorted
 * by internal tag.
 */
const SLUG = "donweb-contenidos";

/** 2400w desktop captures, with their 1200w siblings for srcSet. */
const capture = (name: string, id?: string) => workImage(SLUG, name, 2400, 1500, { variants: [1200], id });
/** 3x phone captures, portrait, single file. */
const phone = (name: string, id?: string) => workImage(SLUG, name, 1170, 2532, { id });
/** Screen recordings transcoded to mp4 + webm with a poster frame. */
const clip = (name: string) => workVideo(SLUG, name, 1920, 1080);
/** A motion graphic registered in scenes/live-registry.tsx, with its stage aspect. */
const live = (component: string, aspect: number): ShowcaseLive => ({ kind: "live", component, aspect });

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
      { id: "lattice", layout: "live-full", media: live("hex-lattice", 2.4) },
      { id: "cinema", layout: "media-left", media: clip("clip-episode") },
      { id: "pipeline", layout: "live-full", media: live("content-pipeline", 1.8) },
      { id: "hubs", layout: "media-full", media: [capture("pildoras"), capture("academia")] },
      { id: "dashboard", layout: "media-right", media: capture("hub") },
      { id: "wall", layout: "live-full", media: live("video-wall", 2.2) },
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
        lattice: {
          kicker: "Sistema visual",
          title: "Una trama que se dibuja sola.",
          body: [
            "El sitio tiene una identidad propia: azul sobre navy, una trama de hexágonos que acompaña portadas y destacados, y un slider de portada que presenta las series con un título grande y un botón. Acá está reproducido sin imágenes: la geometría se genera en código y el título se escribe letra por letra, como lo ve un lector que entra por primera vez.",
            "Debajo de esa capa hay 13 plantillas a medida en Handlebars (portada, episodio, hubs, roadmap, kit de prensa, contacto) y 24 módulos de JavaScript vanilla: el slider, el reproductor de series, el índice de cada nota, el modal de video, los carruseles de portada y el buscador. Tailwind 4 compilado con Gulp, sin framework de frontend.",
          ],
          facts: [
            { value: "13", label: "plantillas a medida" },
            { value: "24", label: "módulos de JavaScript" },
          ],
          mediaAlt: "Gráfico en movimiento: el slider de portada reproducido sin imagen, con la trama de hexágonos dibujándose y tres títulos escribiéndose letra por letra",
          caption: "El slider de portada, sin imagen: trama generada en código y títulos reales",
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
        pipeline: {
          kicker: "Arquitectura",
          title: "Dos fuentes, una página.",
          body: [
            "Ghost no tiene campos personalizados, cada nota vive en una sola colección y su buscador solo lee título y bajada. Alcanza para escribir, no para ordenar una serie, curar un hub o decidir qué va en la portada. Por eso al lado de Ghost hay un dashboard propio en Next.js con PostgreSQL: diez módulos (series, grupos de etiquetas, hubs, carruseles, roadmap, changelog) y trece endpoints públicos que el theme consulta.",
            "El flujo es siempre el mismo: el equipo publica en Ghost, el theme renderiza por etiqueta y autor en el servidor, y su JavaScript le pide al dashboard lo que Ghost no sabe: el orden de la serie detrás del contador “Episodio 5 de 5”, las secciones de cada hub, los carruseles de portada y el roadmap. Reordenar una serie en el panel cambia la página del episodio en el próximo render, sin tocar una nota.",
          ],
          facts: [
            { value: "10", label: "módulos del dashboard" },
            { value: "13", label: "endpoints públicos" },
          ],
          mediaAlt: "Gráfico en movimiento: Ghost, el theme y el dashboard conectados por reglas; un post viaja de Ghost al theme y tres json del dashboard al theme mientras la página se arma",
          caption: "Ghost publica, el dashboard ordena, el theme arma la página",
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
            "El panel es una app en Next.js con PostgreSQL y Drizzle: series, grupos de etiquetas, hubs, carruseles de portada, roadmap, changelog, contacto, galería, importar y exportar, y ajustes. El orden se define arrastrando, y los gráficos de analítica muestran qué se lee. El equipo cura ahí lo que Ghost no modela, y el theme lo lee al renderizar.",
            "Se despliega con GitHub Actions a GHCR y de ahí por SSH al servidor; todo corre en contenedores con Docker Compose detrás de Caddy con TLS automático, en un servidor que también administro: despliegue, backups y el soporte diario del medio.",
          ],
          mediaAlt: "Hub de tutoriales, con las secciones y el orden que define el dashboard",
          caption: "Hub de tutoriales, curado desde el dashboard",
        },
        wall: {
          kicker: "Video",
          title: "Etiquetas que se vuelven hubs.",
          body: [
            "Además del sitio, produzco el contenido en video del canal de DonWeb Cloud: tutoriales largos, series como el curso de n8n y píldoras cortas para quien llega con una pregunta puntual. Treinta y seis de esos videos viven embebidos en el medio.",
            "Cada video entra a Ghost como una nota con una etiqueta interna: #short, #serie-item o #video. El theme las lee y arma las portadas solas: Píldoras junta los shorts, Academia ordena las series y cada hub muestra sus videos cruzando su etiqueta con #video. Publicar un video nuevo es publicar una nota; el resto se ordena solo.",
          ],
          facts: [
            { value: "36", label: "videos embebidos" },
            { value: "3", label: "etiquetas internas" },
          ],
          mediaAlt: "Gráfico en movimiento: 18 miniaturas de videos entran en una grilla y se ordenan en tres filas, Shorts, Series y Videos, cada una con su etiqueta interna",
          caption: "Las miniaturas del canal, ordenadas por la etiqueta interna que lee el theme",
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
        lattice: {
          kicker: "Visual system",
          title: "A lattice that draws itself.",
          body: [
            "The site has an identity of its own: blue over navy, a hexagon lattice that runs behind front pages and featured slots, and a hero slider that presents the series with a big title and one button. Here it is reproduced without images: the geometry is generated in code and the title types itself letter by letter, the way a first-time reader sees it.",
            "Under that layer sit 13 custom Handlebars templates (front page, episode, hubs, roadmap, press kit, contact) and 24 vanilla JavaScript modules: the slider, the series player, each article's table of contents, the video modal, the front-page carousels and the search. Tailwind 4 compiled with Gulp, no frontend framework.",
          ],
          facts: [
            { value: "13", label: "custom templates" },
            { value: "24", label: "JavaScript modules" },
          ],
          mediaAlt: "Motion graphic: the hero slider reproduced without an image, with the hexagon lattice drawing itself and three titles typing letter by letter",
          caption: "The hero slider without an image: a lattice generated in code and real titles",
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
        pipeline: {
          kicker: "Architecture",
          title: "Two sources, one page.",
          body: [
            "Ghost has no custom fields, every article lives in exactly one collection and its search reads title and excerpt only. Enough to write, not enough to order a series, curate a hub or decide what goes on the front page. So next to Ghost there is an in-house dashboard in Next.js with PostgreSQL: ten modules (series, tag groups, hubs, carousels, roadmap, changelog) and thirteen public endpoints the theme consumes.",
            "The flow never changes: the team publishes in Ghost, the theme renders by tag and author on the server, and its JavaScript asks the dashboard for what Ghost does not know: the series order behind the “Episode 5 of 5” counter, each hub's sections, the front-page carousels and the roadmap. Reordering a series in the panel changes the episode page on the next render, without touching an article.",
          ],
          facts: [
            { value: "10", label: "dashboard modules" },
            { value: "13", label: "public endpoints" },
          ],
          mediaAlt: "Motion graphic: Ghost, the theme and the dashboard joined by rules; a post travels from Ghost to the theme and three json payloads from the dashboard to the theme while the page assembles",
          caption: "Ghost publishes, the dashboard orders, the theme assembles the page",
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
            "The panel is a Next.js app on PostgreSQL with Drizzle: series, tag groups, hubs, front-page carousels, roadmap, changelog, contact, gallery, import and export, and settings. Order is set by dragging, and the analytics charts show what gets read. The team curates there what Ghost does not model, and the theme reads it at render time.",
            "It deploys through GitHub Actions to GHCR and from there over SSH to the server; everything runs in Docker Compose containers behind Caddy with automatic TLS, on a server I also operate: deployment, backups and the day-to-day support of the publication.",
          ],
          mediaAlt: "The tutorials hub, with the sections and order defined in the dashboard",
          caption: "Tutorials hub, curated from the dashboard",
        },
        wall: {
          kicker: "Video",
          title: "Tags that become hubs.",
          body: [
            "Besides the site, I produce the video content for the DonWeb Cloud channel: long tutorials, series like the n8n course, and short píldoras for whoever arrives with one specific question. Thirty-six of those videos live embedded in the publication.",
            "Each video enters Ghost as a post with one internal tag: #short, #serie-item or #video. The theme reads them and assembles the front pages on its own: Píldoras gathers the shorts, Academia orders the series, and every hub lists its videos by crossing its own tag with #video. Publishing a new video is publishing a post; the rest sorts itself.",
          ],
          facts: [
            { value: "36", label: "embedded videos" },
            { value: "3", label: "internal tags" },
          ],
          mediaAlt: "Motion graphic: 18 video thumbnails enter a grid and sort themselves into three rows, Shorts, Series and Videos, each with its internal tag",
          caption: "The channel's thumbnails, sorted by the internal tag the theme reads",
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
