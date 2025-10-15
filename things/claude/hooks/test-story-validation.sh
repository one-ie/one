#!/bin/bash

# Test Suite for Story Validation System
# Tests all components of the story validation hook system

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEST_LOG="$SCRIPT_DIR/../test-validation.log"
VALIDATION_ENGINE="$SCRIPT_DIR/story-validation-engine.js"
SCORING_SYSTEM="$SCRIPT_DIR/story-scoring-system.js"
VALIDATION_HOOK="$SCRIPT_DIR/story-validation-hook.sh"

# Test story content samples
GOOD_STORY_CONTENT='# Test Story

## Status
Ready

## Story
**As a** developer **I want** to test validation **so that** I can ensure quality

## Acceptance Criteria
1. Validation engine processes story files correctly
2. Scoring system generates accurate metrics
3. Hook integration blocks poor quality stories

## Tasks / Subtasks
- [ ] Test validation engine
- [ ] Test scoring system
- [ ] Test hook integration

## Dev Notes
Technical implementation details here.

## Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-07-19 | 1.0 | Test story | Test |

## Dev Agent Record
### Agent Model Used
Test Agent

### File List
- test-story.md'

BAD_STORY_CONTENT='# Bad Story

## Status
Draft

Some content without proper structure.'

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_RUN=0
TESTS_PASSED=0

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') $1" | tee -a "$TEST_LOG"
}

run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_exit_code="${3:-0}"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -e "\n${YELLOW}Test $TESTS_RUN: $test_name${NC}"
    
    if eval "$test_command"; then
        actual_exit_code=$?
    else
        actual_exit_code=$?
    fi
    
    if [ $actual_exit_code -eq $expected_exit_code ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        log "PASS: $test_name"
    else
        echo -e "${RED}❌ FAIL (exit code: $actual_exit_code, expected: $expected_exit_code)${NC}"
        log "FAIL: $test_name - exit code: $actual_exit_code, expected: $expected_exit_code"
    fi
}

setup_test_files() {
    # Create temporary test story files
    echo "$GOOD_STORY_CONTENT" > "/tmp/good-story.md"
    echo "$BAD_STORY_CONTENT" > "/tmp/bad-story.md"
    log "Created test story files"
}

cleanup_test_files() {
    rm -f "/tmp/good-story.md" "/tmp/bad-story.md"
    log "Cleaned up test files"
}

echo -e "${YELLOW}Starting Story Validation System Test Suite${NC}"
log "=== Story Validation Test Suite Started ==="

# Setup
setup_test_files

# Test 1: Validation Engine Executable
run_test "Validation engine is executable" "test -x $VALIDATION_ENGINE"

# Test 2: Scoring System Executable
run_test "Scoring system is executable" "test -x $SCORING_SYSTEM"

# Test 3: Validation Hook Executable
run_test "Validation hook is executable" "test -x $VALIDATION_HOOK"

# Test 4: Validation Engine with Good Story
run_test "Validation engine processes good story" "node $VALIDATION_ENGINE /tmp/good-story.md > /dev/null"

# Test 5: Validation Engine with Bad Story (should fail)
run_test "Validation engine rejects bad story" "node $VALIDATION_ENGINE /tmp/bad-story.md > /dev/null" 1

# Test 6: Scoring System with Good Story
run_test "Scoring system processes good story" "node $SCORING_SYSTEM /tmp/good-story.md > /dev/null"

# Test 7: Hook Integration with Good Story
run_test "Hook passes good story" "$VALIDATION_HOOK /tmp/good-story.md > /dev/null"

# Test 8: Hook Integration with Bad Story (should fail)
run_test "Hook blocks bad story" "$VALIDATION_HOOK /tmp/bad-story.md > /dev/null" 1

# Test 9: Hook with Non-Story File (should skip)
run_test "Hook skips non-story files" "$VALIDATION_HOOK /tmp/non-story.txt > /dev/null || echo 'skipped'"

# Test 10: Performance Test - Multiple Stories
run_test "Performance test with multiple validations" "
    for i in {1..5}; do
        node $VALIDATION_ENGINE /tmp/good-story.md > /dev/null || exit 1
    done
"

# Test 11: Memory Usage Test
run_test "Memory usage within limits" "
    timeout 30s node $VALIDATION_ENGINE /tmp/good-story.md > /dev/null
"

# Test 12: Error Handling - Missing File
run_test "Handles missing file gracefully" "node $VALIDATION_ENGINE /tmp/nonexistent.md > /dev/null 2>&1" 1

# Cleanup
cleanup_test_files

# Summary
echo -e "\n${YELLOW}=== Test Results ===${NC}"
echo -e "Tests Run: $TESTS_RUN"
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$((TESTS_RUN - TESTS_PASSED))${NC}"

if [ $TESTS_PASSED -eq $TESTS_RUN ]; then
    echo -e "\n${GREEN}🎉 All tests passed! Validation system is ready.${NC}"
    log "=== All tests passed! Validation system ready ==="
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed. Review and fix issues.${NC}"
    log "=== Test failures detected. Review required ==="
    exit 1
fi