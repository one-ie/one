# Installation Folders Guide

**Version:** 1.0.0
**Status:** Production Ready

## Overview

Installation folders enable filesystem-based customization where each ONE installation gets a top-level folder with ontology-structured subdirectories that override global templates.

## Architecture

### Conceptual Model

```
Installation Folder ≠ Database Group
```

- **One installation** can serve **many database groups**
- Installation folder = Documentation/config per organization
- Database groups = Runtime data per group (via `groupId`)

### Folder Structure

```
/
├── one/                        # GLOBAL templates (always fallback)
├── <installation-name>/        # INSTALLATION-SPECIFIC
│   ├── README.md
│   ├── groups/                 # Hierarchical group documentation
│   │   ├── engineering/
│   │   │   ├── frontend/
│   │   │   ├── backend/
│   │   │   └── practices.md
│   │   └── marketing/
│   ├── people/
│   ├── things/
│   ├── connections/
│   ├── events/
│   └── knowledge/
├── web/
├── backend/
└── .claude/
```

## File Resolution

### Resolution Algorithm

```
Given: relativePath = "sprint-guide.md", groupId = frontend

1. Check group-specific:
   /<installation>/groups/engineering/frontend/sprint-guide.md

2. Walk up parents:
   /<installation>/groups/engineering/sprint-guide.md

3. Check installation root:
   /<installation>/sprint-guide.md

4. Global fallback:
   /one/sprint-guide.md

5. Not found: throw error
```

### Implementation

```typescript
import { resolveFile } from '@/lib/utils/file-resolver';

const filePath = await resolveFile('things/vision.md', {
  installationName: 'acme',
  groupId: frontendGroupId,
  fallbackToGlobal: true,
});
```

## Use Cases

### 1. Private Documentation

Store customer-specific documentation that shouldn't be in the global templates:

```bash
echo "# Acme Engineering Handbook" > /acme/groups/engineering/handbook.md
```

### 2. Custom Agent Prompts

Override global AI agent prompts with organization-specific instructions:

```bash
echo "# Custom Agent Rules" > /acme/.claude/rules.md
```

### 3. Group-Specific Workflows

Document workflows unique to specific groups:

```bash
echo "# Frontend Sprint Process" > /acme/groups/engineering/frontend/sprint-guide.md
```

### 4. Installation-Wide Overrides

Replace global vision or rules for entire installation:

```bash
echo "# Our Vision" > /acme/things/vision.md
```

## CLI Usage

### Automatic Initialization (via `/one` Command)

When you run the `/one` command in Claude Code, it automatically performs initialization checks:

**1. Git Repository Initialization**

If `.git` directory doesn't exist:
```bash
✅ Initializing git repository...
git init
git add .
git commit -m "chore: initialize ONE Platform repository"
✅ Git repository initialized
```

**2. Installation Metadata Check**

The `/one` command looks for `.oneie/installation.json`:

```json
{
  "owner": "John Doe",
  "organization": {
    "name": "Acme Corp",
    "url": "https://acme.one.ie"
  },
  "installationId": "acme",
  "createdAt": "2025-10-19T12:00:00Z"
}
```

**3. Display Context**

When found, the `/one` command displays:
```
Account: John Doe
Organization: Acme Corp - https://acme.one.ie
```

### Manual Initialization

You can also initialize explicitly using the CLI:

```bash
$ npx oneie init
? What is your organization name? Acme Corp
? Installation identifier: acme

✅ Creating installation folder: /acme
✅ Mirroring ontology structure...
✅ Creating README.md
✅ Creating .oneie/installation.json
✅ Creating .env.local with INSTALLATION_NAME=acme

🎉 Installation initialized!
```

### Environment Configuration

The installation name is stored in `.env.local`:

```bash
INSTALLATION_NAME=acme
PUBLIC_INSTALLATION_NAME=acme  # Exposed to frontend
```

Installation metadata is stored in `.oneie/installation.json` for display purposes.

## Security

### Path Validation

All file paths are validated to prevent traversal attacks:

```typescript
// ✅ Valid
/acme/things/vision.md

// ❌ Invalid (path traversal)
/acme/../../../etc/passwd

// ❌ Invalid (symlink outside allowed dirs)
/acme/things/../../secrets.txt
```

### Sensitive Data

**NEVER** store secrets or credentials in installation folders:

- ❌ API keys
- ❌ Database passwords
- ❌ OAuth secrets
- ❌ Private keys

Use `.env.local` for sensitive configuration.

### Access Control

Installation folders use filesystem-level isolation:

- Local installations: Standard filesystem permissions
- SaaS deployments: Separate repository per customer
- Git: Exclude installation folders by default (`.gitignore`)

## Deployment

### Cloudflare Pages

**Build Integration:**

Installation folder is copied to `dist/_installation` during build:

```bash
INSTALLATION_NAME=acme npm run build
# Copies /acme/ → dist/_installation/
```

**Runtime Resolution:**

Files are served from `dist/_installation/` on Cloudflare Pages.

### Environment-Specific

Support different docs per environment:

```bash
# Development
INSTALLATION_NAME=acme INSTALLATION_ENV=dev npm run dev

# Production
INSTALLATION_NAME=acme INSTALLATION_ENV=prod npm run build
```

Resolution checks:
1. `/acme-prod/` (environment-specific)
2. `/acme/` (installation default)
3. `/one/` (global fallback)

## Database vs Filesystem

### Example Scenario

**Installation:** Acme Corp (`/acme/`)

**Database groups:**
- `acme-engineering` (groupId: g1, parentGroupId: null)
- `acme-frontend` (groupId: g2, parentGroupId: g1)
- `acme-backend` (groupId: g3, parentGroupId: g1)
- `acme-marketing` (groupId: g4, parentGroupId: null)

**Filesystem docs:**
- `/acme/groups/engineering/practices.md` - Applies to g1, g2, g3
- `/acme/groups/engineering/frontend/sprint-guide.md` - Applies to g2 only
- `/acme/groups/marketing/campaigns.md` - Applies to g4 only

**Key Insight:** Filesystem hierarchy mirrors database `parentGroupId` structure.

## Best Practices

### 1. Start with Global Templates

Don't override files unless you have a specific reason:

```bash
# ✅ Good: Override when needed
/acme/things/vision.md  # Custom vision

# ❌ Bad: Unnecessary duplication
/acme/things/architecture.md  # Same as /one/things/architecture.md
```

### 2. Use Hierarchical Groups

Leverage parent groups for shared documentation:

```bash
# Shared by all engineering subgroups
/acme/groups/engineering/practices.md

# Frontend-specific
/acme/groups/engineering/frontend/sprint-guide.md

# Backend-specific
/acme/groups/engineering/backend/deployment-guide.md
```

### 3. Version Control

Decide if installation folder should be in git:

```bash
# Option 1: Exclude (default)
echo "/acme/" >> .gitignore

# Option 2: Track in separate repo
cd /acme && git init
```

### 4. Documentation Hygiene

Keep installation folders clean and organized:

- Use descriptive filenames
- Follow ontology structure
- Delete unused files
- Update README.md with context

## FAQ

**Q: Do I need an installation folder?**
A: No, it's optional. The system falls back to `/one/` if no installation folder exists.

**Q: Can I have multiple installation folders?**
A: Phase 2 feature. Currently, one installation per deployment.

**Q: What if I delete my installation folder?**
A: The system falls back to global `/one/` templates. No data loss (database is separate).

**Q: Can installation folders access each other?**
A: No, strict isolation. Each installation only sees its own folder and `/one/`.

**Q: How do I sync installation folder to production?**
A: Use git, CI/CD, or (future) `npx oneie sync --upload`.

## Learn More

- Complete implementation plan: `/one/things/plans/group-folder-multi-tenancy.md`
- 6-Dimension Ontology: `/one/knowledge/ontology.md`
- Development workflow: `/one/connections/workflow.md`
- CLI reference: `/one/knowledge/cli.md` (TODO)

---

**Simple enough for individuals. Powerful enough for enterprises.**
