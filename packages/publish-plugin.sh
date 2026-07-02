#!/usr/bin/env bash
# Publish a template/packages/plugin-* package to npm without shipping the `workspace:*`
# protocol, so `bun add @oneie/plugin-<name>` / `npm install` resolves outside this monorepo.
#
# Why: every plugin package peers `@oneie/frontend: "workspace:*"` (and some peer sibling
# plugins the same way). That protocol only resolves inside this repo's linked node_modules;
# npm's registry has never heard of it, and `@oneie/frontend` itself is not published (a
# separate, larger OSS-distribution decision — see text/plugin-delivery-plan.md). This script
# rewrites any peerDependencies entry whose value is the literal string "workspace:*" to a
# loose "*" + marks it optional in peerDependenciesMeta, so a missing/unresolvable peer is a
# warning, not an install failure. Every other peer range (astro, react, better-auth,
# @oneie/sdk) is left byte-identical. The repo's own package.json is restored on exit via
# trap, mirroring the proven recipe in packages/cli/publish.sh.
#
# Usage:  bash template/packages/publish-plugin.sh <plugin-dir-name> [--dry-run]
#   e.g.  bash template/packages/publish-plugin.sh plugin-blog --dry-run
# Auth:   npm config set //registry.npmjs.org/:_authToken <token>  (see reference_npm_token memory)
#
# HARD BLOCK: the 5 packages backing PAID_FEATURES (one.ie/web/src/lib/billing/gate.ts) are
# refused unconditionally, even with --dry-run. A public npm package has no purchase gate —
# publishing paid plugin source there hands it to anyone for free and defeats the sale. Their
# delivery mechanism is a separate, undecided design (text/plugin-delivery-plan.md § Scope
# correction) — do not remove this block to work around it.
set -euo pipefail

PAID_PLUGINS="plugin-admin plugin-course plugin-dashboard plugin-premium plugin-shop"

PKG_NAME="${1:?usage: publish-plugin.sh <plugin-dir-name> [--dry-run]}"
DRY="${2:-}"

for blocked in $PAID_PLUGINS; do
  if [ "$PKG_NAME" = "$blocked" ]; then
    echo "✗ refusing to publish $PKG_NAME — it backs a PAID_FEATURES entitlement." >&2
    echo "  Public npm has no purchase gate. See text/plugin-delivery-plan.md § Scope correction." >&2
    exit 1
  fi
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PKG_DIR="$SCRIPT_DIR/$PKG_NAME"

[ -d "$PKG_DIR" ] || { echo "✗ no such package dir: $PKG_DIR"; exit 1; }
cd "$PKG_DIR"

BACKUP="$(mktemp)"
cp package.json "$BACKUP"
trap 'cp -f "$BACKUP" package.json 2>/dev/null; rm -f "$BACKUP"' EXIT

node -e '
  const fs = require("fs")
  const p = JSON.parse(fs.readFileSync("package.json", "utf8"))
  const peers = p.peerDependencies || {}
  const meta = p.peerDependenciesMeta || {}
  for (const k of Object.keys(peers)) {
    if (peers[k] === "workspace:*") {
      peers[k] = "*"
      meta[k] = { optional: true }
    }
  }
  p.peerDependencies = peers
  if (Object.keys(meta).length) p.peerDependenciesMeta = meta
  fs.writeFileSync("package.json", JSON.stringify(p, null, 2) + "\n")
'

PKG_FULL_NAME="$(node -pe "require('./package.json').name")"
CURRENT_VER="$(node -pe "require('./package.json').version")"
PUBLISHED_VER="$(npm view "$PKG_FULL_NAME" version 2>/dev/null || true)"

if [ "$CURRENT_VER" = "$PUBLISHED_VER" ]; then
  echo "→ $PKG_FULL_NAME@$CURRENT_VER already published — skip"
  exit 0
fi

if [ "$DRY" = "--dry-run" ]; then
  npm publish --access public --dry-run
else
  npm publish --access public
fi

echo "✓ $PKG_FULL_NAME@$CURRENT_VER published (or dry-ran)"
