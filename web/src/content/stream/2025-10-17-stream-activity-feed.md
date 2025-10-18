---
title: "Stream Activity Feed: Platform-Wide Updates"
date: 2025-10-17T16:00:00Z
description: "Launched flexible stream system showing real-time activity across the entire ONE Platform"
type: "feature_added"
tags: ["stream", "content", "documentation", "transparency"]
repo: "web"
path: "web/src/content/stream/"
author: "Claude"
featured: true
---

Launched the **Stream Activity Feed**—a flexible system for documenting everything happening across the ONE Platform in real-time.

## What Was Built

### 1. Flexible Content Schema
```typescript
const StreamSchema = z.object({
  title: z.string(),              // Required
  date: z.date(),                 // Required
  description: z.string().optional(),
  author: z.string().optional().default('ONE'),
  type: z.string().optional(),    // file_created, feature_added, etc.
  tags: z.array(z.string()).optional(),
  image: z.string().optional(),
  draft: z.boolean().optional(),
  path: z.string().optional(),    // Original file path
  repo: z.string().optional(),    // web, backend, one, etc.
});
```

**Only title and date required** - everything else is optional for maximum flexibility.

### 2. Stream List Page (`/stream`)
- Shows all updates sorted by date (newest first)
- Card-based layout with metadata
- Relative time display ("2 hours ago")
- Badges for type, repo, tags
- Empty state for no updates
- Responsive design

### 3. Individual Entry Pages (`/stream/[slug]`)
- Full markdown content rendering
- Metadata display (author, type, repo, path)
- Prose styling for readability
- Back navigation
- Dark mode support

### 4. Documentation (`stream/README.md`)
- Complete usage guide
- Schema examples
- Best practices for agents
- File naming conventions
- Automation ideas

## Purpose: Keep Root Clean

The stream replaces clutter in `/` and `/one`:

### ❌ Before
```
/
├── CHANGELOG.md
├── UPDATES.md
├── HISTORY.md
├── NOTES.md
└── ... (messy!)
```

### ✅ After
```
/
├── README.md
├── LICENSE.md
├── SECURITY.md
├── CLAUDE.md
├── AGENTS.md
└── .mcp.json

/web/src/content/stream/
├── 2025-01-16-feature-x.md
├── 2025-01-15-bugfix-y.md
└── ... (organized!)
```

## How It Works

### For Humans
1. Visit `/stream` to see latest activity
2. Browse chronologically
3. Click to read full updates
4. Filter by tags, type, repo

### For Agents/Automation
1. Create markdown file in `web/src/content/stream/`
2. Add minimal frontmatter (title + date)
3. Write what happened
4. Stream auto-displays sorted by date

### Example Entry
```yaml
---
title: "Added Deploy Page"
date: 2025-01-16
type: "feature_added"
tags: ["deployment", "documentation"]
repo: "web"
---

Created comprehensive deployment guide...
```

## What Gets Tracked

- **File creations**: New pages, components, features
- **Updates**: Documentation changes, improvements
- **Bug fixes**: Issues resolved
- **Performance**: Optimizations made
- **Integrations**: New connections added
- **Deployments**: Production releases

## Benefits

### Transparency
- Public activity log
- Real-time updates
- Progress visibility
- Community engagement

### Organization
- Centralized activity feed
- Clean root directory
- Structured metadata
- Easy search/filter

### Automation-Friendly
- Simple markdown format
- Flexible schema
- Git-based workflow
- CI/CD integration

## Future Automation

The stream enables:
- Auto-generate on git commits
- Watch file system for changes
- Parse commit messages
- Tag based on file location
- Daily/weekly summaries
- RSS feed generation

## Live Now

Visit `/stream` to see:
- This update
- Deploy page creation
- OrbitingCircles integration
- Real deployment metrics
- Navigation enhancements

The stream is your window into everything happening on ONE Platform—transparent, organized, and real-time.
