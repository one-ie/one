#!/usr/bin/env bash
# verify-foundation.sh — the plan kill-switch
# Chains: build + typecheck (BaaS + standalone) + strip-guard + entitlement 402
# Exit 0 = plan outcome met. Used by /do to gate plan close.
#
# STUBS: entitlement check is wired in C4; standalone mode in C5.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "=== ONE Frontend — verify-foundation.sh ==="

# 1. Build (BaaS mode — default)
echo ""
echo "[1/4] Build (BaaS mode)..."
cd apps/web
bun run build
echo "  PASS"

# 2. Typecheck
echo ""
echo "[2/4] Typecheck..."
bun run typecheck
echo "  PASS"

# 2b. Standalone mode build (no API key) — build is key-independent (key is a runtime
# CF binding, not read at build time); this is a regression check, not a mode divergence.
echo ""
echo "[2b/4] Standalone mode build (no API key)..."
ONE_API_KEY="" bun run build
echo "  PASS"
cd ../..

# 3. STRIP guard
echo ""
echo "[3/4] STRIP guard..."
bash scripts/strip-guard.sh

# 4. Entitlement gate (stub until C4)
echo ""
echo "[4/4] Entitlement gate + paid plugin (402 without claim)..."
bun vitest run tests/entitlement.test.ts tests/admin.test.ts
echo "  PASS"

echo ""
echo "=== verify-foundation.sh: PASS ==="
