#!/bin/bash

# Claude Code test execution hook script
# Handles test execution with caching and performance optimization

set -e

# Source the logger
source .claude/hooks/hook-logger.sh

# Configuration
CACHE_DIR=".claude/test-cache"
WORKSPACE="${1:-}"
MODE="${2:-affected}"  # affected, all, or fast
FILE_PATH="${3:-}"

# Log start
log_message "INFO" "Starting test-hook for workspace: ${WORKSPACE:-root}, mode: $MODE"
START_TIME=$(get_time_ms)

# Create cache directory if it doesn't exist
mkdir -p "$CACHE_DIR"

# Function to get cache key for a file or workspace
get_cache_key() {
  local target="$1"
  if [ -f "$target" ]; then
    echo "$(stat -f %m "$target" 2>/dev/null || stat -c %Y "$target" 2>/dev/null || echo 0)"
  else
    echo "$(date +%s)"
  fi
}

# Function to check if tests are cached and still valid
is_cache_valid() {
  local cache_file="$1"
  local cache_key="$2"
  
  if [ -f "$cache_file" ]; then
    local cached_key=$(cat "$cache_file" | head -n1)
    [ "$cached_key" = "$cache_key" ] && return 0
  fi
  return 1
}

# Function to save cache
save_cache() {
  local cache_file="$1"
  local cache_key="$2"
  local exit_code="$3"
  
  echo "$cache_key" > "$cache_file"
  echo "$exit_code" >> "$cache_file"
  echo "$(date)" >> "$cache_file"
}

# Determine test command based on workspace and mode
TEST_CMD=""
CACHE_FILE=""

if [ -n "$WORKSPACE" ]; then
  case "$MODE" in
    "affected")
      TEST_CMD="turbo run test --filter=$WORKSPACE --affected"
      CACHE_FILE="$CACHE_DIR/test-$WORKSPACE-affected.cache"
      ;;
    "all")
      TEST_CMD="turbo run test --filter=$WORKSPACE"
      CACHE_FILE="$CACHE_DIR/test-$WORKSPACE-all.cache"
      ;;
    "fast")
      TEST_CMD="turbo run test --filter=$WORKSPACE --changed"
      CACHE_FILE="$CACHE_DIR/test-$WORKSPACE-fast.cache"
      ;;
  esac
else
  case "$MODE" in
    "affected")
      TEST_CMD="turbo run test --affected"
      CACHE_FILE="$CACHE_DIR/test-root-affected.cache"
      ;;
    "all")
      TEST_CMD="turbo run test"
      CACHE_FILE="$CACHE_DIR/test-root-all.cache"
      ;;
    "fast")
      TEST_CMD="turbo run test --changed"
      CACHE_FILE="$CACHE_DIR/test-root-fast.cache"
      ;;
  esac
fi

# Fallback to bun test if turbo not available
if ! command -v turbo &> /dev/null; then
  log_message "WARN" "Turbo not found, falling back to bun test"
  TEST_CMD="bun test"
  CACHE_FILE="$CACHE_DIR/test-bun.cache"
fi

log_message "INFO" "Test command: $TEST_CMD"

# Check cache if in fast mode
if [ "$MODE" = "fast" ] && [ -n "$FILE_PATH" ]; then
  CACHE_KEY=$(get_cache_key "$FILE_PATH")
  if is_cache_valid "$CACHE_FILE" "$CACHE_KEY"; then
    CACHED_EXIT_CODE=$(sed -n '2p' "$CACHE_FILE")
    log_message "INFO" "Using cached test result: exit code $CACHED_EXIT_CODE"
    echo "✅ Tests cached (no changes detected)"
    
    END_TIME=$(get_time_ms)
    log_hook_execution "test-hook" "$0 $*" "$START_TIME" "$END_TIME" "$CACHED_EXIT_CODE"
    exit "$CACHED_EXIT_CODE"
  fi
fi

# Execute tests
EXIT_CODE=0
if [ -n "$TEST_CMD" ]; then
  echo "Running tests: $TEST_CMD"
  $TEST_CMD || EXIT_CODE=$?
else
  echo "⚠️  No test command configured"
  EXIT_CODE=0
fi

# Save cache
if [ -n "$CACHE_FILE" ] && [ -n "$FILE_PATH" ]; then
  CACHE_KEY=$(get_cache_key "$FILE_PATH")
  save_cache "$CACHE_FILE" "$CACHE_KEY" "$EXIT_CODE"
fi

# Report results
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Tests passed"
  log_message "INFO" "Tests passed successfully"
else
  echo "❌ Tests failed with exit code $EXIT_CODE"
  log_message "ERROR" "Tests failed with exit code $EXIT_CODE"
fi

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "test-hook" "$0 $*" "$START_TIME" "$END_TIME" "$EXIT_CODE"

exit $EXIT_CODE