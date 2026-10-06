import { workImage, workVideo } from "../scenes/media-src";
import type { ShowcaseDefinition, ShowcaseLive } from "../types";

/**
 * DonWeb Cloud, workshops and certification (P/02). Real captures and clips
 * from public/work/donweb-talleres/ (dimensions from public/work/manifest.json)
 * plus three live components registered in scenes/live-registry.tsx:
 * `cert-tilt` (the certificate hero re-created), `legacy-url` and
 * `four-services` (motion graphics, see scenes/mg/donweb-talleres.tsx).
 *
 * The headline figures (218 / 138.109 / 123.253, July 2026) are the ones the
 * home carousel states; the chapter facts come from the repositories: 2.180
 * test cases in 128 files, 121.087 registrations and 205 programs migrated
 * in June 2026, 43 GB of stored PDFs replaced by on-demand composition,
 * 5.718 → 8 errors per hour on a live-event day, ~3 min from merge to
 * production, ~17 s nginx → Caddy cutover.
 */
const SLUG = "donweb-talleres";

/** 2400w desktop captures, with their 1200w siblings for srcSet. */
const capture = (name: string, id?: string) => workImage(SLUG, name, 2400, 1500, { variants: [1200], id });
/** 3x phone captures, portrait, single file. */
const phone = (name: string, id?: string) => workImage(SLUG, name, 1170, 2532, { id });
/** The 760x537 demo certificates the pipeline rendered. */
const cert = (name: string, id?: string) => workImage(SLUG, name, 760, 537, { id });
/** Screen recordings transcoded to mp4 + webm with a poster frame. */
const clip = (name: string, width = 1920, height = 1080) => workVideo(SLUG, name, width, height);
const live = (component: string, aspect: number): ShowcaseLive => ({ kind: "live", component, aspect });

export const donwebTalleres: ShowcaseDefinition = {
  shared: {
    slug: SLUG,
    order: 2,
    status: "production",
    atmosphere: {
      scheme: "dark",
      canvas: "#071226",
      sunken: "#0A1A33",
      raised: "#112240",
      card: "#0E1C2F",
      ink: "#FFFFFF",
      secondary: "rgba(255,255,255,0.74)",
      muted: "rgba(255,255,255,0.5)",
      accent: "#90F268",
      accentFg: "#071226",
      hairline: "rgba(255,255,255,0.12)",
    },
    stack: ["Node.js", "Fastify", "TypeScript", "React", "PostgreSQL", "Directus", "Docker", "CI/CD"],
    hero: { media: clip("clip-certificate") },
    chapters: [
      { id: "certificate", layout: "live-full", media: live("cert-tilt", 1.6) },
      { id: "registro", layout: "media-cinema", media: clip("clip-registro") },
      { id: "legacy-url", layout: "live-full", media: live("legacy-url", 2) },
      {
        id: "before-after",
        layout: "media-full",
        media: [workImage(SLUG, "cert-236-legacy", 1024, 768), capture("certificate")],
      },
      { id: "first-generation", layout: "media-cinema", media: clip("demo-2023", 1920, 966) },
      { id: "platform", layout: "live-full", media: live("four-services", 2) },
      { id: "operators", layout: "media-right", media: capture("panel-login") },
    ],
    gallery: [
      capture("hub", "hub"),
      capture("registro-real", "registro-real"),
      capture("registro-oficial", "registro-oficial"),
      capture("acreditacion", "acreditacion"),
      capture("certificate-s1", "certificate-s1"),
      phone("certificate-mobile", "certificate-mobile"),
      phone("registro-cloud-mobile", "registro-cloud-mobile"),
      workImage(SLUG, "cert-236-rrss", 1200, 627, { id: "cert-236-rrss" }),
      cert("cert-c6", "cert-c6"),
      cert("cert-c9", "cert-c9"),
    ],
    next: "ada13",
  },
  copy: {
    es: {
      name: "DonWeb Cloud — Talleres y certificación",
      kicker: "P/02",
      tagline:
        "Registro, acreditación y certificados de los talleres de DonWeb Cloud: cuatro servicios, migración sin downtime y más de 1.700 tests.",
      role: "Desarrollo y liderazgo técnico",
      period: "2023 — 2026",
      statusLabel: "Producción",
      hero: {
        headline: "Un certificado para cada persona que se sentó a aprender.",
        sub: "Registro, acreditación y certificados en cuatro servicios, migrados sin downtime y con más de 1.700 tests.",
        mediaAlt:
          "La página pública de un certificado en certificados.donweb.com: el certificado se inclina con el puntero y abajo aparece la colección de la persona",
      },
      chapters: {
        certificate: {
          kicker: "El certificado",
          title: "Un certificado por persona.",
          body: [
            "Cada certificado tiene su página pública: nombre, taller, fecha y un identificador verificable. Es lo que la persona comparte en LinkedIn y lo que un empleador abre para comprobar que existe. Abajo está esa página, re-creada: mové el puntero sobre el certificado y probá los otros de la colección.",
            "La página ofrece el PDF para descargar, el link para compartir en redes y un botón de copiar el link de verificación. El PDF no vive en un disco: se compone bajo demanda con sharp y pdfkit a partir de la plantilla del taller, con el nombre como capa SVG, en el mismo paso que genera la tarjeta social de 1200 × 627.",
          ],
          facts: [
            { value: "PDF", label: "compuesto bajo demanda" },
            { value: "SVG", label: "el nombre, como capa sobre la plantilla" },
            { value: "1200 × 627", label: "tarjeta social por certificado" },
          ],
          mediaAlt:
            "Re-creación interactiva de la página del certificado: el certificado en blanco sobre el fondo azul, con inclinación 3D, y los otros certificados de la colección",
        },
        registro: {
          kicker: "Registro y acreditación",
          title: "Anotarse sin cuenta, acreditarse con un click.",
          body: [
            "Cada taller tiene su landing de registro con la marca que corresponde: DonWeb Cloud o la marca oficial de DonWeb. La persona deja nombre y mail, recibe la confirmación por correo y no necesita crear ninguna cuenta: el mail es la identidad.",
            "El día del taller, la acreditación de asistencia es una página más: la persona confirma que estuvo, el sistema la marca presente y el certificado queda listo para emitirse. Los correos de confirmación, recordatorio y certificado salen por Customer.io con los datos de cada inscripción.",
          ],
          facts: [
            { value: "2", label: "marcas, una landing por taller" },
            { value: "0", label: "cuentas necesarias" },
          ],
          mediaAlt: "Recorrido por la landing de registro de un taller de DonWeb Cloud",
          caption: "Landing de registro, marca Cloud",
        },
        "legacy-url": {
          kicker: "Migración",
          title: "Las URLs de 2023 siguen vivas.",
          body: [
            "Las primeras URLs de certificado llevaban el id del curso y el mail de la persona a la vista: /72/72_persona@mail.com. Miles de esos links ya estaban publicados en LinkedIn y no se podían romper. Hoy cada certificado vive en /cloud/certificado/{uuid}, y la URL vieja sigue resolviendo: Caddy y un rewrite de Next la llevan a un resolver que responde 307 hacia la nueva.",
            "La migración de junio de 2026 movió 121.087 inscripciones y 205 programas sin perder un registro, y reemplazó 43 GB de PDFs guardados en disco por certificados que se componen al pedirlos. El corte de nginx a Caddy duró unos 17 segundos; el servicio no se detuvo.",
          ],
          facts: [
            { value: "121.087", label: "inscripciones migradas" },
            { value: "205", label: "programas, sin pérdidas" },
            { value: "~17 s", label: "de corte nginx → Caddy" },
          ],
          mediaAlt:
            "Gráfico en movimiento: una URL histórica con el mail de la persona se transforma en la URL nueva con uuid, con una respuesta 307",
        },
        "before-after": {
          kicker: "2023 → 2026",
          title: "El mismo certificado, dos generaciones.",
          body: [
            "A la izquierda, mi propio certificado de agosto de 2024 tal como lo renderizaba el pipeline original: una imagen fija, compuesta en el servidor y guardada en disco. A la derecha, el mismo certificado en la página pública de 2026: verificable, descargable y con toda la colección de la persona debajo.",
            "Cambió el formato, el identificador y la forma de generarlo. No cambió ningún link ya publicado.",
          ],
          mediaAlt: [
            "Certificado de Diego Barrionuevo de agosto de 2024, renderizado por el pipeline de 2023",
            "El mismo certificado en la página pública de certificados.donweb.com en 2026",
          ],
          caption: ["2024, render del pipeline original", "2026, página pública"],
        },
        "first-generation": {
          kicker: "Primera versión",
          title: "Mayo de 2023: un servicio, una persona.",
          body: [
            "La primera versión la construí solo, en mayo de 2023: Next 13 y Express, certificados compuestos con sharp y pdfkit, correos por Envialo Simple. Un único servicio que registraba, acreditaba y emitía.",
            "Esa versión emitió los primeros certificados y definió lo que el sistema tenía que preservar: la URL pública como prueba y el mail como identidad. La renovación de 2026 heredó esas dos decisiones y reemplazó todo lo demás.",
          ],
          mediaAlt: "Grabación de pantalla de la primera versión de la plataforma, en 2023",
          caption: "Demo de la primera versión, 2023",
        },
        platform: {
          kicker: "Plataforma",
          title: "Cuatro servicios y un deploy de tres minutos.",
          body: [
            "La versión de 2026 son cuatro servicios: la API en Node 22 y Fastify con arquitectura hexagonal (dominio, aplicación, infraestructura), la web pública en Next 15, el panel de operación en Next 16 y la infraestructura con Docker Compose y Caddy, que resuelve TLS con un certificado wildcard. Directus se monta sobre la base MySQL heredada, así el equipo edita los datos históricos sin migrarlos a otro motor.",
            "Cada cambio corre 2.180 casos de test en Vitest. Si pasan, GitHub Actions construye la imagen, la publica en GHCR y promueve el SHA inmutable a producción: unos tres minutos del merge a producción. Volver atrás es promover el SHA anterior.",
          ],
          facts: [
            { value: "2.180", label: "casos de test en 128 archivos" },
            { value: "~3 min", label: "del merge a producción" },
            { value: "4", label: "servicios: api, web, panel, infra" },
          ],
          mediaAlt:
            "Gráfico en movimiento: los cuatro servicios y un SHA que viaja de CI a GHCR y a producción, con un rollback de un paso",
        },
        operators: {
          kicker: "Operación",
          title: "Un panel para el equipo que dicta los talleres.",
          body: [
            "El panel de operación crea los talleres, programa las transmisiones en YouTube Live por la API de Google, sigue las inscripciones en tiempo real y dispara los correos de confirmación, recordatorio y certificado por Customer.io.",
            "En un día de evento en vivo, los errores por hora bajaron de 5.718 a 8 después de la renovación. El equipo opera desde el panel; el soporte diario y la infraestructura siguen a mi cargo.",
          ],
          facts: [
            { value: "5.718 → 8", label: "errores por hora en un evento en vivo" },
            { value: "−99,86 %", label: "de errores" },
          ],
          mediaAlt: "Pantalla de ingreso al panel de operación de los talleres",
          caption: "Panel de operación",
        },
      },
      metrics: {
        kicker: "A julio de 2026",
        stats: [
          { value: "218", label: "cursos, talleres y webinars" },
          { value: "138.109", label: "registros" },
          { value: "123.253", label: "certificados emitidos" },
        ],
        closer: "Más de 1.700 tests automatizados y migración sin downtime.",
        note: "Cifras del panel de operación a julio de 2026.",
      },
      gallery: {
        kicker: "Recorrido",
        items: {
          hub: { alt: "Portada de talleres.donweb.com con el catálogo de talleres", caption: "Portada y catálogo" },
          "registro-real": { alt: "Landing de registro de un taller real", caption: "Registro de un taller" },
          "registro-oficial": {
            alt: "Landing de registro con la marca oficial de DonWeb",
            caption: "Registro, marca oficial",
          },
          acreditacion: {
            alt: "Página de acreditación de asistencia a un taller",
            caption: "Acreditación de asistencia",
          },
          "certificate-s1": {
            alt: "La sección de otros certificados en la página de un certificado",
            caption: "La colección de la persona",
          },
          "certificate-mobile": { alt: "Página de un certificado en el celular", caption: "Certificado, móvil" },
          "registro-cloud-mobile": { alt: "Landing de registro en el celular", caption: "Registro, móvil" },
          "cert-236-rrss": {
            alt: "Tarjeta social de 1200 × 627 de un certificado, generada junto con el PDF",
            caption: "Tarjeta para redes",
          },
          "cert-c6": {
            alt: "Certificado de demostración del taller de despliegue continuo con GitHub Actions",
            caption: "Certificado: GitHub Actions",
          },
          "cert-c9": {
            alt: "Certificado de demostración del taller de PostgreSQL",
            caption: "Certificado: PostgreSQL",
          },
        },
      },
      links: [{ label: "Ver el sitio", href: "https://certificados.donweb.com", variant: "accent" }],
      nextLabel: "Siguiente proyecto",
    },
    en: {
      name: "DonWeb Cloud — Workshops & certification",
      kicker: "P/02",
      tagline:
        "Registration, attendance and certificates for DonWeb Cloud's workshops: four services, a zero-downtime migration and 1,700+ tests.",
      role: "Development and technical leadership",
      period: "2023 — 2026",
      statusLabel: "Production",
      hero: {
        headline: "A certificate for every person who sat down to learn.",
        sub: "Registration, attendance and certificates across four services, migrated with zero downtime and backed by 1,700+ tests.",
        mediaAlt:
          "The public page of a certificate on certificados.donweb.com: the certificate tilts with the pointer and the person's collection follows below",
      },
      chapters: {
        certificate: {
          kicker: "The certificate",
          title: "One certificate per person.",
          body: [
            "Every certificate has its own public page: name, workshop, date and a verifiable identifier. It is what people share on LinkedIn and what an employer opens to check that it exists. Below is that page, re-created: move the pointer over the certificate and try the others in the collection.",
            "The page offers the PDF to download, the link to share on social networks and a button that copies the verification link. The PDF does not live on a disk: it is composed on demand with sharp and pdfkit from the workshop's template, with the name as an SVG layer, in the same step that renders the 1200 × 627 social card.",
          ],
          facts: [
            { value: "PDF", label: "composed on demand" },
            { value: "SVG", label: "the name, as a layer over the template" },
            { value: "1200 × 627", label: "social card per certificate" },
          ],
          mediaAlt:
            "Interactive re-creation of the certificate page: the white certificate on the navy field, tilting in 3D, with the other certificates in the collection",
        },
        registro: {
          kicker: "Registration and attendance",
          title: "Sign up without an account, check in with one click.",
          body: [
            "Every workshop has its own registration landing page under the brand it belongs to: DonWeb Cloud or DonWeb's official brand. People leave a name and an e-mail, get the confirmation by e-mail and never create an account: the e-mail is the identity.",
            "On the day, attendance is one more page: the person confirms they were there, the system marks them present and the certificate is ready to be issued. Confirmation, reminder and certificate e-mails go out through Customer.io with each registration's data.",
          ],
          facts: [
            { value: "2", label: "brands, one landing page per workshop" },
            { value: "0", label: "accounts required" },
          ],
          mediaAlt: "A walk through the registration landing page of a DonWeb Cloud workshop",
          caption: "Registration landing, Cloud brand",
        },
        "legacy-url": {
          kicker: "Migration",
          title: "The 2023 URLs are still alive.",
          body: [
            "The first certificate URLs carried the course id and the person's e-mail in plain sight: /72/72_persona@mail.com. Thousands of those links were already on LinkedIn and could not break. Today every certificate lives at /cloud/certificado/{uuid}, and the old URL still resolves: Caddy and a Next rewrite hand it to a resolver that answers 307 towards the new one.",
            "The June 2026 migration moved 121,087 registrations and 205 programs without losing a record, and replaced 43 GB of PDFs stored on disk with certificates composed when requested. The nginx to Caddy cutover took about 17 seconds; the service never stopped.",
          ],
          facts: [
            { value: "121,087", label: "registrations migrated" },
            { value: "205", label: "programs, nothing lost" },
            { value: "~17 s", label: "nginx → Caddy cutover" },
          ],
          mediaAlt:
            "Motion graphic: a legacy URL carrying the person's e-mail becomes the new uuid URL, answered with a 307",
        },
        "before-after": {
          kicker: "2023 → 2026",
          title: "The same certificate, two generations.",
          body: [
            "On the left, my own certificate from August 2024 as the original pipeline rendered it: a static image, composed on the server and stored on disk. On the right, the same certificate on the 2026 public page: verifiable, downloadable, with the person's whole collection underneath.",
            "The format, the identifier and the way it is generated changed. Not one published link did.",
          ],
          mediaAlt: [
            "Diego Barrionuevo's certificate from August 2024, rendered by the 2023 pipeline",
            "The same certificate on the certificados.donweb.com public page in 2026",
          ],
          caption: ["2024, original pipeline render", "2026, public page"],
        },
        "first-generation": {
          kicker: "First version",
          title: "May 2023: one service, one person.",
          body: [
            "I built the first version alone, in May 2023: Next 13 and Express, certificates composed with sharp and pdfkit, e-mail through Envialo Simple. A single service that registered, checked in and issued.",
            "That version issued the first certificates and defined what the system had to preserve: the public URL as proof and the e-mail as identity. The 2026 renewal inherited those two decisions and replaced everything else.",
          ],
          mediaAlt: "Screen recording of the platform's first version, in 2023",
          caption: "Demo of the first version, 2023",
        },
        platform: {
          kicker: "Platform",
          title: "Four services and a three-minute deploy.",
          body: [
            "The 2026 version is four services: the API on Node 22 and Fastify with a hexagonal architecture (domain, application, infrastructure), the public web on Next 15, the operations panel on Next 16 and the infrastructure on Docker Compose and Caddy, which handles TLS with a wildcard certificate. Directus sits on top of the legacy MySQL database, so the team edits the historic data without moving it to another engine.",
            "Every change runs 2,180 test cases on Vitest. When they pass, GitHub Actions builds the image, publishes it to GHCR and promotes the immutable SHA to production: about three minutes from merge to production. Rolling back is promoting the previous SHA.",
          ],
          facts: [
            { value: "2,180", label: "test cases in 128 files" },
            { value: "~3 min", label: "from merge to production" },
            { value: "4", label: "services: api, web, panel, infra" },
          ],
          mediaAlt:
            "Motion graphic: the four services and a SHA travelling from CI to GHCR to production, with a one-step rollback",
        },
        operators: {
          kicker: "Operations",
          title: "A panel for the team that runs the workshops.",
          body: [
            "The operations panel creates the workshops, schedules the YouTube Live broadcasts through the Google API, follows registrations in real time and triggers the confirmation, reminder and certificate e-mails through Customer.io.",
            "On a live-event day, errors per hour went from 5,718 to 8 after the renewal. The team operates from the panel; day-to-day support and the infrastructure remain with me.",
          ],
          facts: [
            { value: "5,718 → 8", label: "errors per hour on a live-event day" },
            { value: "−99.86%", label: "errors" },
          ],
          mediaAlt: "The sign-in screen of the workshops operations panel",
          caption: "Operations panel",
        },
      },
      metrics: {
        kicker: "As of July 2026",
        stats: [
          { value: "218", label: "courses, workshops and webinars" },
          { value: "138,109", label: "registrations" },
          { value: "123,253", label: "certificates issued" },
        ],
        closer: "1,700+ automated tests and a zero-downtime migration.",
        note: "Operations panel figures as of July 2026.",
      },
      gallery: {
        kicker: "Walkthrough",
        items: {
          hub: { alt: "The talleres.donweb.com front page with the workshop catalogue", caption: "Front page and catalogue" },
          "registro-real": { alt: "The registration landing page of a real workshop", caption: "Workshop registration" },
          "registro-oficial": {
            alt: "A registration landing page under DonWeb's official brand",
            caption: "Registration, official brand",
          },
          acreditacion: {
            alt: "The attendance check-in page of a workshop",
            caption: "Attendance check-in",
          },
          "certificate-s1": {
            alt: "The other-certificates section on a certificate page",
            caption: "The person's collection",
          },
          "certificate-mobile": { alt: "A certificate page on a phone", caption: "Certificate, mobile" },
          "registro-cloud-mobile": { alt: "A registration landing page on a phone", caption: "Registration, mobile" },
          "cert-236-rrss": {
            alt: "The 1200 × 627 social card of a certificate, rendered alongside the PDF",
            caption: "Social card",
          },
          "cert-c6": {
            alt: "Demo certificate for the continuous deployment with GitHub Actions workshop",
            caption: "Certificate: GitHub Actions",
          },
          "cert-c9": { alt: "Demo certificate for the PostgreSQL workshop", caption: "Certificate: PostgreSQL" },
        },
      },
      links: [{ label: "Visit the site", href: "https://certificados.donweb.com", variant: "accent" }],
      nextLabel: "Next project",
    },
  },
};
