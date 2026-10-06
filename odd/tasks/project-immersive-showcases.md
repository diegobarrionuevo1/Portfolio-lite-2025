# Feature: project-immersive-showcases

Branch: `feat/project-immersive-showcases` (branched from `main` at `58d6abf`).
Engram mirror topic: `odd/project-immersive-showcases/tasks` (project `portfolio-lite-2025`).

## Objective

Give every project named in the portfolio its own immersive presentation page
(`/work/<slug>` in Spanish, `/en/work/<slug>` in English) built from real,
high-quality material found on this machine and on the live products: screenshots,
videos, portable components re-rendered, brand atmosphere, and motion graphics
that explain the nature of each project. Each page must feel like entering that
project's own reality and technology while staying inside the Contraste design
system of the portfolio.

## Problem and why

The home carousel ships placeholder media slots (`v3-p01-contenidos`,
`v3-p02-talleres`, `v3-p02-certificado`, `v2-p04`) and one borrowed screenshot
(`/hero-light.png`). The handoff README lists them as pending assets. There is no
per-project page, no video, and no motion beyond reveals and the carousel.

## Scope

User decision (2026-10-05): immersive showcases only for the projects Diego built
end to end on his own. Hashi is TEAM EXPERIENCE (company, period, role, what he
built) and moves out of the carousel into a new home section "Experiencia en
equipo" (index 03), data-driven so Bookster can be added later. Second user
instruction: focus first on the experience and presentation; copy/information
gets reviewed and improved in a later pass.

In scope (5 showcases, 3 selected works + 2 own products, plus the experience section):

| slug | Project | Source of truth found |
| --- | --- | --- |
| `donweb-contenidos` | DonWeb Cloud — Plataforma de contenidos | cloud.donweb.com (Ghost 5.130 + theme + Next dashboard), repo `~/job/profesional/donweb-cloud` |
| `donweb-talleres` | DonWeb Cloud — Talleres y certificación | certificados.donweb.com / certmw / certdashboard, repos `~/job/profesional/donweb-talleres/*`, legacy `Talleres Donweb` |
| `ada13` | Ada13 — Plataforma web | No local repo. ada13.tech reconstructed from the Wayback Machine (2023/2024) |
| `hermes` | Hermes (own product) | `~/job/business/Hermes` (landing runs locally, 20 design canvases) |
| `finanzas-ia` | Finanzas personales con IA (own product) | `~/job/business/personal-finances` (Expo; portable components) |
| (experience) | Somos Hashi, Sep 2024 – Jan 2025 | Diego's checkouts `~/job/hashi/ portal` and `hashi-portal`; composer screenshot already in `/public/hero-light.png` |

Out of scope: redesigning the home, changing the blog, publishing (push/PR/merge
stay with the user), downloading third-party client videos from Hashi's CDN,
the 2.1 GB meeting recording in `~/job/donweb videos`.

## Constraints (from the integration map)

- House motion style: CSS transitions + `requestAnimationFrame` +
  `IntersectionObserver` with data attributes (`data-reveal`, `data-delay`,
  `data-count`, `data-parallax`). `framer-motion`/`motion` are installed but unused;
  do not introduce them.
- Design rules: light is primary, dark only as `[data-theme="dark"]` scope; one
  strong accent per screen; display weight 500; cards without shadow; grain as the
  only texture; no emoji, no decorative gradients, no hand-drawn SVG illustration
  (geometric/typographic motion built from rules, boxes, counters is allowed);
  no hardcoded hex outside a project atmosphere scope that remaps tokens.
- `overflow-x: clip`, never `hidden`, on html/body/wrapper.
- `prefers-reduced-motion` disables every animation and pauses autoplay video.
- Media: everything under `public/work/<slug>/`; `<img>` with the eslint escape
  or `next/image` for local statics; first `<video>` pattern in the codebase must be
  muted/loop/playsInline + poster + reduced-motion pause.
- Pages must mount `<Nav lang/>`, `<Night/>`, `<RevealObserver/>` and end with
  `<Contact lang/>` (nav CTAs link `#contact`). `Night` is inert without
  `[data-slider]`; dark scenes are local scopes.
- i18n: same language-neutral slug on both sides; copy colocated as `{ es, en }`;
  metadata with `alternates.canonical/languages` and `openGraph.locale`.
- Technical artifacts (code, comments, data keys) in English; UI copy per language.
- Verification commands: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`
  (no test runner exists: TDD RED/GREEN not applicable, structural + functional
  checks instead), plus a visual pass at 1440 and 390 wide and reduced motion.

## Evidence notes that change copy (flag to the user, do not silently rewrite)

- P/01 "+200.000 visualizaciones orgánicas en 3 meses" has no local backing; only
  Search Console 85,331 impressions / 222 clicks in 28 days exists. Keep the claim
  as the user's own, label it as reported.
- P/01 tag "Ghost 6": production runs Ghost 5.130.6 (6.16.1 was rolled back).
- P/02 figures 218 / 138.109 / 123.253 exist only in the portfolio copy; closest
  evidence 205 courses + 121,087 registrations (June 2026 migration) and 2,180 tests.
- Hermes tag "Cloud Run": canon D-038 chose Vercel Pro + Supabase; no Cloud Run
  config exists. Showcase copy follows the canon.
- Hashi: the product today is AI video (avatars, scripts, editor). Diego's work
  (Sep 2024 – Jan 2025) was the AI script generation core, Hashi Studio components
  and the admin appearance panel. The showcase dates the MVP and shows the current
  product as "where it went".

## Delivery strategy

`exception-ok`: one feature branch, one work-unit commit per task, no automatic
PR chaining. Reason: the user asked for a separate branch and is away; push, PR
and merge remain their decisions. The branch will exceed 400 authored lines by
design (six content-heavy pages); this is recorded, not hidden.

Receipt-driven development: ON (global). After each work-unit commit run
`gentle-ai review assess --cwd <repo> --agent claude-code --base-ref <last boundary> --committed-only --json`
and follow `next_transition`. First boundary: `58d6abf`.

## Tasks

- [ ] T1 Foundation: routes, registry, shell, metadata, sitemap, carousel link
  - Route: inline or delegated writer (2+ non-trivial files → delegated).
  - Files: `src/app/work/[slug]/page.tsx`, `src/app/en/work/[slug]/page.tsx`,
    `src/components/work/showcase/showcase-page.tsx`,
    `src/components/work/showcase/registry.ts` (slug → content module),
    `src/lib/i18n.ts` (`workHref`), `src/components/work/projects.ts` (`slug`),
    `src/components/work/project-carousel.tsx` (link to showcase),
    `src/app/sitemap.ts`, `src/app/globals.css` (showcase rules).
  - Acceptance: `/work/<slug>` and `/en/work/<slug>` build statically for all six
    slugs with placeholder scenes; language switch round-trips; lint/tsc/build green.
- [ ] T2 Asset pipeline: capture, copy, fetch, process into `public/work/<slug>/`
  - Captures at 2x desktop (1440) and 3x mobile (390) of every live view; local
    assets copied from the repos; remote own assets fetched (DonWeb og images,
    YouTube thumbnails of DonWeb Cloud videos, the 2023 Talleres demo video on
    Vercel Blob); Ada13 from Wayback; Hermes landing from localhost:3100 and the
    design canvases; Hashi from Diego's checkouts plus a local component harness.
  - Processing: WebP (quality ~82) at 2400w max, poster frames, H.264 mp4 +
    VP9/AV1 webm, each ≤ ~6 MB; a manifest JSON with dimensions.
  - Acceptance: every showcase has a hero image, ≥ 3 gallery images, and at
    least one motion asset (video or live component) where the project allows it.
- [ ] T3 Scene primitives: hero, chapter, media frame (image/video), gallery
  strip, metrics, stack rail, next-project footer, atmosphere scope, scroll
  progress helper (rAF), reduced-motion handling.
- [ ] T4 Showcase `donweb-contenidos` (content ES/EN, atmosphere, motion graphic
  "pipeline Ghost → theme → dashboard", hex-lattice reveal).
- [ ] T5 Showcase `donweb-talleres` (root-growth trama, certificate tilt, legacy
  URL → UUID motion graphic, four-service lattice, before/after 2023 → 2026).
- [ ] T6 Showcase `somos-hashi` (self-typing console, pipeline beam GUION → AUDIO →
  AVATAR → VIDEO, Diego's components re-rendered, dated MVP, "where it went").
- [ ] T7 Showcase `ada13` (day-256 counter, registration states 1–4 motion
  graphic, Directus + Express + EnvialoSimple architecture, archived site visuals).
- [ ] T8 Showcase `hermes` (order capsule travel, theme engine morph, night → day).
- [ ] T9 Showcase `finanzas-ia` ("mensaje → movimiento" parser motion graphic,
  "disponible real" subtraction, three channels one inbox).
- [ ] T10 Verification and closure: lint, tsc, build, visual pass desktop/mobile/
  reduced motion, asset budget, OG images, sitemap, final report.

## Progress log

(appended per task: route taken, trigger evidence, commit, checks observed)
