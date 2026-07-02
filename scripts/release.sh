#!/usr/bin/env bash
# Release: one-ie/template → apps/one (github.com/one-ie/one) + npm + oo/site
#
# What it does:
#   1. rsync template/ → apps/one/ (excluding private state files)
#   2. Stub any paid plugin source
#   3. Build create/ scaffolder (bundles apps/web as its template)
#   4. git commit + push → github.com/one-ie/one
#   5. npm publish all packages (frontend, design, plugins, create-one-app)
#   6. rsync apps/one/apps/web/ → apps/oo/site/ (keeps the agency node's site current)
#
# Usage:
#   ./scripts/release.sh [--dry-run] [--message "release note"] [--skip-npm] [--no-push]
#   --no-push commits locally in apps/one but does not push or publish to npm
#   (npm publish still runs unless --skip-npm is also passed — pass both to
#   fully stage a release without any public-facing effect)
#
# Requires:
#   - apps/one cloned at ../../apps/one (relative to one-ie/template)
#   - apps/oo cloned at ../../apps/oo
#   - npm logged in with @oneie publish rights (npm whoami)

set -euo pipefail

TEMPLATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET_DIR="$(cd "$TEMPLATE_DIR/../../apps/one" 2>/dev/null && pwd)" || {
  echo "ERROR: apps/one not found. Clone it first:" >&2
  echo "  git clone git@github.com:one-ie/one.git $(dirname "$TEMPLATE_DIR")/apps/one" >&2
  exit 1
}

DRY_RUN=false
SKIP_NPM=false
NO_PUSH=false
BUMP=""
MESSAGE="release: sync from one-ie/template"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run)          DRY_RUN=true; shift ;;
    --skip-npm)         SKIP_NPM=true; shift ;;
    --no-push)          NO_PUSH=true; shift ;;
    --bump)             BUMP="${2:-patch}"; shift 2 ;;
    --bump=*)           BUMP="${1#--bump=}"; shift ;;
    --message)          MESSAGE="$2"; shift 2 ;;
    *) echo "Unknown flag: $1" >&2; exit 1 ;;
  esac
done

# Validate bump value if provided
if [[ -n "$BUMP" ]] && [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
  echo "ERROR: --bump must be patch|minor|major (got: $BUMP)" >&2; exit 1
fi

OO_DIR="$(cd "$TEMPLATE_DIR/../../apps/oo" 2>/dev/null && pwd)" || {
  echo "WARN: apps/oo not found — will skip oo/site sync" >&2
  OO_DIR=""
}

# Paid plugins whose SOURCE is secret — stripped and replaced with a serve-only stub.
# plugin-admin is intentionally NOT listed here: its source is a thin public loader.
# The secret is the served UI at one.ie/x/admin.js, which lives in pay/backend/ (private).
# Only add a plugin here if its package/src/ contains proprietary logic that must not ship.
PAID_PLUGINS=()

echo "[release] source: $TEMPLATE_DIR"
echo "[release] target: $TARGET_DIR"
echo "[release] paid plugins (stubbed): ${PAID_PLUGINS[*]:-none}"
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
# Clean up any directory names that changed between releases (rsync --delete misses these
# when they contain excluded files that prevent deletion)
$DRY_RUN || rm -rf "$TARGET_DIR/packages/config"

if (( ${#PAID_PLUGINS[@]} > 0 )); then
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

    # Derive camelCase function name: plugin-foo-bar → fooBarPanel
    fn_name=$(echo "${plugin#plugin-}" | sed 's/-\([a-z]\)/\U\1/g')Panel

    # Replace src/ with a single stub
    rm -rf "$pkg_dir/src"
    mkdir -p "$pkg_dir/src"
    cat > "$pkg_dir/src/index.ts" <<STUB
// This plugin is served via x402 — source is not included in this repo.
// It loads at runtime from the ONE platform.
import type { OnePlugin } from "@oneie/frontend";

export function ${fn_name}(): OnePlugin {
  return {
    name: "${plugin}",
    tier: "paid",
    serves: "${serves_url}",
    entitlement: "${plugin#plugin-}",
  };
}
STUB
    echo "[release] stubbed $plugin → serves: $serves_url"
  done
fi

# ── 3. Commit + push ──────────────────────────────────────────────────────────
if $DRY_RUN; then
  echo "[release] dry run complete — no commit"
  exit 0
fi

cd "$TARGET_DIR"
git add -A
if git diff --cached --quiet; then
  echo "[release] nothing changed — already up to date"
else
  git commit -m "$MESSAGE"
  if $NO_PUSH; then
    echo "[release] --no-push: committed locally in $TARGET_DIR, not pushed"
  else
    # Ensure HTTPS remote (SSH may fail without agent; HTTPS uses stored credentials)
    git remote set-url origin https://github.com/one-ie/one.git
    git push origin main
    echo "[release] pushed to github.com/one-ie/one"
  fi
fi

# ── 4. Publish npm packages ───────────────────────────────────────────────────
# create-one-app is omitted — superseded by `npx oneie create site`
NPM_PACKAGES=(
  packages/design
  packages/frontend
  packages/plugin-auth
  packages/plugin-backend
  packages/plugin-chat
  packages/plugin-track
  packages/plugin-premium
  packages/plugin-admin
)

if $SKIP_NPM; then
  echo "[release] --skip-npm: skipping npm publish"
elif $DRY_RUN; then
  echo "[release] would publish (bump=${BUMP:-none}): ${NPM_PACKAGES[*]}"
else
  # Auth check before doing any work
  npm_user=$(npm whoami 2>/dev/null) || {
    echo "ERROR: not logged in to npm. Run: npm login" >&2; exit 1
  }
  echo "[release] publishing as: $npm_user"

  for pkg in "${NPM_PACKAGES[@]}"; do
    pkg_dir="$TARGET_DIR/$pkg"
    pkg_name=$(node -p "require('$pkg_dir/package.json').name" 2>/dev/null || echo "$pkg")
    echo "  publishing $pkg_name..."
    if [[ -n "$BUMP" ]]; then
      (cd "$pkg_dir" && npm version "$BUMP" --no-git-tag-version --no-commit-hooks 2>/dev/null) \
        || echo "    WARN: version bump failed for $pkg_name"
    fi
    (cd "$pkg_dir" && npm publish --access public) \
      && echo "  ✓ $pkg_name" \
      || { echo "  ERROR: $pkg_name publish failed" >&2; exit 1; }
  done
  echo "[release] npm publish complete"
fi

# ── 5. Sync apps/web → apps/oo/site/ ─────────────────────────────────────────
if [[ -n "$OO_DIR" ]]; then
  if $DRY_RUN; then
    echo "[release] would sync apps/web → $OO_DIR/site/"
  else
    echo "[release] syncing apps/web → oo/site/..."
    rsync -a --delete \
      --exclude=node_modules --exclude=dist --exclude=.astro --exclude=.wrangler \
      "$TARGET_DIR/apps/web/" "$OO_DIR/site/"
    cd "$OO_DIR"
    git add site/
    if ! git diff --cached --quiet; then
      git commit -m "chore(site): sync from one-ie/template apps/web"
      git push origin main
      echo "[release] oo/site synced + pushed"
    else
      echo "[release] oo/site already in sync"
    fi
  fi
fi

echo "[release] done"
