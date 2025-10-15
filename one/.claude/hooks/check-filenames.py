#!/usr/bin/env python3
"""Check for files that don't follow kebab-case naming"""
import os
import re
from pathlib import Path

one_dir = Path("/Users/toc/Server/ONE/one")
pattern = re.compile(r'^[a-z0-9]+(-[a-z0-9]+)*\.(md|yaml|yml|json)$')

invalid_files = []

for root, dirs, files in os.walk(one_dir):
    # Skip .git and .obsidian
    dirs[:] = [d for d in dirs if d not in ['.git', '.obsidian']]

    for filename in files:
        if filename.endswith(('.md', '.yaml', '.yml', '.json')):
            if not pattern.match(filename):
                filepath = os.path.join(root, filename)
                # Suggest kebab-case name
                suggested = filename.lower()
                suggested = re.sub(r'[^a-z0-9.]+', '-', suggested)
                suggested = re.sub(r'-+', '-', suggested)
                suggested = re.sub(r'^-|-$', '', suggested)

                invalid_files.append({
                    'path': filepath,
                    'filename': filename,
                    'suggested': suggested
                })

if invalid_files:
    print(f"Found {len(invalid_files)} files with invalid naming:\n")
    for item in invalid_files:
        print(f"❌ {item['path']}")
        print(f"   Current:   {item['filename']}")
        print(f"   Suggested: {item['suggested']}")
        print()
else:
    print("✅ All files follow kebab-case naming convention!")
