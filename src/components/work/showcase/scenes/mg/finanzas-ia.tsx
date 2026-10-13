"use client";

import { useCallback, useRef, type RefObject } from "react";
import type { Lang } from "@/lib/i18n";
import { useStagePlayback } from "./use-stage-playback";
import "./finanzas-ia.css";

/**
 * Live components of the Finanzas showcase (/work/finanzas-ia):
 *
 *   MessageToMovement  motion graphic: the capture bar types "gasté 18 mil
 *                      en nafta con la Visa Galicia"; each word is boxed
 *                      and lands in its field of a JSON card (type, amount,
 *                      description, payment_method, card,
 *                      should_affect_balance); the empty `currency` field
 *                      flashes amber and a Pending badge stamps on; a
 *                      Confirm rule sweeps and the card's debt counts to
 *                      18.000 while the bank balance visibly stays still.
 *   AvailableBalance   motion graphic: a vertical subtraction, real balance
 *                      − reserved − savings − invested = AVAILABLE on an ink
 *                      card; then the reserved figure climbs past the
 *                      balance, the result crosses zero, turns red and the
 *                      "Over-committed · Review" pill drops in (ADR-022:
 *                      never clamped).
 *   ThreeChannels      motion graphic: TEXT / AUDIO / PHOTO boxes inside a
 *                      dashed phone boundary send packets along thin wires
 *                      to a Cloudflare Worker, amber-edged cards land in a
 *                      Pending column with a ticking relative age, and the
 *                      per-device daily quota decrements once per capture.
 *
 * The motion is CSS (scenes/mg/finanzas-ia.css) keyed on the stage's
 * data-playing / data-reduced attributes; JS only writes what CSS cannot
 * (the typed line, the money counters, the quota and the ages) on a rAF
 * tick that runs while the stage plays and reads the same 12s cycle as the
 * keyframes. Each component renders `.mg-fin` (the container-query root
 * that fills the stage) with one layout child, because an element cannot
 * answer a container query about itself.
 *
 * Every figure shown is one the repo evidences (the placeholder sentence
 * and its parse from the eval corpus, the balance formula and ADR-022, the
 * Worker routes and quotas); the ledger amounts are schematic examples.
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

/**
 * "$ 1.250.000" (es-AR) / "$ 1,250,000" (en-US): the product's own amount
 * format, whole pesos, with a true minus sign for negatives.
 */
const AMOUNT: Record<Lang, Intl.NumberFormat> = {
  es: new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }),
  en: new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }),
};
function money(value: number, lang: Lang): string {
  const sign = value < 0 ? "−" : "";
  return `${sign}$ ${AMOUNT[lang].format(Math.abs(value))}`;
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
 * hook lives in scenes/mg/ada13.tsx and hermes.tsx; extracting it next to
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
/* MessageToMovement                                                   */
/* ------------------------------------------------------------------ */

/**
 * The app's own placeholder sentence, and the parse the eval corpus expects.
 * Multi-word tokens hold a non-breaking space so a narrow column never
 * breaks a token across lines (its hairline box would collapse) and both
 * layers of the input, the typed one and the tokenised one, wrap at the
 * same point. In the mono face the no-break space is as wide as a space.
 */
const SENTENCE = "gasté 18 mil en nafta con la Visa Galicia";
/**
 * The sentence split into the tokens the parser maps, in order. `slot`
 * names the JSON field the token lands in (the card token feeds two).
 */
const TOKENS: { text: string; slot?: "type" | "amount" | "description" | "card" }[] = [
  { text: "gasté", slot: "type" },
  { text: " " },
  { text: "18 mil", slot: "amount" },
  { text: " en " },
  { text: "nafta", slot: "description" },
  { text: " con la " },
  { text: "Visa Galicia", slot: "card" },
];
/** The JSON fields, with the value the parser returns for each. */
const FIELDS = [
  ["type", "expense"],
  ["amount", "18000"],
  ["description", "nafta"],
  ["payment_method", "credit_card"],
  ["credit_card_suggestion", "Visa Galicia"],
  ["should_affect_balance", "false"],
  ["currency", "null"],
] as const;
/** The debt the confirmed movement adds to the card. */
const CARD_DEBT = 18000;
/** A schematic real balance for the bank account, which never moves here. */
const BANK_BALANCE = 1250000;
/** Where in the cycle the line types (JS) and the debt counts (JS). */
const TYPE_FROM = 0.03;
const TYPE_TO = 0.27;
const DEBT_FROM = 0.78;
const DEBT_TO = 0.86;
const CARET = "▍";

const MSG_UI = {
  es: {
    headLeft: "captura · texto",
    headRight: "json_schema estricto · vos confirmás",
    bar: "Registrá con IA",
    cardHead: "movimiento propuesto",
    cardSub: "schema · hash verificado",
    pending: "Pendiente · falta moneda",
    confirm: "Confirmar",
    cardName: "Visa Galicia",
    cardSub2: "tarjeta de crédito · deuda",
    bankName: "Banco Galicia",
    bankSub: "cuenta · saldo real",
    unchanged: "sin cambios",
    note: "should_affect_balance: false · la cuenta no se toca hasta pagar el resumen",
    alt: "Gráfico en movimiento: en la barra Registrá con IA se escribe “gasté 18 mil en nafta con la Visa Galicia”; cada palabra se enmarca y aterriza en su campo de un JSON, tipo, monto, descripción, medio de pago y tarjeta; el campo moneda, vacío, se marca en ámbar como pendiente; al confirmar, la deuda de la tarjeta sube a 18.000 y el saldo del banco no se mueve",
  },
  en: {
    headLeft: "capture · text",
    headRight: "strict json_schema · you confirm",
    bar: "Registrá con IA",
    cardHead: "proposed movement",
    cardSub: "schema · hash verified",
    pending: "Pending · currency missing",
    confirm: "Confirm",
    cardName: "Visa Galicia",
    cardSub2: "credit card · debt",
    bankName: "Banco Galicia",
    bankSub: "account · real balance",
    unchanged: "unchanged",
    note: "should_affect_balance: false · the account is untouched until the statement is paid",
    alt: "Motion graphic: in the Registrá con IA bar the line “gasté 18 mil en nafta con la Visa Galicia” types itself; each word is boxed and lands in its JSON field, type, amount, description, payment method and card; the empty currency field is flagged amber as pending; on confirm, the card's debt climbs to 18.000 while the bank balance stays still",
  },
} as const;

export function MessageToMovement({ lang }: { lang: Lang }) {
  const ui = MSG_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const typed = useRef<HTMLSpanElement>(null);
  const debt = useRef<HTMLSpanElement>(null);

  /** `t` in [0, 1] is how much of the sentence is typed; `d` the debt counted. */
  const write = useCallback(
    (t: number, d: number) => {
      const n = t >= 1 ? SENTENCE.length : Math.floor(t * SENTENCE.length);
      setText(typed.current, SENTENCE.slice(0, n) + (t >= 1 ? "" : CARET));
      // Hundreds, so the digits tick like a till rather than flicker.
      setText(debt.current, money(Math.round((CARD_DEBT * d) / 100) * 100, lang));
    },
    [lang]
  );

  const frame = useCallback(
    (phase: number) => {
      write(
        clamp01((phase - TYPE_FROM) / (TYPE_TO - TYPE_FROM)),
        easeOutQuart(clamp01((phase - DEBT_FROM) / (DEBT_TO - DEBT_FROM)))
      );
    },
    [write]
  );
  const idle = useCallback(() => write(0, 0), [write]);
  const final = useCallback(() => write(1, 1), [write]);

  useCycle(root, { frame, idle, final });

  return (
    <div ref={root} className="mg-fin" role="img" aria-label={ui.alt}>
      <div className="mg-fin-msg" aria-hidden="true">
        <div className="mg-fin-msg__head mg-fin-rise mg-run">
          <span className="mg-fin-label">{ui.headLeft}</span>
          <span className="mg-fin-label">{ui.headRight}</span>
        </div>

        <div className="mg-fin-msg__bar mg-fin-rise mg-run">
          <span className="mg-fin-label mg-fin-msg__bar-label">{ui.bar}</span>
          <div className="mg-fin-msg__bar-row">
            <div className="mg-fin-msg__input">
              {/* Two layers with the same text: the typed one (JS) during
                  the typing, then the tokenised one, boxed word by word. */}
              <span ref={typed} className="mg-fin-msg__typed">
                {CARET}
              </span>
              <span className="mg-fin-msg__line">
                {TOKENS.map((token) =>
                  token.slot ? (
                    <span key={token.text} className="mg-fin-msg__token" data-slot={token.slot}>
                      {token.text}
                    </span>
                  ) : (
                    <span key={token.text}>{token.text}</span>
                  )
                )}
              </span>
            </div>
            {/* The product's AI button: ink, raised by a hairline ring, no shadow. */}
            <span className="mg-fin-msg__ai">{"✦"}</span>
          </div>
        </div>

        <div className="mg-fin-msg__body">
          <div className="mg-fin-msg__card mg-fin-box mg-fin-rise mg-run">
            <div className="mg-fin-msg__card-head">
              <span className="mg-fin-label">{ui.cardHead}</span>
              <span className="mg-fin-label">{ui.cardSub}</span>
            </div>
            <div className="mg-fin-msg__rows">
              {FIELDS.map(([key, value]) => (
                <div key={key} className="mg-fin-msg__row" data-key={key}>
                  <span className="mg-fin-msg__key">{key}</span>
                  <span className="mg-fin-msg__value">{value}</span>
                  {key === "currency" ? <span className="mg-fin-msg__badge">{ui.pending}</span> : null}
                </div>
              ))}
            </div>
            {/* Confirm: the base row, and an ink layer with the same label
                revealed by a clip-path sweep (hold-to-confirm, deliberate). */}
            <div className="mg-fin-msg__confirm">
              <span className="mg-fin-msg__confirm-base">{ui.confirm}</span>
              <span className="mg-fin-msg__confirm-fill">{ui.confirm}</span>
            </div>
          </div>

          <div className="mg-fin-msg__ledger">
            <div className="mg-fin-msg__acct mg-fin-box mg-fin-rise mg-run" data-acct="card">
              <span className="mg-fin-msg__acct-name">{ui.cardName}</span>
              <span className="mg-fin-label">{ui.cardSub2}</span>
              <span ref={debt} className="mg-fin-msg__amount">
                {money(0, lang)}
              </span>
              {/* Red: the product's expense colour, only ever on a movement. */}
              <i className="mg-fin-msg__bar-fill" />
            </div>
            <div className="mg-fin-msg__acct mg-fin-box mg-fin-rise mg-run" data-acct="bank">
              <span className="mg-fin-msg__acct-name">{ui.bankName}</span>
              <span className="mg-fin-label">{ui.bankSub}</span>
              <span className="mg-fin-msg__amount">{money(BANK_BALANCE, lang)}</span>
              <span className="mg-fin-msg__tag">{ui.unchanged}</span>
            </div>
            <span className="mg-fin-label mg-fin-msg__note">{ui.note}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* AvailableBalance                                                    */
/* ------------------------------------------------------------------ */

/** Schematic figures for the subtraction: real − reserved − savings − invested. */
const REAL = 1250000;
const RESERVED = 300000;
const SAVINGS = 200000;
const INVESTED = 150000;
const AVAILABLE = REAL - RESERVED - SAVINGS - INVESTED; // 600000
/** Where the reserved figure climbs to, past the balance. */
const RESERVED_END = 950000;
const AVAILABLE_END = REAL - RESERVED_END - SAVINGS - INVESTED; // −50000
/** Where in the cycle the result counts (JS) and the climb runs (JS, linear). */
const COUNT_FROM = 0.2;
const COUNT_TO = 0.3;
const CLIMB_FROM = 0.34;
const CLIMB_TO = 0.6;

const BAL_UI = {
  es: {
    headLeft: "inicio · disponible",
    headRight: "la resta vive en el dominio",
    rows: ["Saldo real", "Reservado", "Ahorro", "Inversión"],
    result: "Disponible",
    pill: "Sobre-comprometido · Revisar",
    gauge: "disponible",
    zero: "0",
    note: "El disponible nunca se recorta a cero",
    alt: "Gráfico en movimiento: una resta vertical, saldo real 1.250.000 menos reservado 300.000, menos ahorro 200.000, menos inversión 150.000, igual a disponible 600.000 en una tarjeta de tinta; después lo reservado sube a 950.000, el disponible cruza el cero, queda en rojo en menos 50.000 y aparece la etiqueta Sobre-comprometido · Revisar; una nota recuerda que nunca se recorta a cero",
  },
  en: {
    headLeft: "home · available",
    headRight: "the subtraction lives in the domain",
    rows: ["Real balance", "Reserved", "Savings", "Invested"],
    result: "Available",
    pill: "Over-committed · Review",
    gauge: "available",
    zero: "0",
    note: "Available money is never clamped to zero",
    alt: "Motion graphic: a vertical subtraction, real balance 1.250.000 minus reserved 300.000, minus savings 200.000, minus invested 150.000, equals available 600.000 on an ink card; then the reserved figure climbs to 950.000, the available figure crosses zero, turns red at minus 50.000 and the label Over-committed · Review appears; a note recalls that it is never clamped to zero",
  },
} as const;

export function AvailableBalance({ lang }: { lang: Lang }) {
  const ui = BAL_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const layout = useRef<HTMLDivElement>(null);
  const reserved = useRef<HTMLSpanElement>(null);
  const available = useRef<HTMLSpanElement>(null);
  const availableRed = useRef<HTMLSpanElement>(null);

  const write = useCallback(
    (reservedValue: number, availableValue: number) => {
      // Thousands, so the digits tick like a till rather than flicker.
      const r = Math.round(reservedValue / 1000) * 1000;
      const a = Math.round(availableValue / 1000) * 1000;
      setText(reserved.current, money(r, lang));
      const text = money(a, lang);
      setText(available.current, text);
      setText(availableRed.current, text);
      const el = layout.current;
      if (el) {
        const negative = a < 0;
        if (negative && !el.dataset.negative) el.dataset.negative = "1";
        if (!negative && el.dataset.negative) delete el.dataset.negative;
      }
    },
    [lang]
  );

  const frame = useCallback(
    (phase: number) => {
      const count = easeOutQuart(clamp01((phase - COUNT_FROM) / (COUNT_TO - COUNT_FROM)));
      // Linear, so the zero crossing lands where the gauge keyframes put it.
      const climb = clamp01((phase - CLIMB_FROM) / (CLIMB_TO - CLIMB_FROM));
      const reservedValue = RESERVED + (RESERVED_END - RESERVED) * climb;
      const availableValue = climb > 0 ? AVAILABLE + (AVAILABLE_END - AVAILABLE) * climb : AVAILABLE * count;
      write(reservedValue, availableValue);
    },
    [write]
  );
  const idle = useCallback(() => write(RESERVED, 0), [write]);
  const final = useCallback(() => write(RESERVED_END, AVAILABLE_END), [write]);

  useCycle(root, { frame, idle, final });

  const rows = [
    { name: ui.rows[0], value: REAL, sign: "" },
    { name: ui.rows[1], value: RESERVED, sign: "−" },
    { name: ui.rows[2], value: SAVINGS, sign: "−" },
    { name: ui.rows[3], value: INVESTED, sign: "−" },
  ];

  return (
    <div ref={root} className="mg-fin" role="img" aria-label={ui.alt}>
      <div ref={layout} className="mg-fin-bal" aria-hidden="true">
        <div className="mg-fin-bal__head mg-fin-rise mg-run">
          <span className="mg-fin-label">{ui.headLeft}</span>
          <span className="mg-fin-label">{ui.headRight}</span>
        </div>

        <div className="mg-fin-bal__main">
          <div className="mg-fin-bal__stack">
            {rows.map((row, i) => (
              <div key={row.name} className="mg-fin-bal__row" data-row={i + 1}>
                <i className="mg-fin-bal__cursor" />
                <span className="mg-fin-bal__sign">{row.sign}</span>
                <span className="mg-fin-bal__name">{row.name}</span>
                <span ref={i === 1 ? reserved : undefined} className="mg-fin-bal__amount">
                  {money(row.value, lang)}
                </span>
                <i className="mg-fin-bal__rule" />
              </div>
            ))}
          </div>

          <div className="mg-fin-bal__side">
            {/* The product's ink card: DISPONIBLE, the headline figure the
                home screen shows. The red copy sits on top and only its
                opacity moves. */}
            <div className="mg-fin-bal__result">
              <span className="mg-fin-bal__result-label">{ui.result}</span>
              <span className="mg-fin-bal__result-amount">
                <span ref={available}>{money(0, lang)}</span>
                <span ref={availableRed} className="mg-fin-bal__result-red">
                  {money(0, lang)}
                </span>
              </span>
              <span className="mg-fin-bal__pill">{ui.pill}</span>
            </div>

            {/* The gauge: a track with a zero tick; the positive fill grows
                to the right of it, the negative one to the left. */}
            <div className="mg-fin-bal__gauge mg-fin-rise mg-run">
              <span className="mg-fin-label">{ui.gauge}</span>
              <div className="mg-fin-bal__track">
                <i className="mg-fin-bal__pos" />
                <i className="mg-fin-bal__neg" />
                <i className="mg-fin-bal__zero" />
              </div>
              <span className="mg-fin-label mg-fin-bal__zero-label">{ui.zero}</span>
            </div>
            <span className="mg-fin-label mg-fin-bal__note">{ui.note}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ThreeChannels                                                       */
/* ------------------------------------------------------------------ */

/** The Worker's per-device daily quotas: 20 parse, 10 transcribe, 10 image. */
const QUOTA = [20, 10, 10] as const;
/** Cycle phases at which each capture reaches the Worker (quota decrements). */
const ARRIVE_AT = [0.14, 0.32, 0.5] as const;
/** Cycle phases at which each pending card lands in the inbox. */
const LAND_AT = [0.21, 0.39, 0.57] as const;
/** One schematic "minute" of relative age, as a fraction of the cycle (3s). */
const MINUTE = 0.25;
/** The phase the final frame freezes on, before the fade. */
const FINAL_PHASE = 0.92;

const CHAN_UI = {
  es: {
    headLeft: "proxy · cloudflare worker",
    headRight: "3 rutas · cuotas por dispositivo",
    phone: "el teléfono",
    channels: [
      ["Texto", "gasté 18 mil en nafta…", "gpt-5.4-nano · /parse"],
      ["Audio", "0:07 · nota de voz", "gpt-4o-mini-transcribe · /transcribe"],
      ["Foto", "ticket · 1 imagen", "gpt-4o-mini vision · /image"],
    ],
    quota: "cuota de hoy",
    units: ["parse", "transcribe", "image"],
    worker: "Worker",
    workerSub: "la clave de OpenAI vive acá",
    inbox: "Pendientes",
    cards: [
      ["Nafta · Visa Galicia", "falta moneda"],
      ["Nota de voz", "confirmar monto"],
      ["Ticket del súper", "revisar total"],
    ],
    now: "ahora",
    ago: (n: number) => `hace ${n} min`,
    note: "solo la captura viaja, nunca el ledger",
    alt: "Gráfico en movimiento: tres cajas, texto, audio y foto, dentro de un borde punteado que representa el teléfono, mandan paquetes por líneas finas a un Worker de Cloudflare, y de ahí llegan tarjetas con borde ámbar a una columna Pendientes cuya antigüedad avanza, hace 1 min, hace 2 min; la cuota del día baja de 20, 10 y 10 con cada captura; una nota dice que solo la captura viaja, nunca el ledger",
  },
  en: {
    headLeft: "proxy · cloudflare worker",
    headRight: "3 routes · per-device quotas",
    phone: "the phone",
    channels: [
      ["Text", "gasté 18 mil en nafta…", "gpt-5.4-nano · /parse"],
      ["Audio", "0:07 · voice note", "gpt-4o-mini-transcribe · /transcribe"],
      ["Photo", "receipt · 1 image", "gpt-4o-mini vision · /image"],
    ],
    quota: "today's quota",
    units: ["parse", "transcribe", "image"],
    worker: "Worker",
    workerSub: "the OpenAI key lives here",
    inbox: "Pending",
    cards: [
      ["Fuel · Visa Galicia", "currency missing"],
      ["Voice note", "confirm amount"],
      ["Grocery receipt", "review total"],
    ],
    now: "now",
    ago: (n: number) => `${n} min ago`,
    note: "only the capture travels, never the ledger",
    alt: "Motion graphic: three boxes, text, audio and photo, inside a dashed border that stands for the phone, send packets along thin wires to a Cloudflare Worker, and from there amber-edged cards arrive in a Pending column whose age advances, 1 min ago, 2 min ago; the day's quota drops from 20, 10 and 10 with each capture; a note says only the capture travels, never the ledger",
  },
} as const;

export function ThreeChannels({ lang }: { lang: Lang }) {
  const ui = CHAN_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const quotas = useRef<(HTMLSpanElement | null)[]>([]);
  const ages = useRef<(HTMLSpanElement | null)[]>([]);
  const count = useRef<HTMLSpanElement>(null);

  const write = useCallback(
    (phase: number) => {
      QUOTA.forEach((q, i) => setText(quotas.current[i], String(phase >= ARRIVE_AT[i] ? q - 1 : q)));
      let landed = 0;
      LAND_AT.forEach((at, i) => {
        if (phase >= at) {
          landed += 1;
          const minutes = Math.floor((phase - at) / MINUTE);
          setText(ages.current[i], minutes === 0 ? ui.now : ui.ago(minutes));
        } else {
          setText(ages.current[i], ui.now);
        }
      });
      setText(count.current, String(landed));
    },
    [ui]
  );

  const frame = useCallback((phase: number) => write(Math.min(phase, FINAL_PHASE)), [write]);
  const idle = useCallback(() => write(0), [write]);
  const final = useCallback(() => write(FINAL_PHASE), [write]);

  useCycle(root, { frame, idle, final });

  return (
    <div ref={root} className="mg-fin" role="img" aria-label={ui.alt}>
      <div className="mg-fin-chan" aria-hidden="true">
        <div className="mg-fin-chan__head mg-fin-rise mg-run">
          <span className="mg-fin-label">{ui.headLeft}</span>
          <span className="mg-fin-label">{ui.headRight}</span>
        </div>

        <div className="mg-fin-chan__body">
          {/* The dashed boundary is the phone; the ledger never crosses it. */}
          <div className="mg-fin-chan__phone mg-fin-rise mg-run">
            <span className="mg-fin-label mg-fin-chan__phone-label">{ui.phone}</span>
          </div>

          {ui.channels.map(([kind, sample, model], i) => (
            <div key={kind} className="mg-fin-chan__chan mg-fin-box mg-fin-rise mg-run" data-i={i}>
              <span className="mg-fin-chan__kind">{kind}</span>
              <span className="mg-fin-chan__sample">{sample}</span>
              <span className="mg-fin-label mg-fin-chan__model">{model}</span>
            </div>
          ))}

          <div className="mg-fin-chan__quota mg-fin-rise mg-run">
            <span className="mg-fin-label">{ui.quota}</span>
            <span className="mg-fin-chan__quota-row">
              {QUOTA.map((q, i) => (
                <span key={ui.units[i]} className="mg-fin-chan__quota-item">
                  <span
                    ref={(el) => {
                      quotas.current[i] = el;
                    }}
                    className="mg-fin-chan__quota-n"
                  >
                    {q}
                  </span>
                  <span className="mg-fin-label">{ui.units[i]}</span>
                </span>
              ))}
            </span>
          </div>

          {/* One wire per channel, each a container so its packet can
              travel the wire's own width. */}
          {ui.channels.map(([kind], i) => (
            <div key={kind} className="mg-fin-chan__wire" data-i={i}>
              <i className="mg-fin-chan__hair" />
              <i className="mg-fin-chan__packet" />
            </div>
          ))}

          <div className="mg-fin-chan__bus">
            <i className="mg-fin-chan__bus-line" />
            <div className="mg-fin-chan__worker mg-fin-box mg-fin-rise mg-run">
              <span className="mg-fin-chan__worker-name">{ui.worker}</span>
              <span className="mg-fin-label">{ui.workerSub}</span>
              <i className="mg-fin-chan__ring" />
            </div>
          </div>

          <div className="mg-fin-chan__out">
            <i className="mg-fin-chan__hair" />
            <i className="mg-fin-chan__packet mg-fin-chan__packet--out" />
          </div>

          <div className="mg-fin-chan__inbox mg-fin-rise mg-run">
            <div className="mg-fin-chan__inbox-head">
              <span className="mg-fin-chan__inbox-title">{ui.inbox}</span>
              <span className="mg-fin-chan__inbox-count">
                (<span ref={count}>0</span>)
              </span>
            </div>
            {/* Amber left border: the product's pending colour. */}
            {ui.cards.map(([title, missing], i) => (
              <div key={title} className="mg-fin-chan__card mg-fin-box" data-i={i}>
                <span className="mg-fin-chan__card-title">{title}</span>
                <span className="mg-fin-label mg-fin-chan__card-missing">{missing}</span>
                <span
                  ref={(el) => {
                    ages.current[i] = el;
                  }}
                  className="mg-fin-label mg-fin-chan__card-age"
                >
                  {ui.now}
                </span>
              </div>
            ))}
          </div>
        </div>

        <span className="mg-fin-label mg-fin-chan__note">{ui.note}</span>
      </div>
    </div>
  );
}
