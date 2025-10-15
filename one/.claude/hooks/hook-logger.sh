#!/bin/bash

# Claude Code Hook Logger - ONE Platform
# Handles logging for hook execution with debug mode and performance metrics

LOG_FILE="${LOG_FILE:-$CLAUDE_PROJECT_DIR/.claude/hooks.log}"
DEBUG_MODE="${DEBUG_MODE:-false}"

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log messages
log_message() {
  local level="$1"
  local message="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

  echo "[$timestamp] [$level] $message" >> "$LOG_FILE"

  if [ "$DEBUG_MODE" = "true" ]; then
    echo "[$timestamp] [$level] $message" >&2
  fi
}

# Function to log hook execution
log_hook_execution() {
  local hook_name="$1"
  local command="$2"
  local start_time="$3"
  local end_time="$4"
  local exit_code="$5"

  local duration=$((end_time - start_time))

  log_message "INFO" "Hook: $hook_name | Duration: ${duration}ms | Exit: $exit_code"

  # Log performance warning if execution took too long
  if [ "$duration" -gt 5000 ]; then
    log_message "WARN" "Hook execution exceeded 5 seconds: $hook_name"
  fi
}

# Function to get current time in milliseconds
get_time_ms() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    python3 -c "import time; print(int(time.time() * 1000))" 2>/dev/null || echo $(($(date +%s) * 1000))
  else
    # Linux
    echo $(($(date +%s%N) / 1000000))
  fi
}

# Export functions for use in other scripts
export -f log_message
export -f log_hook_execution
export -f get_time_ms
export LOG_FILE
export DEBUG_MODE
