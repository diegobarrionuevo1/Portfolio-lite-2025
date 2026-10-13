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
- [x] T2 (inline) `npm run build` green (SSG, 5 slugs × 2 langs); fast-forward push of
      `5d517cb` to `main`; Vercel production deploy READY on diegobarrionuevo.com.
      Native review assess: medium, `under_budget`, not due.
- [x] T3a (inline) `ab80518` sticky protection strip under the nav on showcase pages
      (browser readback on a dark and a light showcase). Deploy READY.
- [x] T3b (inline) `09f5cac` filler metrics and the false "0 datos en la nube" stat
      removed; last ADR suffix removed from the Finanzas graphic. Deploy READY;
      production smoke test: all showcase routes and the restored assets return 200.
- [ ] T4 Needs Diego's facts or new material: Talleres figures that disagree
      (121.087 vs 120.729 inscriptions, 205 vs 204 programs), the Camtasia watermark on
      the Talleres cinema clip, the Expo scaffold icon on Finanzas, the remaining 30 fps
      clips, and the motion-graphics redesign (deferred by the user).

## Notes

- The `odd/tasks/project-immersive-showcases.md` claim that five clips were replaced at
  60 fps is false: only `hermes/clip-landing` was, and it showed the wrong site. The
  restored clip is 30 fps.
