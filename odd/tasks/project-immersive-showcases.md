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

### T1 Foundation — DONE (commit `40eb5e8`)
- Route: delegated writer (writer trigger: 24 files; mapping trigger: integration map from the discovery workflow).
- Checks observed by the writer and spot-checked by the parent: `npm run lint` clean; `npx tsc --noEmit` exit 0 (re-run by parent); `npm run build` SSG 23/23 with `/work/[slug]` and `/en/work/[slug]` x5. Pre-existing warning: Ghost content key not configured at build.
- Home: Hashi moved to the new `#experience` section (index 03); Ada13 is P/03; sections 04–07 renumbered; carousel names link to `/work/<slug>` and the ficha slide has "Ver la presentación".
- RDD: assess → medium, `review_due: slice_budget_reached`. STATUS → START returned `invalid_request` (untracked inventory changed while the asset pipeline was still writing `public/work/`). Retry after the T2 asset commit with a stable tree.

### T2 Asset pipeline — IN PROGRESS
- Captures (Playwright 1.57, Chromium headless, 1440x900@2x and 390x844@3x): 39 live views across cloud.donweb.com, certificados.donweb.com (+ Diego's own certificate, demo landings, panel login), talleres.donweb.com, hashiapp.com, archived ada13.tech (2023 and 2024 via Wayback), the Hermes landing from localhost:3100 and 20 Claude Design canvases; plus inner sections by scroll offset.
- Local copies: DonWeb theme hero slides, hex tramas, cloud-servers illustration, logos; 9 generated demo certificates, legacy 2023 certificate (test render), Talleres logos/tramas; Hashi composer screenshots (1914 and 2880 wide) and torii logo; Hermes icon; Finanzas app icon.
- Remote own assets: 3 DonWeb Cloud og banners, 18 YouTube maxres thumbnails of Diego's DonWeb Cloud videos, current DWC logo, Talleres 2023 demo video (Vercel Blob, 17 MB), Diego's legacy course-236 certificate renders, Ada13 logo/hero image and the 2024 vertical event video (Wayback).
- Clips recorded (1920x1080): cloud home slider + scroll, cinema-mode episode page, certificate 3D tilt + gallery, registro landing, Hermes landing night→day scroll, archived Ada13 scroll. Transcoded with ffmpeg to H.264 MP4 (crf 23) + VP9 WebM (crf 34) + WebP poster.
- Output: `public/work/<slug>/` as WebP (2400w + 1200w variants, q82; alpha assets q90) and `public/work/manifest.json` with dimensions. 144 images, heaviest 176 KB.
- DONE (commit `63250d4`): 144 WebP images + 8 clips (MP4/WebM/poster), 65 MB under `public/work/`.
- Finanzas: Expo Release build installed on the iPhone 17 simulator (`xcrun simctl`, no panel permission needed); home screen captured light and dark at 1206x2622 → `public/work/finanzas-ia/home-{light,dark}.webp`. Other tabs need taps (deep links trigger the system "¿Abrir en…?" dialog), so they wait for the user to grant simulator access.

### T3 Scene primitives — DONE (commit `d22ec3d`)
- Route: delegated writer (8 components + CSS; writer trigger).
- Checks observed: `npm run lint` clean; `npx tsc --noEmit` clean; `npm run build` SSG 23/23, work routes 102 kB first load; visual pass at 1440 and 390 with four fixes (nav dark from y=0 by pulling the band under the sticky nav, gallery bleed, strip heights, parallax range); reduced-motion probe with Playwright (`--p` 0.5, videos paused, cue hidden).
- Parent spot check: viewed the final desktop/mobile/gallery captures of `/work/donweb-contenidos`.
- RDD (range 58d6abf..d22ec3d, untracked excluded): assess medium / slice_budget_reached → STATUS → START returned the `gentle-ai.review-integration.consent/v3` envelope (lineage `review-b74645fa44937d94`, target `sha256:1006d627…`). Relayed to the user losslessly; the user answered `granted` (2026-10-05 23:45). Two attempts: the first START failed `invalid_request` (untracked inventory changed while the Talleres writer created files); renegotiated with the same target identity and ran the new `granted` invocation verbatim → `lens_context_budget_exceeded` (terminal: 205 files / 4,771 lines exceed the native reviewer context; no authority created, nothing to abandon). The CLI only targets base-to-HEAD, so narrower slices need their own HEAD: review per PR slice at delivery time (chained PRs) or in a throwaway worktree per commit. Consent stays candidate-scoped; later candidates ask again.

### T5 donweb-talleres — DONE (commit `d72a27d`)
- Route: delegated writer. Live ids `cert-tilt`, `legacy-url`, `four-services`; 7 chapters, 9-item gallery, metrics as the carousel states them (user's figures, note added).
- Checks observed: lint clean; tsc clean (re-run by parent); build SSG 23/23; runtime probe desktop/mobile/reduced (counters, timer, keyboard chips, tilt, no overflow); six visual fixes recorded by the writer. Parent spot check: viewed certificate, legacy-url, four-services desktop and mobile captures.

### T7 ada13 — DONE (commit `aca7405`)
- Route: delegated writer. Live ids `day-256`, `inscribe-states`, `incident-ledger`; 6 chapters, 6-item gallery, metrics with the archive note; `useStagePlayback` extracted to `scenes/mg/use-stage-playback.ts`.
- Checks observed: lint clean; tsc clean (re-run by parent); build SSG 23/23 (work routes 108 kB); runtime probe desktop/mobile/reduced; six visual fixes. Parent spot check: viewed day-256, inscribe-states and the portrait footage chapter.

### T8 hermes — DONE (commit `d86b557`)
- Route: delegated writer. Live ids `theme-morph`, `order-capsule`, `menu-import`; 8 chapters, 10-item gallery, "En construcción" metrics; hermes.ar link omitted (not verified live); Cloud Run not repeated.
- Checks observed: lint clean; tsc clean (re-run by parent); build SSG 23/23 (work routes 112 kB); 17 captures + 6 recaptures + tablet/phone checks, four fixes; reduced-motion probe. Parent spot check: viewed theme-morph (Street), order-capsule final frame and menu-import.

### T9 finanzas-ia — DONE (commit `beeaf28`)
- Route: delegated writer. Live ids `message-to-movement`, `available-balance`, `three-channels`; 6 chapters, 3-item gallery, "En desarrollo" metrics; light scheme verified (nav light, contrast of mono labels and hairlines).
- Checks observed: lint clean; tsc clean (re-run by parent); build SSG 23/23 (work routes 116 kB); runtime probe desktop/tablet/mobile/reduced; five fixes. Parent spot check: viewed hero, parser, balance and channels captures.

### T4 donweb-contenidos motion graphics — DONE (commit `8bafeaf`)
- Route: delegated writer. Live ids `hex-lattice`, `content-pipeline`, `video-wall`; final chapter order editorial → lattice → cinema → pipeline → hubs → dashboard → wall → metrics → gallery.
- Checks observed: lint clean; tsc clean (re-run by parent); build SSG 23/23 (work routes 120 kB); 28 captures, runtime probe at 1440/1024/900/390 and reduced; seven fixes. Parent spot check: viewed lattice, pipeline and wall.

### T10 Verification — DONE with one open item
- Full capture of 12 pages (home ES/EN + 5 showcases × 2 languages, desktop + mobile, full page sliced into tiles). The visual QA workflow reviewed home ES/EN before the weekly subagent limit stopped the other 10 reviewers (resets 13:00 America/Cordoba); those pages were reviewed by the parent from the writers' captures instead. Home findings fixed: carousel first slides now show real captures (P/01 home, P/02 real registration landing + certificate, P/03 archived ada13.tech before the plate), Hashi card uses a cropped composer screenshot, mobile caption no longer collides with the drag hint. Left as is: the capabilities grid orphan (pre-existing design), the capture artifact above 16,384 device px.
- Parent checks: `npm run lint` clean, `npx tsc --noEmit` clean, `npm run build` SSG 23/23 (work routes 121 kB first load), sitemap lists 10 work URLs, OG route answers 200 for ES/EN titles, hreflang pairs present, `/work/nope` → 404.

### T11 Refinement pass (user feedback: videos choppy, video pages generic) — DONE (commit after `8bafeaf`)
- Diagnosis: headless playback probe showed 60 fps and 0 dropped video frames with and without the grain layers, so the stutter was in the recordings (wheel-tick scroll + 25→30 fps duplication), not in playback.
- Fix: `record2.mjs` captures frame by frame through CDP with eased scroll/pointer timelines at 60 fps (deterministic, independent of real-time performance); five clips replaced (0.6–2.4 MB MP4 + VP9 WebM + poster). `ShowcaseVideo` now switches to `preload="auto"` within one viewport.
- Design (impeccable `animate`/`bolder` + Emil Kowalski `animate`): new `media-cinema` chapter layout, the authored peak of each showcase: the clip opens from an inset rounded card into a full-bleed sharp screen as it scrolls in (clip-path inset + scale follow `--p`), the title sits on the picture over the `--scrim-bottom` token, prose and facts follow in two columns; video heroes run edge to edge. Applied to Contenidos (editorial, cinema), Talleres (registro, first-generation); Talleres and Hermes heroes. Reduced motion renders the open state.
- Pruned 7.3 MB of unreferenced media (ada13 clip-home) and three unused Hashi captures; `public/work` is 56 MB.
- RDD: the branch candidate exceeds the native reviewer context (`lens_context_budget_exceeded`); review per PR slice at delivery time.
