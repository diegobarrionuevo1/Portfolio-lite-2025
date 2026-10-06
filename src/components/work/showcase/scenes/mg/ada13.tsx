"use client";

import { useCallback, useRef, type RefObject } from "react";
import type { Lang } from "@/lib/i18n";
import { useStagePlayback } from "./use-stage-playback";
import "./ada13.css";

/**
 * Live components of the Ada13 showcase (/work/ada13):
 *
 *   Day256          motion graphic: a mono counter walks the year from day
 *                   001 to 256 while a rule sweeps the months, then the
 *                   digits resolve into 13 · 09, Programmer's Day.
 *   InscribeStates  motion graphic: the registration pipeline, form →
 *                   POST /inscribe → Express → one of four states → the
 *                   e-mail, with Directus feeding the countries into the form.
 *   IncidentLedger  motion graphic (schematic): a mono table of incidents
 *                   types itself in and closes row by row as a rule sweeps
 *                   down, while a tally counts the closed ones.
 *
 * The motion is CSS (scenes/mg/ada13.css) keyed on the stage's data-playing
 * / data-reduced attributes; JS only writes the digits that CSS cannot (the
 * day counter, the e-mail count, the closed-incidents tally), on a rAF tick
 * that runs while the stage plays and reads the same 12s cycle as the
 * keyframes. Each component renders `.mg-ada` (the container-query root that
 * fills the stage) with one layout child, because an element cannot answer a
 * container query about itself.
 *
 * Every figure shown is one the archived site evidences (the day of the
 * year, the four states, one e-mail per state, the platform's own areas);
 * nothing here is a metric.
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

function pad3(n: number): string {
  return String(n).padStart(3, "0");
}

/** Writes only when the text changed, so a 60 Hz tick never thrashes the DOM. */
function setText(el: HTMLElement | null, text: string) {
  if (el && el.textContent !== text) el.textContent = text;
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
 * Drives a component's digits in step with the CSS narrative: the phase is
 * measured from the moment the stage started playing, which is also the
 * moment the keyframes declared under `[data-playing]` restart.
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
/* Day256                                                              */
/* ------------------------------------------------------------------ */

/** 13 September 2023 is day 256 of a 365-day year. */
const DAY_OF_YEAR = 256;
/** First day (0-based) of each month in a common year, for the ticks. */
const MONTH_STARTS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
const SEPTEMBER = 8;
/** Where in the cycle the counter walks (mirrors the sweep in the CSS). */
const COUNT_FROM = 0.04;
const COUNT_TO = 0.4;

const DAY_UI = {
  es: {
    site: "ada13.tech · 2023",
    day: "día",
    ofYear: "de 365",
    date: "13 · 09",
    stamp: "Día del Programador",
    venue: "Usina del Arte · Buenos Aires · 2023",
    second: "2.ª edición · 2024",
    months: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"],
    alt: "Gráfico en movimiento: un contador monoespaciado cuenta del día 001 al 256 mientras una línea recorre el año y se detiene en el 13 de septiembre, Día del Programador, Usina del Arte, Buenos Aires, 2023; segunda edición en 2024",
  },
  en: {
    site: "ada13.tech · 2023",
    day: "day",
    ofYear: "of 365",
    date: "13 · 09",
    stamp: "Programmer's Day",
    venue: "Usina del Arte · Buenos Aires · 2023",
    second: "2nd edition · 2024",
    months: ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"],
    alt: "Motion graphic: a monospaced counter counts from day 001 to 256 while a rule sweeps the year and stops on 13 September, Programmer's Day, Usina del Arte, Buenos Aires, 2023; second edition in 2024",
  },
} as const;

export function Day256({ lang }: { lang: Lang }) {
  const ui = DAY_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const dayLabel = useRef<HTMLSpanElement>(null);

  const write = useCallback(
    (day: number) => {
      setText(counter.current, pad3(day));
      setText(dayLabel.current, `${ui.day} ${pad3(day)}`);
    },
    [ui.day]
  );

  const frame = useCallback(
    (phase: number) => {
      const t = clamp01((phase - COUNT_FROM) / (COUNT_TO - COUNT_FROM));
      write(Math.round(1 + (DAY_OF_YEAR - 1) * easeOutQuart(t)));
    },
    [write]
  );
  const idle = useCallback(() => write(1), [write]);
  const final = useCallback(() => write(DAY_OF_YEAR), [write]);

  useCycle(root, { frame, idle, final });

  return (
    <div ref={root} className="mg-ada" role="img" aria-label={ui.alt}>
      <div className="mg-ada-day" aria-hidden="true">
        <div className="mg-ada-day__head mg-ada-rise mg-run">
          <span className="mg-ada-label">{ui.site}</span>
          <span className="mg-ada-label">
            <span ref={dayLabel}>
              {ui.day} {pad3(1)}
            </span>{" "}
            {ui.ofYear}
          </span>
        </div>

        <div className="mg-ada-day__main">
          <div className="mg-ada-day__digits">
            <span ref={counter} className="mg-ada-day__counter">
              {pad3(1)}
            </span>
            <span className="mg-ada-day__date">{ui.date}</span>
          </div>
          <span className="mg-ada-day__stamp">{ui.stamp}</span>
        </div>

        <div className="mg-ada-day__year mg-ada-rise mg-run">
          <i className="mg-ada-day__track" />
          <i className="mg-ada-day__sweep" />
          {MONTH_STARTS.map((start, i) => {
            const x = start / 365;
            return (
              <span key={ui.months[i]} style={{ display: "contents" }}>
                <i className="mg-ada-day__tick" style={{ ["--x" as string]: x }} />
                <span className="mg-ada-day__month mg-ada-label" style={{ ["--x" as string]: x }}>
                  {ui.months[i]}
                </span>
                {i === SEPTEMBER ? (
                  <span
                    className="mg-ada-day__month mg-ada-day__month--lit mg-ada-label"
                    style={{ ["--x" as string]: x }}
                  >
                    {ui.months[i]}
                  </span>
                ) : null}
              </span>
            );
          })}
          <i className="mg-ada-day__mark" />
        </div>

        <div className="mg-ada-day__foot">
          <span className="mg-ada-day__venue mg-ada-label">{ui.venue}</span>
          <span className="mg-ada-day__tag">{ui.second}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* InscribeStates                                                      */
/* ------------------------------------------------------------------ */

/** The payload keys the archived form posted, with a value-bar width each. */
const FIELDS: { key: string; w: number }[] = [
  { key: "email", w: 0.62 },
  { key: "first_name", w: 0.4 },
  { key: "last_name", w: 0.48 },
  { key: "country", w: 0.34 },
  { key: "phone", w: 0.44 },
  { key: "attendance_mode", w: 0.3 },
];

/** Cycle phases at which the service's answer lands on each state. */
const STATE_AT = [0.36, 0.41, 0.46, 0.51];

const INS_UI = {
  es: {
    headLeft: "inscripción · ada13.tech",
    headRight: "4 estados · un correo por estado",
    form: "formulario",
    post: "POST /inscribe",
    packet: "{ … }",
    express: "Express",
    host: "utils.ada13.tech",
    states: [
      ["1", "pre-inscripto"],
      ["2", "lista de espera"],
      ["3", "anotado"],
      ["4", "formulario cerrado"],
    ],
    message: "Te hemos enviado todos los detalles al mail",
    mail: "EnvialoSimple",
    mailSub: "correo transaccional",
    sent: "ENVIADO",
    mailsLabel: "correos",
    directus: "Directus",
    directusSub: "backend.ada13.tech",
    countries: "GET /items/countries",
    alt: "Gráfico en movimiento: el formulario de inscripción manda un JSON por POST a un servicio Express, que responde uno de cuatro estados, pre-inscripto, lista de espera, anotado o formulario cerrado, y cada estado dispara un correo por EnvialoSimple; a un costado, Directus alimenta la lista de países del formulario",
  },
  en: {
    headLeft: "registration · ada13.tech",
    headRight: "4 states · one e-mail per state",
    form: "form",
    post: "POST /inscribe",
    packet: "{ … }",
    express: "Express",
    host: "utils.ada13.tech",
    states: [
      ["1", "pre-registered"],
      ["2", "waiting list"],
      ["3", "registered"],
      ["4", "form closed"],
    ],
    message: "We have sent all the details to your e-mail",
    mail: "EnvialoSimple",
    mailSub: "transactional e-mail",
    sent: "SENT",
    mailsLabel: "e-mails",
    directus: "Directus",
    directusSub: "backend.ada13.tech",
    countries: "GET /items/countries",
    alt: "Motion graphic: the registration form posts a JSON payload to an Express service, which answers one of four states, pre-registered, waiting list, registered or form closed, and every state triggers an e-mail through EnvialoSimple; to the side, Directus feeds the form's country list",
  },
} as const;

export function InscribeStates({ lang }: { lang: Lang }) {
  const ui = INS_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);

  const write = useCallback((n: number) => setText(count.current, String(n)), []);
  const frame = useCallback(
    (phase: number) => {
      // Fades with everything else at the end of the pass, so the figure
      // simply holds until the restart.
      write(STATE_AT.filter((at) => phase >= at).length);
    },
    [write]
  );
  const idle = useCallback(() => write(0), [write]);
  const final = useCallback(() => write(STATE_AT.length), [write]);

  useCycle(root, { frame, idle, final });

  return (
    <div ref={root} className="mg-ada" role="img" aria-label={ui.alt}>
      <div className="mg-ada-ins" aria-hidden="true">
        <div className="mg-ada-ins__head mg-ada-rise mg-run">
          <span className="mg-ada-label">{ui.headLeft}</span>
          <span className="mg-ada-label">{ui.headRight}</span>
        </div>

        <div className="mg-ada-ins__flow">
          <div className="mg-ada-ins__form mg-ada-box">
            <span className="mg-ada-label">{ui.form}</span>
            {FIELDS.map((field) => (
              <span key={field.key} className="mg-ada-ins__field">
                <span className="mg-ada-ins__key">{field.key}</span>
                <i className="mg-ada-ins__fill" style={{ ["--w" as string]: field.w }} />
              </span>
            ))}
          </div>

          <div className="mg-ada-ins__link mg-ada-ins__link--post">
            <i className="mg-ada-ins__wire" />
            <span className="mg-ada-ins__pill">{ui.post}</span>
            <span className="mg-ada-ins__packet">{ui.packet}</span>
          </div>

          <div className="mg-ada-ins__node mg-ada-ins__express mg-ada-box">
            <span className="mg-ada-ins__name">{ui.express}</span>
            <span className="mg-ada-label">{ui.host}</span>
          </div>

          <div className="mg-ada-ins__link mg-ada-ins__link--state">
            <i className="mg-ada-ins__wire" />
          </div>

          <div className="mg-ada-ins__states">
            {ui.states.map(([n, label]) => (
              <span key={n} className="mg-ada-ins__state mg-ada-box">
                <span className="mg-ada-ins__n">{n}</span>
                <span className="mg-ada-ins__state-label">{label}</span>
              </span>
            ))}
            <i className="mg-ada-ins__cursor" />
            <span className="mg-ada-ins__message">{ui.message}</span>
          </div>

          <div className="mg-ada-ins__link mg-ada-ins__link--mail">
            <i className="mg-ada-ins__wire" />
          </div>

          <div className="mg-ada-ins__node mg-ada-ins__mail mg-ada-box">
            <span className="mg-ada-ins__name">{ui.mail}</span>
            <span className="mg-ada-label">{ui.mailSub}</span>
            <span className="mg-ada-ins__count">
              <span ref={count}>0</span>
              <span className="mg-ada-label">{ui.mailsLabel}</span>
            </span>
            <span className="mg-ada-ins__stamp">{ui.sent}</span>
          </div>

          <div className="mg-ada-ins__node mg-ada-ins__directus mg-ada-box">
            <i className="mg-ada-ins__riser" />
            <span className="mg-ada-ins__pill mg-ada-ins__pill--countries">{ui.countries}</span>
            <span className="mg-ada-ins__name">{ui.directus}</span>
            <span className="mg-ada-label">{ui.directusSub}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* IncidentLedger                                                      */
/* ------------------------------------------------------------------ */

/** Cycle phases at which each row flips to closed (the sweep passes it). */
const CLOSE_AT = [0.42, 0.47, 0.52, 0.57, 0.62, 0.67];

const LEDGER_UI = {
  es: {
    headLeft: "soporte correctivo · seguimiento de incidencias",
    headRight: "2023 → 2024",
    columns: ["id", "área", "estado"],
    rows: ["inscripciones", "correos", "países (Directus)", "agenda", "front-end", "edición 2024"],
    open: "abierta",
    closed: "cerrada",
    tally: "incidencias cerradas",
    of: "de 6 · esquema",
    alt: "Gráfico en movimiento, esquemático: una tabla monoespaciada de incidencias se escribe línea por línea, con las áreas de la plataforma, y cada fila pasa de abierta a cerrada cuando una línea la recorre, mientras un contador suma las cerradas",
  },
  en: {
    headLeft: "corrective support · incident follow-up",
    headRight: "2023 → 2024",
    columns: ["id", "area", "status"],
    rows: ["registrations", "e-mail", "countries (Directus)", "schedule", "front end", "2024 edition"],
    open: "open",
    closed: "closed",
    tally: "incidents closed",
    of: "of 6 · schematic",
    alt: "Motion graphic, schematic: a monospaced table of incidents types itself in line by line, one per area of the platform, and each row flips from open to closed as a rule sweeps past it, while a tally counts the closed ones",
  },
} as const;

export function IncidentLedger({ lang }: { lang: Lang }) {
  const ui = LEDGER_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const tally = useRef<HTMLSpanElement>(null);

  const write = useCallback((n: number) => setText(tally.current, String(n)), []);
  const frame = useCallback((phase: number) => write(CLOSE_AT.filter((at) => phase >= at).length), [write]);
  const idle = useCallback(() => write(0), [write]);
  const final = useCallback(() => write(CLOSE_AT.length), [write]);

  useCycle(root, { frame, idle, final });

  return (
    <div ref={root} className="mg-ada" role="img" aria-label={ui.alt}>
      <div className="mg-ada-ledger" aria-hidden="true">
        <div className="mg-ada-ledger__head mg-ada-rise mg-run">
          <span className="mg-ada-label">{ui.headLeft}</span>
          <span className="mg-ada-label">{ui.headRight}</span>
        </div>

        <div className="mg-ada-ledger__table mg-ada-rise mg-run">
          <div className="mg-ada-ledger__row mg-ada-ledger__row--head">
            {ui.columns.map((column) => (
              <span key={column}>{column}</span>
            ))}
          </div>
          <div className="mg-ada-ledger__body">
            {ui.rows.map((area, i) => (
              <div key={area} className="mg-ada-ledger__row mg-ada-ledger__row--item">
                <span className="mg-ada-ledger__id">#{String(i + 1).padStart(2, "0")}</span>
                <span className="mg-ada-ledger__area">{area}</span>
                <span className="mg-ada-ledger__status" style={{ ["--i" as string]: i }}>
                  <span className="mg-ada-ledger__open">{ui.open}</span>
                  <span className="mg-ada-ledger__closed">{ui.closed}</span>
                </span>
              </div>
            ))}
            <i className="mg-ada-ledger__sweep" />
          </div>
        </div>

        <div className="mg-ada-ledger__tally mg-ada-rise mg-run">
          <span ref={tally} className="mg-ada-ledger__count">
            0
          </span>
          <span className="mg-ada-ledger__count-label mg-ada-label">{ui.tally}</span>
          <span className="mg-ada-label">{ui.of}</span>
        </div>
      </div>
    </div>
  );
}
