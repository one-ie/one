#!/bin/bash

# Claude Code Hook Debouncer
# Prevents rapid successive hook executions

DEBOUNCE_DIR=".claude/debounce"
HOOK_NAME="$1"
DEBOUNCE_TIME="${2:-2}"  # Default 2 seconds
shift 2
COMMAND="$*"

# Create debounce directory
mkdir -p "$DEBOUNCE_DIR"

LOCK_FILE="$DEBOUNCE_DIR/$HOOK_NAME.lock"
TIMESTAMP_FILE="$DEBOUNCE_DIR/$HOOK_NAME.timestamp"

# Function to check if enough time has passed
should_execute() {
  if [ ! -f "$TIMESTAMP_FILE" ]; then
    return 0  # First execution
  fi
  
  local last_execution=$(cat "$TIMESTAMP_FILE" 2>/dev/null || echo 0)
  local current_time=$(date +%s)
  local time_diff=$((current_time - last_execution))
  
  [ $time_diff -ge $DEBOUNCE_TIME ]
}

# Function to update timestamp
update_timestamp() {
  echo "$(date +%s)" > "$TIMESTAMP_FILE"
}

# Check if we should execute
if should_execute; then
  # Acquire lock
  if ! mkdir "$LOCK_FILE" 2>/dev/null; then
    echo "Hook $HOOK_NAME is already running, skipping..."
    exit 0
  fi
  
  # Set trap to cleanup lock on exit
  trap 'rmdir "$LOCK_FILE" 2>/dev/null' EXIT
  
  # Update timestamp
  update_timestamp
  
  # Execute command
  echo "Executing debounced hook: $HOOK_NAME"
  eval "$COMMAND"
  exit_code=$?
  
  # Cleanup lock
  rmdir "$LOCK_FILE" 2>/dev/null
  
  exit $exit_code
else
  echo "Hook $HOOK_NAME debounced (executed recently)"
  exit 0
fi