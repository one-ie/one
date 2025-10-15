#!/usr/bin/env python3
"""
ONE Platform - Clean Agent Post-Inference Hook
Cleans up and organizes after completing each inference.

This hook runs after inference completion to:
- Remove generated artifacts and temporary files
- Organize files into correct directories
- Update metadata tags on modified files
- Archive old versions
- Generate cleanup report
- Update cleanliness metrics
"""
import json
import sys
import os
from pathlib import Path
from typing import Dict, Any, List
import subprocess
import shutil
from datetime import datetime

# Temporary file patterns to clean
TEMP_PATTERNS = [
    "*.tmp",
    "*.swp",
    "*~",
    "*.bak",
    ".DS_Store",
    "*.log",
]

# Directories to clean
CLEAN_DIRS = [
    ".astro",
    "dist",
    "node_modules/.cache",
    ".claude/state/temp",
]

# Archive directory for old versions
ARCHIVE_DIR = ".claude/archive"


class CleanupAgent:
    def __init__(self, project_dir: str):
        self.project_dir = Path(project_dir)
        self.actions_taken: List[str] = []
        self.files_removed: int = 0
        self.files_organized: int = 0
        self.files_tagged: int = 0
        self.space_freed: int = 0  # in bytes

    def log_action(self, action: str):
        """Log a cleanup action"""
        self.actions_taken.append(action)

    def remove_temp_files(self):
        """Remove temporary and backup files"""
        removed = []

        for pattern in TEMP_PATTERNS:
            for temp_file in self.project_dir.rglob(pattern):
                # Skip node_modules and .git
                if "node_modules" in str(temp_file) or ".git" in str(temp_file):
                    continue

                try:
                    file_size = temp_file.stat().st_size
                    temp_file.unlink()
                    removed.append(str(temp_file.relative_to(self.project_dir)))
                    self.space_freed += file_size
                    self.files_removed += 1
                except Exception as e:
                    pass  # Skip files we can't remove

        if removed:
            self.log_action(f"Removed {len(removed)} temporary files")
            for file in removed[:5]:
                self.log_action(f"  • {file}")
            if len(removed) > 5:
                self.log_action(f"  ... and {len(removed) - 5} more")

    def clean_build_artifacts(self):
        """Clean build and cache directories"""
        for clean_dir in CLEAN_DIRS:
            dir_path = self.project_dir / clean_dir
            if dir_path.exists() and dir_path.is_dir():
                try:
                    # Calculate size before deletion
                    total_size = sum(
                        f.stat().st_size
                        for f in dir_path.rglob("*")
                        if f.is_file()
                    )

                    shutil.rmtree(dir_path)
                    self.space_freed += total_size
                    self.log_action(f"Cleaned: {clean_dir} ({self._format_size(total_size)})")
                except Exception:
                    pass  # Skip if we can't clean

    def organize_files(self):
        """Organize files into correct directories"""
        # Check for misplaced markdown files
        root_md_files = [
            f for f in self.project_dir.glob("*.md")
            if f.name not in ["README.md", "CLAUDE.md", "AGENTS.md", "LICENSE.md", "CHANGELOG.md"]
        ]

        for md_file in root_md_files:
            # Suggest moving to one/knowledge/
            target_dir = self.project_dir / "one" / "knowledge"
            if target_dir.exists():
                try:
                    target_path = target_dir / md_file.name
                    if not target_path.exists():
                        shutil.move(str(md_file), str(target_path))
                        self.files_organized += 1
                        self.log_action(f"Moved: {md_file.name} → one/knowledge/")
                except Exception:
                    pass

    def update_metadata_tags(self):
        """Update metadata tags on recently modified files"""
        # Find markdown files modified in last inference
        recent_files = []
        cutoff_time = datetime.now().timestamp() - 3600  # Last hour

        for md_file in (self.project_dir / "one").rglob("*.md"):
            try:
                if md_file.stat().st_mtime > cutoff_time:
                    recent_files.append(md_file)
            except Exception:
                pass

        # Add/update metadata tags
        for md_file in recent_files:
            if self._add_metadata_if_missing(md_file):
                self.files_tagged += 1
                self.log_action(f"Tagged: {md_file.relative_to(self.project_dir)}")

    def _add_metadata_if_missing(self, file_path: Path) -> bool:
        """Add metadata frontmatter if missing"""
        try:
            content = file_path.read_text()

            # Check if already has frontmatter
            if content.startswith("---\n"):
                return False

            # Infer metadata from file location
            relative_path = file_path.relative_to(self.project_dir)
            parts = relative_path.parts

            # Determine dimension and tags
            dimension = parts[1] if len(parts) > 1 else "knowledge"
            category = parts[2] if len(parts) > 2 else "general"

            # Generate metadata
            metadata = f"""---
title: {file_path.stem.replace("-", " ").title()}
dimension: {dimension}
category: {category}
tags: []
created: {datetime.now().strftime("%Y-%m-%d")}
updated: {datetime.now().strftime("%Y-%m-%d")}
version: 1.0.0
ai_context: |
  This document is part of the {dimension} dimension.
  Location: {relative_path}
  For AI agents: Read this to understand {file_path.stem.replace("-", " ")}.
---

"""
            # Prepend metadata
            new_content = metadata + content
            file_path.write_text(new_content)
            return True

        except Exception:
            return False

    def archive_old_versions(self):
        """Archive old versions of files (if backup exists)"""
        archive_dir = self.project_dir / ARCHIVE_DIR
        archive_dir.mkdir(parents=True, exist_ok=True)

        # Find .bak files and archive them
        for bak_file in self.project_dir.rglob("*.bak"):
            if "node_modules" in str(bak_file) or ".git" in str(bak_file):
                continue

            try:
                # Create date-stamped archive
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                archive_name = f"{bak_file.stem}_{timestamp}.bak"
                archive_path = archive_dir / archive_name

                shutil.move(str(bak_file), str(archive_path))
                self.log_action(f"Archived: {bak_file.name}")
            except Exception:
                pass

    def _format_size(self, bytes: int) -> str:
        """Format bytes as human-readable size"""
        for unit in ["B", "KB", "MB", "GB"]:
            if bytes < 1024:
                return f"{bytes:.1f} {unit}"
            bytes /= 1024
        return f"{bytes:.1f} TB"

    def run_cleanup(self):
        """Run all cleanup operations"""
        self.remove_temp_files()
        self.clean_build_artifacts()
        self.organize_files()
        self.update_metadata_tags()
        self.archive_old_versions()


def generate_report(agent: CleanupAgent) -> str:
    """Generate cleanup report"""
    report = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧹 CLEANUP COMPLETE - Agent Clean Post-Inference
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 CLEANUP METRICS:
  • Files Removed: {agent.files_removed}
  • Files Organized: {agent.files_organized}
  • Files Tagged: {agent.files_tagged}
  • Space Freed: {agent._format_size(agent.space_freed)}

"""

    if agent.actions_taken:
        report += "✅ ACTIONS TAKEN:\n"
        for action in agent.actions_taken[:10]:
            report += f"  {action}\n"
        if len(agent.actions_taken) > 10:
            report += f"  ... and {len(agent.actions_taken) - 10} more actions\n"
    else:
        report += "✨ Environment was already clean - no actions needed!\n"

    report += """
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 NEXT STEPS:
  • Files are organized and tagged
  • Temporary artifacts removed
  • Ready for next inference

🔄 Run /done to advance to next inference
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    return report


def main():
    try:
        # Load hook input from stdin
        input_data = json.load(sys.stdin)

        # Get project directory
        project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")

        # Run cleanup
        agent = CleanupAgent(project_dir)
        agent.run_cleanup()

        # Generate report
        report = generate_report(agent)

        # Save cleanup metrics
        state_file = Path(project_dir) / ".claude" / "state" / "cleanup_metrics.json"
        state_file.parent.mkdir(parents=True, exist_ok=True)

        metrics = {
            "last_cleanup": datetime.now().isoformat(),
            "files_removed": agent.files_removed,
            "files_organized": agent.files_organized,
            "files_tagged": agent.files_tagged,
            "space_freed": agent.space_freed,
            "actions": agent.actions_taken
        }

        state_file.write_text(json.dumps(metrics, indent=2))

        # Output report
        print(report)
        sys.exit(0)

    except Exception as e:
        # Don't block on hook errors
        print(f"Error in clean-post hook: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()
