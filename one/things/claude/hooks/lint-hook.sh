#!/bin/bash

# Claude Code linting hook script
# Handles linting and type checking with auto-fix capabilities

set -e

# Source the logger
source .claude/hooks/hook-logger.sh

# Configuration
WORKSPACE="${1:-}"
MODE="${2:-lint}"  # lint, typecheck, or fix
FILE_PATH="${3:-}"

# Log start
log_message "INFO" "Starting lint-hook for workspace: ${WORKSPACE:-root}, mode: $MODE"
START_TIME=$(get_time_ms)

# Determine commands based on workspace and mode
LINT_CMD=""
TYPECHECK_CMD=""
FIX_CMD=""

if [ -n "$WORKSPACE" ]; then
  LINT_CMD="turbo run lint --filter=$WORKSPACE"
  TYPECHECK_CMD="turbo run typecheck --filter=$WORKSPACE"
  FIX_CMD="turbo run lint:fix --filter=$WORKSPACE"
else
  LINT_CMD="turbo run lint"
  TYPECHECK_CMD="turbo run typecheck"
  FIX_CMD="turbo run lint:fix"
fi

# Fallback commands if turbo not available
if ! command -v turbo &> /dev/null; then
  log_message "WARN" "Turbo not found, using fallback commands"
  
  # Check for ESLint
  if command -v eslint &> /dev/null; then
    LINT_CMD="eslint . --ext .ts,.tsx,.js,.jsx"
    FIX_CMD="eslint . --ext .ts,.tsx,.js,.jsx --fix"
  elif [ -f "node_modules/.bin/eslint" ]; then
    LINT_CMD="./node_modules/.bin/eslint . --ext .ts,.tsx,.js,.jsx"
    FIX_CMD="./node_modules/.bin/eslint . --ext .ts,.tsx,.js,.jsx --fix"
  fi
  
  # Check for TypeScript
  if command -v tsc &> /dev/null; then
    TYPECHECK_CMD="tsc --noEmit"
  elif [ -f "node_modules/.bin/tsc" ]; then
    TYPECHECK_CMD="./node_modules/.bin/tsc --noEmit"
  fi
  
  # Check for Biome as alternative
  if command -v biome &> /dev/null; then
    LINT_CMD="biome check ."
    FIX_CMD="biome check . --apply"
  fi
fi

EXIT_CODE=0

case "$MODE" in
  "lint")
    if [ -n "$LINT_CMD" ]; then
      echo "Running linter: $LINT_CMD"
      log_message "INFO" "Executing: $LINT_CMD"
      $LINT_CMD || EXIT_CODE=$?
    else
      echo "⚠️  No linting command available"
      log_message "WARN" "No linting command configured"
    fi
    ;;
    
  "typecheck")
    if [ -n "$TYPECHECK_CMD" ]; then
      echo "Running type checker: $TYPECHECK_CMD"
      log_message "INFO" "Executing: $TYPECHECK_CMD"
      $TYPECHECK_CMD || EXIT_CODE=$?
    else
      echo "⚠️  No type checking command available"
      log_message "WARN" "No type checking command configured"
    fi
    ;;
    
  "fix")
    if [ -n "$FIX_CMD" ]; then
      echo "Running auto-fix: $FIX_CMD"
      log_message "INFO" "Executing: $FIX_CMD"
      $FIX_CMD || EXIT_CODE=$?
      
      # Run linting again to verify fixes
      if [ $EXIT_CODE -eq 0 ] && [ -n "$LINT_CMD" ]; then
        echo "Verifying fixes..."
        $LINT_CMD || EXIT_CODE=$?
      fi
    else
      echo "⚠️  No auto-fix command available"
      log_message "WARN" "No auto-fix command configured"
    fi
    ;;
    
  "all")
    # Run linting first
    if [ -n "$LINT_CMD" ]; then
      echo "Running linter: $LINT_CMD"
      log_message "INFO" "Executing: $LINT_CMD"
      $LINT_CMD || EXIT_CODE=$?
    fi
    
    # Run type checking if linting passed
    if [ $EXIT_CODE -eq 0 ] && [ -n "$TYPECHECK_CMD" ]; then
      echo "Running type checker: $TYPECHECK_CMD"
      log_message "INFO" "Executing: $TYPECHECK_CMD"
      $TYPECHECK_CMD || EXIT_CODE=$?
    fi
    ;;
    
  *)
    echo "❌ Unknown mode: $MODE"
    log_message "ERROR" "Unknown lint mode: $MODE"
    EXIT_CODE=1
    ;;
esac

# Report results
if [ $EXIT_CODE -eq 0 ]; then
  echo "✅ Linting completed successfully"
  log_message "INFO" "Linting completed successfully"
else
  echo "❌ Linting failed with exit code $EXIT_CODE"
  log_message "ERROR" "Linting failed with exit code $EXIT_CODE"
fi

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "lint-hook" "$0 $*" "$START_TIME" "$END_TIME" "$EXIT_CODE"

exit $EXIT_CODE