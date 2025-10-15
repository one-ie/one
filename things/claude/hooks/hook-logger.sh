#!/bin/bash

# Claude Code Hook Logger
# Handles logging for hook execution with debug mode and performance metrics

LOG_FILE="${LOG_FILE:-.claude/hooks.log}"
DEBUG_MODE="${DEBUG_MODE:-false}"

# Load debug mode from config if available
CONFIG_FILE=".claude/claude-code-hooks.json"
if [ -f "$CONFIG_FILE" ] && command -v jq &> /dev/null; then
  DEBUG_MODE=$(jq -r '.config.debug // false' "$CONFIG_FILE")
fi

# Create log directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Function to log messages
log_message() {
  local level="$1"
  local message="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S.%3N')
  
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
  
  log_message "INFO" "Hook: $hook_name"
  log_message "INFO" "Command: $command"
  log_message "INFO" "Duration: ${duration}ms"
  log_message "INFO" "Exit Code: $exit_code"
  
  # Log performance warning if execution took too long
  if [ "$duration" -gt 5000 ]; then
    log_message "WARN" "Hook execution exceeded 5 seconds"
  fi
}

# Function to get current time in milliseconds
get_time_ms() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - use python for better precision
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

# If called with arguments, log them
if [ $# -gt 0 ]; then
  case "$1" in
    "start")
      log_message "INFO" "Hook execution started: ${2:-unknown}"
      ;;
    "end")
      log_message "INFO" "Hook execution completed: ${2:-unknown}"
      ;;
    "error")
      log_message "ERROR" "${2:-Unknown error}"
      ;;
    "debug")
      if [ "$DEBUG_MODE" = "true" ]; then
        log_message "DEBUG" "${2:-Debug message}"
      fi
      ;;
    *)
      log_message "INFO" "$*"
      ;;
  esac
fi