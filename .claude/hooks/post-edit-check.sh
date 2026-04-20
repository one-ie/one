#!/bin/bash
# POST-EDIT CHECK — The deterministic sandwich around every file change
#
# Runs after Write/Edit. Checks the touched file with biome.
# Non-blocking (exit 0) — reports issues as warnings, doesn't halt.
# The W4 verify step does the blocking check.
# Emits hook:post-edit:{ok,warn} signal per Rule 1 (see .claude/skills/signal.md).

# shellcheck source=lib/signal.sh
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/signal.sh"

FILE=$(echo "$1" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

# Only check .ts/.tsx/.js/.jsx files
if [[ -z "$FILE" ]] || [[ ! "$FILE" =~ \.(ts|tsx|js|jsx)$ ]]; then
  exit 0
fi

# Quick biome lint on the single file (non-blocking)
RESULT=$(cd "$CLAUDE_PROJECT_DIR" && bun biome check "$FILE" 2>&1)
EXIT=$?

BASE=$(basename "$FILE")
if [ $EXIT -ne 0 ]; then
  ISSUES=$(echo "$RESULT" | grep -c "━━━" 2>/dev/null || echo "?")
  echo "biome: ${ISSUES} issues in $BASE" >&2
  emit_signal "hook:post-edit:warn" -0.5 "file=$BASE issues=$ISSUES"
else
  emit_signal "hook:post-edit:ok" 1 "file=$BASE"
fi

exit 0  # Never block — just inform
