#!/bin/bash

# Security Hook - ONE Platform
# Protects sensitive files and scans for credentials

set -e

# Source the logger
source "$CLAUDE_PROJECT_DIR/.claude/hooks/hook-logger.sh"

# Configuration
FILE_PATH="${1:-}"
MODE="${2:-protect}"  # protect, scan, audit
ACTION="${3:-warn}"   # warn, block, log

# Sensitive file patterns
SENSITIVE_PATTERNS=(
  "**/.env*"
  "**/secrets/**"
  "**/*secret*"
  "**/.ssh/**"
  "**/*.pem"
  "**/*.p12"
  "**/credentials/**"
  "**/*token*"
)

# Credential regex patterns
CREDENTIAL_PATTERNS=(
  "api[_-]?key[s]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{16,}"
  "secret[_-]?key[s]?\s*[:=]\s*['\"]?[a-zA-Z0-9_-]{16,}"
  "password[s]?\s*[:=]\s*['\"]?[a-zA-Z0-9!@#$%^&*()_+-=]{8,}"
  "Bearer [a-zA-Z0-9_.-]{16,}"
  "mongodb://[a-zA-Z0-9_:/@.-]+"
  "postgres://[a-zA-Z0-9_:/@.-]+"
)

# Log start
log_message "INFO" "security-hook: $MODE mode for ${FILE_PATH:-all files}"
START_TIME=$(get_time_ms)

# Check if file matches sensitive patterns
is_sensitive_file() {
  local file="$1"

  for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    # Convert glob to regex
    local regex=$(echo "$pattern" | sed 's/\*\*/.*/' | sed 's/\*/[^\/]*/')
    if [[ "$file" =~ $regex ]]; then
      return 0
    fi
  done
  return 1
}

# Scan file content for credentials
scan_credentials() {
  local file="$1"

  if [ ! -f "$file" ]; then
    return 0
  fi

  local found=0
  for pattern in "${CREDENTIAL_PATTERNS[@]}"; do
    if grep -qE "$pattern" "$file" 2>/dev/null; then
      local line_num=$(grep -nE "$pattern" "$file" | head -1 | cut -d: -f1)
      echo "⚠️  Line $line_num: Potential credential detected"
      log_message "WARN" "Credential pattern in $file:$line_num"
      found=1
    fi
  done

  return $found
}

# Create audit entry
audit() {
  local file="$1"
  local event="$2"
  local action="$3"

  local audit_file="$CLAUDE_PROJECT_DIR/.claude/security-audit.log"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  echo "[$timestamp] $event | $file | $action" >> "$audit_file"
}

EXIT_CODE=0

case "$MODE" in
  "protect")
    if [ -n "$FILE_PATH" ] && is_sensitive_file "$FILE_PATH"; then
      case "$ACTION" in
        "block")
          echo "🚫 BLOCKED: Cannot modify sensitive file: $FILE_PATH"
          log_message "ERROR" "Blocked: $FILE_PATH"
          audit "$FILE_PATH" "BLOCKED" "sensitive file"
          EXIT_CODE=2
          ;;
        "warn")
          echo "⚠️  WARNING: Modifying sensitive file: $FILE_PATH"
          echo "   Ensure no secrets are being committed"
          log_message "WARN" "Sensitive file modified: $FILE_PATH"
          audit "$FILE_PATH" "WARNED" "sensitive file"
          ;;
        "log")
          log_message "INFO" "Sensitive file access: $FILE_PATH"
          audit "$FILE_PATH" "LOGGED" "sensitive file"
          ;;
      esac
    fi
    ;;

  "scan")
    if [ -n "$FILE_PATH" ] && [ -f "$FILE_PATH" ]; then
      echo "🔍 Scanning $FILE_PATH for credentials..."
      if ! scan_credentials "$FILE_PATH"; then
        echo "✅ No credentials detected"
        audit "$FILE_PATH" "SCAN_PASSED" "clean"
      else
        audit "$FILE_PATH" "SCAN_FAILED" "credentials found"
        if [ "$ACTION" = "block" ]; then
          EXIT_CODE=2
        fi
      fi
    fi
    ;;

  "audit")
    echo "📋 Security Audit Summary"
    local audit_file="$CLAUDE_PROJECT_DIR/.claude/security-audit.log"

    if [ -f "$audit_file" ]; then
      echo "Recent events (last 10):"
      tail -10 "$audit_file"
      echo ""
      echo "Statistics:"
      echo "  Blocked: $(grep -c "BLOCKED" "$audit_file" 2>/dev/null || echo 0)"
      echo "  Warned: $(grep -c "WARNED" "$audit_file" 2>/dev/null || echo 0)"
      echo "  Scans failed: $(grep -c "SCAN_FAILED" "$audit_file" 2>/dev/null || echo 0)"
    else
      echo "No audit log found"
    fi
    ;;

  *)
    echo "❌ Unknown security mode: $MODE"
    EXIT_CODE=1
    ;;
esac

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "security-hook" "$MODE $FILE_PATH" "$START_TIME" "$END_TIME" "$EXIT_CODE"

exit $EXIT_CODE
