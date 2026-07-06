#!/usr/bin/env bash
# Redeploys the ONE team's own reference instance (https://template.one.ie).
#
# wrangler's Cloudflare-adapter build injects `main` into whatever file is
# literally named wrangler.toml — `wrangler deploy --config <other-file>`
# does not go through that injection and fails with "Cannot use assets with
# a binding in an assets-only Worker." So this script swaps the real,
# gitignored config in, deploys, and always restores the placeholder file
# a template clone should see — even if the deploy fails partway.
set -euo pipefail
cd "$(dirname "$0")/.."

REAL=wrangler.template-deploy.toml
TRACKED=wrangler.toml
BACKUP="$(mktemp)"

if [ ! -f "$REAL" ]; then
  echo "error: $REAL not found — this redeploys the ONE team's own reference site only." >&2
  exit 1
fi

cp "$TRACKED" "$BACKUP"
restore() { cp "$BACKUP" "$TRACKED"; rm -f "$BACKUP"; }
trap restore EXIT

cp "$REAL" "$TRACKED"
astro build && wrangler deploy
