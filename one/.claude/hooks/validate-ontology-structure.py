#!/usr/bin/env python3
"""
Ontology Structure Validator for ONE Platform
Ensures all files in /one follow the 6-dimension ontology structure
"""
import json
import sys
import os
import re
from pathlib import Path

# ONE Platform 6-Dimension Ontology
VALID_DIMENSIONS = {
    "groups": {
        "aliases": ["groups", "group", "organisations", "organizations", "organisation", "organization"],
        "description": "Hierarchical containers for collaboration - who belongs where and at what level"
    },
    "people": {
        "aliases": ["people", "person"],
        "description": "Authorization & governance - platform owner, org owners"
    },
    "things": {
        "aliases": ["things", "thing"],
        "description": "Every 'thing' - users, agents, content, tokens, courses",
        "types": [
            # Core
            "creator", "ai_clone", "audience_member", "organization",
            # Business Agents
            "strategy_agent", "research_agent", "marketing_agent", "sales_agent",
            "service_agent", "design_agent", "engineering_agent", "finance_agent",
            "legal_agent", "intelligence_agent",
            # Content
            "blog_post", "video", "podcast", "social_post", "email", "course", "lesson",
            # Products
            "digital_product", "membership", "consultation", "nft",
            # Community
            "community", "conversation", "message",
            # Token
            "token", "token_contract",
            # Knowledge
            "knowledge_item", "embedding",
            # Platform
            "website", "landing_page", "template", "livestream", "recording", "media_asset",
            # Business
            "payment", "subscription", "invoice", "metric", "insight", "prediction", "report",
            # Auth Session
            "session", "oauth_account", "verification_token", "password_reset_token",
            # UI Preferences
            "ui_preferences",
            # Marketing
            "notification", "email_campaign", "announcement", "referral", "campaign", "lead",
            # External
            "external_agent", "external_workflow", "external_connection",
            # Protocol
            "mandate", "product",
            # Workflow
            "idea", "plan", "feature", "test", "design", "task", "lesson"
        ]
    },
    "connections": {
        "aliases": ["connections", "connection"],
        "description": "Every relationship - owns, follows, taught_by, powers",
        "types": [
            # Ownership
            "owns", "created_by",
            # AI Relationships
            "clone_of", "trained_on", "powers",
            # Content Relationships
            "authored", "generated_by", "published_to", "part_of", "references",
            # Community Relationships
            "member_of", "following", "moderates", "participated_in",
            # Business Relationships
            "manages", "reports_to", "collaborates_with",
            # Token Relationships
            "holds_tokens", "staked_in", "earned_from",
            # Product Relationships
            "purchased", "enrolled_in", "completed", "teaching",
            # Consolidated
            "transacted", "notified", "referred", "communicated", "delegated", "approved", "fulfilled"
        ]
    },
    "events": {
        "aliases": ["events", "event"],
        "description": "Every action - purchased, created, viewed, completed",
        "types": [
            # Entity Lifecycle
            "entity_created", "entity_updated", "entity_deleted", "entity_archived",
            # User Events
            "user_registered", "user_verified", "user_login", "user_logout", "profile_updated",
            # Authentication Events
            "password_reset_requested", "password_reset_completed",
            "email_verification_sent", "email_verified",
            "two_factor_enabled", "two_factor_disabled",
            # Organization Events
            "organization_created", "organization_updated",
            "user_invited_to_org", "user_joined_org", "user_removed_from_org",
            # Dashboard UI Events
            "dashboard_viewed", "settings_updated", "theme_changed", "preferences_updated",
            # AI Clone Events
            "clone_created", "clone_updated", "voice_cloned", "appearance_cloned",
            # Agent Events
            "agent_created", "agent_executed", "agent_completed", "agent_failed",
            # Token Events
            "token_created", "token_minted", "token_burned",
            "tokens_purchased", "tokens_staked", "tokens_unstaked", "tokens_transferred",
            # Course Events
            "course_created", "course_enrolled", "lesson_completed", "course_completed", "certificate_earned",
            # Analytics Events
            "metric_calculated", "insight_generated", "prediction_made", "optimization_applied", "report_generated",
            # Inference Events
            "inference_request", "inference_completed", "inference_failed",
            "inference_quota_exceeded", "inference_revenue_collected",
            "org_revenue_generated", "revenue_share_distributed",
            # Blockchain Events
            "nft_minted", "nft_transferred", "tokens_bridged", "contract_deployed", "treasury_withdrawal",
            # Consolidated Events
            "content_event", "payment_event", "subscription_event", "commerce_event",
            "livestream_event", "notification_event", "referral_event",
            "communication_event", "task_event", "mandate_event", "price_event",
            # Workflow Events
            "plan_started", "feature_assigned", "tasks_created",
            "feature_started", "implementation_complete", "task_started", "task_completed",
            "quality_check_started", "quality_check_complete", "test_started", "test_passed", "test_failed",
            "problem_analysis_started", "solution_proposed", "fix_started", "fix_complete",
            "documentation_started", "documentation_complete", "lesson_learned_added",
            "feature_complete", "plan_complete"
        ]
    },
    "knowledge": {
        "aliases": ["knowledge"],
        "description": "Labels + chunks + vectors powering RAG & search",
        "types": ["label", "document", "chunk", "vector_only"]
    }
}

# Protocol identifiers that should be in metadata
PROTOCOLS = ["a2a", "acp", "ap2", "x402", "ag-ui"]

def get_dimension_from_path(file_path):
    """Extract dimension from file path"""
    parts = Path(file_path).parts

    # Find 'one' in path and get next part
    try:
        one_index = parts.index('one')
        if one_index + 1 < len(parts):
            return parts[one_index + 1]
    except ValueError:
        return None

    return None

def normalize_dimension(dimension):
    """Normalize dimension name to canonical form"""
    if not dimension:
        return None

    dimension_lower = dimension.lower()

    for canonical, config in VALID_DIMENSIONS.items():
        if dimension_lower in [alias.lower() for alias in config["aliases"]]:
            return canonical

    return None

def to_kebab_case(filename):
    """Convert filename to kebab-case"""
    # Split filename and extension
    name, ext = os.path.splitext(filename)

    # Convert to lowercase
    name = name.lower()

    # Replace spaces, underscores, and multiple hyphens with single hyphen
    name = re.sub(r'[_\s]+', '-', name)
    name = re.sub(r'-+', '-', name)

    # Remove leading/trailing hyphens
    name = name.strip('-')

    # Keep extension lowercase
    ext = ext.lower()

    return name + ext

def validate_file_path(file_path):
    """Validate that file path follows ontology structure"""
    issues = []

    # Check if file is in /one directory
    if '/one/' not in file_path:
        return issues  # Not in /one, skip validation

    # Allow certain root-level files in /one
    parts = Path(file_path).parts
    try:
        one_index = parts.index('one')
        # If this is a direct child of /one (not in a subdirectory)
        if one_index + 2 == len(parts):
            # Allow specific root-level files
            allowed_root_files = ['LICENSE.md', 'README.md', 'CONTRIBUTING.md', 'CHANGELOG.md', '.gitignore']
            filename = Path(file_path).name
            if filename in allowed_root_files:
                return issues  # Valid root-level file
    except ValueError:
        pass

    # Extract dimension from path
    dimension = get_dimension_from_path(file_path)

    if not dimension:
        issues.append("File is in /one but not in a dimension directory")
        return issues

    # Normalize and validate dimension
    canonical_dimension = normalize_dimension(dimension)

    if not canonical_dimension:
        valid_dims = []
        for dim_config in VALID_DIMENSIONS.values():
            valid_dims.extend(dim_config["aliases"])
        issues.append(
            f"Invalid dimension '{dimension}'. Must be one of: {', '.join(valid_dims)}"
        )
        return issues

    # Check file extension
    valid_extensions = ['.md', '.yaml', '.yml', '.json']
    if not any(file_path.endswith(ext) for ext in valid_extensions):
        issues.append(
            f"Invalid file extension. Files in /one must be: {', '.join(valid_extensions)}"
        )

    # Check for valid naming conventions
    filename = Path(file_path).name

    # Files should use kebab-case
    if not re.match(r'^[a-z0-9]+(-[a-z0-9]+)*\.(md|yaml|yml|json)$', filename):
        correct_name = to_kebab_case(filename)
        issues.append(
            f"Filename '{filename}' should use kebab-case (lowercase with hyphens). Suggested: '{correct_name}'"
        )

    return issues

def validate_file_content(file_path, content=None):
    """Validate file content follows ontology patterns"""
    issues = []

    # Only validate markdown files
    if not file_path.endswith('.md'):
        return issues

    # Read content if not provided
    if content is None:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            issues.append(f"Could not read file: {e}")
            return issues

    dimension = normalize_dimension(get_dimension_from_path(file_path))

    if not dimension:
        return issues

    # Check for dimension-specific patterns
    if dimension == "things":
        # Things should reference type
        config = VALID_DIMENSIONS["things"]
        if "type:" in content.lower() or "## type" in content.lower():
            # Extract type mentions
            type_pattern = r'\btype:\s*(\w+)'
            types_found = re.findall(type_pattern, content, re.IGNORECASE)

            for found_type in types_found:
                if found_type not in config.get("types", []):
                    issues.append(
                        f"Unknown thing type '{found_type}'. "
                        f"Must be one of the 66 defined thing types"
                    )

    elif dimension == "connections":
        # Connections should reference relationship types
        config = VALID_DIMENSIONS["connections"]
        if "relationship" in content.lower() or "type:" in content.lower():
            # Look for relationship type mentions
            for rel_type in config.get("types", []):
                if rel_type in content.lower():
                    break
            else:
                # No valid relationship type found, might be okay
                pass

    elif dimension == "events":
        # Events should reference event types
        config = VALID_DIMENSIONS["events"]
        if "type:" in content.lower() or "event:" in content.lower():
            # Look for event type mentions
            for event_type in config.get("types", []):
                if event_type in content.lower():
                    break
            else:
                # No valid event type found, might be okay
                pass

    # Check for protocol references
    protocol_mentions = []
    for protocol in PROTOCOLS:
        if protocol.lower() in content.lower():
            protocol_mentions.append(protocol)

    if protocol_mentions and "metadata.protocol" not in content.lower():
        issues.append(
            f"Protocol references found ({', '.join(protocol_mentions)}) "
            f"but no 'metadata.protocol' field mentioned. "
            f"Protocols should be stored in metadata.protocol field"
        )

    return issues

def auto_fix_filename(file_path):
    """Automatically fix filename to kebab-case if needed"""
    filename = Path(file_path).name

    # Check if filename needs fixing
    if re.match(r'^[a-z0-9]+(-[a-z0-9]+)*\.(md|yaml|yml|json)$', filename):
        return None  # Already valid

    # Generate correct filename
    correct_name = to_kebab_case(filename)

    if correct_name == filename:
        return None  # No change needed

    # Build new path
    directory = os.path.dirname(file_path)
    new_path = os.path.join(directory, correct_name)

    # Rename the file
    try:
        if os.path.exists(file_path):
            os.rename(file_path, new_path)
            return {
                'old_name': filename,
                'new_name': correct_name,
                'old_path': file_path,
                'new_path': new_path
            }
    except Exception as e:
        return {'error': str(e)}

    return None

def main():
    """Main hook execution"""
    try:
        # Read hook input from stdin
        hook_input = json.load(sys.stdin)

        hook_event = hook_input.get("hook_event_name")
        tool_name = hook_input.get("tool_name")
        tool_input = hook_input.get("tool_input", {})

        # Only validate Edit and Write operations
        if tool_name not in ["Edit", "Write", "MultiEdit"]:
            sys.exit(0)

        file_path = tool_input.get("file_path")
        if not file_path:
            sys.exit(0)

        # Skip validation for non-/one files
        if '/one/' not in file_path:
            sys.exit(0)

        # For PostToolUse, try to auto-fix filename first
        if hook_event == "PostToolUse":
            fix_result = auto_fix_filename(file_path)
            if fix_result:
                if 'error' in fix_result:
                    print(f"⚠️ Could not auto-fix filename: {fix_result['error']}", file=sys.stderr)
                else:
                    print(f"🔧 Auto-fixed filename: '{fix_result['old_name']}' → '{fix_result['new_name']}'")
                    # Update file_path for subsequent validation
                    file_path = fix_result['new_path']

        issues = []

        # Validate file path structure
        path_issues = validate_file_path(file_path)
        issues.extend(path_issues)

        # For PostToolUse, also validate content
        if hook_event == "PostToolUse":
            content = tool_input.get("content") or tool_input.get("new_string")
            content_issues = validate_file_content(file_path, content)
            issues.extend(content_issues)

        if issues:
            # Build error message
            dimension = get_dimension_from_path(file_path)
            canonical = normalize_dimension(dimension)

            error_msg = f"⚠️ Ontology Validation Failed for {file_path}\n\n"
            error_msg += "Issues found:\n"
            for i, issue in enumerate(issues, 1):
                error_msg += f"{i}. {issue}\n"

            error_msg += f"\nONE Ontology Structure:\n"
            error_msg += "Files in /one must follow the 6-dimension ontology:\n\n"

            for dim_name, dim_config in VALID_DIMENSIONS.items():
                error_msg += f"• {dim_name}/\n"
                error_msg += f"  {dim_config['description']}\n"
                if dim_config.get('types'):
                    count = len(dim_config['types'])
                    error_msg += f"  ({count} defined types)\n"

            error_msg += f"\nCurrent dimension: {dimension}"
            if canonical and canonical != dimension:
                error_msg += f" (normalized to: {canonical})"
            error_msg += "\n"

            # For PreToolUse, block with exit code 2
            if hook_event == "PreToolUse":
                print(error_msg, file=sys.stderr)
                sys.exit(2)  # Block the operation
            else:
                # For PostToolUse, just warn
                print(error_msg, file=sys.stdout)
                sys.exit(0)

        # Success - show dimension info
        dimension = get_dimension_from_path(file_path)
        canonical = normalize_dimension(dimension)

        if canonical:
            success_msg = f"✅ Ontology structure validated: {canonical}/"
            dim_config = VALID_DIMENSIONS[canonical]
            success_msg += f" - {dim_config['description']}"
            print(success_msg)

        sys.exit(0)

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error validating ontology structure: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
