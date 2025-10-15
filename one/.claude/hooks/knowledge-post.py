#!/usr/bin/env python3
"""
ONE Platform - Knowledge Tagging Post-Hook
Tags created/modified artifacts as knowledge in the ontology.

This hook runs on PostToolUse to:
- Create knowledge entries for new artifacts
- Tag with appropriate labels (file type, dimension, feature)
- Link knowledge to related things (features, tasks, designs)
- Optionally generate embeddings for RAG search
"""
import json
import sys
import os
import hashlib
from pathlib import Path
from datetime import datetime
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

def get_inference_context() -> Dict[str, Any]:
    """Load current inference context from todo state"""
    try:
        todo_state_path = Path.home() / ".claude" / "todo-state.json"
        if todo_state_path.exists():
            with open(todo_state_path, 'r') as f:
                state = json.load(f)
                return {
                    "inference_number": state.get("current_inference", 0),
                    "feature": state.get("feature", "New Feature"),
                    "organization": state.get("organization", "Default Org"),
                    "person_role": state.get("person_role", "platform_owner"),
                }
    except Exception:
        pass

    return {
        "inference_number": 0,
        "feature": "New Feature",
        "organization": "Default Org",
        "person_role": "platform_owner",
    }

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

def generate_content_hash(file_path: str) -> str:
    """Generate SHA256 hash of file content"""
    try:
        with open(file_path, 'rb') as f:
            return hashlib.sha256(f.read()).hexdigest()[:16]
    except Exception:
        return ""

def create_knowledge_entry(file_path: str, content: Optional[str] = None) -> Dict[str, Any]:
    """Create knowledge entry for artifact"""
    path = Path(file_path)
    artifact_type = get_artifact_type(file_path)
    labels = get_knowledge_labels(file_path)
    inference_ctx = get_inference_context()
    content_hash = generate_content_hash(file_path)

    # Build knowledge entry
    entry = {
        "type": "knowledge_item",
        "artifact_type": artifact_type,
        "file_path": str(path.absolute()),
        "file_name": path.name,
        "labels": labels,
        "content_hash": content_hash,
        "created_at": datetime.now().isoformat(),
        "inference_number": inference_ctx["inference_number"],
        "feature": inference_ctx["feature"],
        "organization": inference_ctx["organization"],
        "created_by_role": inference_ctx["person_role"],
        "metadata": {
            "file_size": path.stat().st_size if path.exists() else 0,
            "directory": str(path.parent),
            "extension": path.suffix,
        }
    }

    # Add content preview if available
    if content:
        entry["content_preview"] = content[:500] if len(content) > 500 else content
    elif path.exists():
        try:
            with open(path, 'r', encoding='utf-8') as f:
                preview = f.read(500)
                entry["content_preview"] = preview
        except Exception:
            pass

    return entry

def save_knowledge_entry(entry: Dict[str, Any]) -> str:
    """Save knowledge entry to knowledge log"""
    # Create knowledge log directory
    knowledge_log_dir = Path.home() / ".claude" / "knowledge-log"
    knowledge_log_dir.mkdir(parents=True, exist_ok=True)

    # Create daily log file
    log_date = datetime.now().strftime("%Y-%m-%d")
    log_file = knowledge_log_dir / f"knowledge-{log_date}.jsonl"

    # Append entry
    with open(log_file, 'a') as f:
        f.write(json.dumps(entry) + "\n")

    return str(log_file)

def main():
    """Main hook execution"""
    try:
        # Read hook input from stdin
        hook_input = json.load(sys.stdin)

        hook_event = hook_input.get("hook_event_name")
        tool_name = hook_input.get("tool_name")
        tool_input = hook_input.get("tool_input", {})

        # Only process PostToolUse for Write/Edit operations
        if hook_event != "PostToolUse":
            sys.exit(0)

        file_path = tool_input.get("file_path")
        if not file_path:
            sys.exit(0)

        # Check if should be tagged as knowledge
        if not should_tag_as_knowledge(file_path, tool_name):
            sys.exit(0)

        # Create knowledge entry
        content = tool_input.get("content") or tool_input.get("new_string")
        entry = create_knowledge_entry(file_path, content)

        # Save to knowledge log
        log_file = save_knowledge_entry(entry)

        # Output post-hook message
        artifact_type = entry["artifact_type"]
        labels = entry["labels"]
        inference_num = entry["inference_number"]

        msg = f"✨ Knowledge Tagged\n"
        msg += f"   Artifact: {entry['file_name']}\n"
        msg += f"   Type: {artifact_type}\n"
        msg += f"   Labels: {', '.join(labels[:5])}"
        if len(labels) > 5:
            msg += f" (+{len(labels) - 5} more)"
        if inference_num > 0:
            msg += f"\n   Inference: {inference_num}/100"
        msg += f"\n   Hash: {entry['content_hash']}"
        msg += f"\n   → Logged to: {Path(log_file).name}"

        print(msg)
        sys.exit(0)

    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON input: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"Error in knowledge post-hook: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
