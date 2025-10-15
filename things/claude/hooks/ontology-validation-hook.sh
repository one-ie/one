#!/bin/bash

# Ontology Validation Hook for Claude Code
# Validates file changes against ONE system ontology

set -e

HOOK_NAME="ontology-validation"
VALIDATION_ENGINE="$HOME/Server/one-code/.claude/hooks/ontology-validation-engine.js"
ONTOLOGY_FILE="$HOME/Server/one-code/one/ontology.md"
LOG_FILE="$HOME/Server/one-code/.claude/ontology-validation.log"

# Function to log with timestamp
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to validate file against ontology
validate_file() {
    local file_path="$1"
    
    # Skip validation for non-ONE files
    if [[ ! "$file_path" =~ ^(\.one/|one/) ]]; then
        return 0
    fi
    
    log "Validating $file_path against ontology..."
    
    # Run validation engine
    local result=$(node "$VALIDATION_ENGINE" "$file_path" 2>&1)
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        log "✅ $file_path: PASSED ontology validation"
        return 0
    else
        log "❌ $file_path: FAILED ontology validation"
        log "$result"
        
        # Check if this is a critical violation
        if echo "$result" | grep -q "CRITICAL"; then
            log "🚨 CRITICAL violation detected - blocking operation"
            echo "ONTOLOGY VALIDATION FAILED"
            echo "$result"
            return 1
        else
            log "⚠️  Warning violations detected - operation continues"
            echo "ONTOLOGY VALIDATION WARNINGS"
            echo "$result"
            return 0
        fi
    fi
}

# Main validation logic
main() {
    local changed_files="$1"
    
    if [ -z "$changed_files" ]; then
        log "No files to validate"
        return 0
    fi
    
    log "Starting ontology validation for changed files..."
    
    # Validate each changed file
    local validation_failed=false
    while IFS= read -r file; do
        if [ -n "$file" ]; then
            if ! validate_file "$file"; then
                validation_failed=true
            fi
        fi
    done <<< "$changed_files"
    
    if [ "$validation_failed" = true ]; then
        log "❌ Ontology validation failed for one or more files"
        return 1
    else
        log "✅ All files passed ontology validation"
        return 0
    fi
}

# Execute validation
main "$1"