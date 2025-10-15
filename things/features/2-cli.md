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

### Phase 1: Initial Bootstrap

```bash
npx oneie
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

Let's set up your environment with the 6-dimension ontology.

🧑 Step 1: Tell us about yourself

What's your name? (e.g., Anthony O'Connell): _
```

### Phase 2: User Profile Creation

After user enters name:

```
Great to meet you, Anthony! 👋

What's your email address? tony@one.ie


🏢 Step 2: Organisation Setup

What's your organization name? (e.g., My Company): Company Name
Organization slug (URL-friendly): company-name
Organization Website: https://my-company.com

Creating your profile...
✓ Created one/people/anthony-o-connell.md
✓ Created one/groups/my-company.md
✓ Linked anthony → owns → My Company
✓ Linked anthony → member_of → My Company (role: group_owner)
```

### Phase 3: Ontology Sync

```
📚 Step 3: Syncing ONE Ontology

Copying ontology files from ONE framework...

✓ Copied 100+ .md files from /one/* to your project
✓ Updated cli/folders.yaml with all /one/* paths
✓ Synced 12 agent definitions: one/things/agents/* → .claude/agents/*
✓ Synced Claude Code hooks: .claude/hooks/*
✓ Synced Claude Code commands: .claude/commands/*

Ontology sync complete! 🎉
```

### Phase 4: Website Setup (Optional)

```
🌐 Step 4: Website Setup

Would you like to build a website? (yes/no): yes

Cloning frontend repository...
✓ git clone https://github.com/one-ie/frontend.git → /frontend
✓ Installed dependencies (bun install)
✓ Created frontend/.env.local with your organization details

Your website is ready at: http://localhost:4321
Run: cd frontend && bun run dev
```

### Phase 5: Third-Party Docs (Optional)

```
📖 Step 5: Third-Party Documentation

Would you like to clone third-party docs for AI context? (yes/no): yes

Cloning documentation repositories...
✓ Astro docs → /docs/astro
✓ Convex docs → /docs/convex
✓ Effect.ts docs → /docs/effect
✓ React docs → /docs/react
✓ Tailwind CSS docs → /docs/tailwind

Documentation cloned! AI agents can now reference these offline.
```

### Phase 6: Complete

```
✅ Setup Complete!

Your ONE environment is ready:

📁 Project Structure:
   /one/                 → 6-dimension ontology (100+ files)
   /frontend/            → Astro + React website
   /docs/                → Third-party documentation
   /.claude/             → AI agent integration
   /cli/                 → CLI configuration

🧑 Your Profile:
   Name: Anthony O'Connell
   Email: anthony@one.ie
   Username: anthony
   Role: org_owner
   File: one/people/anthony-o-connell.md

🏢 Your Group:
   Name: ONE Platform
   Slug: one
   Domain: one.ie
   File: one/groups/one.md

🚀 Next Steps:

1. Start building:
   cd frontend && bun run dev

2. Use AI agents:
   claude

3. Read the docs:
   cat one/knowledge/ontology.md

4. Create your first feature:
   /one

Happy building! 🎉
```

---

## Technical Implementation

### 1. Copy Ontology Files (folders.yaml)

**File:** `cli/folders.yaml`

**Current state:**
```yaml
# ONE Framework - Folder Copy Configuration
claude_folders:
  - .claude/agents
  - .claude/commands
  - .claude/hooks

one_platform_folders:
  - .one/checklists
  - .one/data
  - .one/missions
  - .one/ontology
  - .one/stories
  - .one/tasks
  - .one/teams
  - .one/templates
  - .one/workflows

one_user_folders:
  - one/agents
  - one/brand
  - one/checklists
  - one/company
  - one/data
  - one/docs
  - one/engineering
  - one/guides
  - one/me
  - one/missions
  - one/prompts
  - one/stories
  - one/tasks
  - one/templates
  - one/workflows

root_files:
  - .one/interface.md
  - .one/one-command.js
  - .one/structure.yaml
  - one/core-config.yaml
  - one/manifest.md
  - one/one.md
  - one/ontology.md
  - one/plan.md
  - one/structure.yaml
  - one/workflow.md
```

**Simplified configuration:**
```yaml
# ONE CLI - Folder Copy Configuration
# Simple: Copy everything from /one/* to user's project

# Claude Code Integration
claude_folders:
  - .claude/agents
  - .claude/commands
  - .claude/hooks

# ONE Ontology (copy ALL files from /one/*)
# No need to list individual folders - CLI discovers them automatically
one_folders:
  - one/**/*

# File extensions to copy
allowed_extensions:
  - .md
  - .yaml
  - .yml
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
```

**Implementation (Simplified):**

```typescript
// cli/src/sync-ontology.ts
import fs from "fs/promises";
import path from "path";
import yaml from "yaml";
import { glob } from "glob";

interface FoldersConfig {
  claude_folders: string[];
  one_folders: string[];
  allowed_extensions: string[];
  exclude_patterns: string[];
}

export async function syncOntologyFiles() {
  // 1. Read config
  const configPath = path.join(__dirname, "../../cli/folders.yaml");
  const configContent = await fs.readFile(configPath, "utf-8");
  const config: FoldersConfig = yaml.parse(configContent);

  // 2. Build glob pattern for all allowed extensions
  const patterns = config.allowed_extensions.map(
    (ext) => `one/**/*${ext}`
  );

  // 3. Find all matching files
  const oneFiles: string[] = [];
  for (const pattern of patterns) {
    const files = await glob(pattern, {
      cwd: path.join(__dirname, "../.."),
      ignore: config.exclude_patterns,
    });
    oneFiles.push(...files);
  }

  // 4. Copy all files to user directory
  for (const file of oneFiles) {
    const sourcePath = path.join(__dirname, "../..", file);
    const targetPath = path.join(process.cwd(), file);

    // Create directory if needed
    await fs.mkdir(path.dirname(targetPath), { recursive: true });

    // Copy file
    await fs.copyFile(sourcePath, targetPath);
  }

  console.log(`✓ Copied ${oneFiles.length} ontology files`);

  return {
    filesCopied: oneFiles.length,
  };
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

**Group Profile:** `one/groups/{name}.md`

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
}

export async function createGroupProfile(profile: GroupProfile) {
  const filePath = path.join(
    process.cwd(),
    `one/groups/${profile.slug}.md`
  );

  // Create directory
  await fs.mkdir(path.dirname(filePath), { recursive: true });

  // Generate content
  const content = `# ${profile.name}

**Slug:** \`${profile.slug}\`
**Domain:** ${profile.domain}
**Owner:** ${profile.ownerName} (100%)
**Status:** Active
**Plan:** Enterprise

---

## Identity

- **Name:** ${profile.name}
- **Slug:** \`${profile.slug}\`
- **Domain:** ${profile.domain}
- **Owner:** ${profile.ownerName}
- **Status:** Active
- **Plan:** Enterprise

---

## The Group Entity

\`\`\`typescript
{
  _id: Id<"groups">,
  name: "${profile.name}",
  type: "organization",  // One of 6 group types
  parentGroupId: undefined,  // Top-level group
  properties: {
    // Identity
    slug: "${profile.slug}",
    domain: "${profile.domain}",
    description: "Group created via ONE CLI",

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
    role: "group_owner",
    permissions: ["*"],  // All permissions
    joinedAt: Date.now(),
  },
  createdAt: Date.now(),
}
\`\`\`

---

## Key Principles

- **Multi-Tenant Isolation** - Group partitions the data space
- **Owner Control** - ${profile.ownerName} has full control (100% ownership)
- **Enterprise Plan** - Unlimited resources for growth
- **Ontology Mapping** - Dimension 1 (Groups) in the 6-dimension model
- **6 Group Types** - friend_circle, business, community, dao, government, organization

---

## See Also

- [Owner Profile](../people/${profile.ownerUsername}.md)
- [Group Structure](./groups.md)
- [Multi-Tenancy](../connections/multitenant.md)
`;

  // Write file
  await fs.writeFile(filePath, content, "utf-8");

  console.log(`✓ Created ${filePath}`);

  return filePath;
}
```

---

### 4. Clone Frontend Repository

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
  const targetDir = path.join(process.cwd(), "frontend");

  // Check if frontend already exists
  if (await fs.stat(targetDir).catch(() => null)) {
    console.log("⚠️  Frontend directory already exists, skipping clone");
    return { alreadyExists: true };
  }

  // Clone repository
  console.log("Cloning frontend repository...");
  await execAsync(
    "git clone https://github.com/one-ie/frontend.git frontend",
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
  const envContent = `# ONE Platform Configuration
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
- ✅ `cli/folders.yaml` auto-updated with discovered paths
- ✅ 12 agent definitions synced to `.claude/agents/`
- ✅ User profile created with correct ontology mapping
- ✅ Organization profile created with ownership connections
- ✅ Frontend cloned and configured with org details
- ✅ Third-party docs cloned for offline AI context
- ✅ Complete setup in < 5 minutes

---

## Future Enhancements

### Phase 2: Incremental Sync

```bash
npx oneie sync
# Sync only changed files from upstream
```

### Phase 3: Multi-User Support

```bash
npx oneie add-user
# Add additional users to existing organization
```

### Phase 4: Template Selection

```bash
npx oneie create --template=creator-platform
npx oneie create --template=saas
npx oneie create --template=marketplace
```

---

## Related Documentation

- [CLI Overview](../cli.md) - Complete CLI architecture
- [Ontology](../../knowledge/ontology.md) - 6-dimension ontology
- [People](../../people/people.md) - People & roles
- [Groups](../../groups/groups.md) - Group structure (6 types, hierarchical)
- [Agents](../agents/agent-director.md) - AI agent definitions

---

**This is the ONE CLI. Simple, powerful, ontology-driven.**
