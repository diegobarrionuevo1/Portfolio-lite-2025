import type { ShowcaseDefinition } from "../types";

/**
 * Personal finance with AI, own product. The only light atmosphere: the app
 * itself is white and ink. Text-only stub; later tasks add the phone
 * captures and the "message to movement" parser motion graphic.
 */
export const finanzasIa: ShowcaseDefinition = {
  shared: {
    slug: "finanzas-ia",
    order: 5,
    status: "in-development",
    atmosphere: {
      scheme: "light",
      canvas: "#FFFFFF",
      sunken: "#F1F5F9",
      raised: "#FFFFFF",
      card: "#FFFFFF",
      ink: "#111827",
      secondary: "#374151",
      muted: "#6B7280",
      accent: "#111827",
      accentFg: "#FFFFFF",
      hairline: "#E5E7EB",
    },
    stack: ["React Native", "Expo", "TypeScript", "SQLite", "OpenAI"],
    hero: {},
    chapters: [
      { id: "capture", layout: "text-only" },
      { id: "balance", layout: "text-only" },
    ],
    next: "donweb-contenidos",
  },
  copy: {
    es: {
      name: "Finanzas personales con IA",
      kicker: "Producto propio",
      tagline:
        "Decís lo que gastaste por texto, audio o foto del comprobante; la IA propone el movimiento y vos confirmás.",
      role: "Diseño y desarrollo",
      period: "2026",
      statusLabel: "En desarrollo",
      hero: {
        headline: "Decís lo que gastaste; la app lo entiende.",
        sub: "Texto, audio o foto del comprobante; la IA propone, vos confirmás.",
        mediaAlt: "Pantalla de captura de la app",
      },
      chapters: {
        capture: {
          kicker: "La captura",
          title: "Tres canales, una sola bandeja.",
          body: [
            "Escribís “café 3500”, mandás un audio o sacás una foto del ticket. Un modelo de OpenAI lee el mensaje, propone monto, categoría, cuenta y fecha, y lo deja en una bandeja para revisar.",
            "Nada se guarda sin tu confirmación. Si la propuesta está mal, la corregís en un toque y la app aprende tu forma de nombrar las cosas.",
          ],
        },
        balance: {
          kicker: "El balance",
          title: "Disponible real, no saldo de cuenta.",
          body: [
            "Cuentas, tarjetas, cuotas y deudas en un mismo lugar. El disponible resta lo que ya está comprometido: cuotas por vencer, dinero reservado y gastos fijos del mes.",
            "React Native con Expo y TypeScript, datos locales en SQLite. En desarrollo: todavía sin usuarios ni facturación.",
          ],
        },
      },
      links: [],
      nextLabel: "Siguiente proyecto",
    },
    en: {
      name: "Personal finance with AI",
      kicker: "Own product",
      tagline:
        "Tell the app what you spent by text, voice or a photo of the receipt; the AI proposes the entry and you confirm it.",
      role: "Design and development",
      period: "2026",
      statusLabel: "In development",
      hero: {
        headline: "Say what you spent; the app understands.",
        sub: "Text, voice or a photo of the receipt; the AI proposes, you confirm.",
        mediaAlt: "The app's capture screen",
      },
      chapters: {
        capture: {
          kicker: "Capture",
          title: "Three channels, one inbox.",
          body: [
            "Type “coffee 3500”, send a voice note or snap the receipt. An OpenAI model reads the message, proposes amount, category, account and date, and leaves it in an inbox for review.",
            "Nothing is saved without your confirmation. If the proposal is wrong, you fix it in one tap and the app learns how you name things.",
          ],
        },
        balance: {
          kicker: "Balance",
          title: "Real available money, not the account balance.",
          body: [
            "Accounts, cards, installments and debts in one place. The available figure subtracts what is already committed: upcoming installments, reserved money and the month's fixed expenses.",
            "React Native with Expo and TypeScript, local data in SQLite. In development: no users or revenue yet.",
          ],
        },
      },
      links: [],
      nextLabel: "Next project",
    },
  },
};
