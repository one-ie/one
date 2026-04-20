#!/usr/bin/env bash
# Shared signal emitter. Source from any hook:
#   source "$CLAUDE_PROJECT_DIR/.claude/hooks/lib/signal.sh"
#   emit_signal <receiver> <weight> [key=value ...]
#
# Fire-and-forget POST to /api/signal (2s max, backgrounded). Never blocks.
# Receiver naming + weight semantics: .claude/skills/signal.md

emit_signal() {
  local receiver="$1"
  local weight="${2:-1}"
  shift 2 || true
  local data="$*"

  # JSON-escape data (backslash + double-quote)
  data="${data//\\/\\\\}"
  data="${data//\"/\\\"}"

  local url="${ONE_API_URL:-http://localhost:4321}/api/signal"

  # Backgrounded, silent, non-blocking. Telemetry failure never breaks tooling.
  curl -sS -o /dev/null --max-time 2 -X POST "$url" \
    -H 'Content-Type: application/json' \
    -d "{\"sender\":\"hook\",\"receiver\":\"$receiver\",\"amount\":$weight,\"data\":\"$data\"}" \
    >/dev/null 2>&1 &

  return 0
}
