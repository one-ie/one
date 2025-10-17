# Feature 2: ONE CLI - Bootstrap & Ontology Sync

**Version:** 2.0.0
**Package:** `npx oneie`
**Status:** In Development
**Priority:** Critical

---

## Overview

The ONE CLI is a bootstrap and synchronization tool that:

1. **Copies ontology files** from the ONE framework to user projects
2. **Syncs agent definitions** to Claude Code integration
3. **Creates user & organization profiles** with ontology mappings
4. **Clones frontend repository** for website building
5. **Clones third-party documentation** for AI context

**Core Command:** `npx oneie`

---

## User Flow

### Phase 1: Installation Initialization

```bash
npx oneie init
```

**What happens:**

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║    ██████╗ ███╗   ██╗███████╗    Turn ideas into reality         ║
║   ██╔═══██╗████╗  ██║██╔════╝                                    ║
║   ██║   ██║██╔██╗ ██║█████╗      https://one.ie                  ║
║   ██║   ██║██║╚██╗██║██╔══╝                                      ║
║   ╚██████╔╝██║ ╚████║███████╗    npx oneie                       ║
║    ╚═════╝ ╚═╝  ╚═══╝╚══════╝                                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

✨ Welcome to ONE!

ONE is organized by groups which have their own people, things,
connections, events, and knowledge. Groups can have subgroups.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📥 Downloading ONE Framework...

✓ Copied 100+ ontology files from /one/
✓ Synced 12 agent definitions to .claude/agents/
✓ Copied Claude Code hooks and commands

ONE Setup Complete! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 Account Setup

What's your name? Anthony O'Connell
What's your email? anthony@one.ie

✓ Created your profile in one/people/anthony-o-connell.md

Account Setup Complete! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏢 Organization Setup

What's your organization name? Acme Corp
Installation identifier: acme
Domain: acme.com

Creating your installation folder...
✓ /acme/groups/
✓ /acme/people/
✓ /acme/things/
✓ /acme/connections/
✓ /acme/events/
✓ /acme/knowledge/

✓ Created installation README
✓ Updated .env.local with INSTALLATION_NAME=acme

Organization Setup Complete! 🎉

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Next: Create Your First Group

Visit your web app to create groups in the database:
  cd web && bun run dev

Then run this to generate group documentation:
  npx oneie create-group-docs

You're all set! 🚀
```

---

### Phase 2: Website Setup (Optional)

```
🌐 Step 4: Website Setup

Would you like to build a website? (yes/no): yes

Cloning frontend repository...
✓ git clone https://github.com/one-ie/web.git → /web
✓ Installed dependencies (bun install)
✓ Created web/.env.local with your installation details

Your website is ready at: http://localhost:4321
Run: cd web && bun dev
```

### Phase 3: Third-Party Docs (Optional)

```
📖 Step 5: Third-Party Documentation

Would you like to clone third-party docs for AI context? Don't do this unless you plan to start development. You can add later if you like. (yes/no): yes

⚠️  This will download complete documentation repositories (~500MB)
   Only needed if you plan to do development with offline AI context.

Cloning documentation repositories...
✓ Astro docs → /docs/astro
✓ Convex docs → /docs/convex
✓ Effect.ts docs → /docs/effect
✓ React docs → /docs/react
✓ Tailwind CSS docs → /docs/tailwind

Documentation cloned! AI agents can now reference these offline.
```

### Phase 4: Complete

```
✅ Setup Complete!

Your ONE environment is ready:

📁 Project Structure:
   /one/                 → Global ontology (100+ files)
   /acme/                → Installation folder (your private docs)
      ├── groups/        → Hierarchical group docs
      ├── people/        → People profiles
      ├── things/        → Entity definitions
      ├── connections/   → Relationship definitions
      ├── events/        → Event specifications
      └── knowledge/     → RAG, AI, embeddings
   /web/                 → Astro + React website
   /docs/                → Third-party documentation
   /.claude/             → AI agent integration


🧑 Your Profile:
   Name: Anthony O'Connell
   Email: anthony@one.ie
   Username: anthony
   Role: org_owner
   File: one/people/anthony-o-connell.md

🏢 Your Organization:
   Name: ONE Platform
   Slug: one
   Domain: one.ie
   File: /acme/groups/one.md
   Installation: /acme/

🚀 Next Steps:

1. Start building:
   cd web && bun run dev

2. Use AI agents:
   claude

3. Read the docs:
   cat one/knowledge/ontology.md

4. Create your first feature:
   /build

Happy building! 🎉
```

---

## Technical Implementation

### 1. Installation Folder Initialization

**File:** `cli/src/commands/init.ts`

**Purpose:** Create installation folder with 6-dimension structure

**Configuration:**
```yaml
# ONE CLI - Installation Configuration
# cli/config.yaml

# Claude Code Integration (global)
claude_folders:
  - .claude/agents
  - .claude/commands
  - .claude/hooks

# Global Ontology (copy from /one/* to user's project)
one_folders:
  - one/**/*

# Installation Folder Structure (created per installation)
installation_structure:
  - groups/          # Hierarchical group docs (supports nesting)
  - people/          # People profiles
  - things/          # Entity definitions
  - connections/     # Relationship definitions
  - events/          # Event specifications
  - knowledge/       # RAG, AI, embeddings

# File extensions to copy
allowed_extensions:
  - .md
  - .yaml
  - .yml
  - .json
  - .sh

# Files/folders to exclude
exclude_patterns:
  - "*/node_modules/*"
  - "*/.git/*"
  - "*/dist/*"
  - "*/build/*"
  - "*/.DS_Store"
  - "*/package-lock.json"
  - "*/bun.lockb"

# Environment variables
env_vars:
  - INSTALLATION_NAME  # Set during init
  - INSTALLATION_ENV   # Optional: dev, staging, prod
```

**Implementation:**

```typescript
// cli/src/commands/init.ts
import fs from "fs/promises";
import path from "path";
import prompts from "prompts";
import { syncOntologyFiles } from "../utils/sync-ontology";
import { createInstallationFolder } from "../utils/installation-setup";
import { updateEnvFile } from "../utils/env-updater";
import { updateGitignore } from "../utils/gitignore-updater";

export async function initCommand() {
  // 1. Prompt for installation details
  const { orgName, installationId } = await prompts([
    {
      type: "text",
      name: "orgName",
      message: "What is your organization name?",
      validate: (value) => value.length > 0 ? true : "Organization name cannot be empty"
    },
    {
      type: "text",
      name: "installationId",
      message: "Installation identifier (lowercase, hyphens only):",
      validate: (value) => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(value)
        ? true
        : "Must be lowercase letters, numbers, and hyphens only"
    }
  ]);

  // 2. Create installation folder
  console.log(`\nCreating installation folder: /${installationId}`);
  await createInstallationFolder(installationId, orgName);

  // 3. Sync global ontology
  console.log("\nCopying ontology files from /one/*...");
  await syncOntologyFiles();

  // 4. Update environment
  console.log("\n✓ Updated .env.local with INSTALLATION_NAME=" + installationId);
  await updateEnvFile({ INSTALLATION_NAME: installationId });

  // 5. Update .gitignore
  console.log("✓ Updated .gitignore");
  await updateGitignore(installationId);

  console.log("\n🎉 Installation initialized!");
  console.log(`\nYour private docs go in /${installationId}/`);
  console.log("\nNext steps:");
  console.log("  1. Create your first group in the database (via web UI)");
  console.log(`  2. Add group-specific docs: /${installationId}/groups/<group-slug>/`);
  console.log("  3. Run: npx oneie dev");
}

// cli/src/utils/installation-setup.ts
import fs from "fs/promises";
import path from "path";

const INSTALLATION_DIMENSIONS = [
  "groups",
  "people",
  "things",
  "connections",
  "events",
  "knowledge"
];

export async function createInstallationFolder(
  installationId: string,
  orgName: string
) {
  const installationPath = path.join(process.cwd(), installationId);

  // Create root folder
  await fs.mkdir(installationPath, { recursive: true });

  // Create 6-dimension folders
  for (const dimension of INSTALLATION_DIMENSIONS) {
    const dimensionPath = path.join(installationPath, dimension);
    await fs.mkdir(dimensionPath, { recursive: true });
    console.log(`✓ /${installationId}/${dimension}/`);
  }

  // Create README
  const readmeContent = `# ${orgName} - ONE Installation

**Installation ID:** \`${installationId}\`
**Created:** ${new Date().toISOString().split('T')[0]}

---

## Structure

This installation folder follows the 6-dimension ontology:

- **groups/** - Hierarchical group documentation (supports nesting)
- **people/** - People profiles and roles
- **things/** - Entity definitions and specs
- **connections/** - Relationship definitions
- **events/** - Event specifications
- **knowledge/** - RAG, AI, embeddings

## File Resolution

Files in this folder override global templates in \`/one/\`:

1. \`/${installationId}/groups/<group-path>/<file>\` (most specific)
2. \`/${installationId}/<dimension>/<file>\` (installation-wide)
3. \`/one/<dimension>/<file>\` (global fallback)

## Hierarchical Groups

Create nested group documentation matching your database structure:

\`\`\`bash
mkdir -p /${installationId}/groups/engineering/frontend
echo "# Frontend Practices" > /${installationId}/groups/engineering/frontend/practices.md
\`\`\`

## Security

- **DO NOT** store secrets or credentials here
- Use \`.env.local\` for environment variables
- This folder is for documentation and configuration only
- Optionally exclude from git (see .gitignore)

---

**Built with ONE Platform:** https://one.ie
`;

  await fs.writeFile(
    path.join(installationPath, "README.md"),
    readmeContent,
    "utf-8"
  );

  console.log(`✓ Created /${installationId}/README.md`);

  return installationPath;
}
```

---

### 2. Sync Agent Definitions

**Sync:** `one/things/agents/* → .claude/agents/*`

**Implementation:**

```typescript
// cli/src/sync-agents.ts
import fs from "fs/promises";
import path from "path";
import { glob } from "glob";

export async function syncAgentDefinitions() {
  const sourceDir = path.join(__dirname, "../../one/things/agents");
  const targetDir = path.join(process.cwd(), ".claude/agents");

  // Create target directory
  await fs.mkdir(targetDir, { recursive: true });

  // Find all agent files
  const agentFiles = await glob("*.md", { cwd: sourceDir });

  // Copy each agent file
  for (const file of agentFiles) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    await fs.copyFile(sourcePath, targetPath);
  }

  console.log(`✓ Synced ${agentFiles.length} agent definitions`);

  return {
    agentsSynced: agentFiles.length,
    agents: agentFiles.map((f) => path.basename(f, ".md")),
  };
}
```

**Also copy .claude/* to user:**

```typescript
// cli/src/copy-claude-config.ts
import fs from "fs/promises";
import path from "path";

export async function copyClaudeConfig() {
  const sourceDir = path.join(__dirname, "../../.claude");
  const targetDir = path.join(process.cwd(), ".claude");

  // Create target directory
  await fs.mkdir(targetDir, { recursive: true });

  // Copy hooks/
  await fs.cp(
    path.join(sourceDir, "hooks"),
    path.join(targetDir, "hooks"),
    { recursive: true }
  );

  // Copy commands/
  await fs.cp(
    path.join(sourceDir, "commands"),
    path.join(targetDir, "commands"),
    { recursive: true }
  );

  // Copy agents/ (already done by syncAgentDefinitions)
  // Copy settings if exists
  const settingsPath = path.join(sourceDir, "settings.json");
  if (await fs.stat(settingsPath).catch(() => null)) {
    await fs.copyFile(
      settingsPath,
      path.join(targetDir, "settings.json")
    );
  }

  console.log("✓ Copied Claude Code configuration");
}
```

---

### 3. Create User & Organization Profiles

**User Profile:** `one/people/{name}.md`

**Template:**

```typescript
// cli/src/create-user-profile.ts
import fs from "fs/promises";
import path from "path";

interface UserProfile {
  name: string;
  email: string;
  username: string;
  website?: string;
}

export async function createUserProfile(profile: UserProfile) {
  // Generate filename from name (lowercase, hyphenated)
  const filename = profile.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const filePath = path.join(process.cwd(), `one/people/${filename}.md`);

  // Create directory
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Generate content
  const content = `# ${profile.name}

**Role:** Organization Owner (\`org_owner\`)
**Email:** ${profile.email}
**Username:** ${profile.username}
${profile.website ? `**Website:** ${profile.website}\n` : ""}
---

## Identity

- **Name:** ${profile.name}
- **Email:** ${profile.email}
- **Username:** ${profile.username}
- **Role:** \`org_owner\`
${profile.website ? `- **Website:** ${profile.website}\n` : ""}
---

## The Person Entity

\`\`\`typescript
{
  type: "creator",
  name: "${profile.name}",
  properties: {
    role: "org_owner",
    email: "${profile.email}",
    username: "${profile.username}",
    displayName: "${profile.name}",
    bio: "Organization owner",
    ${profile.website ? `website: "${profile.website}",` : ""}

    // Permissions
    permissions: ["*"],  // All permissions as org owner

    // Organization context
    organizationId: null,  // Set when linked to organization
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
\`\`\`

---

## Ownership Connections

### Owns Organization
\`${profile.username}\` → \`org\` via \`owns\`

\`\`\`typescript
{
  fromThingId: ${profile.username}Id,
  toThingId: orgId,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
    since: "${new Date().toISOString().split("T")[0]}",
  },
  createdAt: Date.now(),
}
\`\`\`

### Member of Organization
\`${profile.username}\` → \`org\` via \`member_of\`

\`\`\`typescript
{
  fromThingId: ${profile.username}Id,
  toThingId: orgId,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["*"],  // All permissions
    joinedAt: Date.now(),
  },
  createdAt: Date.now(),
}
\`\`\`

---

## Key Principles

- **Organization Owner** - Has full control over the organization
- **All Permissions** - \`permissions: ["*"]\` grants access to everything
- **Ontology Mapping** - Represented as a \`creator\` thing with role metadata
- **Connection-Based Access** - Access granted via \`member_of\` connection

---

## See Also

- [Group Profile](../groups/${filename}.md)
- [People Roles](./people.md)
- [Groups](../groups/groups.md)
`;

  // Write file
  await fs.writeFile(filePath, content, "utf-8");

  console.log(`✓ Created ${filePath}`);

  return filePath;
}
```

**Group Profile:** `/{installation-name}/groups/{slug}.md`

```typescript
// cli/src/create-group-profile.ts
import fs from "fs/promises";
import path from "path";

interface GroupProfile {
  name: string;
  slug: string;
  domain: string;
  ownerName: string;
  ownerUsername: string;
  installationName: string;
  parentGroupSlug?: string;  // For hierarchical groups
  groupType?: string;        // One of 6 group types
}

export async function createGroupProfile(profile: GroupProfile) {
  // Determine file path based on hierarchy
  let groupPath = profile.slug;
  if (profile.parentGroupSlug) {
    groupPath = `${profile.parentGroupSlug}/${profile.slug}`;
  }

  const filePath = path.join(
    process.cwd(),
    `${profile.installationName}/groups/${groupPath}.md`
  );

  // Create directory (supports nested hierarchies)
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Generate content
  const content = `# ${profile.name}

**Slug:** \`${profile.slug}\`
**Domain:** ${profile.domain}
**Owner:** ${profile.ownerName} (100%)
**Status:** Active
**Plan:** Enterprise
${profile.parentGroupSlug ? `**Parent Group:** ${profile.parentGroupSlug}` : "**Type:** Top-level organization"}

---

## Identity

- **Name:** ${profile.name}
- **Slug:** \`${profile.slug}\`
- **Domain:** ${profile.domain}
- **Owner:** ${profile.ownerName}
- **Status:** Active
- **Plan:** Enterprise
- **Group Type:** ${profile.groupType || "organization"}
${profile.parentGroupSlug ? `- **Parent Group:** ${profile.parentGroupSlug}` : ""}

---

## The Group Entity

\`\`\`typescript
{
  _id: Id<"groups">,
  name: "${profile.name}",
  type: "${profile.groupType || "organization"}",  // One of 6 group types
  parentGroupId: ${profile.parentGroupSlug ? `parentGroupId` : "undefined"},  // ${profile.parentGroupSlug ? "Nested group" : "Top-level group"}
  properties: {
    // Identity
    slug: "${profile.slug}",
    domain: "${profile.domain}",
    description: "Group created via ONE CLI",
    installationName: "${profile.installationName}",

    // Status & Plan
    plan: "enterprise",

    // Limits & Usage
    limits: {
      users: 1000,
      storage: 100000,
      apiCalls: -1,        // Unlimited
      inferences: -1,      // Unlimited
    },
    usage: {
      users: 0,
      storage: 0,
      apiCalls: 0,
      inferences: 0,
    },

    // Settings
    settings: {
      allowSignups: true,
      requireEmailVerification: true,
      enableTwoFactor: true,
      inferenceEnabled: true,
    },

    // Public info
    website: "https://${profile.domain}",
  },
  status: "active",
  createdAt: Date.now(),
  updatedAt: Date.now(),
}
\`\`\`

---

## File Resolution for This Group

**Hierarchical file lookup:**
1. \`/${profile.installationName}/groups/${groupPath}/<file>\` (most specific)
${profile.parentGroupSlug ? `2. \`/${profile.installationName}/groups/${profile.parentGroupSlug}/<file>\` (parent group)` : ""}
${profile.parentGroupSlug ? `3. \`/${profile.installationName}/<file>\` (installation-wide)` : `2. \`/${profile.installationName}/<file>\` (installation-wide)`}
${profile.parentGroupSlug ? `4. \`/one/<file>\` (global fallback)` : `3. \`/one/<file>\` (global fallback)`}

**Example:**
\`\`\`bash
# Create group-specific documentation
mkdir -p /${profile.installationName}/groups/${groupPath}
echo "# ${profile.name} Practices" > /${profile.installationName}/groups/${groupPath}/practices.md
\`\`\`

---

## Ownership Connections

### ${profile.ownerName} Owns ${profile.name}
\`${profile.ownerUsername}\` → \`${profile.slug}\` via \`owns\`

\`\`\`typescript
{
  fromThingId: ${profile.ownerUsername}Id,
  toThingId: ${profile.slug}Id,
  relationshipType: "owns",
  metadata: {
    ownershipPercentage: 100,
    since: "${new Date().toISOString().split("T")[0]}",
  },
  createdAt: Date.now(),
}
\`\`\`

### ${profile.ownerName} is Member of ${profile.name}
\`${profile.ownerUsername}\` → \`${profile.slug}\` via \`member_of\`

\`\`\`typescript
{
  fromThingId: ${profile.ownerUsername}Id,
  toThingId: ${profile.slug}Id,
  relationshipType: "member_of",
  metadata: {
    role: "org_owner",
    permissions: ["*"],  // All permissions
    joinedAt: Date.now(),
  },
  createdAt: Date.now(),
}
\`\`\`

---

## Key Principles

- **Installation-Based Multi-Tenancy** - Group docs stored in installation folder
- **Hierarchical Groups** - ${profile.parentGroupSlug ? "This is a nested subgroup" : "Top-level organization, can have subgroups"}
- **Owner Control** - ${profile.ownerName} has full control (100% ownership)
- **Enterprise Plan** - Unlimited resources for growth
- **Ontology Mapping** - Dimension 1 (Groups) in the 6-dimension model
- **6 Group Types** - friend_circle, business, community, dao, government, organization

---

## Creating Subgroups

${profile.parentGroupSlug ? `This group can have its own subgroups:` : `Create subgroups for this organization:`}

\`\`\`bash
# Example: Create engineering/frontend subgroup
npx oneie create-group \\
  --name "Frontend Team" \\
  --slug "frontend" \\
  --parent "${profile.slug}" \\
  --type "business"

# This creates: /${profile.installationName}/groups/${profile.slug}/frontend/frontend.md
\`\`\`

---

## See Also

- [Owner Profile](../../people/${profile.ownerUsername}.md)
- [Installation README](../../README.md)
- [Multi-Tenancy Plan](../../../one/things/plans/group-folder-multi-tenancy.md)
`;

  // Write file
  await fs.writeFile(filePath, content, "utf-8");

  console.log(`✓ Created ${filePath}`);

  return filePath;
}
```

---

### 4. Create Group Documentation (After Database Groups Exist)

**Command:** `npx oneie create-group-docs`

**Purpose:** Create markdown documentation for groups that exist in the database

```typescript
// cli/src/commands/create-group-docs.ts
import fs from "fs/promises";
import path from "path";
import prompts from "prompts";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../convex/_generated/api";

export async function createGroupDocsCommand() {
  const installationName = process.env.INSTALLATION_NAME;
  if (!installationName) {
    console.error("❌ INSTALLATION_NAME not set in .env.local");
    console.log("Run: npx oneie init");
    process.exit(1);
  }

  // 1. Connect to Convex backend
  const convexUrl = process.env.PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("❌ PUBLIC_CONVEX_URL not set in .env.local");
    process.exit(1);
  }

  const convex = new ConvexHttpClient(convexUrl);

  // 2. Fetch all groups from database
  console.log("Fetching groups from database...");
  const groups = await convex.query(api.queries.groups.list, {});

  if (groups.length === 0) {
    console.log("No groups found in database.");
    console.log("Create your first group in the web UI: /groups/new");
    return;
  }

  // 3. Display groups and let user select
  const { selectedGroupIds } = await prompts({
    type: "multiselect",
    name: "selectedGroupIds",
    message: "Select groups to create documentation for:",
    choices: groups.map((g) => ({
      title: `${g.name} (${g.properties.slug})${g.parentGroupId ? " → subgroup" : ""}`,
      value: g._id,
    })),
  });

  if (!selectedGroupIds || selectedGroupIds.length === 0) {
    console.log("No groups selected. Exiting.");
    return;
  }

  // 4. Create documentation for each selected group
  for (const groupId of selectedGroupIds) {
    const group = groups.find((g) => g._id === groupId);
    if (!group) continue;

    // Build hierarchical path
    const groupPath = await buildGroupPath(group, groups);

    const docsPath = path.join(
      process.cwd(),
      installationName,
      "groups",
      groupPath,
      "README.md"
    );

    await fs.mkdir(path.dirname(docsPath), { recursive: true });

    const content = `# ${group.name}

**Slug:** \`${group.properties.slug}\`
**Type:** ${group.type}
${group.parentGroupId ? `**Parent:** ${getParentName(group.parentGroupId, groups)}` : "**Level:** Top-level"}
**Created:** ${new Date(group.createdAt).toISOString().split("T")[0]}

---

## About

This folder contains documentation specific to the **${group.name}** group.

## File Resolution

When AI agents or the web app load documentation for this group, files are resolved in this order:

1. \`/${installationName}/groups/${groupPath}/<file>\` (most specific)
${group.parentGroupId ? `2. \`/${installationName}/groups/${getParentPath(group.parentGroupId, groups)}/<file>\` (parent group)\n` : ""}${group.parentGroupId ? `3. \`/${installationName}/<file>\` (installation-wide)\n` : `2. \`/${installationName}/<file>\` (installation-wide)\n`}${group.parentGroupId ? `4. \`/one/<file>\` (global fallback)` : `3. \`/one/<file>\` (global fallback)`}

## Add Custom Documentation

Create markdown files in this folder for group-specific content:

\`\`\`bash
# Practices and guidelines
echo "# ${group.name} Practices" > ${docsPath.replace("README.md", "practices.md")}

# Meeting notes
echo "# Sprint Planning" > ${docsPath.replace("README.md", "sprint-planning.md")}

# Technical specs
echo "# Architecture" > ${docsPath.replace("README.md", "architecture.md")}
\`\`\`

## Database Entity

\`\`\`typescript
{
  _id: "${group._id}",
  name: "${group.name}",
  type: "${group.type}",
  parentGroupId: ${group.parentGroupId ? `"${group.parentGroupId}"` : "undefined"},
  properties: {
    slug: "${group.properties.slug}",
    installationName: "${installationName}",
    // ...
  }
}
\`\`\`

---

**Updated:** ${new Date().toISOString().split("T")[0]}
`;

    await fs.writeFile(docsPath, content, "utf-8");
    console.log(`✓ Created ${docsPath}`);
  }

  console.log("\n✅ Group documentation created!");
  console.log("Add custom markdown files to these folders to override global templates.");
}

// Helper: Build hierarchical path for group
async function buildGroupPath(group: any, allGroups: any[]): Promise<string> {
  const segments = [group.properties.slug];

  let currentParentId = group.parentGroupId;
  while (currentParentId) {
    const parent = allGroups.find((g) => g._id === currentParentId);
    if (parent) {
      segments.unshift(parent.properties.slug);
      currentParentId = parent.parentGroupId;
    } else {
      break;
    }
  }

  return segments.join("/");
}

// Helper: Get parent group name
function getParentName(parentId: string, allGroups: any[]): string {
  const parent = allGroups.find((g) => g._id === parentId);
  return parent ? parent.name : "Unknown";
}

// Helper: Get parent group path
function getParentPath(parentId: string, allGroups: any[]): string {
  const parent = allGroups.find((g) => g._id === parentId);
  if (!parent) return "";
  // Recursively build parent path
  return buildGroupPath(parent, allGroups);
}
```

---

### 5. File Resolution with Hierarchical Groups

**File:** `cli/src/utils/file-resolver.ts`

**Purpose:** Resolve markdown files with hierarchical group support

```typescript
// cli/src/utils/file-resolver.ts
import fs from "fs/promises";
import path from "path";
import { Id } from "../../convex/_generated/dataModel";

interface ResolveOptions {
  installationName: string;
  groupId?: Id<"groups">;
  convexClient: any;  // ConvexHttpClient
}

export async function resolveFile(
  relativePath: string,
  options: ResolveOptions
): Promise<string | null> {
  const { installationName, groupId, convexClient } = options;

  // If groupId provided, resolve hierarchically
  if (groupId) {
    const groupPath = await getGroupPath(groupId, convexClient);

    // 1. Check most-specific group first
    const groupFile = path.join(
      process.cwd(),
      installationName,
      "groups",
      groupPath,
      relativePath
    );
    if (await fileExists(groupFile)) {
      return await fs.readFile(groupFile, "utf-8");
    }

    // 2. Walk up parent groups
    let currentGroupId = groupId;
    while (currentGroupId) {
      const group = await convexClient.query(api.queries.groups.get, {
        id: currentGroupId,
      });

      if (group?.parentGroupId) {
        const parentPath = await getGroupPath(group.parentGroupId, convexClient);
        const parentFile = path.join(
          process.cwd(),
          installationName,
          "groups",
          parentPath,
          relativePath
        );
        if (await fileExists(parentFile)) {
          return await fs.readFile(parentFile, "utf-8");
        }
        currentGroupId = group.parentGroupId;
      } else {
        break;
      }
    }
  }

  // 3. Check installation root (non-group-specific)
  const installFile = path.join(
    process.cwd(),
    installationName,
    relativePath
  );
  if (await fileExists(installFile)) {
    return await fs.readFile(installFile, "utf-8");
  }

  // 4. Fallback to global template
  const globalFile = path.join(process.cwd(), "one", relativePath);
  if (await fileExists(globalFile)) {
    return await fs.readFile(globalFile, "utf-8");
  }

  // 5. Not found
  return null;
}

// Helper: Get group's full path (e.g., "engineering/frontend")
async function getGroupPath(
  groupId: Id<"groups">,
  convexClient: any
): Promise<string> {
  const group = await convexClient.query(api.queries.groups.get, { id: groupId });
  if (!group) throw new Error("Group not found");

  const segments: string[] = [group.properties.slug];

  // Walk up to root
  let currentParentId = group.parentGroupId;
  while (currentParentId) {
    const parent = await convexClient.query(api.queries.groups.get, {
      id: currentParentId,
    });
    if (parent) {
      segments.unshift(parent.properties.slug);
      currentParentId = parent.parentGroupId;
    } else {
      break;
    }
  }

  return segments.join("/");
}

// Helper: Check if file exists
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

// Example usage:
// const content = await resolveFile("practices.md", {
//   installationName: "acme",
//   groupId: "frontend-group-id" as Id<"groups">,
//   convexClient: convex
// });
//
// Checks in order:
// 1. /acme/groups/engineering/frontend/practices.md
// 2. /acme/groups/engineering/practices.md (parent)
// 3. /acme/practices.md (installation root)
// 4. /one/practices.md (global fallback)
```

---

### 6. Clone Frontend Repository

```typescript
// cli/src/clone-frontend.ts
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export async function cloneFrontend(orgProfile: {
  name: string;
  slug: string;
  domain: string;
}) {
  const targetDir = path.join(process.cwd(), "web");

  // Check if frontend already exists
  if (await fs.stat(targetDir).catch(() => null)) {
    console.log("⚠️  Frontend directory already exists, skipping clone");
    return { alreadyExists: true };
  }

  // Clone repository
  console.log("Cloning frontend repository...");
  await execAsync(
    "git clone https://github.com/one-ie/web.git web",
    {
      cwd: process.cwd(),
    }
  );

  console.log("✓ Cloned frontend repository");

  // Install dependencies
  console.log("Installing dependencies...");
  await execAsync("bun install", { cwd: targetDir });
  console.log("✓ Installed dependencies");

  // Create .env.local with organization details
  const envContent = `# ONE Configuration
# Generated by CLI on ${new Date().toISOString()}

# Organization
PUBLIC_ORG_NAME="${orgProfile.name}"
PUBLIC_ORG_SLUG="${orgProfile.slug}"
PUBLIC_ORG_DOMAIN="${orgProfile.domain}"

# Convex Backend (update with your deployment)
PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment

# Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:4321

# OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
`;

  await fs.writeFile(path.join(targetDir, ".env.local"), envContent, "utf-8");
  console.log("✓ Created .env.local");

  return { cloned: true };
}
```

---

### 5. Clone Third-Party Documentation

```typescript
// cli/src/clone-docs.ts
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

interface DocRepo {
  name: string;
  repo: string;
  branch?: string;
}

const DOC_REPOS: DocRepo[] = [
  {
    name: "astro",
    repo: "https://github.com/withastro/docs.git",
    branch: "main",
  },
  {
    name: "convex",
    repo: "https://github.com/get-convex/convex-docs.git",
    branch: "main",
  },
  {
    name: "effect",
    repo: "https://github.com/Effect-TS/website.git",
    branch: "main",
  },
  {
    name: "react",
    repo: "https://github.com/reactjs/react.dev.git",
    branch: "main",
  },
  {
    name: "tailwind",
    repo: "https://github.com/tailwindlabs/tailwindcss.com.git",
    branch: "main",
  },
];

export async function cloneThirdPartyDocs() {
  const docsDir = path.join(process.cwd(), "docs");

  // Create docs directory
  await fs.mkdir(docsDir, { recursive: true });

  const results = [];

  for (const doc of DOC_REPOS) {
    const targetDir = path.join(docsDir, doc.name);

    // Check if already exists
    if (await fs.stat(targetDir).catch(() => null)) {
      console.log(`⚠️  ${doc.name} docs already exist, skipping`);
      results.push({ name: doc.name, skipped: true });
      continue;
    }

    // Clone repository
    const cloneCmd = doc.branch
      ? `git clone --depth 1 --branch ${doc.branch} ${doc.repo} ${doc.name}`
      : `git clone --depth 1 ${doc.repo} ${doc.name}`;

    try {
      await execAsync(cloneCmd, { cwd: docsDir });
      console.log(`✓ ${doc.name} docs → /docs/${doc.name}`);
      results.push({ name: doc.name, cloned: true });
    } catch (error) {
      console.error(`✗ Failed to clone ${doc.name}: ${error.message}`);
      results.push({ name: doc.name, error: error.message });
    }
  }

  return results;
}
```

---

## CLI Entry Point

**File:** `cli/src/index.ts`

```typescript
#!/usr/bin/env node
import prompts from "prompts";
import chalk from "chalk";
import ora from "ora";
import { syncOntologyFiles } from "./sync-ontology";
import { syncAgentDefinitions } from "./sync-agents";
import { copyClaudeConfig } from "./copy-claude-config";
import { createUserProfile } from "./create-user-profile";
import { createOrgProfile } from "./create-org-profile";
import { cloneFrontend } from "./clone-frontend";
import { cloneThirdPartyDocs } from "./clone-docs";
import { displayBanner } from "./banner";

async function main() {
  // Display welcome banner
  displayBanner();

  console.log(chalk.cyan("\n✨ Welcome to ONE Platform!\n"));
  console.log(
    "Let's set up your environment with the 6-dimension ontology.\n"
  );

  // Step 1: User profile
  console.log(chalk.bold("🧑 Step 1: Tell us about yourself\n"));

  const userAnswers = await prompts([
    {
      type: "text",
      name: "name",
      message: "What's your name?",
      validate: (value) =>
        value.length > 0 ? true : "Name cannot be empty",
    },
    {
      type: "text",
      name: "email",
      message: "What's your email address?",
      validate: (value) =>
        value.includes("@") ? true : "Please enter a valid email",
    },
    {
      type: "text",
      name: "username",
      message: "What username would you like?",
      validate: (value) =>
        /^[a-z0-9_-]+$/.test(value)
          ? true
          : "Username must be lowercase letters, numbers, hyphens, or underscores",
    },
    {
      type: "text",
      name: "website",
      message: "What's your website URL? (optional)",
      initial: "",
    },
  ]);

  // Step 2: Organization profile
  console.log(chalk.bold("\n🏢 Step 2: Organization Setup\n"));

  const orgAnswers = await prompts([
    {
      type: "text",
      name: "name",
      message: "What's your organization name?",
      validate: (value) =>
        value.length > 0 ? true : "Organization name cannot be empty",
    },
    {
      type: "text",
      name: "slug",
      message: "Organization slug (URL-friendly)?",
      validate: (value) =>
        /^[a-z0-9-]+$/.test(value)
          ? true
          : "Slug must be lowercase letters, numbers, and hyphens",
    },
    {
      type: "text",
      name: "domain",
      message: "Organization domain?",
      validate: (value) =>
        value.includes(".") ? true : "Please enter a valid domain",
    },
  ]);

  // Step 3: Sync ontology
  console.log(chalk.bold("\n📚 Step 3: Syncing ONE Ontology\n"));

  let spinner = ora("Copying ontology files from /one/*...").start();
  const ontologyResult = await syncOntologyFiles();
  spinner.succeed(`Copied ${ontologyResult.filesCopied} ontology files`);


  spinner = ora("Syncing agent definitions...").start();
  const agentsResult = await syncAgentDefinitions();
  spinner.succeed(
    `Synced ${agentsResult.agentsSynced} agent definitions to .claude/agents/`
  );

  spinner = ora("Copying Claude Code configuration...").start();
  await copyClaudeConfig();
  spinner.succeed("Synced .claude/hooks/ and .claude/commands/");

  // Step 4: Create profiles
  console.log(chalk.bold("\nCreating your profile...\n"));

  spinner = ora("Creating user profile...").start();
  const userProfilePath = await createUserProfile({
    name: userAnswers.name,
    email: userAnswers.email,
    username: userAnswers.username,
    website: userAnswers.website || undefined,
  });
  spinner.succeed(`Created ${userProfilePath}`);

  spinner = ora("Creating group profile...").start();
  const groupProfilePath = await createGroupProfile({
    name: orgAnswers.name,
    slug: orgAnswers.slug,
    domain: orgAnswers.domain,
    ownerName: userAnswers.name,
    ownerUsername: userAnswers.username,
  });
  spinner.succeed(`Created ${groupProfilePath}`);

  spinner = ora("Linking user to group...").start();
  spinner.succeed(
    `Linked ${userAnswers.username} → owns → ${orgAnswers.name}`
  );
  spinner.succeed(
    `Linked ${userAnswers.username} → member_of → ${orgAnswers.name} (role: group_owner)`
  );

  // Step 5: Website setup (optional)
  console.log(chalk.bold("\n🌐 Step 4: Website Setup\n"));

  const { buildWebsite } = await prompts({
    type: "confirm",
    name: "buildWebsite",
    message: "Would you like to build a website?",
    initial: true,
  });

  if (buildWebsite) {
    spinner = ora("Cloning frontend repository...").start();
    const frontendResult = await cloneFrontend({
      name: orgAnswers.name,
      slug: orgAnswers.slug,
      domain: orgAnswers.domain,
    });

    if (frontendResult.alreadyExists) {
      spinner.warn("Frontend directory already exists");
    } else {
      spinner.succeed("Cloned and configured frontend");
      console.log(
        chalk.gray("\nYour website is ready at: http://localhost:4321")
      );
      console.log(chalk.gray("Run: cd frontend && bun run dev\n"));
    }
  }

  // Step 6: Third-party docs (optional)
  console.log(chalk.bold("\n📖 Step 5: Third-Party Documentation\n"));

  const { cloneDocs } = await prompts({
    type: "confirm",
    name: "cloneDocs",
    message: "Would you like to clone third-party docs for AI context?",
    initial: true,
  });

  if (cloneDocs) {
    spinner = ora("Cloning documentation repositories...").start();
    const docsResults = await cloneThirdPartyDocs();
    const clonedCount = docsResults.filter((r) => r.cloned).length;
    spinner.succeed(`Cloned ${clonedCount} documentation repositories`);
  }

  // Step 7: Complete
  console.log(chalk.bold.green("\n✅ Setup Complete!\n"));

  console.log(chalk.bold("Your ONE environment is ready:\n"));

  console.log(chalk.cyan("📁 Project Structure:"));
  console.log("   /one/                 → 6-dimension ontology (100+ files)");
  if (buildWebsite) {
    console.log("   /frontend/            → Astro + React website");
  }
  if (cloneDocs) {
    console.log("   /docs/                → Third-party documentation");
  }
  console.log("   /.claude/             → AI agent integration");
  console.log("   /cli/                 → CLI configuration\n");

  console.log(chalk.cyan("🧑 Your Profile:"));
  console.log(`   Name: ${userAnswers.name}`);
  console.log(`   Email: ${userAnswers.email}`);
  console.log(`   Username: ${userAnswers.username}`);
  console.log(`   Role: org_owner`);
  console.log(`   File: ${userProfilePath}\n`);

  console.log(chalk.cyan("🏢 Your Group:"));
  console.log(`   Name: ${orgAnswers.name}`);
  console.log(`   Slug: ${orgAnswers.slug}`);
  console.log(`   Domain: ${orgAnswers.domain}`);
  console.log(`   File: ${groupProfilePath}\n`);

  console.log(chalk.bold("🚀 Next Steps:\n"));
  if (buildWebsite) {
    console.log("1. Start building:");
    console.log(chalk.gray("   cd frontend && bun run dev\n"));
  }
  console.log("2. Use AI agents:");
  console.log(chalk.gray("   claude\n"));
  console.log("3. Read the docs:");
  console.log(chalk.gray("   cat one/knowledge/ontology.md\n"));
  console.log("4. Create your first feature:");
  console.log(chalk.gray("   /one\n"));

  console.log(chalk.bold.green("Happy building! 🎉\n"));
}

main().catch((error) => {
  console.error(chalk.red("\n✗ Error:"), error.message);
  process.exit(1);
});
```

---

## Package Configuration

**File:** `cli/package.json`

```json
{
  "name": "oneie",
  "version": "2.0.0",
  "description": "ONE CLI - Bootstrap & Ontology Sync",
  "bin": {
    "oneie": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "prepublishOnly": "npm run build"
  },
  "keywords": [
    "one",
    "ontology",
    "cli",
    "bootstrap",
    "6-dimension"
  ],
  "author": "Anthony O'Connell <anthony@one.ie>",
  "license": "MIT",
  "dependencies": {
    "prompts": "^2.4.2",
    "chalk": "^5.3.0",
    "ora": "^8.0.1",
    "yaml": "^2.3.4",
    "glob": "^10.3.10"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/prompts": "^2.4.9",
    "typescript": "^5.3.3"
  },
  "files": [
    "dist",
    "README.md"
  ]
}
```

---

## Testing

### Manual Test Plan

1. **Test ontology sync:**
   ```bash
   npx oneie
   # Verify all /one/* files copied
   # Verify folders.yaml updated
   ```

2. **Test agent sync:**
   ```bash
   ls .claude/agents/
   # Should see: agent-director.md, agent-backend.md, etc.
   ```

3. **Test user profile creation:**
   ```bash
   cat one/people/anthony-o-connell.md
   # Verify correct formatting and connections
   ```

4. **Test group profile creation:**
   ```bash
   cat one/groups/one.md
   # Verify correct formatting and connections
   ```

5. **Test frontend clone:**
   ```bash
   cd frontend && bun run dev
   # Should start on localhost:4321
   ```

6. **Test docs clone:**
   ```bash
   ls docs/
   # Should see: astro/, convex/, effect/, react/, tailwind/
   ```

---

## Success Metrics

- ✅ All 100+ ontology files copied from `/one/*`
- ✅ Installation folder created with 6-dimension structure
- ✅ 12 agent definitions synced to `.claude/agents/`
- ✅ User profile created with correct ontology mapping
- ✅ `INSTALLATION_NAME` set in `.env.local`
- ✅ `.gitignore` updated to exclude installation folder (optional)
- ✅ Group documentation command available for database groups
- ✅ Hierarchical file resolution working (group → parent → installation → global)
- ✅ Frontend cloned and configured with installation details
- ✅ Third-party docs cloned for offline AI context (optional)
- ✅ Complete setup in < 5 minutes

---

## Future Enhancements

### Phase 2: Incremental Sync

```bash
npx oneie sync
# Sync only changed files from upstream /one/ to local
# Preserves installation folder customizations
```

### Phase 3: Multi-Installation Support

```bash
npx oneie switch acme-staging
# Switch between multiple installations in same project
# Useful for dev/staging/prod environments
```

### Phase 4: Group Documentation Templates

```bash
npx oneie create-group-docs --template=engineering
npx oneie create-group-docs --template=marketing
# Pre-populated documentation templates for common group types
```

### Phase 5: Cloud Sync (KV/R2)

```bash
npx oneie sync --upload   # Push installation docs to Cloudflare KV
npx oneie sync --download # Pull from Cloudflare KV
# Enable runtime doc updates without rebuilds
```

---

## Related Documentation

- [Installation Folder Multi-Tenancy Plan](../plans/group-folder-multi-tenancy.md) - Complete architecture
- [CLI Overview](../cli.md) - Complete CLI architecture
- [Ontology](../../knowledge/ontology.md) - 6-dimension ontology
- [People](../../people/people.md) - People & roles
- [Groups](../../groups/groups.md) - Group structure (6 types, hierarchical)
- [Agents](../agents/agent-director.md) - AI agent definitions
- [File Resolution](../../knowledge/file-resolution.md) - Hierarchical file loading logic

---

## Key Differences from Legacy

**OLD (Pre-v2.0.0):**
- Created `one/groups/{name}.md` immediately
- No installation folder concept
- No hierarchical group documentation
- Groups were filesystem folders only

**NEW (v2.0.0+):**
- Creates installation folder (e.g., `/acme/`) with 6-dimension structure
- Groups are database entities with `groupId` and `parentGroupId`
- Group documentation created AFTER groups exist in database
- Hierarchical file resolution: group → parent → installation → global
- Installation folder = organization-wide customization
- Database groups = runtime data isolation

---

**This is the ONE CLI. Simple, powerful, ontology-driven.**
