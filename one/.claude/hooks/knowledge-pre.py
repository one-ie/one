#!/usr/bin/env python3
"""
ONE Platform - Knowledge Tagging Pre-Hook
Validates that artifacts created will be tagged as knowledge in the ontology.

This hook runs on PreToolUse to ensure:
- Knowledge dimension is properly mapped
- Artifacts will be categorized correctly
- Labels and metadata are prepared
"""
import json
import sys
import os
from pathlib import Path
from typing import Dict, Any, Optional, List

# Knowledge artifact types
KNOWLEDGE_ARTIFACT_TYPES = {
    "code": ["py", "ts", "tsx", "js", "jsx", "astro", "json", "yaml", "yml"],
    "documentation": ["md", "mdx", "txt"],
    "design": ["fig", "sketch", "svg", "png", "jpg"],
    "test": ["test.ts", "test.tsx", "spec.ts", "spec.tsx"],
    "config": ["json", "yaml", "yml", "toml", "ini"],
}

# Knowledge labels based on file location/type
KNOWLEDGE_LABELS = {
    "/web/src/components": ["component", "frontend", "ui"],
    "/web/src/pages": ["page", "frontend", "routing"],
    "/backend/convex/queries": ["query", "backend", "database"],
    "/backend/convex/mutations": ["mutation", "backend", "database"],
    "/backend/convex/services": ["service", "backend", "business-logic"],
    "/one/things": ["documentation", "ontology", "things"],
    "/one/connections": ["documentation", "ontology", "connections"],
    "/one/events": ["documentation", "ontology", "events"],
    "/one/knowledge": ["documentation", "ontology", "knowledge"],
    "/test": ["test", "quality", "validation"],
}

def get_artifact_type(file_path: str) -> Optional[str]:
    """Determine artifact type from file path"""
    path = Path(file_path)
    ext = path.suffix.lstrip(".")

    # Check for test files first
    if "test" in path.name or "spec" in path.name:
        return "test"

    # Check by extension
    for artifact_type, extensions in KNOWLEDGE_ARTIFACT_TYPES.items():
        if any(path.name.endswith(e) for e in extensions):
            return artifact_type

    return None

def get_knowledge_labels(file_path: str) -> List[str]:
    """Generate knowledge labels based on file path"""
    labels = []

    # Add labels based on path patterns
    for path_pattern, path_labels in KNOWLEDGE_LABELS.items():
        if path_pattern in file_path:
            labels.extend(path_labels)

    # Add artifact type label
    artifact_type = get_artifact_type(file_path)
    if artifact_type:
        labels.append(artifact_type)

    # Add dimension label if in /one
    if "/one/" in file_path:
        parts = Path(file_path).parts
        try:
            one_index = parts.index("one")
            if one_index + 1 < len(parts):
                dimension = parts[one_index + 1]
                labels.append(f"dimension-{dimension}")
        except ValueError:
            pass

    return list(set(labels))  # Remove duplicates

def should_tag_as_knowledge(file_path: str, tool_name: str) -> bool:
    """Determine if artifact should be tagged as knowledge"""
    # Only tag Write and Edit operations
    if tool_name not in ["Write", "Edit", "MultiEdit"]:
        return False

    # Don't tag temporary files
    if "/tmp/" in file_path or "/.temp/" in file_path:
        return False

    # Don't tag generated files
    if "/_generated/" in file_path or "/node_modules/" in file_path:
        return False

    # Only tag known artifact types
    artifact_type = get_artifact_type(file_path)
    if not artifact_type:
        return False

    return True

def main():
    """Main hook execution"""
    try:
        # Read hook input from stdin
        hook_input = json.load(sys.stdin)

        hook_event = hook_input.get("hook_event_name")
        tool_name = hook_input.get("tool_name")
        tool_input = hook_input.get("tool_input", {})

        # Only process PreToolUse for Write/Edit operations
        if hook_event != "PreToolUse":
            sys.exit(0)

        file_path = tool_input.get("file_path")
        if not file_path:
            sys.exit(0)

        # Check if should be tagged as knowledge
        if not should_tag_as_knowledge(file_path, tool_name):
            sys.exit(0)

        # Prepare knowledge metadata
        artifact_type = get_artifact_type(file_path)
        labels = get_knowledge_labels(file_path)

        # Output pre-hook message
        msg = f"📚 Knowledge Pre-Hook\n"
        msg += f"   Artifact: {Path(file_path).name}\n"
        msg += f"   Type: {artifact_type}\n"
        msg += f"   Labels: {', '.join(labels[:5])}"
        if len(labels) > 5:
            msg += f" (+{len(labels) - 5} more)"
        msg += f"\n   → Will be tagged in knowledge dimension after creation"

        print(msg)
        sys.exit(0)

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error in knowledge pre-hook: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
