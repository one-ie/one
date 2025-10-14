#!/bin/bash

# File Organization Hook for Claude Code
# Ensures all files follow ONE framework ontology structure
# Auto-corrects file placement when possible

set -e

HOOK_NAME="file-organization"
ORGANIZATION_ENGINE="$HOME/Server/one-code/.claude/hooks/file-organization-engine.js"
ONTOLOGY_FILE="$HOME/Server/one-code/one/ontology.md"
LOG_FILE="$HOME/Server/one-code/.claude/file-organization.log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to organize file
organize_file() {
    local file_path="$1"
    local operation="$2"  # 'open' or 'close'
    
    # Skip organization for certain files and directories
    if [[ "$file_path" =~ ^(node_modules/|\.git/|\.DS_Store|package.*\.json|README\.md|CLAUDE\.md|vitest\.config\.js)$ ]]; then
        return 0
    fi
    
    # Skip if file is already in correct location
    if [[ "$file_path" =~ ^(one/|\.one/|\.claude/) ]]; then
        log "✅ $file_path: Already in correct ontology location"
        return 0
    fi
    
    log "🔍 Checking organization for $file_path (on $operation)..."
    
    # Run organization engine
    local result=$(node "$ORGANIZATION_ENGINE" "$file_path" --operation="$operation" 2>&1)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log "✅ $file_path: Organization check passed"
        return 0
    elif [ $exit_code -eq 2 ]; then
        # File was moved
        log "📁 $file_path: Automatically reorganized"
        echo "FILE REORGANIZED: $result"
        return 0
    else
        log "❌ $file_path: Organization check failed"
        log "$result"
        echo "ORGANIZATION CHECK FAILED"
        echo "$result"
        return 1
    fi
}

# Main organization logic
main() {
    local file_path="$1"
    local operation="${2:-close}"  # Default to 'close' if not specified
    
    if [ -z "$file_path" ]; then
        log "No file specified for organization check"
        return 0
    fi
    
    log "Starting file organization check: $file_path ($operation)"
    
    if organize_file "$file_path" "$operation"; then
        log "✅ File organization check completed successfully"
        return 0
    else
        log "❌ File organization check failed"
        return 1
    fi
}

# Execute organization check
main "$1" "$2"