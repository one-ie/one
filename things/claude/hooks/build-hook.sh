#!/bin/bash

# Claude Code build verification hook script
# Handles incremental and full builds with smart thresholds

set -e

# Source the logger
source .claude/hooks/hook-logger.sh

# Configuration
WORKSPACE="${1:-}"
MODE="${2:-incremental}"  # incremental, full, or verify
CHANGE_COUNT="${3:-0}"    # Number of files changed

# Thresholds for triggering full builds
FULL_BUILD_THRESHOLD=10
CRITICAL_FILE_PATTERNS="package.json|tsconfig.json|*.config.*|convex/schema.ts"

# Log start
log_message "INFO" "Starting build-hook for workspace: ${WORKSPACE:-root}, mode: $MODE, changes: $CHANGE_COUNT"
START_TIME=$(get_time_ms)

# Function to check if changes include critical files
has_critical_changes() {
  if [ -n "$WORKSPACE" ]; then
    # Check for critical file changes in workspace
    git diff --name-only HEAD~1 HEAD 2>/dev/null | grep -E "$CRITICAL_FILE_PATTERNS" | grep -q "$WORKSPACE" && return 0
  else
    # Check for critical file changes globally
    git diff --name-only HEAD~1 HEAD 2>/dev/null | grep -E "$CRITICAL_FILE_PATTERNS" >/dev/null && return 0
  fi
  return 1
}

# Determine build strategy
SHOULD_FULL_BUILD=false

if [ "$MODE" = "full" ]; then
  SHOULD_FULL_BUILD=true
elif [ "$MODE" = "incremental" ]; then
  if [ "$CHANGE_COUNT" -gt "$FULL_BUILD_THRESHOLD" ]; then
    log_message "INFO" "Change count ($CHANGE_COUNT) exceeds threshold ($FULL_BUILD_THRESHOLD), triggering full build"
    SHOULD_FULL_BUILD=true
  elif has_critical_changes; then
    log_message "INFO" "Critical files changed, triggering full build"
    SHOULD_FULL_BUILD=true
  fi
fi

# Determine build commands
BUILD_CMD=""
if [ -n "$WORKSPACE" ]; then
  if [ "$SHOULD_FULL_BUILD" = true ]; then
    BUILD_CMD="turbo run build --filter=$WORKSPACE"
  else
    BUILD_CMD="turbo run build --filter=$WORKSPACE --affected"
  fi
else
  if [ "$SHOULD_FULL_BUILD" = true ]; then
    BUILD_CMD="turbo run build"
  else
    BUILD_CMD="turbo run build --affected"
  fi
fi

# Fallback if turbo not available
if ! command -v turbo &> /dev/null; then
  log_message "WARN" "Turbo not found, using fallback build commands"
  
  if [ -f "package.json" ] && command -v bun &> /dev/null; then
    BUILD_CMD="bun run build"
  elif [ -f "package.json" ] && command -v npm &> /dev/null; then
    BUILD_CMD="npm run build"
  else
    echo "⚠️  No build system found"
    log_message "WARN" "No build system configured"
    EXIT_CODE=0
    END_TIME=$(get_time_ms)
    log_hook_execution "build-hook" "$0 $*" "$START_TIME" "$END_TIME" "$EXIT_CODE"
    exit $EXIT_CODE
  fi
fi

EXIT_CODE=0

case "$MODE" in
  "verify")
    # Just check if build would succeed without actually building
    echo "Verifying build configuration..."
    log_message "INFO" "Verifying build without execution"
    
    # Check for build configuration files
    if [ -n "$WORKSPACE" ]; then
      if [ ! -f "$WORKSPACE/package.json" ]; then
        echo "❌ No package.json found in workspace $WORKSPACE"
        EXIT_CODE=1
      fi
    else
      if [ ! -f "package.json" ]; then
        echo "❌ No package.json found in project root"
        EXIT_CODE=1
      fi
    fi
    
    if [ $EXIT_CODE -eq 0 ]; then
      echo "✅ Build configuration verified"
    fi
    ;;
    
  "incremental"|"full")
    echo "Running build: $BUILD_CMD"
    log_message "INFO" "Executing: $BUILD_CMD"
    
    # Execute build
    if $BUILD_CMD; then
      echo "✅ Build completed successfully"
      log_message "INFO" "Build completed successfully"
      
      # Notify via hook system
      .claude/hooks/hook-logger.sh "info" "Build notification: Build completed for ${WORKSPACE:-project}"
    else
      EXIT_CODE=$?
      echo "❌ Build failed with exit code $EXIT_CODE"
      log_message "ERROR" "Build failed with exit code $EXIT_CODE"
    fi
    ;;
    
  *)
    echo "❌ Unknown build mode: $MODE"
    log_message "ERROR" "Unknown build mode: $MODE"
    EXIT_CODE=1
    ;;
esac

# Additional verification for successful builds
if [ $EXIT_CODE -eq 0 ] && [ "$MODE" != "verify" ]; then
  # Check if build artifacts were created
  if [ -n "$WORKSPACE" ]; then
    BUILD_DIR="$WORKSPACE/dist"
  else
    BUILD_DIR="dist"
  fi
  
  if [ ! -d "$BUILD_DIR" ] && [ ! -d "apps/web/dist" ]; then
    log_message "WARN" "Build completed but no dist directory found"
  else
    log_message "INFO" "Build artifacts verified"
  fi
fi

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "build-hook" "$0 $*" "$START_TIME" "$END_TIME" "$EXIT_CODE"

exit $EXIT_CODE