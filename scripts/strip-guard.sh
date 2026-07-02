#!/usr/bin/env bash
# strip-guard.sh — CI gate: 0 moat/do-engine source in site
# Run: bash scripts/strip-guard.sh
# Exit 1 on violation.
#
# TypeDB in COMMENTS is allowed (explains why D1 is used instead) — code refs are not.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "STRIP guard — checking site/src/ for moat source..."

# Check for client-side substrate classes/globals (never allowed, even in comments)
VIOLATIONS=$(grep -rn \
  "SubstrateClient\|suiWallet\|workspaceContext\|ChatDock\|ChatHost\|GATEWAY_API_KEY\|SUI_WALLET" \
  site/src/ 2>/dev/null || true)

if [ -n "$VIOLATIONS" ]; then
  echo "FAIL: moat source found in site/src/"
  echo "$VIOLATIONS"
  exit 1
fi

# Check TypeDB in non-comment code lines only
TYPEDB_CODE=$(grep -rn "TypeDB" site/src/ 2>/dev/null \
  | grep -v "^\s*//" \
  | grep -v ":[[:space:]]*//" \
  | grep -v ":[[:space:]]*\*" \
  | grep -v "<!--" \
  || true)

if [ -n "$TYPEDB_CODE" ]; then
  echo "FAIL: TypeDB import/usage found in non-comment code:"
  echo "$TYPEDB_CODE"
  exit 1
fi

echo "Checking .claude/ for /do-engine files..."

DO_ENGINE_VIOLATIONS=$(grep -rn \
  "w1-recon\|w2-decide\|w3-edit\|w4-verify\|do-auto\|do-reconcile\|do-tier\|gate-guard\|sync-todo-docs\|task-complete-verify" \
  .claude/ 2>/dev/null || true)

if [ -n "$DO_ENGINE_VIOLATIONS" ]; then
  echo "FAIL: /do-engine files found in .claude/"
  echo "$DO_ENGINE_VIOLATIONS"
  exit 1
fi

echo "STRIP guard: PASS — 0 moat/do-engine source in site + .claude/"
