"use client";

import { useCallback, useRef, type CSSProperties, type RefObject } from "react";
import type { Lang } from "@/lib/i18n";
import { useStagePlayback } from "./use-stage-playback";
import "./donweb-contenidos.css";

/**
 * Live components of the DonWeb Cloud content showcase (/work/donweb-contenidos):
 *
 *   ContentPipeline  motion graphic: three boxes, GHOST (Admin API: posts,
 *                    tags, authors), THEME (Handlebars, rendered on the
 *                    server by tag and author) and DASHBOARD (Next.js:
 *                    /api/series, /api/hub-pages, /api/home-carousels,
 *                    /api/roadmap), joined by rules that light up as a `post`
 *                    token travels Ghost → theme and three `json` tokens
 *                    travel dashboard → theme. Inside the theme box a page
 *                    assembles piece by piece (the hero slide, the
 *                    "Episodio 5 de 5" series bar, a hub's sections, the
 *                    front-page carousels) while four counters tick to
 *                    257 posts · 268 tags · 603 URLs · 100 % HTTP 200.
 *   HexLattice       motion graphic: the hero slider reproduced without an
 *                    image. The brand's hexagon lattice draws itself with
 *                    stroke-dashoffset over the product's own navy gradient
 *                    (the geometry is generated in code below, never drawn
 *                    by hand), while three real slide titles type themselves
 *                    in turn and the green "Ir al destacado" pill rises under
 *                    each one.
 *   VideoWall        motion graphic: the 18 YouTube thumbnails of Diego's
 *                    DonWeb Cloud videos enter as a staggered grid in a mixed
 *                    order, then sort themselves into three labelled rows,
 *                    SHORTS · SERIES · VIDEOS, each tile carrying the
 *                    internal tag the theme reads (#short, #serie-item,
 *                    #video); the counters tick to the site's tag counts.
 *
 * The motion is CSS (scenes/mg/donweb-contenidos.css) keyed on the stage's
 * data-playing / data-reduced attributes; JS only writes what CSS cannot
 * (the typed titles and the counters) on a rAF clock that runs while the
 * stage plays and reads the same cycle as the keyframes. Each component
 * renders `.mg-dwc` (the container-query root that fills the stage) with one
 * layout child, because an element cannot answer a container query about
 * itself.
 *
 * Every figure shown has evidence: the SEO baseline of 2026-10-03 (257
 * posts, 268 tags, 603 URLs all answering 200; tags.csv: #short 17,
 * #serie-item 15, #video 19, so 4 standalone videos and 36 embeds) and the
 * theme and dashboard repositories (13 custom templates, 24 JS modules, 10
 * dashboard modules, 13 public endpoints). The slide titles are the ones the
 * live slider and the theme's own hero slides carry.
 */

const ROOT = "/work/donweb-contenidos";
const CARET = "▍";

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

/** Custom properties as an inline style, the way the atmosphere scope sets its tokens. */
function cssVars(vars: Record<string, number | string>): CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, value] of Object.entries(vars)) style[`--${key}`] = String(value);
  return style as CSSProperties;
}

type Clock = {
  /** Called every animation frame while playing: the phase in [0, 1) of a loop, or progress in [0, 1] of a run. */
  frame: (t: number) => void;
  /** The resting frame, written off screen and on mount. */
  idle: () => void;
  /** The final frame, written under reduced motion. */
  final: () => void;
};

/**
 * Drives a component's text in step with the CSS narrative. With `loop` the
 * clock repeats every `durationMs` (the pipeline and the slider, which
 * mirror an infinite keyframe); without it the clock runs once to 1 and
 * stops (the wall, whose keyframes play once per entry). The phase is
 * measured from the moment the stage started playing, which is also the
 * moment the keyframes declared under `[data-playing]` restart.
 */
function useStageClock(root: RefObject<HTMLElement>, durationMs: number, loop: boolean, { frame, idle, final }: Clock) {
  const raf = useRef(0);

  const onPlay = useCallback(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      if (loop) {
        frame((elapsed % durationMs) / durationMs);
        raf.current = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(1, elapsed / durationMs);
      frame(t);
      raf.current = t < 1 ? requestAnimationFrame(tick) : 0;
    };
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(tick);
  }, [frame, durationMs, loop]);

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
/* ContentPipeline                                                     */
/* ------------------------------------------------------------------ */

/** Mirrors --mg-cycle in the CSS: the loop the pipeline and the slider share. */
const CYCLE_MS = 12000;
/** The four counters: posts, tags, sitemap URLs, share of URLs answering 200. */
const PIPE_COUNTERS = [257, 268, 603, 100] as const;
/** Where in the cycle the counters tick (JS), each starting a little after the last. */
const PIPE_COUNT_FROM = 0.1;
const PIPE_COUNT_SPAN = 0.28;
const PIPE_COUNT_STAGGER = 0.04;

const PIPE_UI = {
  es: {
    headLeft: "flujo editorial · ghost → theme ← dashboard",
    headRight: "render en el servidor · json en el cliente",
    ghost: "Ghost",
    ghostSub: "Admin API · 5.130",
    ghostItems: ["posts", "tags", "autores"],
    theme: "Theme",
    themeSub: "Handlebars · SSR por tag y autor",
    dashboard: "Dashboard",
    dashboardSub: "Next.js · PostgreSQL",
    endpoints: ["/api/series", "/api/hub-pages", "/api/home-carousels", "/api/roadmap"],
    post: "post",
    json: "json",
    page: "cloud.donweb.com",
    bar: "Episodio 5 de 5",
    hub: "hub · tag + #video",
    carousel: "carruseles de portada",
    counters: ["posts", "tags", "URLs", "HTTP 200"],
    alt: "Gráfico en movimiento: tres cajas, Ghost con su Admin API de posts, tags y autores, el theme en Handlebars que renderiza por tag y autor, y el dashboard en Next.js con sus endpoints /api/series, /api/hub-pages, /api/home-carousels y /api/roadmap; una ficha post viaja de Ghost al theme y tres fichas json viajan del dashboard al theme mientras dentro del theme se arma una página, el slide de portada, la barra Episodio 5 de 5, las secciones de un hub y los carruseles; abajo cuatro contadores suben a 257 posts, 268 tags, 603 URLs y 100 % con respuesta 200",
  },
  en: {
    headLeft: "editorial flow · ghost → theme ← dashboard",
    headRight: "rendered on the server · json on the client",
    ghost: "Ghost",
    ghostSub: "Admin API · 5.130",
    ghostItems: ["posts", "tags", "authors"],
    theme: "Theme",
    themeSub: "Handlebars · SSR by tag and author",
    dashboard: "Dashboard",
    dashboardSub: "Next.js · PostgreSQL",
    endpoints: ["/api/series", "/api/hub-pages", "/api/home-carousels", "/api/roadmap"],
    post: "post",
    json: "json",
    page: "cloud.donweb.com",
    bar: "Episode 5 of 5",
    hub: "hub · tag + #video",
    carousel: "front-page carousels",
    counters: ["posts", "tags", "URLs", "HTTP 200"],
    alt: "Motion graphic: three boxes, Ghost with its Admin API of posts, tags and authors, the Handlebars theme that renders by tag and author, and the Next.js dashboard with its /api/series, /api/hub-pages, /api/home-carousels and /api/roadmap endpoints; a post token travels from Ghost to the theme and three json tokens travel from the dashboard to the theme while a page assembles inside the theme, the hero slide, the Episode 5 of 5 bar, a hub's sections and the carousels; below, four counters climb to 257 posts, 268 tags, 603 URLs and 100 % answering 200",
  },
} as const;

export function ContentPipeline({ lang }: { lang: Lang }) {
  const ui = PIPE_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const counters = useRef<(HTMLSpanElement | null)[]>([]);

  const write = useCallback((progress: number[]) => {
    PIPE_COUNTERS.forEach((target, i) => {
      const value = Math.round(target * progress[i]);
      setText(counters.current[i], i === 3 ? `${value} %` : String(value));
    });
  }, []);

  const frame = useCallback(
    (phase: number) => {
      write(
        PIPE_COUNTERS.map((_, i) => {
          const from = PIPE_COUNT_FROM + i * PIPE_COUNT_STAGGER;
          return easeOutQuart(clamp01((phase - from) / PIPE_COUNT_SPAN));
        })
      );
    },
    [write]
  );
  const idle = useCallback(() => write([0, 0, 0, 0]), [write]);
  const final = useCallback(() => write([1, 1, 1, 1]), [write]);

  useStageClock(root, CYCLE_MS, true, { frame, idle, final });

  return (
    <div ref={root} className="mg-dwc" role="img" aria-label={ui.alt}>
      <div className="mg-dwc-pipe" aria-hidden="true">
        <div className="mg-dwc-pipe__head mg-dwc-rise mg-run">
          <span className="mg-dwc-label">{ui.headLeft}</span>
          <span className="mg-dwc-label">{ui.headRight}</span>
        </div>

        {/* Ghost: the editorial source. Its `posts` row lights up right
            before the post token leaves. */}
        <div className="mg-dwc-pipe__ghost mg-dwc-box mg-dwc-rise mg-run">
          <span className="mg-dwc-name">{ui.ghost}</span>
          <span className="mg-dwc-label">{ui.ghostSub}</span>
          <ul className="mg-dwc-pipe__items">
            {ui.ghostItems.map((item, i) => (
              <li key={item} className="mg-dwc-pipe__item" data-i={i}>
                <i className="mg-dwc-pipe__dot" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Each wire is its own container so the token can travel the wire's
            width (or height, stacked) in container units. */}
        <div className="mg-dwc-pipe__wire mg-dwc-pipe__wire--post">
          <i className="mg-dwc-pipe__hair" />
          <i className="mg-dwc-pipe__fill" />
          <span className="mg-dwc-pipe__packet">{ui.post}</span>
        </div>

        {/* The theme: where the page assembles. Every piece below is a type
            or rule placeholder that snaps in when its data arrives. */}
        <div className="mg-dwc-pipe__theme mg-dwc-box mg-dwc-rise mg-run">
          <span className="mg-dwc-name">{ui.theme}</span>
          <span className="mg-dwc-label">{ui.themeSub}</span>
          <div className="mg-dwc-pipe__page">
            <span className="mg-dwc-label mg-dwc-pipe__page-url">{ui.page}</span>
            {/* The hero slide: the product's blue, flat (the gradient is
                quoted in the lattice stage only), two title rules, the pill. */}
            <div className="mg-dwc-pipe__slide">
              <i className="mg-dwc-pipe__slide-line" />
              <i className="mg-dwc-pipe__slide-line mg-dwc-pipe__slide-line--short" />
              <i className="mg-dwc-pipe__slide-pill" />
            </div>
            <div className="mg-dwc-pipe__bar">
              <span className="mg-dwc-pipe__arrow">{"‹"}</span>
              <span className="mg-dwc-pipe__bar-text">{ui.bar}</span>
              <span className="mg-dwc-pipe__arrow">{"›"}</span>
            </div>
            <div className="mg-dwc-pipe__hub">
              <span className="mg-dwc-label mg-dwc-pipe__hub-label">{ui.hub}</span>
              <div className="mg-dwc-pipe__tiles">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="mg-dwc-pipe__tile" data-i={i}>
                    <i className="mg-dwc-pipe__tile-thumb" />
                    <i className="mg-dwc-pipe__tile-line" />
                  </div>
                ))}
              </div>
            </div>
            <div className="mg-dwc-pipe__carousel">
              <span className="mg-dwc-label mg-dwc-pipe__carousel-label">{ui.carousel}</span>
              <div className="mg-dwc-pipe__cards">
                {[0, 1, 2, 3].map((i) => (
                  <i key={i} className="mg-dwc-pipe__card" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mg-dwc-pipe__wire mg-dwc-pipe__wire--json">
          <i className="mg-dwc-pipe__hair" />
          <i className="mg-dwc-pipe__fill" />
          <span className="mg-dwc-pipe__packet">{`{ ${ui.json} }`}</span>
        </div>

        {/* The dashboard: the endpoints the theme consumes; each row lights
            up while its json travels. */}
        <div className="mg-dwc-pipe__dash mg-dwc-box mg-dwc-rise mg-run">
          <span className="mg-dwc-name">{ui.dashboard}</span>
          <span className="mg-dwc-label">{ui.dashboardSub}</span>
          <ul className="mg-dwc-pipe__endpoints">
            {ui.endpoints.map((endpoint, i) => (
              <li key={endpoint} className="mg-dwc-pipe__endpoint" data-i={i}>
                {endpoint}
              </li>
            ))}
          </ul>
        </div>

        <div className="mg-dwc-pipe__counters mg-dwc-rise mg-run">
          {ui.counters.map((label, i) => (
            <span key={label} className="mg-dwc-pipe__counter">
              <span
                ref={(el) => {
                  counters.current[i] = el;
                }}
                className="mg-dwc-pipe__counter-n"
              >
                {i === 3 ? "0 %" : "0"}
              </span>
              <span className="mg-dwc-label">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* HexLattice                                                          */
/* ------------------------------------------------------------------ */

/**
 * The titles the slider carries: the live one on cloud.donweb.com, then two
 * of the theme's own hero slides (slide-02 and slide-03 in the assets).
 */
const HEX_SLIDES = [
  "Instalar y configurar Medusa.JS en Ubuntu",
  "Aprende Docker en 5 minutos",
  "Cómo instalar y configurar PostgreSQL en Ubuntu",
] as const;
/** One slide per third of the cycle; within a slot the title types from 2 % to 56 %. */
const HEX_SLOT = 1 / HEX_SLIDES.length;
const HEX_TYPE_FROM = 0.02;
const HEX_TYPE_TO = 0.56;

type HexCell = { d: string; i: number };
type HexBond = { x1: number; y1: number; x2: number; y2: number; i: number };

/**
 * Deterministic noise in [0, 1) for a lattice coordinate. Server and client
 * must agree on the geometry, so no Math.random: a small integer hash.
 */
function noise(a: number, b: number, salt: number): number {
  let h = (Math.imul(a + 1, 374761393) + Math.imul(b + 1, 668265263) + Math.imul(salt, 1274126177)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h ^= h >>> 16;
  return h / 4294967296;
}

/** A flat-top hexagon of radius r centred on (x, y): vertices every 60° from 0°. */
function hexagonPath(x: number, y: number, r: number): string {
  const points: string[] = [];
  for (let k = 0; k < 6; k += 1) {
    const angle = (Math.PI / 3) * k;
    points.push(`${(x + r * Math.cos(angle)).toFixed(1)} ${(y + r * Math.sin(angle)).toFixed(1)}`);
  }
  return `M${points.join(" L")} Z`;
}

/**
 * The brand's lattice, as the slider and the tramas draw it: hexagons on a
 * triangular grid, in two sizes, joined vertex to vertex by short bonds
 * where two neighbours are both present (the vertices of a flat-top
 * hexagon point exactly along the six neighbour directions). The chance a
 * cell exists grows from about one in five at the left column to about
 * seven in ten at the right, so the lattice thins into the gradient the
 * way the slider's does instead of stopping at an edge, and reads as a
 * network rather than a tiling. Cells and bonds are numbered by their
 * diagonal position, which is the order they draw in.
 */
const HEX_VIEW = { width: 640, height: 520 };
function buildLattice(): { cells: HexCell[]; bonds: HexBond[]; count: number } {
  const spacing = 84;
  const rowHeight = (spacing * Math.sqrt(3)) / 2;
  const columns = 8;
  const rows = 8;
  const present = new Map<string, { x: number; y: number; r: number }>();

  for (let j = 0; j < rows; j += 1) {
    for (let i = 0; i < columns; i += 1) {
      if (noise(i, j, 1) >= 0.2 + (0.5 * i) / (columns - 1)) continue;
      const x = 40 + i * spacing + (j % 2 ? spacing / 2 : 0);
      const y = 12 + j * rowHeight;
      const r = noise(i, j, 2) < 0.2 ? spacing * 0.19 : spacing * 0.36;
      present.set(`${i},${j}`, { x, y, r });
    }
  }

  const entries: { x: number; y: number; make: (i: number) => HexCell | HexBond }[] = [];
  present.forEach((cell, key) => {
    const [i, j] = key.split(",").map(Number);
    entries.push({ x: cell.x, y: cell.y, make: (index) => ({ d: hexagonPath(cell.x, cell.y, cell.r), i: index }) });

    // The three forward neighbours (right, down-right, down-left) cover
    // every pair once; the row offset decides which column is below.
    const shift = j % 2;
    const neighbours: [number, number][] = [
      [i + 1, j],
      [i + shift, j + 1],
      [i - 1 + shift, j + 1],
    ];
    neighbours.forEach(([ni, nj], k) => {
      const other = present.get(`${ni},${nj}`);
      if (!other || noise(i * 7 + k, j, 3) >= 0.72) return;
      const dx = other.x - cell.x;
      const dy = other.y - cell.y;
      const length = Math.hypot(dx, dy);
      const ux = dx / length;
      const uy = dy / length;
      const bond = {
        x1: cell.x + ux * cell.r,
        y1: cell.y + uy * cell.r,
        x2: other.x - ux * other.r,
        y2: other.y - uy * other.r,
      };
      entries.push({
        x: (bond.x1 + bond.x2) / 2,
        y: (bond.y1 + bond.y2) / 2,
        make: (index) => ({ ...bond, i: index }),
      });
    });
  });

  entries.sort((a, b) => a.x + a.y - (b.x + b.y));
  const cells: HexCell[] = [];
  const bonds: HexBond[] = [];
  entries.forEach((entry, index) => {
    const shape = entry.make(index);
    if ("d" in shape) cells.push(shape);
    else bonds.push(shape);
  });
  return { cells, bonds, count: present.size };
}
const LATTICE = buildLattice();

const HEX_UI = {
  es: {
    headLeft: "portada · hero-slider.js",
    headRight: "13 plantillas · 24 módulos js",
    pill: "Ir al destacado",
    foot: `${LATTICE.count} hexágonos · svg generado en código`,
    alt: "Gráfico en movimiento: el slider de portada de cloud.donweb.com reproducido sin imagen; sobre el degradé azul del producto, una trama de hexágonos se dibuja sola trazo a trazo a la derecha, mientras a la izquierda se escriben letra por letra tres títulos de slide, Instalar y configurar Medusa.JS en Ubuntu, Aprende Docker en 5 minutos y Cómo instalar y configurar PostgreSQL en Ubuntu, y bajo cada uno sube el botón verde Ir al destacado; abajo, tres puntos marcan el slide activo",
  },
  en: {
    headLeft: "front page · hero-slider.js",
    headRight: "13 templates · 24 js modules",
    pill: "Ir al destacado",
    foot: `${LATTICE.count} hexagons · svg generated in code`,
    alt: "Motion graphic: the cloud.donweb.com hero slider reproduced without an image; over the product's blue gradient a hexagon lattice draws itself stroke by stroke on the right, while on the left three slide titles type themselves letter by letter, Instalar y configurar Medusa.JS en Ubuntu, Aprende Docker en 5 minutos and Cómo instalar y configurar PostgreSQL en Ubuntu, and under each one the green Ir al destacado button rises; below, three dots mark the active slide",
  },
} as const;

export function HexLattice({ lang }: { lang: Lang }) {
  const ui = HEX_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLSpanElement>(null);

  /** `slot` is the slide, `t` in [0, 1] how much of its title is typed. */
  const write = useCallback((slot: number, t: number) => {
    const text = HEX_SLIDES[slot];
    const n = t >= 1 ? text.length : Math.floor(t * text.length);
    setText(title.current, text.slice(0, n) + (t >= 1 ? "" : CARET));
  }, []);

  const frame = useCallback(
    (phase: number) => {
      const slot = Math.min(HEX_SLIDES.length - 1, Math.floor(phase / HEX_SLOT));
      const local = (phase - slot * HEX_SLOT) / HEX_SLOT;
      write(slot, clamp01((local - HEX_TYPE_FROM) / (HEX_TYPE_TO - HEX_TYPE_FROM)));
    },
    [write]
  );
  const idle = useCallback(() => write(0, 0), [write]);
  const final = useCallback(() => write(0, 1), [write]);

  useStageClock(root, CYCLE_MS, true, { frame, idle, final });

  return (
    <div ref={root} className="mg-dwc" role="img" aria-label={ui.alt}>
      <div className="mg-dwc-hex" aria-hidden="true">
        {/* The lattice: generated geometry only. pathLength="1" lets one
            dash length draw every cell and bond, whatever its size. */}
        <svg
          className="mg-dwc-hex__lattice"
          viewBox={`0 0 ${HEX_VIEW.width} ${HEX_VIEW.height}`}
          preserveAspectRatio="xMidYMid slice"
          focusable="false"
        >
          {LATTICE.bonds.map((bond) => (
            <line
              key={bond.i}
              className="mg-dwc-hex__cell mg-dwc-hex__bond mg-restart"
              style={cssVars({ i: bond.i })}
              x1={bond.x1.toFixed(1)}
              y1={bond.y1.toFixed(1)}
              x2={bond.x2.toFixed(1)}
              y2={bond.y2.toFixed(1)}
              pathLength={1}
            />
          ))}
          {LATTICE.cells.map((cell) => (
            <path key={cell.i} className="mg-dwc-hex__cell mg-restart" style={cssVars({ i: cell.i })} d={cell.d} pathLength={1} />
          ))}
        </svg>

        <div className="mg-dwc-hex__head mg-dwc-rise mg-run">
          <span className="mg-dwc-label">{ui.headLeft}</span>
          <span className="mg-dwc-label">{ui.headRight}</span>
        </div>

        <span className="mg-dwc-hex__arrow mg-dwc-hex__arrow--prev">{"‹"}</span>
        <span className="mg-dwc-hex__arrow mg-dwc-hex__arrow--next">{"›"}</span>

        <div className="mg-dwc-hex__copy">
          <span ref={title} className="mg-dwc-hex__title">
            {CARET}
          </span>
          {/* The product's green CTA: the page accent, as the slider draws it. */}
          <span className="mg-dwc-hex__pill">{ui.pill}</span>
        </div>

        <div className="mg-dwc-hex__foot mg-dwc-rise mg-run">
          <span className="mg-dwc-hex__dots">
            {HEX_SLIDES.map((slide, i) => (
              <i key={slide} className="mg-dwc-hex__dot" data-i={i} />
            ))}
          </span>
          <span className="mg-dwc-label">{ui.foot}</span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* VideoWall                                                           */
/* ------------------------------------------------------------------ */

type WallGroup = "short" | "serie" | "video";

/** The internal tag the theme reads for each kind of video post. */
const WALL_TAG: Record<WallGroup, string> = { short: "#short", serie: "#serie-item", video: "#video" };
const WALL_GROUPS: WallGroup[] = ["short", "serie", "video"];

/**
 * The 18 thumbnails in the order they enter (mixed, so the sort is visible),
 * grouped by what each thumbnail shows: the six vertical frames are shorts;
 * the n8n course episodes and the OpenClaw course belong to series; the
 * four remaining tutorials and talks are standalone videos. The counters
 * below come from the site's tag counts, not from this list.
 */
const WALL_ENTRY: { id: string; group: WallGroup }[] = [
  { id: "pGyVmSuKH-w", group: "serie" },
  { id: "2cWLYCY0ytc", group: "short" },
  { id: "UlND4ZFBcH4", group: "video" },
  { id: "nF1wtYnSyHI", group: "serie" },
  { id: "3vrZJ7UI-vw", group: "short" },
  { id: "L4ZPhCTkX88", group: "serie" },
  { id: "57v5e3ITRBE", group: "short" },
  { id: "CrvIbxow-Q0", group: "video" },
  { id: "10eJRuQ2S_E", group: "serie" },
  { id: "7q7H8RzHm-E", group: "short" },
  { id: "HqRjx7TtJ4E", group: "serie" },
  { id: "E-m3S_fHiDA", group: "video" },
  { id: "IDV68MZsNpw", group: "short" },
  { id: "_n4_MC4Hl5w", group: "serie" },
  { id: "Bv1n_Kr-Hdo", group: "serie" },
  { id: "o3_GDKxlJQc", group: "short" },
  { id: "tA6nlUrd1Hk", group: "video" },
  { id: "Q-R9daHOfdU", group: "serie" },
];

/** Columns per container range (wide, mid, narrow); the CSS picks the matching coordinates. */
const WALL_COLS = { w: 8, m: 6, n: 4 } as const;
type WallRange = keyof typeof WALL_COLS;
const WALL_RANGES = Object.keys(WALL_COLS) as WallRange[];

/** The one-shot run: tiles enter, hold, sort; the counters tick during the sort. */
const WALL_RUN_MS = 4400;
const WALL_COUNT_FROM = 0.5;
const WALL_COUNT_TO = 0.92;
/** #short, #serie-item, standalone #video (19 − 15), embeds in total (19 + 17). */
const WALL_COUNTERS = [17, 15, 4, 36] as const;

type WallPlacement = { c0: number; r0: number; c1: number; r1: number };
type WallLayout = { tiles: WallPlacement[]; rows: number; lanes: number[] };

/**
 * Grid coordinates for one column count: where each tile enters (reading
 * order) and where it ends (its group's rows, in order), the total sorted
 * row count, and the row each group starts on (where its label sits).
 */
function placeWall(cols: number): WallLayout {
  const tiles: WallPlacement[] = WALL_ENTRY.map((_, i) => ({ c0: i % cols, r0: Math.floor(i / cols), c1: 0, r1: 0 }));
  const lanes: number[] = [];
  let row = 0;
  for (const group of WALL_GROUPS) {
    lanes.push(row);
    let j = 0;
    WALL_ENTRY.forEach((tile, i) => {
      if (tile.group !== group) return;
      tiles[i].c1 = j % cols;
      tiles[i].r1 = row + Math.floor(j / cols);
      j += 1;
    });
    row += Math.ceil(j / cols);
  }
  return { tiles, rows: row, lanes };
}
const WALL_LAYOUTS: Record<WallRange, WallLayout> = { w: placeWall(WALL_COLS.w), m: placeWall(WALL_COLS.m), n: placeWall(WALL_COLS.n) };

const WALL_UI = {
  es: {
    headLeft: "canal · 36 videos embebidos",
    headRight: "una nota por video · una etiqueta interna",
    rows: ["Shorts", "Series", "Videos"],
    counters: ["shorts", "episodios de serie", "videos sueltos", "embebidos"],
    alt: "Gráfico en movimiento: las 18 miniaturas de los videos de Diego para DonWeb Cloud entran en una grilla, una tras otra, y después se ordenan solas en tres filas con etiqueta, Shorts, Series y Videos, cada miniatura con la etiqueta interna que lee el theme, #short, #serie-item o #video; abajo cuatro contadores suben a 17 shorts, 15 episodios de serie, 4 videos sueltos y 36 embebidos",
  },
  en: {
    headLeft: "channel · 36 embedded videos",
    headRight: "one post per video · one internal tag",
    rows: ["Shorts", "Series", "Videos"],
    counters: ["shorts", "series episodes", "standalone videos", "embedded"],
    alt: "Motion graphic: the 18 thumbnails of Diego's DonWeb Cloud videos enter a grid one after another, then sort themselves into three labelled rows, Shorts, Series and Videos, each thumbnail carrying the internal tag the theme reads, #short, #serie-item or #video; below, four counters climb to 17 shorts, 15 series episodes, 4 standalone videos and 36 embedded",
  },
} as const;

/** The per-tile coordinates for every range, as custom properties the CSS reads. */
function tileVars(index: number, group: WallGroup): CSSProperties {
  const vars: Record<string, number> = { i: index, g: WALL_GROUPS.indexOf(group) };
  for (const range of WALL_RANGES) {
    const tile = WALL_LAYOUTS[range].tiles[index];
    vars[`c0-${range}`] = tile.c0;
    vars[`r0-${range}`] = tile.r0;
    vars[`c1-${range}`] = tile.c1;
    vars[`r1-${range}`] = tile.r1;
  }
  return cssVars(vars);
}

export function VideoWall({ lang }: { lang: Lang }) {
  const ui = WALL_UI[lang];
  const root = useRef<HTMLDivElement>(null);
  const counters = useRef<(HTMLSpanElement | null)[]>([]);

  const write = useCallback((progress: number) => {
    WALL_COUNTERS.forEach((target, i) => setText(counters.current[i], String(Math.round(target * progress))));
  }, []);

  const frame = useCallback(
    (t: number) => write(easeOutQuart(clamp01((t - WALL_COUNT_FROM) / (WALL_COUNT_TO - WALL_COUNT_FROM)))),
    [write]
  );
  const idle = useCallback(() => write(0), [write]);
  const final = useCallback(() => write(1), [write]);

  useStageClock(root, WALL_RUN_MS, false, { frame, idle, final });

  const boardVars: Record<string, number> = {};
  for (const range of WALL_RANGES) boardVars[`rows-${range}`] = WALL_LAYOUTS[range].rows;

  return (
    <div ref={root} className="mg-dwc" role="img" aria-label={ui.alt}>
      <div className="mg-dwc-wall" aria-hidden="true">
        <div className="mg-dwc-wall__head mg-dwc-rise mg-run">
          <span className="mg-dwc-label">{ui.headLeft}</span>
          <span className="mg-dwc-label">{ui.headRight}</span>
        </div>

        {/* The board reserves the sorted height (always the taller layout);
            tiles and row labels are placed by transform from their vars. */}
        <div className="mg-dwc-wall__board" style={cssVars(boardVars)}>
          {WALL_GROUPS.map((group, g) => {
            const laneVars: Record<string, number> = { g };
            for (const range of WALL_RANGES) laneVars[`r-${range}`] = WALL_LAYOUTS[range].lanes[g];
            return (
              <div key={group} className="mg-dwc-wall__row" style={cssVars(laneVars)}>
                <span className="mg-dwc-wall__row-name">{ui.rows[g]}</span>
                <span className="mg-dwc-label">{WALL_TAG[group]}</span>
              </div>
            );
          })}

          {WALL_ENTRY.map((tile, i) => (
            <figure key={tile.id} className="mg-dwc-wall__tile" data-group={tile.group} style={tileVars(i, tile.group)}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${ROOT}/yt-${tile.id}.webp`} alt="" width={960} height={540} decoding="async" loading="lazy" />
              <figcaption className="mg-dwc-wall__tag">{WALL_TAG[tile.group]}</figcaption>
            </figure>
          ))}
        </div>

        <div className="mg-dwc-wall__counters mg-dwc-rise mg-run">
          {ui.counters.map((label, i) => (
            <span key={label} className="mg-dwc-wall__counter">
              <span
                ref={(el) => {
                  counters.current[i] = el;
                }}
                className="mg-dwc-wall__counter-n"
              >
                0
              </span>
              <span className="mg-dwc-label">{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
