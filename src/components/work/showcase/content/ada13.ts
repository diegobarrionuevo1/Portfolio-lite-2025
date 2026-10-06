import type { ShowcaseDefinition } from "../types";

/**
 * Ada13, web platform (P/03). Archived: the site is offline, so there are no
 * links. Text-only stub; later tasks add the Wayback captures and the
 * registration-states motion graphic.
 */
export const ada13: ShowcaseDefinition = {
  shared: {
    slug: "ada13",
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
    stack: ["Bootstrap", "jQuery", "Express", "Directus", "EnvialoSimple"],
    hero: {},
    chapters: [
      { id: "event", layout: "text-only" },
      { id: "backstage", layout: "text-only" },
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
        mediaAlt: "Portada de ada13.tech",
      },
      chapters: {
        event: {
          kicker: "El evento",
          title: "Un día, una sala, cientos de inscriptos.",
          body: [
            "ADA13 fue la conferencia del Día del Programador: 13 de septiembre de 2023, en la Usina del Arte de Buenos Aires. Charlas, comunidad y una plataforma que tenía que aguantar el pico de inscripciones de las semanas previas.",
            "El sitio ya no está en línea. Lo que queda es el registro de cómo funcionó y lo que aprendí operándolo.",
          ],
          facts: [
            { value: "13.09.2023", label: "Día del Programador" },
            { value: "Usina del Arte", label: "Buenos Aires" },
          ],
        },
        backstage: {
          kicker: "Detrás de escena",
          title: "Inscripción, correo y soporte en vivo.",
          body: [
            "El flujo de inscripción corría sobre Express con Directus como backend de datos. Cada registro disparaba correos transaccionales por EnvialoSimple: confirmación, recordatorios y la entrada del día.",
            "Refactoricé frontend y backend, procesé los datos de inscriptos y atendí incidencias antes y durante el evento, cuando un correo que no llega es una persona que no entra.",
          ],
        },
      },
      links: [],
      nextLabel: "Siguiente proyecto",
    },
    en: {
      name: "Ada13 — Web platform",
      kicker: "P/03",
      tagline:
        "The web platform for Programmer's Day 2023 in Buenos Aires: registrations, transactional email and support during the event.",
      role: "Full-stack development and maintenance",
      period: "2023 — 2024",
      statusLabel: "Archived",
      hero: {
        headline: "The platform behind the Programmer's Day conference.",
        sub: "Registrations, transactional email and support for a one-day conference in Buenos Aires.",
        mediaAlt: "ada13.tech front page",
      },
      chapters: {
        event: {
          kicker: "The event",
          title: "One day, one venue, hundreds of attendees.",
          body: [
            "ADA13 was the Programmer's Day conference: September 13, 2023, at Usina del Arte in Buenos Aires. Talks, community and a platform that had to hold up under the registration peak of the weeks before.",
            "The site is no longer online. What remains is the record of how it worked and what I learned running it.",
          ],
          facts: [
            { value: "Sep 13, 2023", label: "Programmer's Day" },
            { value: "Usina del Arte", label: "Buenos Aires" },
          ],
        },
        backstage: {
          kicker: "Backstage",
          title: "Registration, email and live support.",
          body: [
            "The registration flow ran on Express with Directus as the data backend. Every sign-up triggered transactional email through EnvialoSimple: confirmation, reminders and the ticket for the day.",
            "I refactored the frontend and backend, processed attendee data and handled incidents before and during the event, when an email that never arrives is a person who never gets in.",
          ],
        },
      },
      links: [],
      nextLabel: "Next project",
    },
  },
};
