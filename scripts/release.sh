#!/usr/bin/env bash
# Release template to github.com/one-ie/one (the public OSS repo).
#
# Paid plugins (tier: "paid") ship as stubs — source stays private.
# Free plugins and core packages ship in full.
#
# Usage:
#   ./scripts/release.sh [--dry-run] [--message "release note"]
#
# Requires apps/one to be cloned at ../../apps/one (relative to one-ie/template).

set -euo pipefail

TEMPLATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$(cd "$TEMPLATE_DIR/../../apps/one" 2>/dev/null && pwd)" || {
  echo "ERROR: apps/one not found. Clone it first:" >&2
  echo "  git clone git@github.com:one-ie/one.git $(dirname "$TEMPLATE_DIR")/apps/one" >&2
  exit 1
}

DRY_RUN=false
MESSAGE="release: sync from one-ie/template"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --message) MESSAGE="$2"; shift 2 ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
done

# Paid plugins: source is stripped, replaced with a serve-only stub
# Add plugin dir names here as they become x402-gated
PAID_PLUGINS=(plugin-admin)

echo "[release] source: $TEMPLATE_DIR"
echo "[release] target: $TARGET_DIR"
echo "[release] paid plugins (stubbed): ${PAID_PLUGINS[*]}"
$DRY_RUN && echo "[release] DRY RUN — no writes"

# ── 1. Sync everything except node_modules, .do-* state files, and dist ──────
rsync -a --delete \
  --exclude=.git \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.astro \
  --exclude=.wrangler \
  --exclude=.do-worktrees \
  --exclude=.do-trust.json \
  --exclude=.do-digest.md \
  --exclude=.w0-baseline.json \
  --exclude=.w2-spec.json \
  --exclude=.w3-receipts.json \
  --exclude=.w4-improvements.json \
  --exclude=.w2-doc-plan.json \
  --exclude=.bun \
  "$TEMPLATE_DIR/" "$TARGET_DIR/" \
  $( $DRY_RUN && echo "--dry-run" )

# Remove stray artifacts from prior repo structure (excluded files leave empty dirs behind)
$DRY_RUN || rm -rf "$TARGET_DIR/web"

# ── 1.5. Build create/template/ (scaffolder bundles apps/web as its template) ─
if $DRY_RUN; then
  echo "[release] would build create/template/ from apps/web"
else
  echo "[release] building create/template/..."
  rsync -a --delete \
    --exclude=node_modules --exclude=dist --exclude=.astro --exclude=.wrangler \
    "$TARGET_DIR/apps/web/" "$TARGET_DIR/create/template/"
  if command -v bun &>/dev/null; then
    (cd "$TARGET_DIR/create" && bun install --frozen-lockfile 2>/dev/null || bun install && bun run build)
    echo "[release] create/ built ✓"
  else
    echo "[release] WARN: bun not found — create/dist/ skipped; npm create one-app won't work" >&2
  fi
fi

# ── 2. Stub paid plugin source ────────────────────────────────────────────────
for plugin in "${PAID_PLUGINS[@]}"; do
  pkg_dir="$TARGET_DIR/packages/$plugin"
  [[ -d "$pkg_dir/src" ]] || continue

  if $DRY_RUN; then
    echo "[release] would stub $plugin/src/"
    continue
  fi

  # Derive the serves URL: extract string literal if present, else use the standard pattern
  serves_url=$(grep -m1 'serves:.*"https://' "$TEMPLATE_DIR/packages/$plugin/src/index.ts" \
    | grep -o '"https://[^"]*"' | tr -d '"' || true)
  [[ -z "$serves_url" ]] && serves_url="https://one.ie/x/${plugin#plugin-}.js"

  # Replace src/ with a single stub
  rm -rf "$pkg_dir/src"
  mkdir -p "$pkg_dir/src"
  cat > "$pkg_dir/src/index.ts" <<STUB
// This plugin is served via x402 — source is not included in this repo.
// It loads at runtime from the ONE platform.
import type { OnePlugin } from "@oneie/frontend";

export const ${plugin//-/}: () => OnePlugin = () => ({
  name: "${plugin#plugin-}",
  tier: "paid",
  serves: "${serves_url}",
});
STUB
  echo "[release] stubbed $plugin → serves: $serves_url"
done

# ── 3. Commit + push ──────────────────────────────────────────────────────────
if $DRY_RUN; then
  echo "[release] dry run complete — no commit"
  exit 0
fi

cd "$TARGET_DIR"
git add -A
if git diff --cached --quiet; then
  echo "[release] nothing changed — already up to date"
  exit 0
fi

git commit -m "$MESSAGE"
git push origin main
echo "[release] pushed to github.com/one-ie/one"
