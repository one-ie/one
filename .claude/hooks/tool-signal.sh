#!/usr/bin/env bash
# Tool-call signal emitter — PostToolUse hook.
# Emits tool:<ToolName>:{ok,fail} with +1/-1 weight. Receiver + weight
# semantics: .claude/skills/signal.md.

# shellcheck source=lib/signal.sh
source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/signal.sh"

PAYLOAD="$1"
[[ -z "$PAYLOAD" ]] && exit 0

TOOL=$(echo "$PAYLOAD" | jq -r '.tool_name // empty' 2>/dev/null)
[[ -z "$TOOL" ]] && exit 0

# Receiver must match ^[a-zA-Z0-9:_-]+$ (validateUid in signal.ts).
# MCP tools (mcp__server__tool) contain underscores — still safe.
SAFE_TOOL="${TOOL//[^a-zA-Z0-9_-]/}"
[[ -z "$SAFE_TOOL" ]] && exit 0

# Outcome: error field → fail; Bash non-zero or interrupted → fail; else ok
ERROR=$(echo "$PAYLOAD" | jq -r '.tool_response.error // empty' 2>/dev/null)
OUTCOME="ok"
WEIGHT=1

if [[ -n "$ERROR" ]]; then
  OUTCOME="fail"; WEIGHT=-1
elif [[ "$TOOL" == "Bash" ]]; then
  EXIT_CODE=$(echo "$PAYLOAD" | jq -r '.tool_response.exit_code // .tool_response.returncode // 0' 2>/dev/null)
  INTERRUPTED=$(echo "$PAYLOAD" | jq -r '.tool_response.interrupted // false' 2>/dev/null)
  [[ "$EXIT_CODE" != "0" || "$INTERRUPTED" == "true" ]] && { OUTCOME="fail"; WEIGHT=-1; }
fi

# Human-greppable crumb per tool family. Not structured — don't serialize objects.
DATA=""
case "$TOOL" in
  Write|Edit|MultiEdit|Read|NotebookEdit)
    FILE=$(echo "$PAYLOAD" | jq -r '.tool_input.file_path // .tool_input.notebook_path // .tool_input.path // empty' 2>/dev/null)
    [[ -n "$FILE" ]] && DATA="file=$(basename "$FILE")" ;;
  Bash)
    CMD=$(echo "$PAYLOAD" | jq -r '.tool_input.command // empty' 2>/dev/null | head -c 60 | tr '\n' ' ')
    [[ -n "$CMD" ]] && DATA="cmd=$CMD" ;;
  Grep|Glob)
    PATTERN=$(echo "$PAYLOAD" | jq -r '.tool_input.pattern // empty' 2>/dev/null | head -c 40)
    [[ -n "$PATTERN" ]] && DATA="pattern=$PATTERN" ;;
esac

emit_signal "tool:${SAFE_TOOL}:${OUTCOME}" "$WEIGHT" "$DATA"
exit 0
