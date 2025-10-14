#!/bin/bash

# Format Hook - ONE Platform
# Auto-formats markdown and YAML files in /one directory

set -e

# Source the logger
source "$CLAUDE_PROJECT_DIR/.claude/hooks/hook-logger.sh"

# Get file path from stdin or argument
FILE_PATH="${1:-}"

# Log start
log_message "INFO" "Starting format-hook for: ${FILE_PATH:-all files}"
START_TIME=$(get_time_ms)

# Function to format markdown files
format_markdown() {
  local file="$1"

  if command -v prettier &> /dev/null; then
    prettier --write "$file" --parser markdown 2>/dev/null && echo "✅ Formatted: $file"
  else
    echo "⚠️  prettier not found, skipping markdown formatting"
  fi
}

# Function to format YAML files
format_yaml() {
  local file="$1"

  if command -v prettier &> /dev/null; then
    prettier --write "$file" --parser yaml 2>/dev/null && echo "✅ Formatted: $file"
  else
    echo "⚠️  prettier not found, skipping YAML formatting"
  fi
}

EXIT_CODE=0

# Check if specific file provided
if [ -n "$FILE_PATH" ]; then
  # Format specific file
  if [[ "$FILE_PATH" =~ \.md$ ]]; then
    format_markdown "$FILE_PATH"
  elif [[ "$FILE_PATH" =~ \.(yaml|yml)$ ]]; then
    format_yaml "$FILE_PATH"
  else
    log_message "INFO" "File type not supported for formatting: $FILE_PATH"
  fi
else
  # Format all files in /one directory
  if [ -d "$CLAUDE_PROJECT_DIR/one" ]; then
    echo "🔧 Formatting files in /one directory..."

    # Format markdown files
    if command -v prettier &> /dev/null; then
      find "$CLAUDE_PROJECT_DIR/one" -type f -name "*.md" -exec prettier --write {} \; 2>/dev/null || true
      find "$CLAUDE_PROJECT_DIR/one" -type f \( -name "*.yaml" -o -name "*.yml" \) -exec prettier --write {} \; 2>/dev/null || true
      echo "✅ Formatting completed"
    else
      echo "⚠️  prettier not installed. Install with: npm install -g prettier"
      EXIT_CODE=0  # Don't fail if prettier not installed
    fi
  else
    log_message "WARN" "/one directory not found"
  fi
fi

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "format-hook" "$0 $*" "$START_TIME" "$END_TIME" "$EXIT_CODE"

exit $EXIT_CODE
