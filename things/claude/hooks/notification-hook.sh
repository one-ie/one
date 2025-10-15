#!/bin/bash

# Claude Code notification hook script
# Handles custom notifications for development feedback

set -e

# Source the logger
source .claude/hooks/hook-logger.sh

# Configuration
EVENT="${1:-}"
MESSAGE="${2:-}"
TYPE="${3:-info}"  # info, success, warning, error
CHANNEL="${4:-console}"  # console, system, file, webhook

# Log start
log_message "INFO" "Starting notification-hook for event: $EVENT, type: $TYPE, channel: $CHANNEL"
START_TIME=$(get_time_ms)

# Function to send console notification
send_console_notification() {
  local msg="$1"
  local type="$2"
  
  case "$type" in
    "success")
      echo "✅ $msg"
      ;;
    "warning")
      echo "⚠️  $msg"
      ;;
    "error")
      echo "❌ $msg"
      ;;
    "info"|*)
      echo "ℹ️  $msg"
      ;;
  esac
}

# Function to send system notification (macOS/Linux)
send_system_notification() {
  local title="$1"
  local msg="$2"
  local type="$3"
  
  if command -v osascript &> /dev/null; then
    # macOS
    osascript -e "display notification \"$msg\" with title \"Claude Code - $title\""
  elif command -v notify-send &> /dev/null; then
    # Linux
    local icon=""
    case "$type" in
      "success") icon="dialog-information" ;;
      "warning") icon="dialog-warning" ;;
      "error") icon="dialog-error" ;;
      *) icon="dialog-information" ;;
    esac
    notify-send --icon="$icon" "Claude Code - $title" "$msg"
  else
    # Fallback to console
    send_console_notification "$title: $msg" "$type"
  fi
}

# Function to save notification to file
save_notification_to_file() {
  local msg="$1"
  local type="$2"
  local event="$3"
  
  local notification_file=".claude/notifications.log"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  echo "[$timestamp] [$type] [$event] $msg" >> "$notification_file"
}

# Function to send webhook notification
send_webhook_notification() {
  local msg="$1"
  local type="$2"
  local event="$3"
  local webhook_url="$4"
  
  if [ -n "$webhook_url" ] && command -v curl &> /dev/null; then
    local payload="{\"event\":\"$event\",\"type\":\"$type\",\"message\":\"$msg\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"}"
    
    curl -s -X POST \
         -H "Content-Type: application/json" \
         -d "$payload" \
         "$webhook_url" >/dev/null 2>&1 || true
         
    log_message "INFO" "Webhook notification sent to $webhook_url"
  else
    log_message "WARN" "Webhook notification failed - curl not available or no URL configured"
  fi
}

# Predefined notification templates
get_notification_template() {
  local event="$1"
  
  case "$event" in
    "build-start")
      echo "Build process started"
      ;;
    "build-success")
      echo "Build completed successfully"
      ;;
    "build-failure")
      echo "Build failed - check logs for details"
      ;;
    "test-start")
      echo "Running tests..."
      ;;
    "test-success")
      echo "All tests passed"
      ;;
    "test-failure")
      echo "Some tests failed"
      ;;
    "lint-success")
      echo "Code linting passed"
      ;;
    "lint-failure")
      echo "Linting issues found"
      ;;
    "security-warning")
      echo "Security warning - sensitive file modification detected"
      ;;
    "security-block")
      echo "Security block - sensitive file modification prevented"
      ;;
    "session-start")
      echo "Claude Code session started"
      ;;
    "session-end")
      echo "Claude Code session ended"
      ;;
    *)
      echo "$MESSAGE"
      ;;
  esac
}

EXIT_CODE=0

# Determine notification message
NOTIFICATION_MESSAGE="${MESSAGE:-$(get_notification_template "$EVENT")}"

# Send notification based on channel
case "$CHANNEL" in
  "console")
    send_console_notification "$NOTIFICATION_MESSAGE" "$TYPE"
    ;;
    
  "system")
    send_system_notification "$EVENT" "$NOTIFICATION_MESSAGE" "$TYPE"
    ;;
    
  "file")
    save_notification_to_file "$NOTIFICATION_MESSAGE" "$TYPE" "$EVENT"
    ;;
    
  "webhook")
    # Check for webhook URL in environment or config
    WEBHOOK_URL="${CLAUDE_HOOKS_WEBHOOK_URL:-}"
    if [ -z "$WEBHOOK_URL" ]; then
      # Try to get from config file
      CONFIG_FILE=".claude/claude-code-hooks.json"
      if [ -f "$CONFIG_FILE" ] && command -v jq &> /dev/null; then
        WEBHOOK_URL=$(jq -r '.config.webhookUrl // empty' "$CONFIG_FILE" 2>/dev/null || echo "")
      fi
    fi
    
    send_webhook_notification "$NOTIFICATION_MESSAGE" "$TYPE" "$EVENT" "$WEBHOOK_URL"
    ;;
    
  "all")
    send_console_notification "$NOTIFICATION_MESSAGE" "$TYPE"
    save_notification_to_file "$NOTIFICATION_MESSAGE" "$TYPE" "$EVENT"
    send_system_notification "$EVENT" "$NOTIFICATION_MESSAGE" "$TYPE"
    ;;
    
  *)
    echo "❌ Unknown notification channel: $CHANNEL"
    log_message "ERROR" "Unknown notification channel: $CHANNEL"
    EXIT_CODE=1
    ;;
esac

# Always log the notification
if [ $EXIT_CODE -eq 0 ]; then
  log_message "INFO" "Notification sent: $EVENT - $NOTIFICATION_MESSAGE"
else
  log_message "ERROR" "Notification failed: $EVENT - $NOTIFICATION_MESSAGE"
fi

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "notification-hook" "$0 $*" "$START_TIME" "$END_TIME" "$EXIT_CODE"

exit $EXIT_CODE