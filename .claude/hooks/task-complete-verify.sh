#!/bin/bash
# TASK-COMPLETE VERIFY — The W4 Gate
#
# Runs on TaskCompleted. Blocks task mark if tests regress.
# This is the gate between signal and pheromone — prevents corruption.
#
# Exit 0 = task marked (all checks pass)
# Exit 1 = task blocked (tests regressed or type errors detected)
# Emits hook:w4-verify:{ok,fail} signal per Rule 1 (see .claude/skills/signal.md).

# shellcheck source=lib/signal.sh
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/signal.sh"

cd "$CLAUDE_PROJECT_DIR" || exit 1

# Run the full verify suite
RESULT=$(bun run verify 2>&1)
EXIT=$?

# Extract test counts (used in both branches for the signal payload)
PASSED=$(echo "$RESULT" | grep -o '[0-9]* pass' | head -1 | awk '{print $1}')
FAILED=$(echo "$RESULT" | grep -o '[0-9]* fail' | head -1 | awk '{print $1}')
ERRORS=$(echo "$RESULT" | grep -c "error TS" || echo "0")

if [ $EXIT -eq 0 ]; then
  # All checks passed — mark with deterministic receipts (Rule 3)
  emit_signal "hook:w4-verify:ok" 1 "passed=${PASSED:-0} failed=0 errors=0"
  exit 0
fi

# Verify failed — extract details
echo "W4 GATE BLOCKED: Verification failed" >&2
echo "" >&2

if [ -n "$FAILED" ] && [ "$FAILED" -gt 0 ]; then
  echo "Tests: $FAILED failed" >&2
fi
if [ "$ERRORS" -gt 0 ]; then
  echo "TypeScript: $ERRORS type errors" >&2
fi

# Show last 15 lines of output for context
echo "" >&2
echo "Last output:" >&2
echo "$RESULT" | tail -15 >&2
echo "" >&2
echo "Fix baseline before marking task done." >&2

# Full warn — tests actually regressed, agent produced nothing usable
emit_signal "hook:w4-verify:fail" -1 "passed=${PASSED:-0} failed=${FAILED:-0} errors=${ERRORS:-0}"

exit 1
