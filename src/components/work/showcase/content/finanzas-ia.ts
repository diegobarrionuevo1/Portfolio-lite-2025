import { workImage } from "../scenes/media-src";
import type { ShowcaseDefinition, ShowcaseLive } from "../types";

/**
 * Personal finance with AI, own product: a mobile app that records and
 * analyses financial movements from text, audio or a receipt photo. The AI
 * proposes a movement and the person confirms before anything is saved.
 * In development: not published (store release pending), single-user MVP,
 * no users and no usage metrics. The copy says so plainly and only quotes
 * engineering facts.
 *
 * The only light atmosphere: the app itself is white and ink, so the page
 * reads as a quiet, almost monochrome ledger. The product's three semantic
 * colours (amber pending, red expense / over-committed, emerald income /
 * savings) appear only inside the motion graphics, quoted in
 * scenes/mg/finanzas-ia.css; the page accent is the ink.
 *
 * Media under public/work/finanzas-ia/ (dimensions from
 * public/work/manifest.json): the home screen captured from the iOS
 * simulator in light and dark, and the app icon. Everything else is
 * re-created from the product's own components as three live components
 * registered in scenes/live-registry.tsx: `message-to-movement`,
 * `available-balance` and `three-channels` (scenes/mg/finanzas-ia.tsx).
 *
 * Facts come from the repo, its PRD and its ADRs: the capture example from
 * the real placeholder and the eval corpus; ADR-005 (no arithmetic in the
 * UI), ADR-010 (the AI never auto-confirms), ADR-022 (available money is
 * never clamped); the Cloudflare Worker proxy and its quotas and models;
 * the Expo / React Native / Drizzle stack; 19 SQL migrations, 20 application
 * ports, 16 repositories, 501 source files; 1,119 tests in 99 suites at the
 * Fase 7 gate. Nothing else is claimed.
 */
const SLUG = "finanzas-ia";

/** iPhone 17 simulator captures, portrait, single file. */
const phone = (name: string, id?: string) => workImage(SLUG, name, 1206, 2622, { id });
const live = (component: string, aspect: number): ShowcaseLive => ({ kind: "live", component, aspect });

export const finanzasIa: ShowcaseDefinition = {
  shared: {
    slug: SLUG,
    order: 5,
    status: "in-development",
    // The product's own palette: gray-900 on white, cards on a muted
    // surface, gray-200 hairlines. The ink doubles as the accent, so the
    // page stays monochrome and the semantic colours keep their meaning.
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
    stack: ["Expo SDK 56", "React Native 0.85", "TypeScript", "Drizzle · SQLite", "Cloudflare Workers", "OpenAI"],
    hero: { media: phone("home-light") },
    chapters: [
      { id: "capture", layout: "live-full", media: live("message-to-movement", 2) },
      { id: "balance", layout: "live-full", media: live("available-balance", 2.5) },
      { id: "home", layout: "media-full", media: [phone("home-light"), phone("home-dark")] },
      { id: "channels", layout: "live-full", media: live("three-channels", 2.1) },
      { id: "cards", layout: "text-only" },
      { id: "architecture", layout: "text-only" },
    ],
    gallery: [
      phone("home-light", "home-light"),
      phone("home-dark", "home-dark"),
      workImage(SLUG, "icon", 1024, 1024, { id: "icon" }),
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
        mediaAlt:
          "La pantalla Inicio de la app en el simulador de iOS: Finanzas, Tus cuentas, la tarjeta Disponible en $0,00, la barra Registrá con IA con el botón de IA, el micrófono y la cámara, y la tarjeta Registrá tu plata como un mensaje",
      },
      chapters: {
        capture: {
          kicker: "La captura",
          title: "Un mensaje entra; un movimiento sale.",
          body: [
            "Escribís como hablás: “gasté 18 mil en nafta con la Visa Galicia”. También podés mandar un audio o sacarle una foto al ticket. El modelo devuelve un JSON con esquema estricto: tipo, monto, descripción, medio de pago, tarjeta, y si el movimiento toca o no el saldo de una cuenta.",
            "Lo que falta queda marcado, no inventado: si el mensaje no dice la moneda, el movimiento cae en Pendientes con ese campo en ámbar. Y nada se guarda solo. La IA propone, vos confirmás: esa es la regla que ordena todo el producto.",
          ],
          facts: [
            { value: "3", label: "canales: texto, audio, foto" },
            { value: "1", label: "confirmación humana por movimiento" },
            { value: "30", label: "frases rioplatenses en el corpus de evaluación" },
            { value: "0,9", label: "umbral de aprobación del corpus" },
          ],
          mediaAlt:
            "Gráfico en movimiento: en la barra Registrá con IA se escribe “gasté 18 mil en nafta con la Visa Galicia”; cada palabra se enmarca y aterriza en su campo de un JSON, tipo, monto, descripción, medio de pago y tarjeta; el campo moneda, vacío, se marca en ámbar como pendiente; al confirmar, la deuda de la tarjeta sube a 18.000 y el saldo del banco no se mueve",
        },
        balance: {
          kicker: "El disponible",
          title: "Disponible real, no saldo de cuenta.",
          body: [
            "El número grande de Inicio no es el saldo del banco. Es lo que de verdad podés gastar: saldo real menos lo reservado, menos el ahorro, menos lo invertido. Cuentas, tarjetas, cuotas, deudas, reservas, metas de ahorro e inversiones viven en el mismo libro, y la resta se hace en el dominio, nunca en la pantalla.",
            "Si reservás más de lo que tenés, el disponible se va a negativo y la app te lo dice: Sobre-comprometido · Revisar. No se recorta a cero, porque un cero tranquilizador esconde justo lo que tenés que ver.",
          ],
          facts: [
            { value: "4", label: "términos: saldo real, reservado, ahorro, inversión" },
          ],
          mediaAlt:
            "Gráfico en movimiento: una resta vertical, saldo real 1.250.000 menos reservado 300.000, menos ahorro 200.000, menos inversión 150.000, igual a disponible 600.000 en una tarjeta de tinta; después lo reservado sube a 950.000, el disponible cruza el cero, queda en rojo en menos 50.000 y aparece la etiqueta Sobre-comprometido · Revisar; una nota recuerda que nunca se recorta a cero",
        },
        home: {
          kicker: "Inicio",
          title: "La pantalla que ya existe, en claro y en oscuro.",
          body: [
            "Esto no es un canvas: es la app corriendo en el simulador de iOS, en su primer arranque. Tus cuentas con el disponible en $0,00, la barra Registrá con IA con sus tres botones, y una tarjeta que explica el trato: escribís, grabás o sacás una foto, la IA lo arma y vos confirmás antes de guardar.",
            "Blanco y tinta, tarjetas sobre una superficie apenas gris y tres colores con significado fijo: ámbar para lo pendiente, rojo para gastos y sobrecompromiso, esmeralda para ingresos y ahorro. El botón de IA, elevado en el medio de la barra de pestañas, es el único acento.",
          ],
          mediaAlt: [
            "Pantalla Inicio en modo claro: Finanzas, Tus cuentas, la tarjeta Disponible $0,00, la barra Registrá con IA, la tarjeta Registrá tu plata como un mensaje y el estado vacío Sin cuentas todavía",
            "La misma pantalla Inicio en modo oscuro",
          ],
          caption: ["Inicio · simulador de iOS, claro", "Inicio · simulador de iOS, oscuro"],
        },
        channels: {
          kicker: "El proxy",
          title: "Solo viaja la captura; el libro se queda.",
          body: [
            "La app no habla con OpenAI: habla con un Worker de Cloudflare que guarda la clave y expone tres rutas, /parse, /transcribe e /image. Lo único que cruza la red es el mensaje, el audio o la foto; el libro contable nunca sale del teléfono.",
            "Cada dispositivo tiene una cuota diaria, 20 textos, 10 audios y 10 fotos, y 30 pedidos por minuto por IP. El texto lo lee gpt-5.4-nano, el audio gpt-4o-mini-transcribe y los tickets gpt-4o-mini con visión, todos con salida json_schema estricta y un hash del esquema compartido entre la app y el Worker para detectar desvíos.",
          ],
          facts: [
            { value: "20 / 10 / 10", label: "cuota diaria por dispositivo" },
            { value: "30", label: "pedidos por minuto por IP" },
          ],
          mediaAlt:
            "Gráfico en movimiento: tres cajas, texto, audio y foto, dentro de un borde punteado que representa el teléfono, mandan paquetes por líneas finas a un Worker de Cloudflare, y de ahí llegan tarjetas con borde ámbar a una columna Pendientes cuya antigüedad avanza, hace 1 min, hace 2 min; la cuota del día baja de 20, 10 y 10 con cada captura; una nota dice que solo la captura viaja, nunca el ledger",
        },
        cards: {
          kicker: "Tarjetas y cuotas",
          title: "Comprar con tarjeta no mueve el banco. Pagar el resumen, sí.",
          body: [
            "Una compra con tarjeta suma deuda a la tarjeta y no toca la cuenta bancaria hasta que el resumen se paga en el vencimiento. Cada tarjeta tiene cierre y vencimiento; cada compra en cuotas reparte sus cuotas en los meses que siguen, 1/6, 2/6, hasta 6/6.",
            "Con eso la app proyecta el mes: esperado a recibir, esperado a pagar y neto del mes. No es un pronóstico de IA, es la suma de lo que ya está comprometido.",
          ],
          facts: [
            { value: "2", label: "fechas por tarjeta: cierre y vencimiento" },
            { value: "3", label: "líneas de proyección mensual" },
            { value: "0", label: "movimientos bancarios hasta pagar el resumen" },
          ],
        },
        architecture: {
          kicker: "La arquitectura",
          title: "Hexagonal, local-first, probada.",
          body: [
            "Expo SDK 56 con expo-router, React Native 0.85 con la nueva arquitectura, React 19 y TypeScript. NativeWind con tokens de Tailwind para la interfaz, Zustand en slices para el estado y Drizzle ORM sobre expo-sqlite para el libro, que vive en el teléfono con 19 migraciones versionadas.",
            "Las capas son las de la arquitectura hexagonal: dominio, casos de uso con sus puertos, adaptadores de infraestructura y UI. Veinte puertos, dieciséis repositorios, 501 archivos fuente. Y 1.119 tests en 99 suites verdes al cierre de la Fase 7, con un corpus de 30 frases rioplatenses que el parser tiene que aprobar al 90 %.",
          ],
          facts: [
            { value: "501", label: "archivos fuente" },
            { value: "20", label: "puertos de aplicación" },
            { value: "16", label: "repositorios" },
            { value: "19", label: "migraciones SQL" },
            { value: "1.119", label: "tests en 99 suites" },
          ],
        },
      },
      metrics: {
        kicker: "En desarrollo",
        stats: [
          { value: "1.119", label: "tests" },
          { value: "19", label: "migraciones" },
          { value: "3", label: "canales de captura" },
        ],
        closer: "Sin publicar todavía: un producto propio en desarrollo, mobile-first.",
        note: "Capturas del simulador de iOS; sin usuarios ni métricas de uso.",
      },
      gallery: {
        kicker: "Pantallas",
        items: {
          "home-light": {
            alt: "Pantalla Inicio de la app en modo claro, capturada en el simulador de iOS",
            caption: "Inicio · claro",
          },
          "home-dark": {
            alt: "Pantalla Inicio de la app en modo oscuro, capturada en el simulador de iOS",
            caption: "Inicio · oscuro",
          },
          icon: {
            alt: "El ícono de la app: un chevrón azul sobre un plano celeste con líneas de construcción",
            caption: "Ícono de la app",
          },
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
        mediaAlt:
          "The app's home screen in the iOS simulator: Finanzas, Tus cuentas, the Disponible card at $0,00, the Registrá con IA bar with the AI button, the microphone and the camera, and the card Registrá tu plata como un mensaje",
      },
      chapters: {
        capture: {
          kicker: "Capture",
          title: "A message goes in; a movement comes out.",
          body: [
            "You write the way you talk: “gasté 18 mil en nafta con la Visa Galicia” (spent 18 grand on fuel with the Visa Galicia). You can also send a voice note or photograph the receipt. The model returns JSON under a strict schema: type, amount, description, payment method, card, and whether the movement touches an account balance or not.",
            "Whatever is missing gets flagged, never invented: if the message does not say the currency, the movement lands in Pending with that field in amber. And nothing saves itself. The AI proposes, you confirm: that is the rule the whole product is built around.",
          ],
          facts: [
            { value: "3", label: "channels: text, voice, photo" },
            { value: "1", label: "human confirmation per movement" },
            { value: "30", label: "Rioplatense phrases in the eval corpus" },
            { value: "0.9", label: "pass threshold for the corpus" },
          ],
          mediaAlt:
            "Motion graphic: in the Registrá con IA bar the line “gasté 18 mil en nafta con la Visa Galicia” types itself; each word is boxed and lands in its JSON field, type, amount, description, payment method and card; the empty currency field is flagged amber as pending; on confirm, the card's debt climbs to 18.000 while the bank balance stays still",
        },
        balance: {
          kicker: "Available money",
          title: "Real available money, not the account balance.",
          body: [
            "The big number on the home screen is not the bank balance. It is what you can actually spend: real balance minus what is reserved, minus savings, minus investments. Accounts, cards, installments, debts, reserves, savings goals and investments live in the same ledger, and the subtraction happens in the domain, never on screen.",
            "Reserve more than you have and the available figure goes negative, and the app says so: Over-committed · Review. It is never clamped to zero, because a reassuring zero hides exactly what you need to see.",
          ],
          facts: [
            { value: "4", label: "terms: real balance, reserved, savings, invested" },
          ],
          mediaAlt:
            "Motion graphic: a vertical subtraction, real balance 1.250.000 minus reserved 300.000, minus savings 200.000, minus invested 150.000, equals available 600.000 on an ink card; then the reserved figure climbs to 950.000, the available figure crosses zero, turns red at minus 50.000 and the label Over-committed · Review appears; a note recalls that it is never clamped to zero",
        },
        home: {
          kicker: "Home",
          title: "The screen that already exists, light and dark.",
          body: [
            "This is not a canvas: it is the app running in the iOS simulator, on first launch. Your accounts with the available figure at $0,00, the Registrá con IA bar with its three buttons, and a card that explains the deal: write, record or snap a photo, the AI assembles it and you confirm before saving.",
            "White and ink, cards on a barely grey surface and three colours with a fixed meaning: amber for anything pending, red for expenses and over-commitment, emerald for income and savings. The AI button, raised in the middle of the tab bar, is the only accent.",
          ],
          mediaAlt: [
            "Home screen in light mode: Finanzas, Tus cuentas, the Disponible card at $0,00, the Registrá con IA bar, the card Registrá tu plata como un mensaje and the empty state Sin cuentas todavía",
            "The same home screen in dark mode",
          ],
          caption: ["Home · iOS simulator, light", "Home · iOS simulator, dark"],
        },
        channels: {
          kicker: "The proxy",
          title: "Only the capture travels; the ledger stays.",
          body: [
            "The app does not talk to OpenAI: it talks to a Cloudflare Worker that holds the key and exposes three routes, /parse, /transcribe and /image. The only thing that crosses the network is the message, the audio or the photo; the ledger never leaves the phone.",
            "Each device has a daily quota, 20 texts, 10 voice notes and 10 photos, plus 30 requests per minute per IP. Text is read by gpt-5.4-nano, audio by gpt-4o-mini-transcribe and receipts by gpt-4o-mini with vision, all with strict json_schema output and a schema hash shared between the app and the Worker to catch drift.",
          ],
          facts: [
            { value: "20 / 10 / 10", label: "daily quota per device" },
            { value: "30", label: "requests per minute per IP" },
          ],
          mediaAlt:
            "Motion graphic: three boxes, text, audio and photo, inside a dashed border that stands for the phone, send packets along thin wires to a Cloudflare Worker, and from there amber-edged cards arrive in a Pending column whose age advances, 1 min ago, 2 min ago; the day's quota drops from 20, 10 and 10 with each capture; a note says only the capture travels, never the ledger",
        },
        cards: {
          kicker: "Cards and installments",
          title: "A card purchase does not move the bank. Paying the statement does.",
          body: [
            "A purchase on a card adds debt to the card and does not touch the bank account until the statement is paid on its due date. Each card has a closing date and a due date; each purchase in installments spreads them over the following months, 1/6, 2/6, up to 6/6.",
            "That is what the monthly projection is built from: expected to receive, expected to pay and net for the month. It is not an AI forecast, it is the sum of what is already committed.",
          ],
          facts: [
            { value: "2", label: "dates per card: closing and due" },
            { value: "3", label: "lines in the monthly projection" },
            { value: "0", label: "bank movements until the statement is paid" },
          ],
        },
        architecture: {
          kicker: "Architecture",
          title: "Hexagonal, local-first, tested.",
          body: [
            "Expo SDK 56 with expo-router, React Native 0.85 on the new architecture, React 19 and TypeScript. NativeWind with Tailwind tokens for the interface, Zustand slices for state and Drizzle ORM over expo-sqlite for the ledger, which lives on the phone with 19 versioned migrations.",
            "The layers are the hexagonal ones: domain, use cases with their ports, infrastructure adapters and UI. Twenty ports, sixteen repositories, 501 source files. And 1,119 tests in 99 green suites at the Fase 7 gate, with a corpus of 30 Rioplatense phrases the parser has to pass at 90%.",
          ],
          facts: [
            { value: "501", label: "source files" },
            { value: "20", label: "application ports" },
            { value: "16", label: "repositories" },
            { value: "19", label: "SQL migrations" },
            { value: "1,119", label: "tests in 99 suites" },
          ],
        },
      },
      metrics: {
        kicker: "In development",
        stats: [
          { value: "1,119", label: "tests" },
          { value: "19", label: "migrations" },
          { value: "3", label: "capture channels" },
        ],
        closer: "Not published yet: an own product in development, mobile-first.",
        note: "iOS simulator captures; no users and no usage metrics.",
      },
      gallery: {
        kicker: "Screens",
        items: {
          "home-light": {
            alt: "The app's home screen in light mode, captured in the iOS simulator",
            caption: "Home · light",
          },
          "home-dark": {
            alt: "The app's home screen in dark mode, captured in the iOS simulator",
            caption: "Home · dark",
          },
          icon: {
            alt: "The app icon: a blue chevron on a pale blue plane with construction lines",
            caption: "App icon",
          },
        },
      },
      links: [],
      nextLabel: "Next project",
    },
  },
};
