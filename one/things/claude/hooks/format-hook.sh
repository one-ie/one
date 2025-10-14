#!/bin/bash

# Claude Code formatting hook script
# This script handles formatting for the AI starter template project

set -e

# Source the logger
source .claude/hooks/hook-logger.sh

# Get the workspace from the first argument, default to root
WORKSPACE="${1:-}"
FILTER_ARG=""

# Log start
log_message "INFO" "Starting format-hook for workspace: ${WORKSPACE:-root}"
START_TIME=$(get_time_ms)

# If workspace is provided, create the filter argument
if [ -n "$WORKSPACE" ]; then
  FILTER_ARG="--filter=$WORKSPACE"
fi

# Check if we have a format command in turbo
if turbo run format $FILTER_ARG --dry-run 2>/dev/null; then
  echo "Running turbo format command..."
  turbo run format $FILTER_ARG
elif command -v prettier &> /dev/null; then
  echo "Running prettier..."
  prettier --write "**/*.{js,jsx,ts,tsx,json,md,astro}" --ignore-path .gitignore
elif command -v biome &> /dev/null; then
  echo "Running biome format..."
  biome format --write .
else
  echo "No formatter found. Please install prettier or biome, or add a 'format' script to your package.json"
  exit 0
fi

echo "✅ Formatting completed"

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "format-hook" "$0 $*" "$START_TIME" "$END_TIME" "0"