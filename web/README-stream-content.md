# Stream Content Collection

The **stream** content collection displays real-time activity across the ONE Platform—every file created, feature added, and improvement made.

## Purpose

The stream acts as a live activity feed showing what's happening across:
- `/` root directory
- `/one` documentation
- `/web` frontend
- `/backend` Convex backend
- All repositories

## Schema (Very Flexible)

Only **title** and **date** are required. Everything else is optional:

```yaml
---
title: "Your Update Title"               # Required
date: 2025-01-16                        # Required
description: "Optional description"      # Optional
author: "ONE"                           # Optional (defaults to "ONE")
type: "file_created"                    # Optional: file_created, feature_added, etc.
tags: ["performance", "deployment"]      # Optional
repo: "web"                             # Optional: web, backend, one, etc.
path: "web/src/pages/deploy.astro"     # Optional: original file path
image: "/screenshots/deploy.png"        # Optional
draft: false                            # Optional: hide if true
---

Your markdown content here...
```

## File Naming

Files are sorted by **date** (newest first), not filename. You can use any naming convention:

- `2025-01-16-deploy-page.md`
- `feature-auth-system.md`
- `fix-navigation-bug.md`
- Any filename works!

## How Agents Use This

When AI agents create new files anywhere in the ONE Platform, they should:

1. **Create a stream entry** in `/web/src/content/stream/`
2. **Use minimal frontmatter** (just title and date required)
3. **Add context** about what was created, why, and how
4. **Tag appropriately** for filtering
5. **Specify the repo** if the file is outside `/web`

## Example: New Feature

```yaml
---
title: "Added Deploy Page with Cloudflare Edge Info"
date: 2025-01-16
type: "feature_added"
tags: ["deployment", "cloudflare", "documentation"]
repo: "web"
path: "web/src/pages/deploy.astro"
author: "Claude"
---

Created comprehensive deployment page showcasing:

- 60-second deployment timeline
- Cloudflare Pages vs Workers pricing
- Agent-ops autonomous deployment
- Performance stats (30KB JS, <330ms loads)
- Links to performance blog posts

The page clarifies we deploy TO Cloudflare (not being Cloudflare) and explains how our architecture keeps costs at $0.
```

## Example: Documentation Update

```yaml
---
title: "Updated Architecture Documentation"
date: 2025-01-15
type: "docs_update"
tags: ["documentation", "architecture"]
repo: "one"
path: "one/knowledge/architecture.md"
---

Expanded the architecture guide with:

- Effect.ts service layer patterns
- Convex integration examples
- File organization best practices
```

## Example: Bug Fix

```yaml
---
title: "Fixed Gradient Text Visibility on Deploy Page"
date: 2025-01-16
type: "bug_fix"
tags: ["ui", "bugfix"]
repo: "web"
---

Removed transparent gradient that was making "Deployment" text invisible. Changed to solid `text-primary` color.
```

## Viewing the Stream

- **List view**: `/stream` - Shows all activity in chronological order
- **Detail view**: `/stream/[slug]` - Full content of each update

## Keeping Root Clean

The stream helps keep `/` and `/one` clean by moving activity logs here instead of cluttering the root with files like:

- ❌ `CHANGELOG.md` (use stream instead)
- ❌ `UPDATES.md` (use stream instead)
- ❌ `HISTORY.md` (use stream instead)

**Only these belong in root:**
- README.md
- LICENSE.md
- SECURITY.md
- CLAUDE.md
- AGENTS.md
- .mcp.json

Everything else goes in organized folders with stream entries documenting what happened.

## Automation Ideas

Future automation could:
- Auto-generate stream entries on git commits
- Watch file system for new files
- Parse commit messages for stream content
- Tag based on file location/type
- Generate daily/weekly summaries

---

**The stream is your activity feed. Use it liberally to show progress!**
