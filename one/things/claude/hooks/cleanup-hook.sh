#!/bin/bash

# Claude Code cleanup hook script
# Handles session cleanup and temporary file management

set -e

# Source the logger
source .claude/hooks/hook-logger.sh

# Configuration
MODE="${1:-session}"  # session, temp, cache, all
FORCE="${2:-false}"   # force cleanup even if files are recent

# Cleanup targets
TEMP_DIRS=(
  ".tmp"
  ".claude-cache"
  ".claude/test-cache"
  ".claude/debounce"
  ".turbo/cache"
)

TEMP_FILES=(
  ".claude/*.lock"
  ".claude/*.tmp"
  ".claude/*.temp"
  ".claude/hooks.log.old"
)

LOG_FILES_TO_ROTATE=(
  ".claude/hooks.log"
  ".claude/security-audit.log"
  ".claude/notifications.log"
)

# Log start
log_message "INFO" "Starting cleanup-hook with mode: $MODE, force: $FORCE"
START_TIME=$(get_time_ms)

# Function to safely remove directory
safe_remove_dir() {
  local dir="$1"
  
  if [ -d "$dir" ]; then
    local file_count=$(find "$dir" -type f | wc -l)
    
    if [ "$FORCE" = "true" ] || [ "$file_count" -eq 0 ]; then
      log_message "INFO" "Removing directory: $dir"
      rm -rf "$dir" 2>/dev/null || log_message "WARN" "Failed to remove directory: $dir"
      echo "🗑️  Cleaned directory: $dir"
    else
      # Only remove files older than 1 hour
      find "$dir" -type f -mtime +0.04 -delete 2>/dev/null || true
      local remaining=$(find "$dir" -type f | wc -l)
      if [ "$remaining" -eq 0 ]; then
        rmdir "$dir" 2>/dev/null || true
      fi
      echo "🧹 Cleaned old files from: $dir"
    fi
  fi
}

# Function to safely remove files
safe_remove_files() {
  local pattern="$1"
  
  # Use find with -path to handle glob patterns safely
  local base_dir=$(dirname "$pattern")
  local file_pattern=$(basename "$pattern")
  
  if [ -d "$base_dir" ]; then
    find "$base_dir" -name "$file_pattern" -type f -delete 2>/dev/null || true
    echo "🗑️  Cleaned files matching: $pattern"
  fi
}

# Function to rotate log files
rotate_log_file() {
  local log_file="$1"
  local max_size=10485760  # 10MB in bytes
  
  if [ -f "$log_file" ]; then
    local file_size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null || echo 0)
    
    if [ "$file_size" -gt "$max_size" ]; then
      local backup_file="${log_file}.old"
      mv "$log_file" "$backup_file"
      touch "$log_file"
      log_message "INFO" "Rotated log file: $log_file"
      echo "📋 Rotated log file: $log_file"
    fi
  fi
}

# Function to clean development artifacts
clean_dev_artifacts() {
  echo "🧹 Cleaning development artifacts..."
  
  # Clean node_modules cache if present
  if [ -d "node_modules/.cache" ]; then
    rm -rf "node_modules/.cache" 2>/dev/null || true
    echo "🗑️  Cleaned node_modules cache"
  fi
  
  # Clean Astro cache
  if [ -d ".astro" ]; then
    rm -rf ".astro" 2>/dev/null || true
    echo "🗑️  Cleaned Astro cache"
  fi
  
  # Clean test coverage
  if [ -d "coverage" ]; then
    rm -rf "coverage" 2>/dev/null || true
    echo "🗑️  Cleaned test coverage"
  fi
}

EXIT_CODE=0

case "$MODE" in
  "session")
    echo "🧹 Performing session cleanup..."
    
    # Clean temporary directories
    for dir in "${TEMP_DIRS[@]}"; do
      safe_remove_dir "$dir"
    done
    
    # Clean temporary files
    for pattern in "${TEMP_FILES[@]}"; do
      safe_remove_files "$pattern"
    done
    
    # Send session end notification
    .claude/hooks/notification-hook.sh "session-end" "Claude Code session cleanup completed" "info" "console"
    ;;
    
  "temp")
    echo "🗑️  Cleaning temporary files..."
    
    for pattern in "${TEMP_FILES[@]}"; do
      safe_remove_files "$pattern"
    done
    ;;
    
  "cache")
    echo "🗑️  Cleaning cache directories..."
    
    for dir in "${TEMP_DIRS[@]}"; do
      safe_remove_dir "$dir"
    done
    ;;
    
  "logs")
    echo "📋 Rotating log files..."
    
    for log_file in "${LOG_FILES_TO_ROTATE[@]}"; do
      rotate_log_file "$log_file"
    done
    ;;
    
  "all")
    echo "🧹 Performing comprehensive cleanup..."
    
    # Clean everything
    for dir in "${TEMP_DIRS[@]}"; do
      safe_remove_dir "$dir"
    done
    
    for pattern in "${TEMP_FILES[@]}"; do
      safe_remove_files "$pattern"
    done
    
    for log_file in "${LOG_FILES_TO_ROTATE[@]}"; do
      rotate_log_file "$log_file"
    done
    
    clean_dev_artifacts
    ;;
    
  *)
    echo "❌ Unknown cleanup mode: $MODE"
    log_message "ERROR" "Unknown cleanup mode: $MODE"
    EXIT_CODE=1
    ;;
esac

if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Cleanup completed successfully"
  log_message "INFO" "Cleanup completed successfully"
else
  echo "❌ Cleanup completed with errors"
  log_message "ERROR" "Cleanup completed with errors"
fi

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "cleanup-hook" "$0 $*" "$START_TIME" "$END_TIME" "$EXIT_CODE"

exit $EXIT_CODE