#!/usr/bin/env python3
"""
ONE Platform - Clean Agent Pre-Inference Hook
Validates cleanliness before starting each inference.

This hook runs before UserPromptSubmit to ensure:
- File structure is intact
- No orphaned files exist
- Naming conventions are followed
- Documentation is up to date
- No uncommitted critical changes
- Metadata tags are present on all docs
"""
import json
import sys
import os
from pathlib import Path
from typing import Dict, Any, List, Tuple
import subprocess
import re

# Critical directories that must exist
REQUIRED_DIRS = [
    "one/connections",
    "one/events",
    "one/knowledge",
    "one/things",
    "one/people",
    "one/groups",
    ".claude/hooks",
    ".claude/state",
]

# File naming conventions
NAMING_PATTERNS = {
    ".md": r"^[a-z0-9\-]+\.md$",  # kebab-case for markdown
    ".ts": r"^[a-z0-9\-]+\.ts$",   # kebab-case for TypeScript
    ".tsx": r"^[A-Z][a-zA-Z0-9]+\.tsx$",  # PascalCase for React components
}

# Files that should have metadata frontmatter
METADATA_REQUIRED_PATTERNS = [
    "one/**/*.md",
    "CLAUDE.md",
    "AGENTS.md",
    "README.md",
]


class CleanlinessValidator:
    def __init__(self, project_dir: str):
        self.project_dir = Path(project_dir)
        self.issues: List[Tuple[str, str]] = []  # (severity, message)
        self.warnings: List[str] = []
        self.metrics: Dict[str, Any] = {}

    def add_issue(self, severity: str, message: str):
        """Add a cleanliness issue"""
        self.issues.append((severity, message))

    def add_warning(self, message: str):
        """Add a warning"""
        self.warnings.append(message)

    def validate_directory_structure(self):
        """Check that all required directories exist"""
        for dir_path in REQUIRED_DIRS:
            full_path = self.project_dir / dir_path
            if not full_path.exists():
                self.add_issue("error", f"Missing required directory: {dir_path}")
            elif not full_path.is_dir():
                self.add_issue("error", f"Path exists but is not a directory: {dir_path}")

    def validate_file_naming(self):
        """Check that files follow naming conventions"""
        problematic_files = []

        # Check markdown files in one/
        for md_file in (self.project_dir / "one").rglob("*.md"):
            if not re.match(NAMING_PATTERNS[".md"], md_file.name):
                problematic_files.append(str(md_file.relative_to(self.project_dir)))

        if problematic_files:
            self.add_warning(f"Files not following kebab-case convention: {', '.join(problematic_files[:5])}")
            if len(problematic_files) > 5:
                self.add_warning(f"... and {len(problematic_files) - 5} more")

    def find_orphaned_files(self):
        """Find files that don't belong anywhere"""
        orphans = []

        # Check for common temporary/generated files
        temp_patterns = ["*.tmp", "*.swp", "*.bak", "*.DS_Store", "*~"]
        for pattern in temp_patterns:
            for temp_file in self.project_dir.rglob(pattern):
                # Skip node_modules and .git
                if "node_modules" not in str(temp_file) and ".git" not in str(temp_file):
                    orphans.append(str(temp_file.relative_to(self.project_dir)))

        if orphans:
            self.add_warning(f"Found {len(orphans)} temporary/backup files that should be cleaned")
            for orphan in orphans[:3]:
                self.add_warning(f"  - {orphan}")

    def check_metadata_tags(self):
        """Check that documentation files have metadata frontmatter"""
        missing_metadata = []

        # Check markdown files in one/
        for md_file in (self.project_dir / "one").rglob("*.md"):
            try:
                content = md_file.read_text()
                # Check for YAML frontmatter
                if not content.startswith("---\n"):
                    missing_metadata.append(str(md_file.relative_to(self.project_dir)))
                else:
                    # Validate frontmatter has required fields
                    frontmatter_end = content.find("\n---\n", 4)
                    if frontmatter_end == -1:
                        missing_metadata.append(str(md_file.relative_to(self.project_dir)))
            except Exception:
                pass  # Skip files we can't read

        self.metrics["files_without_metadata"] = len(missing_metadata)

        if missing_metadata:
            self.add_warning(f"{len(missing_metadata)} files missing metadata tags")

    def check_git_status(self):
        """Check for uncommitted changes in critical files"""
        try:
            # Only check if we're in a git repo
            if not (self.project_dir / ".git").exists():
                return

            result = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.project_dir,
                capture_output=True,
                text=True,
                timeout=5
            )

            if result.returncode == 0 and result.stdout:
                lines = result.stdout.strip().split("\n")
                critical_changes = [
                    line for line in lines
                    if any(pattern in line for pattern in ["CLAUDE.md", "AGENTS.md", "schema.ts"])
                ]

                if critical_changes:
                    self.add_warning(f"Uncommitted changes in {len(critical_changes)} critical files")

                self.metrics["uncommitted_files"] = len(lines)
        except Exception:
            pass  # Skip if git check fails

    def calculate_cleanliness_score(self) -> int:
        """Calculate overall cleanliness score (0-100)"""
        score = 100

        # Deduct points for issues
        for severity, _ in self.issues:
            if severity == "error":
                score -= 10
            elif severity == "warning":
                score -= 5

        # Deduct for warnings
        score -= len(self.warnings) * 2

        # Bonus for good metrics
        if self.metrics.get("files_without_metadata", 0) == 0:
            score += 5
        if self.metrics.get("uncommitted_files", 0) == 0:
            score += 5

        return max(0, min(100, score))

    def run_all_checks(self):
        """Run all cleanliness validation checks"""
        self.validate_directory_structure()
        self.validate_file_naming()
        self.find_orphaned_files()
        self.check_metadata_tags()
        self.check_git_status()


def generate_report(validator: CleanlinessValidator) -> str:
    """Generate cleanliness report"""
    score = validator.calculate_cleanliness_score()

    # Determine status emoji
    if score >= 90:
        status = "✨ Excellent"
        color = "🟢"
    elif score >= 70:
        status = "👍 Good"
        color = "🟡"
    elif score >= 50:
        status = "⚠️  Needs Attention"
        color = "🟠"
    else:
        status = "🔴 Critical Issues"
        color = "🔴"

    report = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{color} CLEANLINESS VALIDATION - {status} ({score}/100)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    # Show errors
    errors = [issue for issue in validator.issues if issue[0] == "error"]
    if errors:
        report += "\n🔴 ERRORS:\n"
        for _, message in errors:
            report += f"  • {message}\n"

    # Show warnings
    if validator.warnings:
        report += "\n⚠️  WARNINGS:\n"
        for warning in validator.warnings[:5]:  # Limit to 5
            report += f"  • {warning}\n"
        if len(validator.warnings) > 5:
            report += f"  ... and {len(validator.warnings) - 5} more warnings\n"

    # Show metrics
    if validator.metrics:
        report += "\n📊 METRICS:\n"
        for key, value in validator.metrics.items():
            formatted_key = key.replace("_", " ").title()
            report += f"  • {formatted_key}: {value}\n"

    # Show clean status
    if not errors and not validator.warnings:
        report += "\n✅ Everything is clean! Ready to proceed.\n"

    report += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

    # Add recommendations
    if score < 90:
        report += "\n💡 RECOMMENDATIONS:\n"
        if validator.metrics.get("files_without_metadata", 0) > 0:
            report += "  • Run: Add metadata tags to documentation files\n"
        if validator.metrics.get("uncommitted_files", 0) > 0:
            report += "  • Run: git add . && git commit -m 'chore: clean up'\n"
        if any(issue[0] == "error" for issue in validator.issues):
            report += "  • Fix critical errors before proceeding with inference\n"
        report += "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n"

    return report


def main():
    try:
        # Load hook input from stdin
        input_data = json.load(sys.stdin)
        prompt = input_data.get("prompt", "")

        # Get project directory
        project_dir = os.environ.get("CLAUDE_PROJECT_DIR", ".")

        # Skip validation for workflow commands
        if prompt.strip().startswith("/"):
            sys.exit(0)

        # Run validation
        validator = CleanlinessValidator(project_dir)
        validator.run_all_checks()

        # Generate report
        report = generate_report(validator)

        # Determine if we should block
        score = validator.calculate_cleanliness_score()
        errors = [issue for issue in validator.issues if issue[0] == "error"]

        # Only block if there are critical errors
        if errors and score < 30:
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "UserPromptSubmit",
                    "additionalContext": report,
                    "blocked": True,
                    "blockedMessage": "Critical cleanliness issues detected. Please fix errors before proceeding."
                },
            }
        else:
            # Just show report as context
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "UserPromptSubmit",
                    "additionalContext": report,
                },
            }

        print(json.dumps(output))
        sys.exit(0)

    except Exception as e:
        # Don't block on hook errors
        print(f"Error in clean-pre hook: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()
