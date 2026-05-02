#!/usr/bin/env bash
# Install a git pre-commit hook that runs `bun run verify` (astro check + tsc).
# Idempotent — safe to re-run. No deps (no husky, no lint-staged).

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
  echo "✗ not in a git repo" >&2
  exit 1
}

HOOK="$REPO_ROOT/.git/hooks/pre-commit"
WEB_DIR_REL="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR_REL="${WEB_DIR_REL#$REPO_ROOT/}"

cat > "$HOOK" <<EOF
#!/usr/bin/env bash
# auto-installed by web/scripts/install-hooks.sh — runs verify before each commit.
# Skip with: git commit --no-verify (only when you mean it).
set -e
echo "→ verify ($WEB_DIR_REL): tsc --noEmit"
cd "\$(git rev-parse --show-toplevel)/$WEB_DIR_REL"
bun run verify
EOF

chmod +x "$HOOK"
echo "✓ pre-commit hook installed → $HOOK"
echo "  runs: cd $WEB_DIR_REL && bun run verify"
