"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import type { Lang } from "@/lib/i18n";
import "./donweb-talleres.css";

/**
 * Live components of the DonWeb Cloud workshops showcase (/work/donweb-talleres):
 *
 *   CertTilt      the product's certificate hero re-created: the certificate
 *                 tilts after the pointer, the siblings swap it, the CTAs are
 *                 real (download the shown certificate, copy a verification
 *                 link).
 *   LegacyUrl     motion graphic: a 2023 URL with the person's e-mail becomes
 *                 the 2026 /cloud/certificado/{uuid} with a 307, while the
 *                 migration counters count up.
 *   FourServices  motion graphic: an immutable SHA promoted through
 *                 CI → GHCR → prod, then the previous one re-promoted.
 *
 * The motion is CSS (scenes/mg/donweb-talleres.css) keyed on the stage's
 * data-playing / data-reduced attributes; JS only writes text that CSS
 * cannot (counter and timer digits) and the pointer-driven tilt transform.
 * Each component renders `.mg-tal` (the container-query root that fills the
 * stage) with one layout child, because an element cannot answer a
 * container query about itself.
 */

const ROOT = "/work/donweb-talleres";

/** Mirrors --mg-cycle in the CSS: the loop both narratives share. */
const CYCLE_MS = 12000;

/* ------------------------------------------------------------------ */
/* Stage playback                                                      */
/* ------------------------------------------------------------------ */

type Playback = {
  onPlay: () => void;
  onStop: () => void;
  onReduced: () => void;
};

/**
 * Follows the closest `.mg-stage` attributes so a component can start and
 * stop its own ticks in step with the CSS keyframes: `onPlay` when
 * data-playing appears, `onStop` when it goes (and once on mount, so the
 * idle frame is the start frame), `onReduced` under reduced motion.
 */
function useStagePlayback(ref: RefObject<HTMLElement>, { onPlay, onStop, onReduced }: Playback) {
  useEffect(() => {
    const stage = ref.current?.closest<HTMLElement>(".mg-stage");
    if (!stage) return;

    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let playing = false;

    const sync = () => {
      if (stage.dataset.reduced || reducedQuery.matches) {
        playing = false;
        onReduced();
        return;
      }
      const now = Boolean(stage.dataset.playing);
      if (now === playing) return;
      playing = now;
      if (now) onPlay();
      else onStop();
    };

    onStop();
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(stage, { attributes: true, attributeFilter: ["data-playing", "data-reduced"] });
    return () => {
      observer.disconnect();
      if (playing) onStop();
    };
  }, [ref, onPlay, onStop, onReduced]);
}

function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

const LOCALE: Record<Lang, string> = { es: "es-AR", en: "en-US" };

/* ------------------------------------------------------------------ */
/* CertTilt                                                            */
/* ------------------------------------------------------------------ */

/** Degrees of tilt at the stage's edge, either axis. */
const MAX_TILT = 10;

/** Diego's own certificate page: the real verification link the product hands out. */
const VERIFY_URL = "https://certificados.donweb.com/cloud/certificado/18a94203-a9f5-4127-8b5f-e6a6d133af7f";

/** The demo certificates the asset pipeline rendered, with the titles printed on them. */
const CERTS = [
  {
    name: "cert-c1",
    title: {
      es: "Creá tu propia API REST desde cero con Node.js y Express",
      en: "Build your own REST API from scratch with Node.js and Express",
    },
  },
  {
    name: "cert-c2",
    title: { es: "Autenticación y seguridad de APIs con JWT", en: "API authentication and security with JWT" },
  },
  {
    name: "cert-c3",
    title: { es: "React a prueba de balas con TypeScript", en: "Bulletproof React with TypeScript" },
  },
  {
    name: "cert-c4",
    title: { es: "Tailwind CSS: interfaces modernas y responsivas", en: "Tailwind CSS: modern, responsive interfaces" },
  },
  {
    name: "cert-c5",
    title: { es: "Docker y contenedores para desarrolladores", en: "Docker and containers for developers" },
  },
] as const;

const CERT_UI = {
  es: {
    hiBefore: "¡Felicitaciones, ",
    name: "Diego",
    punct: "!",
    hiAfter: " Acá está tu logro.",
    label: "Tu nuevo logro",
    download: "Descargar",
    copy: "Copiar link de verificación",
    copied: "Link copiado",
    others: "Tus otros certificados",
    certAlt: "Certificado de asistencia",
    pick: "Mostrar el certificado",
  },
  en: {
    hiBefore: "Congratulations, ",
    name: "Diego",
    punct: ".",
    hiAfter: " Here is your achievement.",
    label: "Your new achievement",
    download: "Download",
    copy: "Copy verification link",
    copied: "Link copied",
    others: "Your other certificates",
    certAlt: "Certificate of attendance",
    pick: "Show the certificate",
  },
} as const;

export function CertTilt({ lang }: { lang: Lang }) {
  const ui = CERT_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const glare = useRef<HTMLSpanElement>(null);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);
  const copiedTimer = useRef(0);
  const tiltEnabled = useRef(false);
  const [index, setIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // The pointer tilt is for fine pointers with motion welcome; touch keeps
    // the fixed rest tilt from the stylesheet.
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    tiltEnabled.current = fine && !reduced;
    return () => window.clearTimeout(copiedTimer.current);
  }, []);

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!tiltEnabled.current || event.pointerType !== "mouse") return;
    const el = root.current;
    const c = card.current;
    const g = glare.current;
    if (!el || !c || !g) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    // Written straight to the elements: no React state, no inherited
    // variable, one style recalc each for the card and the glare.
    c.style.transform = `rotateX(${(-y * MAX_TILT * 2).toFixed(2)}deg) rotateY(${(x * MAX_TILT * 2).toFixed(2)}deg)`;
    g.style.transform = `translate3d(${(x * 50).toFixed(1)}%, ${(y * 50).toFixed(1)}%, 0)`;
    g.style.opacity = "1";
  };

  const onPointerLeave = () => {
    const c = card.current;
    const g = glare.current;
    if (c) c.style.transform = "";
    if (g) {
      g.style.transform = "";
      g.style.opacity = "";
    }
  };

  const pick = (next: number, focus = false) => {
    const wrapped = (next + CERTS.length) % CERTS.length;
    setIndex(wrapped);
    if (focus) chips.current[wrapped]?.focus();
  };

  const onChipsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "ArrowDown") pick(index + 1, true);
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") pick(index - 1, true);
    else if (event.key === "Home") pick(0, true);
    else if (event.key === "End") pick(CERTS.length - 1, true);
    else return;
    event.preventDefault();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(VERIFY_URL);
      setCopied(true);
      window.clearTimeout(copiedTimer.current);
      copiedTimer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard refused (permissions, insecure context): nothing to undo.
    }
  };

  const current = CERTS[index];

  return (
    <div ref={root} className="mg-tal" onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      <div className="mg-tal-cert">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="mg-tal-cert__trama mg-tal-cert__trama--l"
          src={`${ROOT}/trama-left.webp`}
          alt=""
          width={509}
          height={729}
          decoding="async"
          loading="lazy"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="mg-tal-cert__trama mg-tal-cert__trama--r"
          src={`${ROOT}/trama-right.webp`}
          alt=""
          width={446}
          height={686}
          decoding="async"
          loading="lazy"
        />

        <div className="mg-tal-cert__copy">
          <p className="mg-tal-cert__hi">
            {ui.hiBefore}
            <span className="mg-tal-cert__who">
              <mark className="mg-tal-cert__mark">{ui.name}</mark>
              {ui.punct}
            </span>
            {ui.hiAfter}
          </p>
          <span className="mg-tal-label">{ui.label}</span>
          <p className="mg-tal-cert__title" aria-live="polite">
            {current.title[lang]}
          </p>
          <div className="mg-tal-cert__actions">
            <a className="mg-tal-cert__cta" href={`${ROOT}/${current.name}.webp`} download={`${current.name}.webp`}>
              {ui.download}
            </a>
            <button type="button" className="mg-tal-cert__ghost" onClick={copyLink} aria-live="polite">
              {copied ? ui.copied : ui.copy}
            </button>
          </div>
        </div>

        <div className="mg-tal-cert__scene">
          <div className="mg-tal-cert__float mg-run">
            <div ref={card} className="mg-tal-cert__card">
              <span className="mg-tal-cert__fold" aria-hidden="true" />
              <div className="mg-tal-cert__paper">
                {CERTS.map((cert, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={cert.name}
                    className="mg-tal-cert__img"
                    data-active={i === index ? "" : undefined}
                    src={`${ROOT}/${cert.name}.webp`}
                    alt={i === index ? `${ui.certAlt}: ${cert.title[lang]}` : ""}
                    width={760}
                    height={537}
                    decoding="async"
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                ))}
              </div>
              <span ref={glare} className="mg-tal-cert__glare" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="mg-tal-cert__chips" role="group" aria-label={ui.others} onKeyDown={onChipsKeyDown}>
          <span className="mg-tal-label">{ui.others}</span>
          {CERTS.map((cert, i) => (
            <button
              key={cert.name}
              ref={(el) => {
                chips.current[i] = el;
              }}
              type="button"
              className="mg-tal-cert__chip"
              aria-pressed={i === index}
              aria-label={`${ui.pick}: ${cert.title[lang]}`}
              tabIndex={i === index ? 0 : -1}
              onClick={() => pick(i)}
              onFocus={() => pick(i)}
              onPointerEnter={(event) => {
                if (event.pointerType === "mouse") pick(i);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ROOT}/${cert.name}.webp`} alt="" width={760} height={537} decoding="async" loading="lazy" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* LegacyUrl                                                           */
/* ------------------------------------------------------------------ */

const LEGACY_UI = {
  es: {
    before: "URL histórica, 2023",
    after: "URL actual, 2026",
    route: ["Caddy", "Next rewrite", "resolver", "307"],
    counters: [
      { value: 121087, label: "inscripciones migradas" },
      { value: 205, label: "programas" },
      { value: 0, label: "registros perdidos" },
    ],
    gb: "43 GB",
    gbLabel: "de PDFs en disco",
    pdf: "PDF bajo demanda",
    pdfLabel: "compuesto al pedirlo",
    alt: "Una URL de 2023 con el mail de la persona se convierte en la URL de 2026 con uuid, con una respuesta 307",
  },
  en: {
    before: "Legacy URL, 2023",
    after: "Current URL, 2026",
    route: ["Caddy", "Next rewrite", "resolver", "307"],
    counters: [
      { value: 121087, label: "registrations migrated" },
      { value: 205, label: "programs" },
      { value: 0, label: "records lost" },
    ],
    gb: "43 GB",
    gbLabel: "of PDFs on disk",
    pdf: "PDF on demand",
    pdfLabel: "composed when requested",
    alt: "A 2023 URL carrying the person's e-mail becomes the 2026 uuid URL, answered with a 307",
  },
} as const;

/** The counters start this long after the stage starts playing and take this long. */
const COUNT_DELAY_MS = 500;
const COUNT_DURATION_MS = 1800;

export function LegacyUrl({ lang }: { lang: Lang }) {
  const ui = LEGACY_UI[lang];
  const locale = LOCALE[lang];
  const root = useRef<HTMLDivElement>(null);
  const values = useRef<(HTMLElement | null)[]>([]);
  const raf = useRef(0);

  const write = useCallback(
    (progress: number) => {
      ui.counters.forEach((counter, i) => {
        const el = values.current[i];
        if (el) el.textContent = Math.round(counter.value * progress).toLocaleString(locale);
      });
    },
    [ui, locale]
  );

  const onPlay = useCallback(() => {
    const start = performance.now() + COUNT_DELAY_MS;
    const frame = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / COUNT_DURATION_MS));
      write(easeOutExpo(t));
      raf.current = t < 1 ? requestAnimationFrame(frame) : 0;
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(frame);
  }, [write]);

  const onStop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    write(0);
  }, [write]);

  const onReduced = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    write(1);
  }, [write]);

  useStagePlayback(root, { onPlay, onStop, onReduced });

  return (
    <div ref={root} className="mg-tal" role="img" aria-label={ui.alt}>
      <div className="mg-tal-legacy">
        <div className="mg-tal-legacy__head" aria-hidden="true">
          <div className="mg-tal-legacy__phase">
            <span className="mg-tal-label mg-tal-legacy__phase-a">{ui.before}</span>
            <span className="mg-tal-label mg-tal-legacy__phase-b">{ui.after}</span>
          </div>
          <span className="mg-tal-label">certificados.donweb.com</span>
        </div>

        <div className="mg-tal-legacy__main" aria-hidden="true">
          <div className="mg-tal-legacy__box mg-tal-box">
            <span className="mg-tal-legacy__badge">307</span>
            <div className="mg-tal-legacy__lines">
              <span className="mg-tal-legacy__line mg-tal-legacy__old">
                <span className="mg-tal-legacy__typed">
                  /72/
                  <span className="mg-tal-legacy__email">
                    72_persona@mail.com
                    <i className="mg-tal-legacy__strike" />
                  </span>
                </span>
                <i className="mg-tal-legacy__caret" />
              </span>
              <span className="mg-tal-legacy__line mg-tal-legacy__new">
                /cloud/certificado/<span className="mg-tal-legacy__uuid">4f0c…</span>
              </span>
            </div>
          </div>

          <ol className="mg-tal-legacy__route">
            {ui.route.map((step, i) => (
              <li key={step} style={{ display: "contents" }}>
                {i > 0 ? <i className="mg-tal-legacy__link" style={{ ["--i" as string]: i - 1 }} /> : null}
                <span className="mg-tal-legacy__step" style={{ ["--i" as string]: i }}>
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <dl className="mg-tal-legacy__foot" aria-hidden="true">
          {ui.counters.map((counter, i) => (
            <div key={counter.label} className="mg-tal-legacy__count">
              <dt
                className="mg-tal-legacy__value"
                ref={(el) => {
                  values.current[i] = el;
                }}
              >
                {counter.value.toLocaleString(locale)}
              </dt>
              <dd className="mg-tal-label">{counter.label}</dd>
            </div>
          ))}
          <div className="mg-tal-legacy__storage">
            <div className="mg-tal-legacy__gb">
              <dt className="mg-tal-legacy__value">{ui.gb}</dt>
              <dd className="mg-tal-label">{ui.gbLabel}</dd>
            </div>
            <div className="mg-tal-legacy__pdf">
              <dt className="mg-tal-legacy__value">{ui.pdf}</dt>
              <dd className="mg-tal-label">{ui.pdfLabel}</dd>
            </div>
          </div>
        </dl>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* FourServices                                                        */
/* ------------------------------------------------------------------ */

const FOUR_UI = {
  es: {
    ci: "CI",
    tests: "2.180 tests",
    ok: "ok",
    ghcr: "GHCR",
    image: "imagen",
    prod: "prod",
    rollback: "rollback",
    services: [
      { name: "api", stack: "Node 22 · Fastify" },
      { name: "web", stack: "Next 15" },
      { name: "panel", stack: "Next 16" },
      { name: "infra", stack: "Compose · Caddy" },
    ],
    footLeft: "promoción de SHA inmutable",
    footRight: "merge → producción: ~3 min",
    alt: "Los cuatro servicios y un SHA inmutable que viaja de CI a GHCR y a producción en tres minutos, con un rollback de un paso",
  },
  en: {
    ci: "CI",
    tests: "2,180 tests",
    ok: "ok",
    ghcr: "GHCR",
    image: "image",
    prod: "prod",
    rollback: "rollback",
    services: [
      { name: "api", stack: "Node 22 · Fastify" },
      { name: "web", stack: "Next 15" },
      { name: "panel", stack: "Next 16" },
      { name: "infra", stack: "Compose · Caddy" },
    ],
    footLeft: "immutable SHA promotion",
    footRight: "merge → production: ~3 min",
    alt: "The four services and an immutable SHA travelling from CI to GHCR to production in three minutes, with a one-step rollback",
  },
} as const;

const SHA_NEW = "a1f3c9e";
const SHA_PREV = "9e2b71d";

/** Where in the cycle the timer counts (mirrors the tag's travel in the CSS). */
const TIMER_FROM = 0.08;
const TIMER_TO = 0.4;
const TIMER_RESET = 0.92;
const TIMER_SECONDS = 180;

function clock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function FourServices({ lang }: { lang: Lang }) {
  const ui = FOUR_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const timer = useRef<HTMLSpanElement>(null);
  const raf = useRef(0);

  const onPlay = useCallback(() => {
    const start = performance.now();
    const frame = (now: number) => {
      const phase = ((now - start) % CYCLE_MS) / CYCLE_MS;
      let seconds = TIMER_SECONDS;
      if (phase >= TIMER_FROM && phase < TIMER_TO) {
        seconds = Math.round(TIMER_SECONDS * (1 - (phase - TIMER_FROM) / (TIMER_TO - TIMER_FROM)));
      } else if (phase >= TIMER_TO && phase < TIMER_RESET) {
        seconds = 0;
      }
      const el = timer.current;
      const text = clock(seconds);
      if (el && el.textContent !== text) el.textContent = text;
      raf.current = requestAnimationFrame(frame);
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(frame);
  }, []);

  const onStop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (timer.current) timer.current.textContent = clock(TIMER_SECONDS);
  }, []);

  const onReduced = useCallback(() => {
    cancelAnimationFrame(raf.current);
    raf.current = 0;
    if (timer.current) timer.current.textContent = clock(0);
  }, []);

  useStagePlayback(root, { onPlay, onStop, onReduced });

  return (
    <div ref={root} className="mg-tal" role="img" aria-label={ui.alt}>
      <div className="mg-tal-four">
        <div className="mg-tal-four__pipe" aria-hidden="true">
          <i className="mg-tal-four__track" />
          <div className="mg-tal-four__node" style={{ ["--i" as string]: 0 }}>
            <div className="mg-tal-four__node-box mg-tal-box">
              <span className="mg-tal-label">{ui.ci}</span>
              <span className="mg-tal-four__sub mg-tal-four__sub--quiet">
                {ui.tests} <span className="mg-tal-four__ok">· {ui.ok}</span>
              </span>
            </div>
          </div>
          <div className="mg-tal-four__node" style={{ ["--i" as string]: 1 }}>
            <div className="mg-tal-four__node-box mg-tal-box">
              <span className="mg-tal-label">{ui.ghcr}</span>
              <span className="mg-tal-four__sub mg-tal-four__sub--quiet">{ui.image}</span>
            </div>
          </div>
          <div className="mg-tal-four__node" style={{ ["--i" as string]: 2 }}>
            <div className="mg-tal-four__node-box mg-tal-box">
              <span className="mg-tal-label">{ui.prod}</span>
              <span className="mg-tal-four__sub">
                <span ref={timer} className="mg-tal-four__timer">
                  {clock(TIMER_SECONDS)}
                </span>
              </span>
            </div>
          </div>
          <span className="mg-tal-four__tag mg-tal-four__tag--sha">sha {SHA_NEW}</span>
          <span className="mg-tal-four__tag mg-tal-four__tag--prev">sha {SHA_PREV}</span>
          <span className="mg-tal-four__rollback">← {ui.rollback}</span>
          {/* Deploy fan-out: prod → down → along the bus → into each service. */}
          <i className="mg-tal-four__drop" />
          <i className="mg-tal-four__bus" />
          {ui.services.map((service, n) => (
            <i key={service.name} className="mg-tal-four__stub" style={{ ["--n" as string]: n }} />
          ))}
        </div>

        <div className="mg-tal-four__services" aria-hidden="true">
          {ui.services.map((service, i) => (
            <div key={service.name} className="mg-tal-four__svc mg-tal-box" style={{ ["--i" as string]: i + 3 }}>
              <span className="mg-tal-four__svc-name">{service.name}</span>
              <span className="mg-tal-four__svc-stack">{service.stack}</span>
              <span className="mg-tal-four__ver">
                <span className="mg-tal-four__ver-old">{SHA_PREV}</span>
                <span className="mg-tal-four__ver-new">{SHA_NEW}</span>
              </span>
            </div>
          ))}
        </div>

        <div className="mg-tal-four__foot" aria-hidden="true">
          <span className="mg-tal-label">{ui.footLeft}</span>
          <span className="mg-tal-label">{ui.footRight}</span>
        </div>
      </div>
    </div>
  );
}
