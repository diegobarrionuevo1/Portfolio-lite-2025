#!/bin/sh
#
# Daily blog post runner, invoked by launchd.
#
# launchd starts a job with a minimal PATH and without sourcing any shell
# profile, so nothing here may rely on an inherited environment: node and the
# claude CLI that generate.ts shells out to are both supplied by the agent's
# EnvironmentVariables. Keeping the machine-specific paths in the plist is why
# this script stays portable.
set -eu

REPO="$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)"
LOG_DIR="${BLOG_LOG_DIR:-$HOME/Library/Logs}"
LOG="$LOG_DIR/portfolio-blog-daily.log"

mkdir -p "$LOG_DIR"
cd "$REPO"

# One success per day. The agent has a catch-up slot in the afternoon, and
# idempotency in the pipeline is per-story, not per-day: a second successful
# run would pick the NEXT story and create a second post. This guard is what
# makes the extra slot safe.
if grep -q "^Fin: $(date '+%Y-%m-%d').*exit 0" "$LOG" 2>/dev/null; then
  echo "Corrida omitida $(date '+%H:%M:%S'): hoy ya hubo una exitosa." >> "$LOG"
  exit 0
fi

{
  echo ""
  echo "════════════════════════════════════════════════════"
  echo "Inicio: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "════════════════════════════════════════════════════"
} >> "$LOG"

# Retries, because the observed failure mode is not "no network": launchd can
# fire during a Power Nap dark wake, the machine falls back asleep mid-run,
# and the frozen claude CLI is killed by its own timeout on the next real
# wake. By then the user has just opened the lid — the machine is awake and
# online — so a short-spaced retry is exactly what succeeds.
attempt=1
max_attempts=3
while :; do
  # --env-file-if-exists rather than --env-file: a checkout without .env.local
  # should fail with the pipeline's own diagnostic, not a shell error.
  if "$REPO/node_modules/.bin/tsx" --env-file-if-exists=.env.local automation/run.ts >> "$LOG" 2>&1; then
    status=0
    break
  fi
  status=$?
  if [ "$attempt" -ge "$max_attempts" ]; then
    break
  fi
  echo "Intento $attempt falló (exit $status); reintento en 5 minutos." >> "$LOG"
  sleep 300
  attempt=$((attempt + 1))
done

echo "Fin: $(date '+%Y-%m-%d %H:%M:%S %Z') — exit $status" >> "$LOG"
exit "$status"
