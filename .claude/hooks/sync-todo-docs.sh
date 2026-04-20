#!/bin/bash
# SYNC-TODO-DOCS — Keep TODO.md + todo.json in sync with TODO-*.md edits.
#
# Fires after Write/Edit on any docs/TODO*.md file.
# Best-effort, non-blocking: pings POST /api/tasks/sync on the dev server
# if it's running (full pipeline: KV → TypeDB → regenerate TODO.md + todo.json).
# If the dev server isn't up, we silently skip — the sandwich's deterministic
# PRE check fails closed without breaking the edit flow.
#
# The dev server does all the real work; this hook is just a trigger.
# To run the full sync manually: `/sync` (or `POST /api/tasks/sync`).
# Emits hook:todo-sync:{ok,dissolved} signal per Rule 1 (see .claude/skills/signal.md).

# shellcheck source=lib/signal.sh
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/signal.sh"

FILE=$(echo "$1" | jq -r '.tool_input.file_path // .tool_input.path // empty' 2>/dev/null)

# Only fire for TODO markdown files under docs/
case "$FILE" in
  */docs/TODO*.md) ;;
  *) exit 0 ;;
esac

# Don't recurse: if the edit IS TODO.md itself, it was likely regenerated. Skip.
case "$FILE" in
  */docs/TODO.md) exit 0 ;;
esac

# Best-effort POST with a 2s cap so edits stay snappy.
# Silently swallow all output — this is a background sync, not a gate.
DEV_URL="${ONE_DEV_URL:-http://localhost:4321}"
RESP=$(curl -s -o /dev/null -w "%{http_code}" \
  --max-time 2 \
  -X POST "${DEV_URL}/api/tasks/sync" 2>/dev/null)

BASE=$(basename "$FILE")
if [ "$RESP" = "200" ]; then
  echo "todo-sync: regenerated TODO.md + todo.json from $BASE" >&2
  emit_signal "hook:todo-sync:ok" 1 "file=$BASE"
else
  # Server down/timeout/error → dissolved (missing unit semantics, mild warn)
  emit_signal "hook:todo-sync:dissolved" -0.5 "file=$BASE http=$RESP"
fi

exit 0
