import { workImage, workVideo } from "../scenes/media-src";
import type { ShowcaseDefinition, ShowcaseLive } from "../types";

/**
 * Ada13, web platform (P/03). Archived: the site is offline, so there are no
 * links. Everything visual is a Wayback Machine capture of ada13.tech (the
 * 2023 one-page and the 2024 pre-registration home, desktop and phone,
 * inner sections by scroll offset), the event's own footage (the 2024
 * vertical clip and the auditorium hero photo) and the wordmark, all under
 * public/work/ada13/ (dimensions from public/work/manifest.json), plus three
 * live components registered in scenes/live-registry.tsx: `day-256`,
 * `inscribe-states` and `incident-ledger` (scenes/mg/ada13.tsx).
 *
 * Facts come from the archived site and its press coverage: 13 September
 * 2023 (day 256 of the year), Usina del Arte, co-produced by DonWeb Cloud
 * and SoyDalto; a JS-generated agenda of 17 items in 3 tracks; a form that
 * POSTs JSON to an Express service at utils.ada13.tech/inscribe with four
 * states; Directus at backend.ada13.tech; EnvialoSimple for the e-mails;
 * a second edition in 2024 on the same platform. Nothing else is claimed.
 */
const SLUG = "ada13";

/** 2400w desktop captures, with their 1200w siblings for srcSet. */
const capture = (name: string, id?: string) => workImage(SLUG, name, 2400, 1500, { variants: [1200], id });
/** 3x phone captures, portrait, single file. */
const phone = (name: string, id?: string) => workImage(SLUG, name, 1170, 2532, { id });
const live = (component: string, aspect: number): ShowcaseLive => ({ kind: "live", component, aspect });

export const ada13: ShowcaseDefinition = {
  shared: {
    slug: SLUG,
    order: 3,
    status: "archived",
    atmosphere: {
      scheme: "dark",
      canvas: "#060C22",
      sunken: "#0B1536",
      raised: "#112363",
      card: "#0D1A44",
      ink: "#FFFFFF",
      secondary: "rgba(255,255,255,0.74)",
      muted: "rgba(255,255,255,0.5)",
      accent: "#FF8000",
      accentFg: "#060C22",
      hairline: "rgba(255,255,255,0.14)",
    },
    stack: ["Bootstrap 4", "jQuery", "Express", "Directus", "EnvialoSimple"],
    hero: { media: capture("home-2023") },
    chapters: [
      { id: "event", layout: "live-full", media: live("day-256", 2) },
      { id: "site", layout: "media-full", media: [capture("section-1"), capture("section-2")] },
      { id: "backstage", layout: "live-full", media: live("inscribe-states", 2.1) },
      { id: "footage", layout: "media-left", media: workVideo(SLUG, "event-2024", 720, 1280) },
      { id: "maintenance", layout: "live-full", media: live("incident-ledger", 2.2) },
      { id: "second-edition", layout: "media-right", media: capture("home-2024") },
    ],
    gallery: [
      phone("home-2023-mobile", "home-2023-mobile"),
      phone("home-2024-mobile", "home-2024-mobile"),
      capture("section-3", "section-3"),
      capture("section-4", "section-4"),
      workImage(SLUG, "intro-bg", 1024, 683, { id: "intro-bg" }),
      workImage(SLUG, "logo", 600, 200, { id: "logo" }),
    ],
    next: "hermes",
  },
  copy: {
    es: {
      name: "Ada13 — Plataforma web",
      kicker: "P/03",
      tagline:
        "La plataforma web del Día del Programador 2023 en Buenos Aires: inscripciones, correos transaccionales y soporte durante el evento.",
      role: "Desarrollo full stack y mantenimiento",
      period: "2023 — 2024",
      statusLabel: "Archivado",
      hero: {
        headline: "La plataforma detrás del evento del Día del Programador.",
        sub: "Inscripciones, correos transaccionales y soporte de una conferencia de un solo día en Buenos Aires.",
        mediaAlt:
          "Portada archivada de ada13.tech en 2023: el auditorio a oscuras, el logo ADA 13 en naranja, la leyenda Evento del día del programador y el botón Inscribite ahora",
      },
      chapters: {
        event: {
          kicker: "El evento",
          title: "Un día, una sala, cientos de inscriptos.",
          body: [
            "ADA13 fue el evento por el Día del Programador: el miércoles 13 de septiembre de 2023, día 256 del año, en la Usina del Arte de La Boca. Lo coprodujeron DonWeb Cloud y SoyDalto, con cupos presenciales limitados y streaming gratuito para el resto del mundo.",
            "Diecisiete charlas y workshops en tres tracks en paralelo, Auditorio, Workshops y Otros, con duelos de código, meet & greet y feria de empleo. Todo lo que el público veía pasaba por un solo sitio: la plataforma web, que tenía que aguantar el pico de inscripciones de las semanas previas y volver a hacerlo en 2024.",
          ],
          facts: [
            { value: "1", label: "día" },
            { value: "256", label: "día del año" },
            { value: "17", label: "charlas y workshops" },
            { value: "3", label: "tracks en paralelo" },
          ],
          mediaAlt:
            "Gráfico en movimiento: un contador monoespaciado cuenta del día 001 al 256 mientras una línea recorre el año y se detiene en el 13 de septiembre, Día del Programador",
        },
        site: {
          kicker: "El sitio",
          title: "Una sola página que lo sostenía todo.",
          body: [
            "ada13.tech era un one-page en Bootstrap 4 y jQuery: intro, sobre el evento, speakers, hosts, agenda, lugar, hoteles cercanos, sponsors, inscripción y preguntas frecuentes. Una página, diez secciones y un solo botón que importaba: Inscribite ahora.",
            "La agenda no estaba escrita en el HTML. Se generaba en JavaScript a partir de una lista de 17 ítems repartidos en tres tracks, con horario, speaker y descripción. Cambiar una charla era editar un objeto, no maquetar.",
          ],
          mediaAlt: [
            "La sección Sobre ADA13 y la grilla de speakers del sitio archivado de 2023",
            "Los hosts y la agenda del sitio archivado, con sus tres tracks: Auditorio, Workshops y Otros",
          ],
          caption: ["Speakers, captura del archivo web, 2023", "Agenda en tres tracks, captura del archivo web, 2023"],
        },
        backstage: {
          kicker: "Detrás de escena",
          title: "Inscripción, correo y soporte en vivo.",
          body: [
            "El formulario pedía mail, nombre, apellido, país, ciudad, fecha de nacimiento, teléfono y modalidad, presencial u online, y mandaba un JSON a un servicio Express en utils.ada13.tech. El servicio respondía uno de cuatro estados, pre-inscripto, lista de espera, anotado o formulario cerrado, y cada uno iba seguido del mismo mensaje: te hemos enviado todos los detalles al mail.",
            "Los países venían de un Directus headless en backend.ada13.tech y los correos salían por EnvialoSimple Transaccional, el producto de email transaccional de DonWeb. Refactoricé las dos puntas, el frontend y el servicio, procesé los datos de inscriptos e implementé los correos: cuando un mail no llega, hay una persona que no entra.",
          ],
          facts: [
            { value: "4", label: "estados de inscripción" },
            { value: "JSON", label: "por POST a /inscribe" },
            { value: "1", label: "CMS headless: Directus" },
          ],
          mediaAlt:
            "Gráfico en movimiento: el formulario de inscripción manda un JSON por POST a un servicio Express, que enciende uno de cuatro estados y dispara un correo por EnvialoSimple; a un costado, Directus alimenta la lista de países",
        },
        footage: {
          kicker: "El día",
          title: "Una laptop en la mesa de acreditación.",
          body: [
            "El 13 de septiembre la plataforma dejó de ser un sitio y pasó a ser una mesa: en la acreditación de la Usina había una laptop con la plataforma abierta, y por ahí entraba cada persona inscripta. Para el resto del mundo, el streaming gratuito.",
            "Ese día el soporte era en vivo. Cualquier duda sobre una inscripción se resolvía en el momento, con los datos del mismo servicio que había recibido el formulario.",
          ],
          mediaAlt:
            "Video vertical de la edición 2024: la Usina del Arte desde el aire, la sala y la mesa de acreditación con una laptop",
          caption: "Edición 2024, registro del evento",
        },
        maintenance: {
          kicker: "Mantenimiento",
          title: "Mantener vivo un evento que vuelve cada año.",
          body: [
            "Después del evento el trabajo no terminó. Desde septiembre de 2023 quedé a cargo del mantenimiento del servicio, el soporte correctivo y el seguimiento de incidencias, y la segunda edición corrió sobre la misma plataforma.",
            "Un evento de un solo día no admite segundas oportunidades: lo que falla el 13 no se arregla el 14. Por eso la operación se parecía menos a un deploy y más a un registro de incidencias que se cierra una por una.",
          ],
          facts: [
            { value: "2", label: "ediciones: 2023 · 2024" },
            { value: "4", label: "estados de inscripción" },
            { value: "1", label: "CMS: Directus" },
            { value: "1", label: "servicio de correo: EnvialoSimple" },
          ],
          mediaAlt:
            "Gráfico en movimiento, esquemático: una tabla monoespaciada de incidencias se escribe línea por línea y cada fila pasa de abierta a cerrada mientras un contador suma las cerradas",
        },
        "second-edition": {
          kicker: "Segunda edición",
          title: "2024: el mismo sitio, otra pre-inscripción.",
          body: [
            "En 2024 el sitio cambió el botón por Pre-inscripción 2024 y volvió a recibir formularios sobre la misma base: el one-page, el servicio Express, Directus y los correos. No hubo que construir otra plataforma, hubo que mantener la que estaba.",
            "Hoy el sitio está fuera de línea. Lo que se ve en esta página son capturas del archivo web de 2023 y 2024 y material del propio evento.",
          ],
          mediaAlt: "Portada archivada de ada13.tech en 2024, con el botón Pre-inscripción 2024",
          caption: "Portada 2024, captura del archivo web",
        },
      },
      metrics: {
        kicker: "Un solo día",
        stats: [
          { value: "13/09", label: "fecha del evento" },
          { value: "256", label: "día del año" },
          { value: "17", label: "charlas y workshops en 3 tracks" },
          { value: "2", label: "ediciones sobre la misma plataforma" },
        ],
        closer: "Inscripciones, correos y soporte de un evento que no admite segundas oportunidades.",
        note: "Sitio original fuera de línea; capturas del archivo web (2023 y 2024).",
      },
      gallery: {
        kicker: "Archivo",
        items: {
          "home-2023-mobile": { alt: "Portada de ada13.tech en 2023, en el celular", caption: "Portada 2023, móvil" },
          "home-2024-mobile": { alt: "Portada de ada13.tech en 2024, en el celular", caption: "Portada 2024, móvil" },
          "section-3": {
            alt: "El cierre de la agenda y el formulario de inscripción del sitio archivado",
            caption: "Inscripción, captura del archivo web, 2023",
          },
          "section-4": {
            alt: "El final del formulario, con la modalidad presencial u online, y la sección Lugar del evento: Usina del Arte, Buenos Aires",
            caption: "Lugar del evento, captura del archivo web, 2023",
          },
          "intro-bg": {
            alt: "El auditorio de la Usina del Arte lleno, la foto de portada del sitio",
            caption: "Foto de portada, 2023",
          },
          logo: { alt: "El wordmark ADA 13 en naranja sobre azul marino", caption: "Wordmark, 2023" },
        },
      },
      links: [],
      nextLabel: "Siguiente proyecto",
    },
    en: {
      name: "Ada13 — Web platform",
      kicker: "P/03",
      tagline:
        "The web platform for Programmer's Day 2023 in Buenos Aires: registrations, transactional e-mail and support during the event.",
      role: "Full-stack development and maintenance",
      period: "2023 — 2024",
      statusLabel: "Archived",
      hero: {
        headline: "The platform behind the Programmer's Day conference.",
        sub: "Registrations, transactional e-mail and support for a one-day conference in Buenos Aires.",
        mediaAlt:
          "The archived ada13.tech front page in 2023: the darkened auditorium, the orange ADA 13 logo, the line Evento del día del programador and the Inscribite ahora button",
      },
      chapters: {
        event: {
          kicker: "The event",
          title: "One day, one venue, hundreds of attendees.",
          body: [
            "ADA13 was the Programmer's Day conference: Wednesday 13 September 2023, day 256 of the year, at Usina del Arte in La Boca. DonWeb Cloud and SoyDalto co-produced it, with limited in-person seats and free streaming for the rest of the world.",
            "Seventeen talks and workshops across three parallel tracks, Auditorio, Workshops and Otros, with code duels, a meet and greet and a job fair. Everything the audience saw went through one site: the web platform, which had to hold up under the registration peak of the weeks before and do it again in 2024.",
          ],
          facts: [
            { value: "1", label: "day" },
            { value: "256", label: "day of the year" },
            { value: "17", label: "talks and workshops" },
            { value: "3", label: "parallel tracks" },
          ],
          mediaAlt:
            "Motion graphic: a monospaced counter counts from day 001 to 256 while a rule sweeps the year and stops on 13 September, Programmer's Day",
        },
        site: {
          kicker: "The site",
          title: "One page that held everything.",
          body: [
            "ada13.tech was a one-page site on Bootstrap 4 and jQuery: intro, about, speakers, hosts, schedule, venue, nearby hotels, sponsors, registration and FAQ. One page, ten sections and the only button that mattered: Inscribite ahora.",
            "The schedule was not written in the HTML. JavaScript generated it from a list of 17 items spread over three tracks, each with its time, speaker and description. Changing a talk meant editing an object, not laying out markup.",
          ],
          mediaAlt: [
            "The About ADA13 section and the speakers grid of the archived 2023 site",
            "The hosts and the schedule of the archived site, with its three tracks: Auditorio, Workshops and Otros",
          ],
          caption: ["Speakers, web archive capture, 2023", "Schedule in three tracks, web archive capture, 2023"],
        },
        backstage: {
          kicker: "Backstage",
          title: "Registration, e-mail and live support.",
          body: [
            "The form asked for e-mail, first name, last name, country, city, date of birth, phone and attendance mode, in person or online, and posted a JSON payload to an Express service at utils.ada13.tech. The service answered one of four states, pre-registered, waiting list, registered or form closed, each followed by the same message: we have sent all the details to your e-mail.",
            "The countries came from a headless Directus at backend.ada13.tech and the e-mails went out through EnvialoSimple Transaccional, DonWeb's transactional e-mail product. I refactored both ends, the frontend and the service, processed the registration data and implemented the e-mails: when a message never arrives, a person never gets in.",
          ],
          facts: [
            { value: "4", label: "registration states" },
            { value: "JSON", label: "posted to /inscribe" },
            { value: "1", label: "headless CMS: Directus" },
          ],
          mediaAlt:
            "Motion graphic: the registration form posts a JSON payload to an Express service, which lights one of four states and triggers an e-mail through EnvialoSimple; to the side, Directus feeds the country list",
        },
        footage: {
          kicker: "The day",
          title: "A laptop on the accreditation desk.",
          body: [
            "On 13 September the platform stopped being a site and became a desk: at the Usina's accreditation table a laptop had the platform open, and every registered person came in through it. For the rest of the world, the free stream.",
            "That day, support was live. Any question about a registration was settled on the spot, with the data of the very service that had received the form.",
          ],
          mediaAlt:
            "Vertical video of the 2024 edition: Usina del Arte from the air, the hall and the accreditation desk with a laptop",
          caption: "2024 edition, event footage",
        },
        maintenance: {
          kicker: "Maintenance",
          title: "Keeping alive an event that comes back every year.",
          body: [
            "The work did not end with the event. From September 2023 I stayed in charge of service maintenance, corrective support and incident follow-up, and the second edition ran on the same platform.",
            "A one-day event allows no second chances: what breaks on the 13th is not fixed on the 14th. So the operation looked less like a deploy and more like an incident ledger, closed one row at a time.",
          ],
          facts: [
            { value: "2", label: "editions: 2023 · 2024" },
            { value: "4", label: "registration states" },
            { value: "1", label: "CMS: Directus" },
            { value: "1", label: "e-mail service: EnvialoSimple" },
          ],
          mediaAlt:
            "Motion graphic, schematic: a monospaced table of incidents types itself in line by line and each row flips from open to closed while a tally counts the closed ones",
        },
        "second-edition": {
          kicker: "Second edition",
          title: "2024: the same site, another pre-registration.",
          body: [
            "In 2024 the site swapped its button for Pre-inscripción 2024 and took forms again on the same base: the one-page, the Express service, Directus and the e-mails. There was no second platform to build, only the first one to keep.",
            "Today the site is offline. What this page shows are web archive captures from 2023 and 2024 and the event's own material.",
          ],
          mediaAlt: "The archived ada13.tech front page in 2024, with the Pre-inscripción 2024 button",
          caption: "2024 front page, web archive capture",
        },
      },
      metrics: {
        kicker: "One single day",
        stats: [
          { value: "13/09", label: "event date" },
          { value: "256", label: "day of the year" },
          { value: "17", label: "talks and workshops in 3 tracks" },
          { value: "2", label: "editions on the same platform" },
        ],
        closer: "Registrations, e-mail and support for an event that allows no second chances.",
        note: "Original site offline; web archive captures (2023 and 2024).",
      },
      gallery: {
        kicker: "Archive",
        items: {
          "home-2023-mobile": { alt: "The ada13.tech front page in 2023, on a phone", caption: "2023 front page, mobile" },
          "home-2024-mobile": { alt: "The ada13.tech front page in 2024, on a phone", caption: "2024 front page, mobile" },
          "section-3": {
            alt: "The end of the schedule and the registration form of the archived site",
            caption: "Registration, web archive capture, 2023",
          },
          "section-4": {
            alt: "The end of the form, with the in-person or online choice, and the venue section: Usina del Arte, Buenos Aires",
            caption: "Venue, web archive capture, 2023",
          },
          "intro-bg": {
            alt: "The full auditorium of Usina del Arte, the site's cover photo",
            caption: "Cover photo, 2023",
          },
          logo: { alt: "The orange ADA 13 wordmark on navy", caption: "Wordmark, 2023" },
        },
      },
      links: [],
      nextLabel: "Next project",
    },
  },
};
