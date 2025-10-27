#!/usr/bin/env python3
"""
Automatically move demo/deliverable markdown files from root to /one/events/
Keeps root clean with only essential documentation files.
"""
import os
import shutil
from pathlib import Path

# Root directory
root_dir = Path("/Users/toc/Server/ONE")

# Files allowed to stay in root
ALLOWED_ROOT_FILES = {
    "README.md",
    "CLAUDE.md",
    "LICENSE.md",
    "SECURITY.md",
    "AGENTS.md",
    "release.md",
}

# Target directory for demo/deliverable files
events_dir = root_dir / "one" / "events"
events_dir.mkdir(parents=True, exist_ok=True)

# Find all markdown and text files in root that should be moved
files_moved = []
files_skipped = []

for file_path in root_dir.glob("*.md"):
    filename = file_path.name

    # Skip allowed files
    if filename in ALLOWED_ROOT_FILES:
        files_skipped.append(filename)
        continue

    # Move file to events
    try:
        dest = events_dir / filename
        shutil.move(str(file_path), str(dest))
        files_moved.append(filename)
    except Exception as e:
        print(f"❌ Failed to move {filename}: {e}")

# Also move .txt files that look like deliverables
for file_path in root_dir.glob("*.txt"):
    filename = file_path.name

    # Skip if it's a git-related file
    if filename in {"package-lock.txt", ".gitignore"}:
        continue

    try:
        dest = events_dir / filename
        shutil.move(str(file_path), str(dest))
        files_moved.append(filename)
    except Exception as e:
        print(f"❌ Failed to move {filename}: {e}")

# Report
if files_moved:
    print(f"✅ Root cleanup complete!")
    print(f"   Moved {len(files_moved)} files to /one/events/:")
    for f in sorted(files_moved):
        print(f"   • {f}")
    print()

if files_skipped:
    print(f"✅ Kept {len(files_skipped)} essential files in root:")
    for f in sorted(files_skipped):
        print(f"   • {f}")
else:
    print("✅ Root is clean - all essential files preserved!")
