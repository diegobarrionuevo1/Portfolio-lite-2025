import type { ShowcaseDefinition } from "../types";

/**
 * Hermes, own product. In development, no public link yet. Text-only stub;
 * later tasks add the landing captures, the design canvases and the order
 * capsule motion graphic.
 */
export const hermes: ShowcaseDefinition = {
  shared: {
    slug: "hermes",
    order: 4,
    status: "in-development",
    atmosphere: {
      scheme: "dark",
      canvas: "#0B0E17",
      sunken: "#10141F",
      raised: "#161B2A",
      card: "#121726",
      ink: "#F4F5FA",
      secondary: "rgba(244,245,250,0.74)",
      muted: "rgba(244,245,250,0.5)",
      accent: "#E8562A",
      accentFg: "#0B0E17",
      hairline: "rgba(244,245,250,0.12)",
    },
    stack: ["Next.js", "TypeScript", "PostgreSQL", "Supabase", "WhatsApp"],
    hero: {},
    chapters: [
      { id: "storefront", layout: "text-only" },
      { id: "orders", layout: "text-only" },
    ],
    next: "finanzas-ia",
  },
  copy: {
    es: {
      name: "Hermes",
      kicker: "Producto propio",
      tagline:
        "Un comercio arma su carta y el cliente pide por WhatsApp: catálogo, pedidos, caja y atención en un solo panel.",
      role: "Fundador y desarrollador",
      period: "2026",
      statusLabel: "En desarrollo",
      hero: {
        headline: "Un comercio arma su carta, el cliente pide por WhatsApp.",
        sub: "Catálogo, pedidos, caja y atención en un panel; el pedido viaja como mensaje.",
        mediaAlt: "Tienda de Hermes en el celular",
      },
      chapters: {
        storefront: {
          kicker: "La tienda",
          title: "Una carta que se arma en minutos.",
          body: [
            "El comercio carga productos, precios, variantes y horarios desde el panel. Hermes publica una tienda web con su marca, lista para compartir como enlace o código QR, sin app que instalar.",
            "El cliente recorre el catálogo, arma el carrito y elige retiro o envío. Nada de registros ni contraseñas: el pedido se cierra donde el cliente ya está.",
          ],
        },
        orders: {
          kicker: "Los pedidos",
          title: "El pedido viaja como mensaje.",
          body: [
            "Al confirmar, el pedido llega al comercio como un mensaje de WhatsApp con el detalle completo y queda registrado en el panel: estado, caja y atención en un mismo lugar.",
            "Next.js y TypeScript sobre PostgreSQL con Supabase. En desarrollo: todavía sin usuarios ni facturación.",
          ],
        },
      },
      links: [],
      nextLabel: "Siguiente proyecto",
    },
    en: {
      name: "Hermes",
      kicker: "Own product",
      tagline:
        "A business builds its menu and customers order over WhatsApp: catalog, orders, cash and customer service in one panel.",
      role: "Founder and developer",
      period: "2026",
      statusLabel: "In development",
      hero: {
        headline: "A business builds its menu, the customer orders over WhatsApp.",
        sub: "Catalog, orders, cash and customer service in one panel; the order travels as a message.",
        mediaAlt: "Hermes storefront on a phone",
      },
      chapters: {
        storefront: {
          kicker: "The storefront",
          title: "A menu that takes minutes to set up.",
          body: [
            "The business loads products, prices, variants and opening hours from the panel. Hermes publishes a branded web store, ready to share as a link or a QR code, with no app to install.",
            "Customers browse the catalog, build their cart and choose pickup or delivery. No sign-ups, no passwords: the order closes where the customer already is.",
          ],
        },
        orders: {
          kicker: "Orders",
          title: "The order travels as a message.",
          body: [
            "On confirmation the order reaches the business as a WhatsApp message with the full detail and is recorded in the panel: status, cash and customer service in one place.",
            "Next.js and TypeScript on PostgreSQL with Supabase. In development: no users or revenue yet.",
          ],
        },
      },
      links: [],
      nextLabel: "Next project",
    },
  },
};
