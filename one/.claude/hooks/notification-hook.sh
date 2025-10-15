#!/bin/bash

# Notification Hook - ONE Platform
# Sends development notifications via console, system, or file

set -e

# Source the logger
source "$CLAUDE_PROJECT_DIR/.claude/hooks/hook-logger.sh"

# Configuration
EVENT="${1:-}"
MESSAGE="${2:-}"
TYPE="${3:-info}"        # info, success, warning, error
CHANNEL="${4:-console}"  # console, system, file, all

# Log start
log_message "INFO" "notification-hook: $EVENT ($TYPE) via $CHANNEL"
START_TIME=$(get_time_ms)

# Console notification
send_console() {
  local msg="$1"
  local type="$2"

  case "$type" in
    "success") echo "✅ $msg" ;;
    "warning") echo "⚠️  $msg" ;;
    "error")   echo "❌ $msg" ;;
    *)         echo "ℹ️  $msg" ;;
  esac
}

# System notification (macOS/Linux)
send_system() {
  local title="$1"
  local msg="$2"

  if command -v osascript &> /dev/null; then
    # macOS
    osascript -e "display notification \"$msg\" with title \"ONE Platform - $title\"" 2>/dev/null || true
  elif command -v notify-send &> /dev/null; then
    # Linux
    notify-send "ONE Platform - $title" "$msg" 2>/dev/null || true
  else
    # Fallback to console
    send_console "$title: $msg" "info"
  fi
}

# File notification
send_file() {
  local msg="$1"
  local type="$2"

  local notif_file="$CLAUDE_PROJECT_DIR/.claude/notifications.log"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  echo "[$timestamp] [$type] $msg" >> "$notif_file"
}

# Notification templates
get_template() {
  case "$1" in
    "build-start")    echo "Build process started" ;;
    "build-success")  echo "Build completed successfully" ;;
    "build-failure")  echo "Build failed" ;;
    "test-success")   echo "All tests passed" ;;
    "test-failure")   echo "Some tests failed" ;;
    "security-warning") echo "Security warning detected" ;;
    "security-block")   echo "Security block - operation prevented" ;;
    "session-start")  echo "Claude Code session started" ;;
    "session-end")    echo "Claude Code session ended" ;;
    *)                echo "${MESSAGE:-$1}" ;;
  esac
}

EXIT_CODE=0
NOTIFICATION_MESSAGE=$(get_template "$EVENT")

# Send notification
case "$CHANNEL" in
  "console")
    send_console "$NOTIFICATION_MESSAGE" "$TYPE"
    ;;
  "system")
    send_system "$EVENT" "$NOTIFICATION_MESSAGE"
    ;;
  "file")
    send_file "$NOTIFICATION_MESSAGE" "$TYPE"
    ;;
  "all")
    send_console "$NOTIFICATION_MESSAGE" "$TYPE"
    send_system "$EVENT" "$NOTIFICATION_MESSAGE"
    send_file "$NOTIFICATION_MESSAGE" "$TYPE"
    ;;
  *)
    echo "❌ Unknown channel: $CHANNEL"
    EXIT_CODE=1
    ;;
esac

# Log notification
if [ $EXIT_CODE -eq 0 ]; then
  log_message "INFO" "Notification sent: $EVENT"
fi

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "notification-hook" "$EVENT $CHANNEL" "$START_TIME" "$END_TIME" "$EXIT_CODE"

exit $EXIT_CODE
