import type { ShowcaseDefinition } from "../types";

/**
 * DonWeb Cloud, workshops and certification (P/02). Text-only stub: later
 * tasks add the certificate tilt, the four-service lattice and the captures.
 */
export const donwebTalleres: ShowcaseDefinition = {
  shared: {
    slug: "donweb-talleres",
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
    hero: {},
    chapters: [
      { id: "certificate", layout: "text-only" },
      { id: "platform", layout: "text-only" },
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
        mediaAlt: "Certificado público de DonWeb Cloud",
      },
      chapters: {
        certificate: {
          kicker: "El certificado",
          title: "Una página pública que vale como prueba.",
          body: [
            "Cada certificado tiene su URL pública: nombre, taller, fecha y un identificador verificable. Es lo que la persona comparte en LinkedIn y lo que un empleador abre para comprobar que existe.",
            "Las URLs históricas de 2023 siguen funcionando. La renovación de 2026 cambió identificadores y formato sin romper un solo enlace ya publicado.",
          ],
        },
        platform: {
          kicker: "La plataforma",
          title: "Cuatro servicios, una migración sin downtime.",
          body: [
            "La versión inicial de 2023 era un único servicio. En 2026 la reemplacé por cuatro: registro, acreditación, certificados y un panel de operación, con Fastify, TypeScript, PostgreSQL y Directus, desplegados en contenedores con CI/CD.",
            "La migración movió datos y usuarios sin cortar el servicio y quedó cubierta por más de 1.700 tests automatizados que corren en cada cambio.",
          ],
          facts: [
            { value: "4", label: "servicios en producción" },
            { value: "+1.700", label: "tests automatizados" },
          ],
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
        mediaAlt: "A public DonWeb Cloud certificate",
      },
      chapters: {
        certificate: {
          kicker: "The certificate",
          title: "A public page that counts as proof.",
          body: [
            "Every certificate has its own public URL: name, workshop, date and a verifiable identifier. It is what people share on LinkedIn and what an employer opens to check that it exists.",
            "The 2023 URLs still work. The 2026 renewal changed identifiers and format without breaking a single link already out there.",
          ],
        },
        platform: {
          kicker: "The platform",
          title: "Four services, one zero-downtime migration.",
          body: [
            "The 2023 version was a single service. In 2026 I replaced it with four: registration, attendance, certificates and an operations panel, built with Fastify, TypeScript, PostgreSQL and Directus and deployed as containers with CI/CD.",
            "The migration moved data and users without taking the service down, and it is covered by 1,700+ automated tests that run on every change.",
          ],
          facts: [
            { value: "4", label: "services in production" },
            { value: "1,700+", label: "automated tests" },
          ],
        },
      },
      links: [{ label: "Visit the site", href: "https://certificados.donweb.com", variant: "accent" }],
      nextLabel: "Next project",
    },
  },
};
