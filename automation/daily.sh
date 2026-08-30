#!/bin/sh
#
# Daily blog post runner, invoked by launchd.
#
# launchd starts a job with a minimal PATH and without sourcing any shell
# profile, so nothing here may rely on an inherited environment: node and the
# claude CLI that generate.ts shells out to are both supplied by the agent's
# EnvironmentVariables. Keeping the machine-specific paths in the plist is why
# this script stays portable.
#
# Everything is appended to one log with a timestamped header, because the
# failure this is most likely to hit — a missing binary, an expired Ghost key —
# is invisible at 09:00 with nobody watching.
set -eu

REPO="$(CDPATH='' cd -- "$(dirname -- "$0")/.." && pwd)"
LOG_DIR="${BLOG_LOG_DIR:-$HOME/Library/Logs}"
LOG="$LOG_DIR/portfolio-blog-daily.log"

mkdir -p "$LOG_DIR"
cd "$REPO"

{
  echo ""
  echo "════════════════════════════════════════════════════"
  echo "Inicio: $(date '+%Y-%m-%d %H:%M:%S %Z')"
  echo "════════════════════════════════════════════════════"
} >> "$LOG"

# --env-file-if-exists rather than --env-file: a checkout without .env.local
# should fail with the pipeline's own diagnostic, not a shell error.
if "$REPO/node_modules/.bin/tsx" --env-file-if-exists=.env.local automation/run.ts >> "$LOG" 2>&1; then
  status=0
else
  status=$?
fi

echo "Fin: $(date '+%Y-%m-%d %H:%M:%S %Z') — exit $status" >> "$LOG"
exit "$status"
