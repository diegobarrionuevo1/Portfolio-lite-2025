import { workImage, workVideo } from "../scenes/media-src";
import type { ShowcaseDefinition, ShowcaseLive } from "../types";

/**
 * Hermes, own product: a WhatsApp-ordering storefront for food businesses
 * with no commission per order, plus the business dashboard. In development:
 * the landing runs, the dashboard exists as design canvases and a partially
 * implemented app, the storefront app is not built yet, and there are no
 * users and no revenue. The copy says so plainly and every dashboard screen
 * is captioned as a design canvas.
 *
 * Media under public/work/hermes/ (dimensions from public/work/manifest.json):
 * the landing captured from the local build at five scroll offsets, where it
 * crossfades from night to day; the Claude Design canvases of the storefront
 * and the dashboard; a 24s clip scrolling the landing. Three live components
 * registered in scenes/live-registry.tsx: `theme-morph`, `order-capsule` and
 * `menu-import` (scenes/mg/hermes.tsx).
 *
 * Facts come from the Hermes repo and its decision log (D-001..D-056): the
 * four themes and their demo businesses, the order status tokens, the
 * pause-reception options, the offline queue, D-028 (Hermes cannot observe
 * WhatsApp delivery, so there is no delivery tick), the AI menu import spike
 * (8 real menu pages, 163 items, 202 prices kept, USD 0.024), the gateway's
 * session machine and limits, the foundations and the plans. Hosting is
 * Vercel + Supabase (D-038). Nothing else is claimed.
 */
const SLUG = "hermes";

/** 2400w desktop captures, with their 1200w siblings for srcSet. */
const capture = (name: string, id?: string) => workImage(SLUG, name, 2400, 1500, { variants: [1200], id });
/** 3x phone capture, portrait, single file. */
const phone = (name: string, id?: string) => workImage(SLUG, name, 1170, 2532, { id });
const live = (component: string, aspect: number): ShowcaseLive => ({ kind: "live", component, aspect });

export const hermes: ShowcaseDefinition = {
  shared: {
    slug: SLUG,
    order: 4,
    status: "in-development",
    // The brand world is the night: the landing's backdrop, one warm ember
    // and the glass nav. The product world (Cristal Preciso, cold near-white
    // with an indigo accent) appears only inside the stages and the canvases,
    // as light islands in this night.
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
    stack: ["Next.js 15", "React 19", "TypeScript", "Drizzle · PostgreSQL", "Supabase", "WhatsApp"],
    hero: { media: workVideo(SLUG, "clip-landing", 1920, 1080) },
    chapters: [
      { id: "storefront", layout: "live-full", media: live("theme-morph", 2) },
      { id: "orders", layout: "live-full", media: live("order-capsule", 2.1) },
      {
        id: "dashboard",
        layout: "media-full",
        media: [capture("canvas-dashboard-c02-c03-pedidos"), capture("canvas-dashboard-c01-inicio")],
      },
      { id: "carta", layout: "live-full", media: live("menu-import", 2) },
      { id: "gateway", layout: "text-only" },
      { id: "night-to-day", layout: "media-full", media: [capture("landing-s2"), capture("landing-s4")] },
      { id: "foundations", layout: "text-only" },
    ],
    gallery: [
      capture("canvas-storefront-v01-inicio", "storefront-home"),
      capture("canvas-storefront-v04-producto", "storefront-product"),
      capture("canvas-storefront-v05-carrito", "storefront-cart"),
      capture("canvas-storefront-v07-pedido-creado", "storefront-created"),
      capture("canvas-temas", "themes"),
      capture("canvas-themephone", "themephone"),
      phone("landing-mobile", "landing-mobile"),
      capture("landing-s1", "landing-s1"),
      capture("landing-s5", "landing-s5"),
      capture("canvas-dashboard-c04-c06-carta", "dashboard-carta"),
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
        mediaAlt:
          "Recorrido por el landing de Hermes: la portada de noche, con la tienda de Casa Umi en un celular y el botón Crear mi tienda, que al bajar se funde con el día",
      },
      chapters: {
        storefront: {
          kicker: "La tienda",
          title: "Cuatro temas, una plataforma.",
          body: [
            "El comercio carga su carta desde el panel y Hermes publica una tienda web con su marca, lista para compartir como enlace o código QR, sin app que instalar. El cliente recorre el catálogo, arma el pedido y lo manda como un mensaje de WhatsApp: sin registro, sin contraseña y sin comisión por pedido.",
            "El motor de temas no cambia dos colores: cambia la composición. Studio, Brutal, Street y Market aplican su propia familia tipográfica, peso y caja, un radio distinto, 10, 0, 4 y 16 píxeles, y otro fondo y otro botón sobre la misma carta. Cuatro negocios de demostración, Casa Umi, Fierro Burger, La Esquina y Lo de Tere, muestran la diferencia en menos de 30 segundos.",
          ],
          facts: [
            { value: "4", label: "temas, una plataforma" },
            { value: "0 %", label: "comisión por pedido" },
            { value: "< 30 s", label: "para ver la diferencia" },
          ],
          mediaAlt:
            "Gráfico en movimiento: una tienda en un celular con los mismos tres productos cambia de tema, Studio, Brutal, Street y Market, mientras al costado se escriben las reglas de cada tema como variables de CSS",
        },
        orders: {
          kicker: "Los pedidos",
          title: "El pedido viaja como mensaje.",
          body: [
            "El cliente elige en el catálogo, ajusta tamaño, cocción y extras, confirma total y entrega, y el pedido sale como un mensaje de WhatsApp con el detalle completo. El mismo pedido queda registrado en el centro de pedidos: el panel es la fuente de verdad y WhatsApp es el canal que lo lleva.",
            "Desde el panel el comercio acepta con una mano, marca cada estado, nuevo, confirmado, preparando, listo, enviado o cancelado, y pausa la recepción 15, 30 o 60 minutos o hasta el próximo turno, sin cerrar la tienda. Sin conexión, los cambios quedan en cola y se reintentan solos. Lo que Hermes no puede ver es si el mensaje llegó: por eso no hay tilde de entrega.",
          ],
          facts: [
            { value: "6", label: "estados de pedido" },
            { value: "15 · 30 · 60", label: "minutos de pausa, o hasta el próximo turno" },
          ],
          mediaAlt:
            "Gráfico en movimiento: una cápsula con el total del pedido recorre cuatro paradas, catálogo, selección, pedido y WhatsApp más panel, y al final el mismo texto aparece dos veces, como mensaje de WhatsApp y como fila del centro de pedidos, sin tilde de entrega",
        },
        dashboard: {
          kicker: "El panel",
          title: "Hora pico desde el celular.",
          body: [
            "El centro de pedidos está pensado para la hora pico y para una sola mano: lo que más espera arriba, aceptar con un toque, pausar la recepción sin cerrar. Si se corta la conexión muestra los últimos pedidos cargados y los cambios quedan pendientes hasta que vuelve.",
            "El inicio tiene una sola tarea principal según el estado real del negocio: cargar la carta, confirmar los datos, preparar la recepción, probar y publicar. Nada de gráficos hasta que haya pedidos que graficar. Estas pantallas son canvases de diseño: el panel está parcialmente implementado.",
          ],
          mediaAlt: [
            "Canvas de diseño del centro de pedidos: los pedidos nuevos arriba con el botón Aceptar, la vista sin conexión y la hoja para pausar la recepción 15, 30 o 60 minutos",
            "Canvas de diseño del inicio del panel: la puesta en marcha en cuatro pasos, cargar la carta, confirmar el negocio, preparar la recepción y publicar",
          ],
          caption: ["C02 – C03 · Pedidos · Diseño (canvas)", "C01 · Inicio · Diseño (canvas)"],
        },
        carta: {
          kicker: "La carta",
          title: "Fotos de la carta, candidatos con evidencia.",
          body: [
            "Cargar la carta es la primera tarea de cualquier comercio y la que más demora. Hermes acepta fotos de la carta impresa, un PDF o la lista que ya se manda por WhatsApp, y la IA prepara un borrador: cada candidato trae el nombre, el fragmento de texto del que salió y el precio.",
            "Un precio cuyos dígitos no aparecen en su fragmento no se inventa: queda vacío y marcado como conflicto para revisar, nunca en cero. En la prueba sobre ocho páginas de cartas reales salieron 163 ítems y se conservaron 202 precios por USD 0.024; una carga de diez fotos cuesta alrededor de USD 0.025. Plan Free: 30 productos y una carga con IA; Pro: 300 productos y cinco cargas.",
          ],
          facts: [
            { value: "8", label: "páginas de cartas reales" },
            { value: "163", label: "ítems" },
            { value: "202", label: "precios conservados" },
            { value: "USD 0.024", label: "costo de la prueba" },
          ],
          mediaAlt:
            "Gráfico en movimiento: una línea recorre una página de carta esquemática y, a medida que pasa, las filas de candidatos se completan con nombre, fragmento de evidencia y precio; un precio sin dígitos en su fragmento se tacha y se marca como conflicto, mientras los contadores llegan a 8 páginas, 163 ítems, 202 precios y USD 0.024",
        },
        gateway: {
          kicker: "WhatsApp",
          title: "Una sesión que sabe en qué estado está.",
          body: [
            "Los mensajes salen por una pasarela propia: Fastify con Baileys multidispositivo y el estado de autenticación guardado en Postgres. La sesión es una máquina de estados explícita, desconectada, QR pendiente, conectando y conectada, con dos finales que no se reintentan solos: sesión cerrada, que pide volver a escanear el código, y bloqueada.",
            "Los límites también son explícitos. El QR se renueva hasta seis veces y después se detiene; la reconexión espera de 2 a 60 segundos entre intentos, con un máximo de ocho; los mensajes salientes se espacian entre 1 y 1,5 segundos. Hermes no observa la entrega del mensaje, así que no promete tildes.",
          ],
          facts: [
            { value: "6", label: "estados de sesión, dos terminales" },
            { value: "6", label: "renovaciones de QR, después se detiene" },
            { value: "2 → 60 s", label: "de espera, máximo 8 intentos" },
            { value: "1 – 1,5 s", label: "entre mensajes salientes" },
          ],
        },
        "night-to-day": {
          kicker: "De la noche al día",
          title: "El landing amanece al bajar.",
          body: [
            "Hermes tiene dos mundos en un producto. La marca es de noche: un fondo casi negro, una sola brasa de color y una barra de navegación de vidrio. El producto es de día, Cristal Preciso: blanco frío, tinta oscura, un acento índigo, materiales de vidrio, líneas finas y chips en píldora, con una mancha de color desenfocada que se mueve despacio.",
            "El landing lo cuenta literalmente: arranca de noche con la tienda de Casa Umi en un celular y, al bajar, se funde con el día, donde aparecen los cuatro negocios de demostración. Todo el fundido es una sola variable, --day-mix, que mueve fondo, texto y superficies a la vez.",
          ],
          mediaAlt: [
            "El landing de Hermes todavía de noche, con la tienda Market de Lo de Tere en un celular y el inicio de la sección Pedido en vivo",
            "El landing de Hermes ya de día: la sección Cuatro negocios, cuatro identidades, con las tiendas de Casa Umi, Fierro Burger, La Esquina y Lo de Tere",
          ],
          caption: ["Landing a 1.900 px de scroll: noche", "Landing a 3.800 px de scroll: día"],
        },
        foundations: {
          kicker: "Los cimientos",
          title: "Más decisiones registradas que pantallas.",
          body: [
            "Un monorepo con pnpm: el panel, el paquete de base de datos y el sistema de diseño. Next.js 15 con React 19 y TypeScript 5.9; Tailwind 4 y Radix en el panel; CSS Modules sobre los tokens de Cristal Preciso en el landing. Drizzle sobre PostgreSQL con seguridad a nivel de fila en 35 tablas y dos roles de base de datos; Supabase para el acceso por código de email y el almacenamiento; Vercel para el hosting.",
            "Antes de tener usuarios hay 396 casos de prueba en 41 archivos, cuatro especificaciones de extremo a extremo con Playwright, 56 decisiones de arquitectura registradas, 22 preguntas abiertas, 20 canvases de diseño y 103 commits. El orden es a propósito: primero las decisiones, después las pantallas.",
          ],
          facts: [
            { value: "35", label: "tablas con RLS" },
            { value: "396", label: "casos de prueba en 41 archivos" },
            { value: "56", label: "decisiones registradas" },
            { value: "22", label: "preguntas abiertas" },
          ],
        },
      },
      metrics: {
        kicker: "En construcción",
        stats: [
          { value: "4", label: "temas" },
          { value: "35", label: "tablas con RLS" },
          { value: "396", label: "tests" },
          { value: "56", label: "decisiones registradas" },
        ],
        closer: "Sin usuarios ni facturación todavía: un producto propio en desarrollo.",
        note: "Las pantallas del panel son canvases de diseño; el landing corre.",
      },
      gallery: {
        kicker: "Pantallas",
        items: {
          "storefront-home": {
            alt: "Canvas de diseño del inicio de la tienda en los cuatro temas: cabecera, portada, chips y los más pedidos",
            caption: "V01 · Inicio de tienda · Diseño (canvas)",
          },
          "storefront-product": {
            alt: "Canvas de diseño de la ficha de producto, Doble $ 14.000 con sus grupos de modificadores, en los cuatro temas",
            caption: "V04 · Producto · Diseño (canvas)",
          },
          "storefront-cart": {
            alt: "Canvas de diseño del carrito, cuatro líneas en tres categorías, en los cuatro temas",
            caption: "V05 · Carrito · Diseño (canvas)",
          },
          "storefront-created": {
            alt: "Canvas de diseño de la pantalla Pedido creado: pedido #0142 listo y el botón Enviar por WhatsApp, en los cuatro temas",
            caption: "V07 · Pedido creado · Diseño (canvas)",
          },
          themes: {
            alt: "Canvas de diseño Temas de tienda: Studio, Brutal y Street sobre la misma estructura",
            caption: "Temas de tienda · Diseño (canvas)",
          },
          themephone: {
            alt: "Canvas de diseño del celular canónico de 360 por 620 con la tienda de Casa Umi en el tema Studio",
            caption: "Celular canónico 360 × 620 · Diseño (canvas)",
          },
          "landing-mobile": {
            alt: "El landing de Hermes en el celular: Tu negocio merece un canal de pedidos a su altura, y la tienda de Casa Umi",
            caption: "Landing en el celular",
          },
          "landing-s1": {
            alt: "El landing de Hermes con la tienda Street de La Esquina en el celular",
            caption: "Landing: tema Street, La Esquina",
          },
          "landing-s5": {
            alt: "La sección Cómo funciona del landing, ya de día: Cargás, Compartís, Recibís",
            caption: "Landing: Cómo funciona",
          },
          "dashboard-carta": {
            alt: "Canvas de diseño de la carta en el panel: precio inline, agotado con deshacer y el producto 31 que se conserva como borrador",
            caption: "C04 – C06 · Carta · Diseño (canvas)",
          },
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
        mediaAlt:
          "A scroll through the Hermes landing: the night-time front page, with the Casa Umi storefront on a phone and the Crear mi tienda button, crossfading into day as the page scrolls",
      },
      chapters: {
        storefront: {
          kicker: "The storefront",
          title: "Four themes, one platform.",
          body: [
            "The business loads its menu from the panel and Hermes publishes a branded web store, ready to share as a link or a QR code, with no app to install. Customers browse the catalog, build the order and send it as a WhatsApp message: no sign-up, no password and no commission per order.",
            "The theme engine does not swap two hues: it changes the composition. Studio, Brutal, Street and Market each apply their own type family, weight and case, a different radius, 10, 0, 4 and 16 pixels, and another background and button over the same menu. Four demo businesses, Casa Umi, Fierro Burger, La Esquina and Lo de Tere, show the difference in under 30 seconds.",
          ],
          facts: [
            { value: "4", label: "themes, one platform" },
            { value: "0 %", label: "commission per order" },
            { value: "< 30 s", label: "to see the difference" },
          ],
          mediaAlt:
            "Motion graphic: a storefront on a phone with the same three products changes theme, Studio, Brutal, Street and Market, while each theme's rules type themselves beside it as CSS custom properties",
        },
        orders: {
          kicker: "Orders",
          title: "The order travels as a message.",
          body: [
            "The customer picks from the catalog, adjusts size, doneness and extras, confirms total and delivery, and the order goes out as a WhatsApp message with the full detail. The same order is recorded in the order centre: the panel is the source of truth and WhatsApp is the channel that carries it.",
            "From the panel the business accepts with one hand, marks each status, new, confirmed, preparing, ready, sent or cancelled, and pauses reception for 15, 30 or 60 minutes or until the next shift, without closing the store. Offline, changes queue and retry on their own. What Hermes cannot see is whether the message arrived: that is why there is no delivery tick.",
          ],
          facts: [
            { value: "6", label: "order statuses" },
            { value: "15 · 30 · 60", label: "minutes of pause, or until the next shift" },
          ],
          mediaAlt:
            "Motion graphic: a capsule with the running total travels four stops, catalog, selection, order and WhatsApp plus panel, and at the end the same text appears twice, as a WhatsApp message and as an order-centre row, with no delivery tick",
        },
        dashboard: {
          kicker: "The panel",
          title: "Rush hour from a phone.",
          body: [
            "The order centre is built for rush hour and for one hand: the order that has waited longest on top, accept with one tap, pause reception without closing. If the connection drops it shows the last orders loaded and changes stay pending until it is back.",
            "The home has one main task according to the real state of the business: load the menu, confirm the details, set up reception, test and publish. No charts until there are orders to chart. These screens are design canvases: the panel is partially implemented.",
          ],
          mediaAlt: [
            "Design canvas of the order centre: new orders on top with the Accept button, the offline view and the sheet to pause reception for 15, 30 or 60 minutes",
            "Design canvas of the panel home: the four-step setup, load the menu, confirm the business, set up reception and publish",
          ],
          caption: ["C02 – C03 · Orders · Design canvas", "C01 · Home · Design canvas"],
        },
        carta: {
          kicker: "The menu",
          title: "Menu photos in, candidates with evidence out.",
          body: [
            "Loading the menu is every business's first task and the one that takes longest. Hermes accepts photos of the printed menu, a PDF or the list already sent over WhatsApp, and the AI prepares a draft: every candidate carries its name, the text fragment it came from and its price.",
            "A price whose digits do not appear in its fragment is not invented: it stays empty and is flagged as a conflict to review, never set to zero. In the spike over eight real menu pages, 163 items came out and 202 prices were kept for USD 0.024; a ten-photo load costs around USD 0.025. Free plan: 30 products and one AI load; Pro: 300 products and five loads.",
          ],
          facts: [
            { value: "8", label: "real menu pages" },
            { value: "163", label: "items" },
            { value: "202", label: "prices kept" },
            { value: "USD 0.024", label: "cost of the spike" },
          ],
          mediaAlt:
            "Motion graphic: a rule scans a schematic menu page and, as it passes, candidate rows fill with name, evidence fragment and price; one price with no digits in its fragment is struck out and flagged as a conflict, while the counters reach 8 pages, 163 items, 202 prices and USD 0.024",
        },
        gateway: {
          kicker: "WhatsApp",
          title: "A session that knows what state it is in.",
          body: [
            "Messages go out through a gateway of our own: Fastify with multi-device Baileys and the auth state kept in Postgres. The session is an explicit state machine, disconnected, QR pending, connecting and connected, with two terminal states that never retry on their own: logged out, which asks for a new scan, and banned.",
            "The limits are explicit too. The QR refreshes up to six times and then stops; reconnection waits 2 to 60 seconds between attempts, eight at most; outbound messages are spaced 1 to 1.5 seconds apart. Hermes does not observe message delivery, so it promises no ticks.",
          ],
          facts: [
            { value: "6", label: "session states, two terminal" },
            { value: "6", label: "QR refreshes, then it stops" },
            { value: "2 → 60 s", label: "backoff, 8 attempts at most" },
            { value: "1 – 1.5 s", label: "between outbound messages" },
          ],
        },
        "night-to-day": {
          kicker: "Night to day",
          title: "The landing dawns as you scroll.",
          body: [
            "Hermes holds two worlds in one product. The brand is night: a near-black backdrop, one warm ember and a glass nav. The product is day, Cristal Preciso: cold near-white, dark ink, one indigo accent, glass materials, hairlines and pill chips, with a blurred colour blob drifting slowly.",
            "The landing tells it literally: it opens at night with the Casa Umi storefront on a phone and, as you scroll, it crossfades into day, where the four demo businesses appear. The whole fade is one variable, --day-mix, moving background, text and surfaces at once.",
          ],
          mediaAlt: [
            "The Hermes landing still at night, with the Market storefront of Lo de Tere on a phone and the start of the Pedido en vivo section",
            "The Hermes landing in daylight: the section Cuatro negocios, cuatro identidades, with the storefronts of Casa Umi, Fierro Burger, La Esquina and Lo de Tere",
          ],
          caption: ["Landing at 1,900 px of scroll: night", "Landing at 3,800 px of scroll: day"],
        },
        foundations: {
          kicker: "Foundations",
          title: "More decisions on record than screens.",
          body: [
            "A pnpm monorepo: the panel, the database package and the design system. Next.js 15 with React 19 and TypeScript 5.9; Tailwind 4 and Radix in the panel; CSS Modules over the Cristal Preciso tokens in the landing. Drizzle on PostgreSQL with row-level security across 35 tables and two database roles; Supabase for e-mail code sign-in and storage; Vercel for hosting.",
            "Before there are users there are 396 test cases in 41 files, four end-to-end specs with Playwright, 56 architecture decisions on record, 22 open questions, 20 design canvases and 103 commits. The order is deliberate: decisions first, screens after.",
          ],
          facts: [
            { value: "35", label: "tables with RLS" },
            { value: "396", label: "test cases in 41 files" },
            { value: "56", label: "decisions on record" },
            { value: "22", label: "open questions" },
          ],
        },
      },
      metrics: {
        kicker: "In development",
        stats: [
          { value: "4", label: "themes" },
          { value: "35", label: "tables with RLS" },
          { value: "396", label: "tests" },
          { value: "56", label: "decisions on record" },
        ],
        closer: "No users and no revenue yet: an own product in development.",
        note: "The panel screens are design canvases; the landing runs.",
      },
      gallery: {
        kicker: "Screens",
        items: {
          "storefront-home": {
            alt: "Design canvas of the storefront home in the four themes: header, cover, chips and the most ordered",
            caption: "V01 · Storefront home · Design canvas",
          },
          "storefront-product": {
            alt: "Design canvas of the product sheet, Doble $ 14.000 with its modifier groups, in the four themes",
            caption: "V04 · Product · Design canvas",
          },
          "storefront-cart": {
            alt: "Design canvas of the cart, four lines in three categories, in the four themes",
            caption: "V05 · Cart · Design canvas",
          },
          "storefront-created": {
            alt: "Design canvas of the Order created screen: order #0142 ready and the Send on WhatsApp button, in the four themes",
            caption: "V07 · Order created · Design canvas",
          },
          themes: {
            alt: "Design canvas Temas de tienda: Studio, Brutal and Street over the same structure",
            caption: "Storefront themes · Design canvas",
          },
          themephone: {
            alt: "Design canvas of the canonical 360 by 620 phone with the Casa Umi storefront in the Studio theme",
            caption: "Canonical phone 360 × 620 · Design canvas",
          },
          "landing-mobile": {
            alt: "The Hermes landing on a phone: Tu negocio merece un canal de pedidos a su altura, and the Casa Umi storefront",
            caption: "Landing on a phone",
          },
          "landing-s1": {
            alt: "The Hermes landing with the Street storefront of La Esquina on the phone",
            caption: "Landing: Street theme, La Esquina",
          },
          "landing-s5": {
            alt: "The landing's Cómo funciona section in daylight: Cargás, Compartís, Recibís",
            caption: "Landing: how it works",
          },
          "dashboard-carta": {
            alt: "Design canvas of the menu in the panel: inline price, sold out with undo and product 31 kept as a draft",
            caption: "C04 – C06 · Menu · Design canvas",
          },
        },
      },
      links: [],
      nextLabel: "Next project",
    },
  },
};
