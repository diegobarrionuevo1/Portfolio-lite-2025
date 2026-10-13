# Feature: directus-identity

Branch: `feat/project-immersive-showcases`, integrated continuously into `main`.
Engram mirror topic: `odd/directus-identity/tasks`.

## Objective

Replace the Claude-looking Contraste skin (warm cream ground, Flare orange, Acid neon,
Bricolage + Instrument Serif italic + JetBrains Mono) with an identity inspired by
Directus, keeping the light start and the Night transition (user decision,
2026-10-13).

## Reference (measured on directus.com, 2026-10-13)

- Ground `#090909`; surfaces `#151515`, `#1E1E1E`; hairlines `#404040`.
- Text `#FFFFFF`; secondary `#A0A0A0`.
- One accent, lavender `#B3A2FF`, used sparingly. Pastel spectrum for categories:
  `#FFA2CF`, `#F4FFA2`, `#A2DBFF`, `#A2FFB5`.
- Source Serif 4 at weight 400, roman (display); Inter (body); IBM Plex Mono (labels).

## Constraints

- Take the system, not Directus' logo or a 1:1 clone.
- The page still starts light and goes dark over Trabajo; re-measure the Night contrast floor.
- Token-level change: no component redesign, no motion work.
- Per-project showcase atmospheres keep their own product palettes.

## Tasks

- [x] T1 (delegated writer: 6+ files) Tokens and fonts
  - Light ramp neutral (no warm chroma); dark ramp Directus blacks.
  - Flare → violet (light-mode accent), Acid → lavender (dark-mode accent), names included.
  - Fonts via `next/font/google`: Source Serif 4, Inter, IBM Plex Mono; display weight 400.
  - Night pairs and literal rgba values follow the new ramps; OG image colours updated.
  - Evidence (uncommitted): `globals.css` (ramps, violet/lavender, glows, aliases, dark
    scope, font stacks, `--fw-display`, tracking), `layout.tsx` (next/font on `<html>`;
    `en/layout.tsx` is not a root layout), `night.tsx` (pairs + action-accent trio),
    `og/route.tsx` (colours, font alias), `project-carousel.tsx`, `nav.tsx`, 13 more
    components/CSS for display weight only. `tsc --noEmit` clean; ESLint clean on
    every changed TS/TSX; `npm run build` OK (23 static pages); leftover scan: only the
    OG TTF read. Night sweep: floors pass after dark `--text-primary` moved to
    `--bone-50` (#fff): primary 4.75, secondary 4.57, muted 4.13, accent 4.49, link
    4.49 (before 4.36/4.22/4.09/4.14/4.14). Dark `--action-accent-fg` set to ink-900
    (white on lavender was 2.2:1).
  - `src/components/work/showcase/scenes/typography.ts` (3 display weights, outside the
    writer's surface) switched to `var(--fw-display)` inline by the parent.
- [x] T2 Verification. RDD is on, so the writer's foreground report is the verification
      of record (tsc, eslint, build, leftover scan, Night sweep above); no separate
      verifier. Parent spot check: `npx tsc --noEmit` clean after the typography.ts edit.
- [x] T3 (inline) Browser readback: home hero (light), Trabajo and Capacidades (dark),
      Contacto (light), /work/donweb-talleres (DonWeb atmosphere kept), /work/finanzas-ia.
      Commit and push to `main`.

## Follow-ups

- The nav keeps `data-theme="dark"` after an instant jump from the dark band to Contacto.
  It reproduces on production with the pre-change build, so this feature did not
  introduce it. Likely cause: the nav recomputes on scroll, not when the Night tween ends.
- The OG image still renders with the Bricolage and Instrument TTF files; only its
  colours changed.
- The pastel spectrum (`#FFA2CF`, `#F4FFA2`, `#A2DBFF`, `#A2FFB5`) is not used yet; it
  could tag projects or categories.
