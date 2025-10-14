#!/bin/bash

# Claude Code hook bypass utility
# Provides emergency override and selective hook bypassing

set -e

# Source the logger
source .claude/hooks/hook-logger.sh

# Configuration
COMMAND="${1:-status}"  # status, enable, disable, emergency, reset
TARGET="${2:-all}"     # all, category, or specific hook name
REASON="${3:-Manual override}"  # Reason for bypass

BYPASS_CONFIG=".claude/hook-bypass.json"
EMERGENCY_FILE=".claude/.emergency-bypass"

# Log start
log_message "INFO" "Starting hook-bypass with command: $COMMAND, target: $TARGET"
START_TIME=$(get_time_ms)

# Function to initialize bypass configuration
init_bypass_config() {
  if [ ! -f "$BYPASS_CONFIG" ]; then
    cat > "$BYPASS_CONFIG" << 'EOF'
{
  "globalBypass": false,
  "emergencyBypass": false,
  "bypassedHooks": {},
  "bypassedCategories": {},
  "bypassHistory": []
}
EOF
    log_message "INFO" "Initialized bypass configuration"
  fi
}

# Function to get bypass status
get_bypass_status() {
  if [ ! -f "$BYPASS_CONFIG" ]; then
    echo "false"
    return
  fi
  
  if command -v jq &> /dev/null; then
    jq -r '.globalBypass // false' "$BYPASS_CONFIG" 2>/dev/null || echo "false"
  else
    # Fallback without jq
    grep -o '"globalBypass":\s*true' "$BYPASS_CONFIG" >/dev/null && echo "true" || echo "false"
  fi
}

# Function to set bypass status
set_bypass_status() {
  local status="$1"
  local target="$2"
  local reason="$3"
  
  init_bypass_config
  
  if command -v jq &> /dev/null; then
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local entry="{\"timestamp\":\"$timestamp\",\"target\":\"$target\",\"action\":\"$status\",\"reason\":\"$reason\"}"
    
    case "$target" in
      "all")
        jq ".globalBypass = $status | .bypassHistory += [$entry]" "$BYPASS_CONFIG" > "${BYPASS_CONFIG}.tmp"
        mv "${BYPASS_CONFIG}.tmp" "$BYPASS_CONFIG"
        ;;
      "emergency")
        jq ".emergencyBypass = $status | .bypassHistory += [$entry]" "$BYPASS_CONFIG" > "${BYPASS_CONFIG}.tmp"
        mv "${BYPASS_CONFIG}.tmp" "$BYPASS_CONFIG"
        
        if [ "$status" = "true" ]; then
          touch "$EMERGENCY_FILE"
          echo "Emergency bypass activated at $(date)" > "$EMERGENCY_FILE"
        else
          rm -f "$EMERGENCY_FILE"
        fi
        ;;
      *)
        # Individual hook or category
        if [[ "$target" == *"category:"* ]]; then
          local category=$(echo "$target" | sed 's/category://')
          jq ".bypassedCategories[\"$category\"] = $status | .bypassHistory += [$entry]" "$BYPASS_CONFIG" > "${BYPASS_CONFIG}.tmp"
        else
          jq ".bypassedHooks[\"$target\"] = $status | .bypassHistory += [$entry]" "$BYPASS_CONFIG" > "${BYPASS_CONFIG}.tmp"
        fi
        mv "${BYPASS_CONFIG}.tmp" "$BYPASS_CONFIG"
        ;;
    esac
  else
    # Fallback without jq - simple approach
    log_message "WARN" "jq not available, using basic bypass mechanism"
    if [ "$status" = "true" ]; then
      echo "BYPASS_ACTIVE=true" > "$BYPASS_CONFIG"
      if [ "$target" = "emergency" ]; then
        touch "$EMERGENCY_FILE"
      fi
    else
      echo "BYPASS_ACTIVE=false" > "$BYPASS_CONFIG"
      rm -f "$EMERGENCY_FILE"
    fi
  fi
  
  log_message "INFO" "Set bypass status: $target = $status (reason: $reason)"
}

# Function to check if specific hook is bypassed
is_hook_bypassed() {
  local hook_name="$1"
  
  # Check emergency bypass
  if [ -f "$EMERGENCY_FILE" ]; then
    return 0
  fi
  
  # Check global bypass
  local global_bypass=$(get_bypass_status)
  if [ "$global_bypass" = "true" ]; then
    return 0
  fi
  
  # Check specific hook bypass
  if [ -f "$BYPASS_CONFIG" ] && command -v jq &> /dev/null; then
    local hook_bypassed=$(jq -r ".bypassedHooks[\"$hook_name\"] // false" "$BYPASS_CONFIG" 2>/dev/null)
    if [ "$hook_bypassed" = "true" ]; then
      return 0
    fi
  fi
  
  return 1
}

# Function to display bypass status
show_status() {
  echo "🔧 Hook Bypass Status:"
  echo ""
  
  # Emergency bypass
  if [ -f "$EMERGENCY_FILE" ]; then
    echo "🚨 EMERGENCY BYPASS ACTIVE"
    echo "   All hooks are bypassed"
    echo "   Activated: $(cat "$EMERGENCY_FILE" | head -1)"
    echo ""
  fi
  
  # Global bypass
  local global_bypass=$(get_bypass_status)
  if [ "$global_bypass" = "true" ]; then
    echo "⏸️  Global bypass: ACTIVE"
  else
    echo "✅ Global bypass: INACTIVE"
  fi
  
  # Individual bypasses
  if [ -f "$BYPASS_CONFIG" ] && command -v jq &> /dev/null; then
    echo ""
    echo "Individual hook bypasses:"
    
    local bypassed_hooks=$(jq -r '.bypassedHooks | to_entries[] | select(.value == true) | .key' "$BYPASS_CONFIG" 2>/dev/null || echo "")
    if [ -n "$bypassed_hooks" ]; then
      echo "$bypassed_hooks" | while read -r hook; do
        echo "  - $hook: BYPASSED"
      done
    else
      echo "  None"
    fi
    
    echo ""
    echo "Category bypasses:"
    local bypassed_categories=$(jq -r '.bypassedCategories | to_entries[] | select(.value == true) | .key' "$BYPASS_CONFIG" 2>/dev/null || echo "")
    if [ -n "$bypassed_categories" ]; then
      echo "$bypassed_categories" | while read -r category; do
        echo "  - $category: BYPASSED"
      done
    else
      echo "  None"
    fi
  fi
}

# Function to show bypass history
show_history() {
  if [ -f "$BYPASS_CONFIG" ] && command -v jq &> /dev/null; then
    echo "📜 Recent bypass history:"
    jq -r '.bypassHistory[-10:][] | "\(.timestamp) - \(.target): \(.action) (\(.reason))"' "$BYPASS_CONFIG" 2>/dev/null || echo "No history available"
  else
    echo "Bypass history not available (requires jq)"
  fi
}

EXIT_CODE=0

case "$COMMAND" in
  "status")
    show_status
    ;;
    
  "enable")
    case "$TARGET" in
      "all")
        set_bypass_status "true" "all" "$REASON"
        echo "🔧 Global hook bypass ENABLED"
        echo "   Reason: $REASON"
        ;;
      "emergency")
        set_bypass_status "true" "emergency" "$REASON"
        echo "🚨 EMERGENCY bypass ACTIVATED"
        echo "   All hooks are now bypassed"
        echo "   Reason: $REASON"
        ;;
      category:*)
        set_bypass_status "true" "$TARGET" "$REASON"
        echo "🔧 Category bypass ENABLED: $(echo "$TARGET" | sed 's/category://')"
        ;;
      *)
        set_bypass_status "true" "$TARGET" "$REASON"
        echo "🔧 Hook bypass ENABLED: $TARGET"
        ;;
    esac
    ;;
    
  "disable")
    case "$TARGET" in
      "all")
        set_bypass_status "false" "all" "$REASON"
        echo "✅ Global hook bypass DISABLED"
        ;;
      "emergency")
        set_bypass_status "false" "emergency" "$REASON"
        echo "✅ Emergency bypass DEACTIVATED"
        ;;
      category:*)
        set_bypass_status "false" "$TARGET" "$REASON"
        echo "✅ Category bypass DISABLED: $(echo "$TARGET" | sed 's/category://')"
        ;;
      *)
        set_bypass_status "false" "$TARGET" "$REASON"
        echo "✅ Hook bypass DISABLED: $TARGET"
        ;;
    esac
    ;;
    
  "reset")
    init_bypass_config
    rm -f "$EMERGENCY_FILE"
    echo "🔄 All bypasses have been reset"
    log_message "INFO" "All bypasses reset"
    ;;
    
  "history")
    show_history
    ;;
    
  "check")
    if is_hook_bypassed "$TARGET"; then
      echo "Hook '$TARGET' is currently bypassed"
      EXIT_CODE=0
    else
      echo "Hook '$TARGET' is active"
      EXIT_CODE=1
    fi
    ;;
    
  *)
    echo "❌ Unknown command: $COMMAND"
    echo ""
    echo "Usage: $0 <command> [target] [reason]"
    echo ""
    echo "Commands:"
    echo "  status                    - Show current bypass status"
    echo "  enable <target> [reason]  - Enable bypass for target"
    echo "  disable <target> [reason] - Disable bypass for target"
    echo "  reset                     - Reset all bypasses"
    echo "  history                   - Show bypass history"
    echo "  check <hook>             - Check if specific hook is bypassed"
    echo ""
    echo "Targets:"
    echo "  all                      - All hooks"
    echo "  emergency                - Emergency bypass (highest priority)"
    echo "  category:<name>          - Hook category (formatting, testing, etc.)"
    echo "  <hook-name>              - Specific hook name"
    EXIT_CODE=1
    ;;
esac

# Log completion
END_TIME=$(get_time_ms)
log_hook_execution "hook-bypass" "$0 $*" "$START_TIME" "$END_TIME" "$EXIT_CODE"

exit $EXIT_CODE