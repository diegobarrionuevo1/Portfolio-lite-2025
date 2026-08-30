# Daily blog pipeline

Automated daily post for diegobarrionuevo.dev: reads a curated set of RSS/Atom
feeds, picks the most notable story of the day, asks Claude to write Diego's
original analysis of it, runs a quality gate, and pushes the result to Ghost.

```
ingest -> select -> generate -> verify -> publish -> mark covered -> revalidate
```

## Commands

```bash
pnpm blog:daily:dry   # full run, no write to Ghost, no state mutation
pnpm blog:daily       # real run
```

`--dry-run` still calls Claude (that costs money) — it only skips the Ghost
write, the dedup-state update, and the revalidate webhook.

## Publishing policy

The pipeline publishes as `published` **only** when both hold:

1. the quality gate passed, and
2. `BLOG_AUTO_PUBLISH` is exactly the string `true`.

Anything else — gate failure, unset variable, `1`, `yes`, `TRUE` — produces a
**draft**. That is deliberate: this blog is Diego's professional face, so the
default with no configuration is "human reviews it first". A gate failure is a
*successful* run that produced a draft; the process still exits 0. Only real
errors (missing API key, Ghost unreachable, model failure) exit non-zero.

## Idempotency

Ghost never rejects a duplicate slug, so nothing upstream stops the pipeline from
publishing the same story twice. Three guards, in order:

1. **`#src-<hash>` internal tag (the important one).** The hash is derived from
   the *source article URL*, so it is identical on every run of the same story —
   unlike the slug, which comes from model output and changes run to run. It is
   checked **before** the Claude call, so a duplicate run also costs nothing.
   The `#` prefix makes it a Ghost *internal* tag: recorded on the post, never
   rendered on the front-end.
2. **Slug lookup**, before creating and again between create attempts.
3. **`state/covered.json`**, committed back to the repo by the Action.

Only (1) survives the case that actually bites: a GitHub *re-run* of a failed
job, or a scheduled run queued behind a manual one. Both check the repo out at
the commit from *before* the state file was updated, so their dedup memory is
empty and they would otherwise re-pick and re-write the same story.

Only the chosen article and other feeds carrying the **same** story are marked as
covered (`selection.sameStory`). `selection.related` may also contain merely
adjacent stories pulled in for prompt context — marking those would silently
prevent the pipeline from ever writing about them.

## Environment variables

No `.env` file is committed. Set these in `.env.local`, or export them in the shell
that runs the pipeline.

| Variable | Required | Purpose |
| --- | --- | --- |
| `CLAUDE_CLI_BIN` | no | Absolute path to the `claude` binary. Defaults to `claude` on the PATH; set it when scheduling under launchd or cron, which start with a minimal PATH. |
| `GHOST_ADMIN_API_KEY` | yes (to publish) | Ghost **Admin** API key in `id:secret` form. The secret half must be hex. Server-side only — never expose it to the browser. |
| `GHOST_ADMIN_API_URL` | one of these two | Ghost admin domain, e.g. `https://blog.example.com`. |
| `GHOST_URL` | one of these two | Fallback used when `GHOST_ADMIN_API_URL` is unset. |
| `BLOG_AUTO_PUBLISH` | no | Set to exactly `true` to allow real publishing. **Unset means draft.** |
| `NEXT_PUBLIC_SITE_URL` | no | Site origin used for the revalidate webhook. |
| `REVALIDATE_SECRET` | no | Sent as the `x-revalidate-secret` header to `POST {site}/api/revalidate`. Both this and `NEXT_PUBLIC_SITE_URL` must be present or the webhook is skipped. |

The revalidate call is best-effort: a failure is logged but never fails the run,
and never blocks publication.

The receiving route lives at `src/app/api/revalidate/route.ts`. It fails closed
(HTTP 503) when `REVALIDATE_SECRET` is unset and returns 401 on a mismatch, so
set the same secret on both sides or the call is a logged no-op.

## Modules

| File | Responsibility |
| --- | --- |
| `sources.ts` | Typed catalogue of verified feeds, plus a list of known-broken ones so they don't get re-added. |
| `feed.ts` | Concurrent fetch + parse with a 15s per-feed timeout and per-feed try/catch. Returns items from the last 3 days. One dead feed never kills the run. |
| `state.ts` | Dedup memory in `state/covered.json`. Canonicalises URLs, prunes entries older than 90 days on every write, tolerates a missing or corrupt file. |
| `select.ts` | Clusters items into stories (canonical URL match, then headline similarity) and ranks by cross-source signal → full-content availability → recency. |
| `generate.ts` | Claude call with zod structured outputs. Enforces Ghost's limits after parsing. Handles `stop_reason: "refusal"`. |
| `verify.ts` | The quality gate. Pure except the link resolver. |
| `publish.ts` | Ghost Admin API: zero-dep JWT, idempotency pre-check, create, retry/backoff. |
| `run.ts` | Orchestrator and human-readable reporting. |

## Quality gate checks

`verify.ts` returns `{ pass, failures }`. A post is downgraded to a draft when any
of these fail:

- every URL resolves — both `sourcesCited` **and** every absolute `<a href>` in
  the body, deduped and capped at 16 (HEAD, falling back to a ranged GET;
  2xx/3xx, 10s timeout)
- the HTML contains at least one `<a href>` pointing at a cited source
- body length is between 350 and 2200 words (not truncated, not padded)
- the HTML is well-formed enough for Ghost: balanced tags, no crossed tags, no
  raw unescaped `<`, only block elements at the top level, no `<script>` /
  `<style>` / `<iframe>` / `<html>` / `<body>`
- slug matches `^[a-z0-9-]+$`, title ≤ 255, excerpt ≤ 300, 2–5 tags. Tag counts
  are **not** padded up to the minimum — padding would attach an unrelated tag to
  a public post, so too few tags is a real gate failure (i.e. a draft).

## Ghost contract notes

Verified empirically. Do not "simplify" these:

- `POST /ghost/api/admin/posts/?source=html` returns **201**, not 200.
- `?source=html` is **mandatory**. Without it Ghost stores an empty body and
  still reports success.
- The JWT secret must be `Buffer.from(secret, 'hex')`. Signing the raw ASCII
  string 401s every request. Tokens last 5 minutes and are minted fresh per HTTP
  attempt.
- **Duplicate slugs never error** — Ghost silently appends `-2`, `-3`, … so a
  retried or double-fired cron would publish N near-identical posts. See
  [Idempotency](#idempotency) for the two checks that prevent it.
- **`POST /posts/` is not idempotent.** A 20s client timeout or a 502 from a
  proxy says nothing about whether Ghost committed the row, so the create is
  never retried blindly: `createPost()` re-checks the slug between attempts and
  returns the post the previous attempt landed.
- Tags are matched **by name** and Ghost **auto-creates** anything it doesn't
  recognise, so a single typo permanently pollutes the tag list. The generation
  schema therefore locks tags to an enum (`ALLOWED_TAGS` in `generate.ts`).
- `?newsletter=<slug>` is **never** sent — that parameter emails the entire
  member list.
- `429` and `5xx` are retried with exponential backoff (4 attempts, honouring
  `Retry-After`).

## Editorial rules

Encoded in the system prompt in `generate.ts`:

- Spanish (Rioplatense, voseo). The site is `es-AR`.
- The post is Diego's **original analysis**, not a rewrite or translation of the
  source. Republishing rewritten content is penalised by Google as scaled content
  abuse. Every post links and attributes its sources explicitly.
- Senior full-stack voice: practical, opinionated, concrete. No hype, no emoji,
  no "en el vertiginoso mundo de la tecnología" openings.
- Required structure: short "qué pasó" → "por qué importa" → "qué cambia en la
  práctica" → **"cuándo NO usarlo"** → closing. The skeptical practitioner
  section is the differentiator and is never optional.

## Scheduling

Generation runs through the local Claude Code CLI (`claude -p`), which signs with
the machine's OAuth session. That keeps the step on the subscription instead of
per-token API billing, and it is also why this pipeline does not run in CI: a
GitHub runner has no such session, and there is no subscription auth in Actions.

`generate.ts` strips `ANTHROPIC_API_KEY` from the CLI's environment on purpose.
Claude Code prefers a key over the OAuth session when one is present, so leaving
it in scope would silently move every run back onto per-token billing.

Run it by hand with `pnpm blog:daily`, or `pnpm blog:daily:dry` to do everything
except write to Ghost.

### The daily launchd agent

`automation/daily.sh` is the entry point. It resolves the repository from its own
location, appends a timestamped section to `~/Library/Logs/portfolio-blog-daily.log`,
and exits with the pipeline's status.

The agent itself is machine configuration and is deliberately **not** committed —
it holds absolute paths for one user. Create
`~/Library/LaunchAgents/com.diegobarrionuevo.blog-daily.plist` with:

- `ProgramArguments` pointing at this repository's `automation/daily.sh`
- `StartCalendarInterval` set to `Hour 9`, `Minute 0` (launchd uses local time)
- `EnvironmentVariables` carrying **both**:
  - `PATH` including the Node ≥ 22.13 bin directory and the directory holding `claude`
  - `CLAUDE_CLI_BIN` set to the absolute path of the `claude` binary

Both are load-bearing. launchd sources no shell profile, so a bare `node` or
`claude` does not resolve and the job dies before it reads a single feed.

Then load it:

```
launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.diegobarrionuevo.blog-daily.plist
```

Useful afterwards:

```
launchctl print gui/$UID/com.diegobarrionuevo.blog-daily   # state, run count, last exit
launchctl kickstart -k gui/$UID/com.diegobarrionuevo.blog-daily   # run it now
launchctl bootout gui/$UID/com.diegobarrionuevo.blog-daily        # stop scheduling it
```

A missed run is not retried on a schedule of this shape: if the machine is asleep
at 09:00, launchd fires the job once it wakes. If it stays off all day, that day
is skipped — the dedup memory means the story is simply picked up later, never
published twice.

`automation/state/covered.json` is written in place and stays there. The
commit-it-back dance the old GitHub workflow performed existed only because a CI
runner starts from a fresh clone every time and would otherwise lose the dedup
memory between runs. Locally that problem does not exist, so committing it is
optional bookkeeping.
