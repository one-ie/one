#!/usr/bin/env python3
"""
ONE Platform - Metadata Tagging Script
Applies metadata tags to all documentation files.

Usage:
    python3 .claude/hooks/tag-all-docs.py [--dry-run] [--verbose]

This script:
- Scans all markdown files in one/ directory
- Adds metadata frontmatter if missing
- Infers dimension, category, and tags from file location and content
- Updates existing metadata if incomplete
- Generates a comprehensive report
"""
import argparse
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import sys

# Dimension inference from directory structure
DIMENSION_MAP = {
    "groups": "groups",
    "people": "people",
    "things": "things",
    "connections": "connections",
    "events": "events",
    "knowledge": "knowledge",
}

# Category inference from subdirectories
CATEGORY_MAP = {
    "agents": "agents",
    "plans": "plans",
    "products": "products",
    "features": "features",
    "components": "components",
    "examples": "examples",
    "claude": "agents",
    "protocols": "protocols",
    "workflows": "workflows",
}

# Tag suggestions based on keywords in content
TAG_KEYWORDS = {
    "ai": ["ai", "artificial-intelligence", "machine-learning"],
    "agent": ["intelligence-agent", "ai-agent", "automation"],
    "ontology": ["ontology", "data-model", "schema"],
    "protocol": ["protocol", "specification", "interoperability"],
    "architecture": ["architecture", "system-design", "patterns"],
    "frontend": ["frontend", "ui", "components", "react"],
    "backend": ["backend", "convex", "database", "services"],
    "blockchain": ["blockchain", "crypto", "web3", "sui", "solana"],
    "authentication": ["auth", "authentication", "authorization", "rbac"],
    "testing": ["testing", "quality", "validation", "e2e"],
}


class MetadataTagger:
    def __init__(self, project_dir: str, dry_run: bool = False, verbose: bool = False):
        self.project_dir = Path(project_dir)
        self.dry_run = dry_run
        self.verbose = verbose
        self.files_processed = 0
        self.files_tagged = 0
        self.files_updated = 0
        self.files_skipped = 0

    def scan_and_tag_all(self):
        """Scan all markdown files and add/update metadata"""
        one_dir = self.project_dir / "one"
        if not one_dir.exists():
            print(f"Error: {one_dir} does not exist")
            return

        markdown_files = list(one_dir.rglob("*.md"))
        print(f"Found {len(markdown_files)} markdown files to process\n")

        for md_file in markdown_files:
            self.files_processed += 1
            self.process_file(md_file)

    def process_file(self, file_path: Path):
        """Process a single markdown file"""
        try:
            content = file_path.read_text()
            relative_path = file_path.relative_to(self.project_dir)

            # Check if file has metadata
            has_metadata, existing_metadata = self.parse_existing_metadata(content)

            if has_metadata and self.is_metadata_complete(existing_metadata):
                if self.verbose:
                    print(f"✓ {relative_path} - Already has complete metadata")
                self.files_skipped += 1
                return

            # Generate metadata
            metadata = self.generate_metadata(file_path, content, existing_metadata)

            # Apply metadata
            if has_metadata:
                new_content = self.update_metadata(content, metadata)
                action = "Updated"
                self.files_updated += 1
            else:
                new_content = self.add_metadata(content, metadata)
                action = "Tagged"
                self.files_tagged += 1

            if self.dry_run:
                print(f"[DRY RUN] Would {action.lower()}: {relative_path}")
                if self.verbose:
                    print(f"  Metadata: {metadata}")
            else:
                file_path.write_text(new_content)
                print(f"{action}: {relative_path}")
                if self.verbose:
                    print(f"  Metadata: {metadata}")

        except Exception as e:
            print(f"✗ Error processing {file_path.name}: {e}")

    def parse_existing_metadata(self, content: str) -> Tuple[bool, Dict]:
        """Parse existing YAML frontmatter"""
        if not content.startswith("---\n"):
            return False, {}

        # Find end of frontmatter
        end_match = re.search(r"\n---\n", content[4:])
        if not end_match:
            return False, {}

        frontmatter = content[4:4 + end_match.start()]

        # Parse YAML-like metadata (simple parsing)
        metadata = {}
        for line in frontmatter.split("\n"):
            if ":" in line:
                key, value = line.split(":", 1)
                metadata[key.strip()] = value.strip()

        return True, metadata

    def is_metadata_complete(self, metadata: Dict) -> bool:
        """Check if metadata has all required fields"""
        required_fields = [
            "title",
            "dimension",
            "category",
            "tags",
            "created",
            "updated",
            "version",
            "ai_context"
        ]

        return all(field in metadata for field in required_fields)

    def generate_metadata(
        self,
        file_path: Path,
        content: str,
        existing: Dict
    ) -> Dict:
        """Generate metadata for a file"""
        relative_path = file_path.relative_to(self.project_dir)
        parts = relative_path.parts

        # Infer dimension from first directory level
        dimension = parts[1] if len(parts) > 1 and parts[1] in DIMENSION_MAP else "knowledge"

        # Infer category from second directory level or filename
        category = "general"
        if len(parts) > 2:
            subdir = parts[2]
            category = CATEGORY_MAP.get(subdir, subdir)

        # Generate title from filename
        title = existing.get("title") or file_path.stem.replace("-", " ").title()

        # Extract/infer tags
        tags = self.infer_tags(content, file_path, existing)

        # Generate AI context
        ai_context = self.generate_ai_context(file_path, dimension, category, content)

        return {
            "title": title,
            "dimension": dimension,
            "category": category,
            "tags": tags,
            "created": existing.get("created", datetime.now().strftime("%Y-%m-%d")),
            "updated": datetime.now().strftime("%Y-%m-%d"),
            "version": existing.get("version", "1.0.0"),
            "ai_context": ai_context,
        }

    def infer_tags(self, content: str, file_path: Path, existing: Dict) -> List[str]:
        """Infer tags from content and context"""
        tags = set()

        # Use existing tags if present
        if existing.get("tags"):
            existing_tags_str = existing["tags"].strip("[]")
            tags.update(tag.strip() for tag in existing_tags_str.split(","))

        # Add tags based on filename
        filename_lower = file_path.stem.lower()
        for keyword, keyword_tags in TAG_KEYWORDS.items():
            if keyword in filename_lower:
                tags.update(keyword_tags[:2])  # Add first 2 related tags

        # Add tags based on content (first 500 chars)
        content_sample = content[:500].lower()
        for keyword, keyword_tags in TAG_KEYWORDS.items():
            if keyword in content_sample:
                tags.add(keyword_tags[0])  # Add primary tag

        # Limit to 7 tags
        return sorted(list(tags))[:7]

    def generate_ai_context(
        self,
        file_path: Path,
        dimension: str,
        category: str,
        content: str
    ) -> str:
        """Generate AI context description"""
        relative_path = file_path.relative_to(self.project_dir)

        # Extract first heading or first paragraph
        purpose = "Provides information"
        heading_match = re.search(r"^#\s+(.+)$", content, re.MULTILINE)
        if heading_match:
            purpose = f"Documents {heading_match.group(1).lower()}"
        else:
            first_para = re.search(r"^[A-Z].+\.", content, re.MULTILINE)
            if first_para:
                purpose = first_para.group(0)[:100]

        return f"""This document is part of the {dimension} dimension in the {category} category.
Location: {relative_path}
Purpose: {purpose}
For AI agents: Read this to understand {file_path.stem.replace("-", " ")}."""

    def add_metadata(self, content: str, metadata: Dict) -> str:
        """Add metadata frontmatter to content"""
        tags_str = ", ".join(metadata["tags"])

        frontmatter = f"""---
title: {metadata['title']}
dimension: {metadata['dimension']}
category: {metadata['category']}
tags: [{tags_str}]
created: {metadata['created']}
updated: {metadata['updated']}
version: {metadata['version']}
ai_context: |
  {metadata['ai_context']}
---

"""
        return frontmatter + content

    def update_metadata(self, content: str, metadata: Dict) -> str:
        """Update existing metadata frontmatter"""
        # Find end of existing frontmatter
        end_match = re.search(r"\n---\n", content[4:])
        if not end_match:
            return self.add_metadata(content, metadata)

        # Replace with new metadata
        body = content[4 + end_match.end():]
        return self.add_metadata(body, metadata)

    def print_summary(self):
        """Print summary of tagging operation"""
        print("\n" + "=" * 70)
        print("METADATA TAGGING SUMMARY")
        print("=" * 70)
        print(f"Files Processed:     {self.files_processed}")
        print(f"Files Tagged:        {self.files_tagged}")
        print(f"Files Updated:       {self.files_updated}")
        print(f"Files Skipped:       {self.files_skipped}")
        print("=" * 70)

        if self.dry_run:
            print("\n[DRY RUN] No files were actually modified.")
            print("Run without --dry-run to apply changes.")
        else:
            print("\n✅ Tagging complete! All files now have metadata.")


def main():
    parser = argparse.ArgumentParser(
        description="Add metadata tags to all ONE Platform documentation files"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be tagged without modifying files"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Show detailed output for each file"
    )
    parser.add_argument(
        "--project-dir",
        default=".",
        help="Project root directory (default: current directory)"
    )

    args = parser.parse_args()

    tagger = MetadataTagger(
        project_dir=args.project_dir,
        dry_run=args.dry_run,
        verbose=args.verbose
    )

    print("=" * 70)
    print("ONE PLATFORM METADATA TAGGING")
    print("=" * 70)
    if args.dry_run:
        print("[DRY RUN MODE - No files will be modified]")
    print()

    tagger.scan_and_tag_all()
    tagger.print_summary()


if __name__ == "__main__":
    main()
