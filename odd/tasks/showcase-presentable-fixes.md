# Feature: showcase-presentable-fixes

Branch: `feat/project-immersive-showcases`, integrated continuously into `main`
(user instruction, 2026-10-13: ship a first presentable version today, smallest
fixes first, no motion-graphics redesign).
Engram mirror topic: `odd/showcase-presentable-fixes/tasks`.

## Objective

Make the showcases safe to present to a recruiter today: remove every factual or
media error found by the 2026-10-13 audit, then ship to production. Motion
graphics, video re-recording and copy rewrites are out of scope for now.

## Scope and constraints

- Smallest truth fixes first, each batch merged to `main` as soon as it is green.
- No redesign of motion graphics, no new recordings.
- Commits: Conventional Commits, no AI attribution (user rule).

## Tasks

- [x] T1 (inline) Truth fixes, batch 1
  - Hermes hero clip restored from `63250d4` (the `8defe2f` re-capture recorded cloud.donweb.com).
  - Talleres: the generated demo certificates are gone; the certificate scene shows only
    Diego's real certificate (`cert-236-legacy`, Search Console, 27 Aug 2024) at 4:3,
    and the gallery no longer lists `cert-c6` and `cert-c9`.
  - Internal decision codes (ADR-0xx, D-0xx) removed from visible copy and alt text.
  - Home "Productos propios" cards link to the Hermes and Finanzas showcases.
  - Checks: `tsc --noEmit` clean, `eslint` clean on changed files, browser readback of
    /work/hermes, /work/donweb-talleres and /#building.
- [ ] T2 Production build and fast-forward push to `main`; confirm the deploy.
- [ ] T3 Next smallest fixes: nav overlapping text on showcase pages, trivia metrics,
      contradictory figures (Talleres 121.087 vs 120.729), Expo scaffold icon, Camtasia
      watermark on the Talleres peak.

## Notes

- The `odd/tasks/project-immersive-showcases.md` claim that five clips were replaced at
  60 fps is false: only `hermes/clip-landing` was, and it showed the wrong site. The
  restored clip is 30 fps.
