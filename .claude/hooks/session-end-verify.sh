#!/bin/bash
# SESSION-END VERIFY — Report regressions introduced during session
#
# Runs on Stop (session end). Non-blocking — just reports.
# Lets human see what might have broken without blocking the session.
# Emits hook:session-end:{ok,warn} signal per Rule 1 (see .claude/skills/signal.md).

# shellcheck source=lib/signal.sh
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/signal.sh"

cd "$CLAUDE_PROJECT_DIR" || exit 0

echo ""
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│ SESSION-END VERIFICATION                                    │"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""

# Run only biome (fast, ~0.3s). Skip tsc/vitest to avoid blocking session exit.
RESULT=$(bun biome check . 2>&1)
EXIT=$?

if [ $EXIT -eq 0 ]; then
  echo "✓ All checks passed. Baseline is green."
  echo ""
  emit_signal "hook:session-end:ok" 1 "biome=clean"
  exit 0
fi

# Extract test counts
PASSED=$(echo "$RESULT" | grep -o '[0-9]* pass' | head -1 | awk '{print $1}')
FAILED=$(echo "$RESULT" | grep -o '[0-9]* fail' | head -1 | awk '{print $1}')
ERRORS=$(echo "$RESULT" | grep -c "error TS" || echo "0")

echo "⚠ Issues detected:"
if [ -n "$FAILED" ] && [ "$FAILED" -gt 0 ]; then
  echo "  · Tests: $FAILED failed (was passing before?)"
fi
if [ "$ERRORS" -gt 0 ]; then
  echo "  · TypeScript: $ERRORS type errors"
fi

echo ""
echo "Next session should start with: bun run verify"
echo ""

# Mild warn — baseline dirty but session continuing
emit_signal "hook:session-end:warn" -0.5 "failed=${FAILED:-0} errors=${ERRORS:-0}"

# Non-blocking — always exit 0
exit 0
