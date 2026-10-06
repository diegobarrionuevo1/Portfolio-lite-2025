"use client";

import { useCallback, useRef, type RefObject } from "react";
import type { Lang } from "@/lib/i18n";
import { useStagePlayback } from "./use-stage-playback";
import "./hermes.css";

/**
 * Live components of the Hermes showcase (/work/hermes):
 *
 *   ThemeMorph     motion graphic: one storefront phone with the same three
 *                  rows while the four theme rule-sets apply in sequence,
 *                  Studio → Brutal → Street → Market; beside it the active
 *                  theme's rules type themselves as CSS custom properties.
 *   OrderCapsule   motion graphic: a pill with the running total travels
 *                  four stops, Catálogo → Selección → Pedido → WhatsApp +
 *                  panel, and at the last one the same text lands twice, a
 *                  chat bubble and an order-centre row, with no delivery
 *                  tick (D-028: Hermes cannot observe delivery).
 *   MenuImport     motion graphic: a rule scans a schematic menu page and
 *                  candidate rows fill with name, evidence fragment and
 *                  price; the one price whose digits are missing from its
 *                  fragment is struck out and flagged, never invented.
 *
 * The motion is CSS (scenes/mg/hermes.css) keyed on the stage's data-playing
 * / data-reduced attributes; JS only writes what CSS cannot (the typed
 * tokens, the running total, the import counters) and flips `data-theme`
 * for the morph, on a rAF tick that runs while the stage plays and reads
 * the same 12s cycle as the keyframes. Each component renders `.mg-her`
 * (the container-query root that fills the stage) with one layout child,
 * because an element cannot answer a container query about itself.
 *
 * Every figure shown is one the Hermes repo evidences (the themes and their
 * demo businesses, the order status tokens, the spike numbers); the order
 * itself is the landing's own demo order for La Esquina.
 */

/** Mirrors --mg-cycle in the CSS: the loop the three narratives share. */
const CYCLE_MS = 12000;

/** 1 - (1 - t)^4, the curve behind --ease-out-quart, so JS and CSS agree. */
function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Writes only when the text changed, so a 60 Hz tick never thrashes the DOM. */
function setText(el: HTMLElement | null, text: string) {
  if (el && el.textContent !== text) el.textContent = text;
}

/** "$ 15.000" (es-AR) / "$ 15,000" (en-US): the product's own price format. */
const PRICE: Record<Lang, Intl.NumberFormat> = {
  es: new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }),
};
function money(value: number, lang: Lang): string {
  return `$ ${PRICE[lang].format(value)}`;
}

type Cycle = {
  /** Called every animation frame while playing with the cycle phase in [0, 1). */
  frame: (phase: number) => void;
  /** The resting frame, written off screen and on mount. */
  idle: () => void;
  /** The final frame, written under reduced motion. */
  final: () => void;
};

/**
 * Drives a component's text in step with the CSS narrative: the phase is
 * measured from the moment the stage started playing, which is also the
 * moment the keyframes declared under `[data-playing]` restart. (The same
 * hook lives in scenes/mg/ada13.tsx; extracting it next to
 * use-stage-playback.ts is a follow-up outside this task's edit surface.)
 */
function useCycle(root: RefObject<HTMLElement>, { frame, idle, final }: Cycle) {
  const raf = useRef(0);

  const onPlay = useCallback(() => {
    const start = performance.now();
    const tick = (now: number) => {
      frame(((now - start) % CYCLE_MS) / CYCLE_MS);
      raf.current = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  }, [frame]);

  const onStop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    idle();
  }, [idle]);

  const onReduced = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    final();
  }, [final]);

  useStagePlayback(root, { onPlay, onStop, onReduced });
}

/* ------------------------------------------------------------------ */
/* ThemeMorph                                                          */
/* ------------------------------------------------------------------ */

type ThemeId = "studio" | "brutal" | "street" | "market";

type Theme = {
  id: ThemeId;
  name: string;
  /** The demo business the landing shows in this theme. */
  business: string;
  /**
   * The rule-set as it is typed beside the phone. Display strings quoting
   * the product's theme files; the colours the phone actually renders are
   * the quotes in hermes.css.
   */
  tokens: readonly string[];
};

/** Studio → Brutal → Street → Market, the landing's own order. */
const THEMES: readonly Theme[] = [
  {
    id: "studio",
    name: "Studio",
    business: "Casa Umi",
    tokens: ["--theme: studio", "--font: serif / 400", "--case: none", "--radius: 10px", "--surface: #FFFFFF", "--cta: #111521"],
  },
  {
    id: "brutal",
    name: "Brutal",
    business: "Fierro Burger",
    tokens: ["--theme: brutal", "--font: grotesk / 800", "--case: uppercase", "--radius: 0px", "--surface: #F2F0E9", "--cta: #FF3B1F"],
  },
  {
    id: "street",
    name: "Street",
    business: "La Esquina",
    tokens: ["--theme: street", "--font: grotesk / 800", "--case: uppercase", "--radius: 4px", "--surface: #140709", "--cta: #FF3B1F"],
  },
  {
    id: "market",
    name: "Market",
    business: "Lo de Tere",
    tokens: ["--theme: market", "--font: sans / 600", "--case: none", "--radius: 16px", "--surface: #FFF4DC", "--cta: #D9481C"],
  },
];

/** Each theme holds a quarter of the cycle (3s): typing fills its first 0.75s. */
const TYPE_FROM = 0.03;
const TYPE_TO = 0.28;
const CARET = "▍";

/** Casa Umi's carta as the landing shows it; the rows never change, only the rules. */
const PRODUCTS = [
  { name: "Roll crocante de salmón y palta", desc: "Ocho piezas. Salmón, palta, queso crema y panko.", price: 12400 },
  { name: "Nigiri de langostino", desc: "Cuatro piezas. Langostino sellado y mayonesa de lima.", price: 9800 },
  { name: "Combinado Umi · 24 piezas", desc: "Selección del chef para dos.", price: 26900 },
] as const;

const MORPH_UI = {
  es: {
    headLeft: "motor de temas · tienda",
    headRight: "misma carta · cuatro reglas",
    rules: "reglas del tema",
    demo: "demo",
    open: "Abierto · 23:30",
    sub: "Sushi · Nueva Córdoba",
    coverSub: "Selección del chef · 24 piezas",
    chips: ["Rolls", "Nigiri", "Combinados"],
    bar: "Pedir por WhatsApp",
    alt: "Gráfico en movimiento: una tienda en un celular con los mismos tres productos cambia de tema, Studio, Brutal, Street y Market, mientras al costado se escriben las reglas de cada tema como variables de CSS: fuente, caja, radio, superficie y botón",
  },
  en: {
    headLeft: "theme engine · storefront",
    headRight: "same menu · four rule-sets",
    rules: "theme rules",
    demo: "demo",
    open: "Open · 23:30",
    sub: "Sushi · Nueva Córdoba",
    coverSub: "The chef's selection · 24 pieces",
    chips: ["Rolls", "Nigiri", "Combos"],
    bar: "Order on WhatsApp",
    alt: "Motion graphic: a storefront on a phone with the same three products changes theme, Studio, Brutal, Street and Market, while each theme's rules type themselves beside it as CSS custom properties: font, case, radius, surface and button",
  },
} as const;

export function ThemeMorph({ lang }: { lang: Lang }) {
  const ui = MORPH_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const morph = useRef<HTMLDivElement>(null);
  const themeName = useRef<HTMLSpanElement>(null);
  const business = useRef<HTMLSpanElement>(null);
  const lines = useRef<(HTMLSpanElement | null)[]>([]);

  /** Flips the theme and writes its tokens, `t` in [0, 1] being how much is typed. */
  const write = useCallback(
    (index: number, t: number) => {
      const theme = THEMES[index];
      if (morph.current && morph.current.dataset.theme !== theme.id) {
        morph.current.dataset.theme = theme.id;
      }
      setText(themeName.current, theme.name);
      setText(business.current, theme.business);

      // One typewriter across the lines: a character budget that the lines
      // consume in order, the caret sitting on the line being typed.
      const total = theme.tokens.reduce((sum, token) => sum + token.length, 0);
      let budget = t >= 1 ? total : Math.floor(t * total);
      let caretPlaced = t >= 1;
      theme.tokens.forEach((token, i) => {
        const n = Math.min(token.length, budget);
        budget -= n;
        let text = token.slice(0, n);
        if (!caretPlaced && n < token.length) {
          text += CARET;
          caretPlaced = true;
        }
        setText(lines.current[i], text);
      });
    },
    []
  );

  const frame = useCallback(
    (phase: number) => {
      const slot = Math.min(THEMES.length - 1, Math.floor(phase * THEMES.length));
      const u = phase * THEMES.length - slot;
      write(slot, clamp01((u - TYPE_FROM) / (TYPE_TO - TYPE_FROM)));
    },
    [write]
  );
  const idle = useCallback(() => write(0, 1), [write]);
  const final = useCallback(() => write(THEMES.length - 1, 1), [write]);

  useCycle(root, { frame, idle, final });

  const first = THEMES[0];

  return (
    <div ref={root} className="mg-her" role="img" aria-label={ui.alt}>
      <div ref={morph} className="mg-her-morph" data-theme={first.id} aria-hidden="true">
        <div className="mg-her-morph__head mg-her-rise mg-run">
          <span className="mg-her-label">{ui.headLeft}</span>
          <span className="mg-her-label">{ui.headRight}</span>
        </div>

        <div className="mg-her-morph__stage mg-her-rise mg-run">
          <div className="mg-her-phone">
            <div className="mg-her-phone__head">
              <span className="mg-her-phone__name">Casa Umi</span>
              <span className="mg-her-phone__open">
                <i />
                {ui.open}
              </span>
            </div>
            <span className="mg-her-phone__sub">{ui.sub}</span>
            <div className="mg-her-phone__cover">
              <span className="mg-her-phone__cover-name">Combinado Umi</span>
              <span className="mg-her-phone__cover-sub">{ui.coverSub}</span>
            </div>
            <div className="mg-her-phone__chips">
              {ui.chips.map((chip, i) => (
                <span key={chip} className="mg-her-phone__chip" data-on={i === 0 ? "" : undefined}>
                  {chip}
                </span>
              ))}
            </div>
            <div className="mg-her-phone__rows">
              {PRODUCTS.map((product) => (
                <div key={product.name} className="mg-her-phone__row">
                  <i className="mg-her-phone__thumb" />
                  <span className="mg-her-phone__title">{product.name}</span>
                  <span className="mg-her-phone__desc">{product.desc}</span>
                  <span className="mg-her-phone__price">{money(product.price, lang)}</span>
                  <span className="mg-her-phone__add">+</span>
                </div>
              ))}
            </div>
            <div className="mg-her-phone__bar">
              <span>{ui.bar}</span>
              <span className="mg-her-phone__bar-count">0</span>
            </div>
          </div>
        </div>

        <div className="mg-her-morph__panel mg-her-rise mg-run">
          <span className="mg-her-label">{ui.rules}</span>
          <span ref={themeName} className="mg-her-morph__name">
            {first.name}
          </span>
          <span className="mg-her-label mg-her-morph__demo">
            {ui.demo} · <span ref={business}>{first.business}</span>
          </span>
          <div className="mg-her-morph__tokens">
            {first.tokens.map((token, i) => (
              <span
                key={token}
                ref={(el) => {
                  lines.current[i] = el;
                }}
                className="mg-her-morph__token"
              >
                {token}
              </span>
            ))}
          </div>
          <div className="mg-her-morph__dots">
            {THEMES.map((theme) => (
              <span key={theme.id} className="mg-her-morph__dot" data-id={theme.id}>
                <i />
                {theme.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* OrderCapsule                                                        */
/* ------------------------------------------------------------------ */

/** The landing's demo order: 1× Doble cheddar con bacon + 1× Papas con cheddar y verdeo. */
const ORDER_TOTAL = 15000;
/** Where in the cycle the total counts up: the capsule's hold at Selección. */
const COUNT_FROM = 0.16;
const COUNT_TO = 0.26;

const ORDERS_UI = {
  es: {
    headLeft: "pedido en vivo · la esquina",
    headRight: "4 paradas · 1 fuente de verdad",
    stops: [
      ["Catálogo", "el cliente elige"],
      ["Selección", "tamaño, cocción, extras"],
      ["Pedido", "total y entrega"],
      ["WhatsApp + panel", "llega listo para cocina"],
    ],
    capSub: "2 ítems · delivery",
    chatName: "La Esquina · Pedidos",
    chatChannel: "whatsapp",
    lines: [
      "Nuevo pedido · La Esquina",
      "1× Doble cheddar con bacon",
      "Cocción: a punto · Sin cebolla",
      "1× Papas con cheddar y verdeo",
      "Entrega: delivery · Nueva Córdoba",
    ],
    payLine: "Pago: efectivo · Total",
    customer: "Martina G. · 351 555 0142",
    time: "23:14",
    centre: "Centro de pedidos",
    centreSub: "hoy",
    orderNo: "#0142",
    orderTitle: "Nuevo pedido",
    wait: "espera 1 min",
    orderMeta: "Delivery · Efectivo · 2 ítems",
    chips: ["nuevo", "preparando", "listo"],
    note: "Hermes no observa la entrega del mensaje: sin tilde · D-028",
    alt: "Gráfico en movimiento: una cápsula con el total del pedido recorre cuatro paradas, catálogo, selección, pedido y WhatsApp más panel, y al final el mismo texto aparece dos veces, como mensaje de WhatsApp y como fila del centro de pedidos con los estados nuevo, preparando y listo, sin tilde de entrega",
  },
  en: {
    headLeft: "live order · la esquina",
    headRight: "4 stops · 1 source of truth",
    stops: [
      ["Catalog", "the customer picks"],
      ["Selection", "size, doneness, extras"],
      ["Order", "total and delivery"],
      ["WhatsApp + panel", "arrives ready for the kitchen"],
    ],
    capSub: "2 items · delivery",
    chatName: "La Esquina · Orders",
    chatChannel: "whatsapp",
    lines: [
      "New order · La Esquina",
      "1× Doble cheddar con bacon",
      "Doneness: medium · No onion",
      "1× Papas con cheddar y verdeo",
      "Delivery · Nueva Córdoba",
    ],
    payLine: "Cash · Total",
    customer: "Martina G. · 351 555 0142",
    time: "23:14",
    centre: "Order centre",
    centreSub: "today",
    orderNo: "#0142",
    orderTitle: "New order",
    wait: "waiting 1 min",
    orderMeta: "Delivery · Cash · 2 items",
    chips: ["new", "preparing", "ready"],
    note: "Hermes does not observe message delivery: no tick · D-028",
    alt: "Motion graphic: a capsule with the running total travels four stops, catalog, selection, order and WhatsApp plus panel, and at the end the same text appears twice, as a WhatsApp message and as an order-centre row with the statuses new, preparing and ready, with no delivery tick",
  },
} as const;

export function OrderCapsule({ lang }: { lang: Lang }) {
  const ui = ORDERS_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const total = useRef<HTMLSpanElement>(null);

  const write = useCallback((value: number) => setText(total.current, money(value, lang)), [lang]);
  const frame = useCallback(
    (phase: number) => {
      const t = clamp01((phase - COUNT_FROM) / (COUNT_TO - COUNT_FROM));
      // Hundreds, so the digits tick like a till rather than flicker.
      write(Math.round((ORDER_TOTAL * easeOutQuart(t)) / 100) * 100);
    },
    [write]
  );
  const idle = useCallback(() => write(0), [write]);
  const final = useCallback(() => write(ORDER_TOTAL), [write]);

  useCycle(root, { frame, idle, final });

  return (
    <div ref={root} className="mg-her" role="img" aria-label={ui.alt}>
      <div className="mg-her-orders" aria-hidden="true">
        <div className="mg-her-orders__head mg-her-rise mg-run">
          <span className="mg-her-label">{ui.headLeft}</span>
          <span className="mg-her-label">{ui.headRight}</span>
        </div>

        <div className="mg-her-orders__track mg-her-rise mg-run">
          <i className="mg-her-orders__rule" />
          <i className="mg-her-orders__sweep" />
          <div className="mg-her-orders__capsule">
            <span ref={total} className="mg-her-orders__total">
              {money(0, lang)}
            </span>
            <span className="mg-her-orders__cap-sub">{ui.capSub}</span>
          </div>
          <div className="mg-her-orders__stops">
            {ui.stops.map(([label, sub], i) => (
              <div key={label} className="mg-her-orders__stop">
                <i className="mg-her-orders__tick" />
                <span className="mg-her-orders__stop-box mg-her-box">
                  <span className="mg-her-orders__n">{i + 1}</span>
                  <span className="mg-her-orders__stop-label">{label}</span>
                  <span className="mg-her-orders__stop-sub">{sub}</span>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mg-her-orders__out">
          <div className="mg-her-orders__chat mg-her-box mg-her-rise mg-run">
            <div className="mg-her-orders__chat-head">
              <span className="mg-her-orders__chat-name">{ui.chatName}</span>
              <span className="mg-her-label">{ui.chatChannel}</span>
            </div>
            <div className="mg-her-orders__bubble mg-her-island">
              {ui.lines.map((line) => (
                <span key={line} className="mg-her-orders__line">
                  {line}
                </span>
              ))}
              <span className="mg-her-orders__line">
                {ui.payLine} <strong>{money(ORDER_TOTAL, lang)}</strong>
              </span>
              <span className="mg-her-orders__line mg-her-orders__line--customer">{ui.customer}</span>
              <span className="mg-her-orders__time">{ui.time}</span>
            </div>
          </div>

          <div className="mg-her-orders__centre mg-her-box mg-her-rise mg-run">
            <div className="mg-her-orders__chat-head">
              <span className="mg-her-orders__chat-name">{ui.centre}</span>
              <span className="mg-her-label">{ui.centreSub}</span>
            </div>
            <div className="mg-her-orders__row mg-her-island">
              <span className="mg-her-orders__row-no">{ui.orderNo}</span>
              <span className="mg-her-orders__row-title">{ui.orderTitle}</span>
              <span className="mg-her-orders__row-wait">{ui.wait}</span>
              <span className="mg-her-orders__row-meta">{ui.orderMeta}</span>
              <span className="mg-her-orders__row-total">{money(ORDER_TOTAL, lang)}</span>
              <span className="mg-her-orders__chips">
                {ui.chips.map((chip, i) => (
                  <span key={chip} className="mg-her-orders__chip">
                    {chip}
                    {/* The lit state is a second layer with the same text, so only opacity moves. */}
                    {i === 0 ? <span className="mg-her-orders__chip-on">{chip}</span> : null}
                  </span>
                ))}
              </span>
            </div>
          </div>
        </div>

        <span className="mg-her-label mg-her-orders__note">{ui.note}</span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MenuImport                                                          */
/* ------------------------------------------------------------------ */

/** The spike's figures: 8 real menu pages, 163 items, 202 prices kept, USD 0.024. */
const SPIKE = { pages: 8, items: 163, prices: 202, usd: 0.024 } as const;
/** Where in the cycle the scan runs and the counters climb with it. */
const SCAN_FROM = 0.04;
const SCAN_TO = 0.4;

/** A rotisería's page, schematic: the one price without digits in its fragment is the conflict. */
const CANDIDATES = [
  { name: "Milanesa napolitana con puré", fragment: "milanesa napolitana c/ puré 8900", price: 8900 },
  { name: "Pollo al horno con papas", fragment: "pollo al horno c/ papas 16500", price: 16500 },
  { name: "Docena de empanadas surtidas", fragment: "empanadas surtidas x12 14400", price: 14400 },
  { name: "Tarta de verdura", fragment: "tarta de verdura · porción", price: 7200, conflict: true },
  { name: "Flan casero", fragment: "flan casero c/ dulce 4500", price: 4500 },
  { name: "Gaseosa 1,5 L", fragment: "gaseosa 1.5 lt 3200", price: 3200 },
] as const;

/** Schematic lines of the photographed page, by relative width. */
const PAGE_LINES = [0.55, 0.82, 0.4, 0.74, 0.62, 0.3, 0.78, 0.58, 0.44, 0.7, 0.52, 0.36] as const;

const IMPORT_UI = {
  es: {
    headLeft: "carga de carta · ia",
    headRight: "fotos → candidatos con evidencia",
    page: "carta impresa · foto 3 de 8",
    columns: ["candidato", "evidencia", "precio"],
    conflict: "conflicto",
    counters: ["páginas", "ítems", "precios", "USD"],
    alt: "Gráfico en movimiento: una línea recorre una página de carta esquemática y, a medida que pasa, las filas de candidatos se completan con nombre, fragmento de evidencia y precio; un precio sin dígitos en su fragmento se tacha, queda vacío y se marca como conflicto, mientras los contadores llegan a 8 páginas, 163 ítems, 202 precios y USD 0.024",
  },
  en: {
    headLeft: "menu import · ai",
    headRight: "photos → candidates with evidence",
    page: "printed menu · photo 3 of 8",
    columns: ["candidate", "evidence", "price"],
    conflict: "conflict",
    counters: ["pages", "items", "prices", "USD"],
    alt: "Motion graphic: a rule scans a schematic menu page and, as it passes, candidate rows fill with name, evidence fragment and price; one price with no digits in its fragment is struck out, left empty and flagged as a conflict, while the counters reach 8 pages, 163 items, 202 prices and USD 0.024",
  },
} as const;

export function MenuImport({ lang }: { lang: Lang }) {
  const ui = IMPORT_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const pages = useRef<HTMLSpanElement>(null);
  const items = useRef<HTMLSpanElement>(null);
  const prices = useRef<HTMLSpanElement>(null);
  const usd = useRef<HTMLSpanElement>(null);

  const write = useCallback((t: number) => {
    setText(pages.current, String(Math.round(SPIKE.pages * t)));
    setText(items.current, String(Math.round(SPIKE.items * t)));
    setText(prices.current, String(Math.round(SPIKE.prices * t)));
    setText(usd.current, (SPIKE.usd * t).toFixed(3));
  }, []);
  const frame = useCallback(
    (phase: number) => write(clamp01((phase - SCAN_FROM) / (SCAN_TO - SCAN_FROM))),
    [write]
  );
  const idle = useCallback(() => write(0), [write]);
  const final = useCallback(() => write(1), [write]);

  useCycle(root, { frame, idle, final });

  const counters = [
    [pages, ui.counters[0]],
    [items, ui.counters[1]],
    [prices, ui.counters[2]],
    [usd, ui.counters[3]],
  ] as const;

  return (
    <div ref={root} className="mg-her" role="img" aria-label={ui.alt}>
      <div className="mg-her-import" aria-hidden="true">
        <div className="mg-her-import__head mg-her-rise mg-run">
          <span className="mg-her-label">{ui.headLeft}</span>
          <span className="mg-her-label">{ui.headRight}</span>
        </div>

        <div className="mg-her-import__body">
          <div className="mg-her-import__page mg-her-box mg-her-rise mg-run">
            <span className="mg-her-label">{ui.page}</span>
            <div className="mg-her-import__lines">
              {PAGE_LINES.map((w, i) => (
                <i key={i} className="mg-her-import__line" style={{ ["--w" as string]: w }} />
              ))}
              <i className="mg-her-import__scan" />
            </div>
          </div>

          <div className="mg-her-import__table mg-her-rise mg-run">
            <div className="mg-her-import__row mg-her-import__row--head">
              {ui.columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>
            <div className="mg-her-import__rows">
              {CANDIDATES.map((candidate) => (
                <div
                  key={candidate.name}
                  className="mg-her-import__row mg-her-import__row--item"
                  data-conflict={"conflict" in candidate ? "" : undefined}
                >
                  <span className="mg-her-import__name">{candidate.name}</span>
                  <span className="mg-her-import__fragment">{candidate.fragment}</span>
                  <span className="mg-her-import__price">
                    <span className="mg-her-import__amount">
                      {money(candidate.price, lang)}
                      {"conflict" in candidate ? <i className="mg-her-import__strike" /> : null}
                    </span>
                    {"conflict" in candidate ? (
                      <>
                        <span className="mg-her-import__empty">—</span>
                        <span className="mg-her-import__flag">{ui.conflict}</span>
                      </>
                    ) : null}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mg-her-import__foot">
          {counters.map(([ref, label]) => (
            <span key={label} className="mg-her-import__counter">
              <span ref={ref} className="mg-her-import__figure">
                0
              </span>
              <span className="mg-her-label">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
