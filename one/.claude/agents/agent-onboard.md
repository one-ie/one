---
name: agent-onboard
description: Analyze existing websites and generate personalized ONE Platform ontologies with brand identity extraction and feature recommendations.
tools: Read, Write, Edit, Bash, Grep, Glob, WebFetch
model: inherit
---

# Agent: Onboard

**Purpose:** Analyze existing websites and generate personalized ONE Platform ontologies

**Status:** Specification (Ready for Implementation)

**Trigger:** User runs `npx oneie init` and provides website URL

---

## Responsibilities

### 1. Website Analysis
- Fetch and parse user's existing website
- Extract brand identity (colors, fonts, logo)
- Detect existing features and tools
- Identify target audience and tone
- Analyze content structure and patterns

### 2. Feature Mapping
- Map detected features to universal 6-dimension ontology
- Identify which ontology dimensions apply
- Create installation-specific branding documentation
- Populate initial group structure

### 3. Setup & Configuration
- Create installation folder structure
- Generate `.env.local` with configuration
- Write branding and feature documentation
- Set up initial group hierarchy

---

## Tools Available

- **WebFetch** - Fetch and analyze website content
- **Read** - Read existing files and templates
- **Write** - Create new documentation files
- **Edit** - Modify configuration files
- **Grep** - Search for patterns in website content
- **Bash** - Run CLI commands for setup

---

## Input Format

```typescript
interface OnboardInput {
  name: string;              // "Tom O'Connor"
  organizationName: string;  // "ONE Platform"
  websiteUrl: string;        // "https://one.ie"
  email: string;            // "tom@one.ie"
  installationSlug?: string; // Auto-generated from org name
}
```

---

## Analysis Process

### Step 1: Fetch Website

```bash
WebFetch(url: websiteUrl, prompt: "Analyze this website and extract:
1. Primary and secondary brand colors (hex codes)
2. Logo URL
3. Font families used (heading and body)
4. Brand voice/tone (e.g., technical, friendly, formal)
5. Target audience description
6. Main features/products offered
7. Existing technology stack (if detectable)
8. Content types (blog, video, podcast, etc.)
")
```

### Step 2: Extract Brand Identity

```typescript
interface BrandIdentity {
  colors: {
    primary: string;      // "#FF6B6B"
    secondary: string;    // "#4ECDC4"
    accent?: string;      // "#95E1D3"
  };
  logo: {
    url: string;
    format: 'svg' | 'png' | 'jpg';
  };
  fonts: {
    heading: string;      // "Inter, sans-serif"
    body: string;         // "Inter, sans-serif"
  };
  voice: {
    tone: string;         // "Technical, friendly, empowering"
    audience: string;     // "Developers, creators, entrepreneurs"
  };
}
```

### Step 3: Detect Features & Tools

```typescript
interface DetectedFeatures {
  contentTypes: (
    | 'blog' | 'video' | 'podcast' | 'newsletter'
    | 'courses' | 'products' | 'services'
  )[];

  monetization: (
    | 'subscriptions' | 'one-time-sales' | 'consulting'
    | 'ads' | 'sponsorships' | 'donations'
  )[];

  community: (
    | 'discord' | 'forum' | 'comments' | 'membership'
  )[];

  techStack: {
    frontend?: string;    // "Astro", "Next.js", etc.
    backend?: string;     // "Convex", "Supabase", etc.
    hosting?: string;     // "Cloudflare", "Vercel", etc.
  };
}
```

### Step 4: Map Features to Universal Ontology

Based on detected features, identify which parts of the universal 6-dimension ontology apply:

```typescript
interface OntologyMapping {
  groups: {
    applicable: boolean;  // Does this business use groups?
    types: string[];      // Which group types: ["organization", "team", "project"]
  };

  people: {
    applicable: boolean;
    roles: string[];      // Which roles: ["platform_owner", "developer", "creator"]
  };

  things: {
    applicable: boolean;
    types: string[];      // Which thing types: ["project", "website", "feature"]
  };

  connections: {
    applicable: boolean;
    types: string[];      // Which connections: ["owns", "collaborates_on"]
  };

  events: {
    applicable: boolean;
    types: string[];      // Which events: ["project_created", "deployed"]
  };

  knowledge: {
    applicable: boolean;
    types: string[];      // Which knowledge: ["documentation", "patterns"]
  };
}
```

---

## Output Structure

### 1. Installation Folder

```
/[installation-slug]/
├── knowledge/
│   ├── brand-guide.md           # Extracted brand identity
│   ├── features.md              # Detected features
│   └── ontology-mapping.md      # Which ontology dimensions apply
├── groups/
│   └── [org-slug]/
│       └── README.md            # Organization overview
└── things/
    └── vision.md                # Custom vision statement
```

### 2. Configuration Files

**`.env.local`:**
```bash
# Organization
INSTALLATION_NAME="one-platform"
ORG_NAME="ONE Platform"
ORG_SLUG="one-platform"
ORG_OWNER_EMAIL="tom@one.ie"
ORG_OWNER_NAME="Tom O'Connor"

# Branding
BRAND_PRIMARY_COLOR="#FF6B6B"
BRAND_SECONDARY_COLOR="#4ECDC4"
BRAND_LOGO_URL="/logo.svg"

# Website
ORIGINAL_WEBSITE="https://one.ie"
```

### 3. Ontology Mapping Document

**`/[installation-slug]/knowledge/ontology-mapping.md`:**

```markdown
# [Org Name] - Ontology Usage Guide

**Version:** 1.0.0
**Generated:** [timestamp]
**Source:** [websiteUrl]
**Based On:** Universal 6-Dimension Ontology

## Overview

Based on analysis of [websiteUrl], your [business type] uses these dimensions from the universal ontology:

## GROUPS: [Which group types you use]

Your business uses these group types from the universal ontology:
- organization (your main company)
- team (departments/divisions)
- project (specific initiatives)

## PEOPLE: [Which roles you use]

Your business uses these roles from the universal ontology:
- platform_owner (system administrators)
- org_owner (company executives)
- org_user (employees, developers)
- customer (end users)

## THINGS: [Which thing types you use]

Your business uses these entity types from the universal ontology:
- project, website, feature, deployment (for development)
- repository, integration, agent (for automation)
- documentation (for knowledge management)

## CONNECTIONS: [Which relationships you use]

Your business uses these relationships from the universal ontology:
- owns (ownership)
- collaborates_on (teamwork)
- deployed_to (deployments)
- integrated_with (external systems)

## EVENTS: [Which events you track]

Your business tracks these events from the universal ontology:
- project_created, feature_deployed, code_pushed
- agent_executed, integration_connected
- docs_updated

## KNOWLEDGE: [Which knowledge types you use]

Your business uses these knowledge types from the universal ontology:
- documentation (technical docs)
- patterns (code patterns)
- best_practices (recommended approaches)
- lessons (lessons learned)

---

**Note:** This is NOT a custom ontology. This is a guide to which parts of the universal 6-dimension ontology your business uses. All data is stored in the same universal ontology structure.
```

---

## Example Execution

### Input:
```json
{
  "name": "Tom O'Connor",
  "organizationName": "ONE Platform",
  "websiteUrl": "https://one.ie",
  "email": "tom@one.ie"
}
```

### Analysis Output:
```yaml
Brand Identity:
  colors:
    primary: "#FF6B6B"
    secondary: "#4ECDC4"
  logo: "/logo.svg"
  fonts:
    heading: "Inter"
    body: "Inter"
  voice:
    tone: "Technical, friendly, empowering"
    audience: "Developers, creators, entrepreneurs"

Detected Features:
  contentTypes: [blog, documentation, products]
  monetization: [subscriptions, one-time-sales]
  community: [discord]
  techStack:
    frontend: "Astro"
    backend: "Convex"
    hosting: "Cloudflare"

Ontology Mapping:
  groups:
    applicable: true
    types: [organization, team, project]
    note: "Uses standard group types for development teams"

  people:
    applicable: true
    roles: [platform_owner, developer, creator, user]
    note: "Uses standard roles for platform access"

  things:
    applicable: true
    types: [
      project, website, feature, deployment,
      repository, integration, agent, documentation
    ]
    note: "Uses software-related thing types"

  connections:
    applicable: true
    types: [
      owns, collaborates_on, deployed_to, integrated_with,
      depends_on, documented_in, built_with
    ]
    note: "Uses development relationship types"

  events:
    applicable: true
    types: [
      project_created, feature_deployed, code_pushed,
      agent_executed, integration_connected, docs_updated
    ]
    note: "Tracks development activity events"

  knowledge:
    applicable: true
    types: [documentation, patterns, best_practices, lessons, tutorials]
    note: "Uses knowledge types for technical learning"
```

### File Output:

**`/one-platform/knowledge/ontology-mapping.md`:**
```markdown
# ONE Platform - Ontology Usage Guide

**Version:** 1.0.0
**Generated:** 2025-10-20
**Source:** https://one.ie
**Based On:** Universal 6-Dimension Ontology

## Overview

Based on analysis of https://one.ie, your development platform
for building AI-native applications uses these parts of the universal ontology:

## GROUPS: Development Organizations

Your platform uses these standard group types:
- **organization** - Top-level companies and enterprises
- **team** - Engineering teams within organizations
- **project** - Individual software projects

## PEOPLE: Platform Roles

Your platform uses these standard roles:
- **platform_owner** - ONE Platform administrators
- **org_owner** - Organization executives
- **org_user** - Developers and engineers
- **customer** - End users of deployed applications

## THINGS: Software Entities

Your platform uses these standard thing types:

**Projects & Code:**
- project, repository, feature, component, module

**Deployments:**
- deployment, release, environment, pipeline

**AI & Automation:**
- agent, workflow, integration, automation

**Knowledge:**
- documentation, tutorial, pattern, lesson

## CONNECTIONS: Development Relationships

Your platform uses these standard connection types:
- **owns** - Developer → Project
- **collaborates_on** - Developer → Project
- **deployed_to** - Feature → Environment
- **integrated_with** - Project → External Service
- **depends_on** - Feature → Feature
- **documented_in** - Feature → Documentation

## EVENTS: Development Activities

Your platform tracks these standard event types:
- **project_created** - New project initialized
- **feature_deployed** - Feature shipped to production
- **code_pushed** - Code committed to repository
- **agent_executed** - AI agent ran task
- **integration_connected** - External service linked
- **docs_updated** - Documentation modified

## KNOWLEDGE: Development Intelligence

Your platform uses these standard knowledge types:
- **documentation** - Technical docs, API references
- **patterns** - Reusable code patterns
- **best_practices** - Recommended approaches
- **lessons** - Lessons learned from deployments
- **tutorials** - Step-by-step guides

---

**Note:** All these types exist in the universal 6-dimension ontology. Your data is stored using the same schema as all other ONE installations, enabling cross-organization compatibility and seamless data portability.
```

---

## Integration with Workflow

After agent-onboard completes:

1. **agent-director** takes over
2. Reads ontology mapping from installation folder
3. Recommends features based on detected patterns
4. User selects features to build
5. agent-director generates 100-inference plan
6. Specialized agents execute (agent-backend, agent-frontend, etc.)

---

## Feature Recommendation Logic

```typescript
function recommendFeatures(detected: DetectedFeatures): Feature[] {
  const features: Feature[] = [
    // Always recommend foundation
    FEATURES["landing-page"],
    FEATURES["authentication"],
    FEATURES["multi-tenant"],
  ];

  // Content-based recommendations
  if (detected.contentTypes.includes('blog')) {
    features.push(FEATURES["blog-cms"]);
  }
  if (detected.contentTypes.includes('video')) {
    features.push(FEATURES["video-library"]);
  }
  if (detected.contentTypes.includes('courses')) {
    features.push(FEATURES["course-platform"]);
  }

  // Monetization-based recommendations
  if (detected.monetization.includes('subscriptions')) {
    features.push(FEATURES["membership-tiers"]);
  }
  if (detected.monetization.includes('one-time-sales')) {
    features.push(FEATURES["product-store"]);
  }

  // Community-based recommendations
  if (detected.community.includes('discord')) {
    features.push(FEATURES["discord-integration"]);
  }

  // Tech stack-based recommendations
  if (detected.techStack.backend === 'Convex') {
    features.push(FEATURES["real-time-sync"]);
  }

  return features;
}
```

---

## Error Handling

### Website Not Accessible
```bash
❌ Could not access https://example.com

Options:
1. Check URL and try again
2. Manually provide brand details
3. Skip website analysis and use defaults

? What would you like to do? ›
```

### Ambiguous Brand Identity
```bash
⚠️  Multiple brand colors detected

Detected colors:
1. Primary: #FF6B6B, Secondary: #4ECDC4
2. Primary: #3498DB, Secondary: #2ECC71

? Which color scheme matches your brand? › 1
```

### No Features Detected
```bash
⚠️  Could not detect specific features from website

? What type of platform are you building? ›
  [ ] Creator Platform (content, community, monetization)
  [ ] Developer Platform (projects, code, deployments)
  [ ] Business Platform (CRM, projects, invoicing)
  [ ] E-commerce (products, orders, customers)
  [ ] Custom (define your own ontology)
```

---

## Success Criteria

- [x] Website successfully fetched and analyzed
- [x] Brand colors extracted (or user-provided)
- [x] Logo URL identified
- [x] Target audience determined
- [x] Ontology mapping created
- [x] Installation folder created
- [x] Configuration files written
- [x] Features recommended
- [x] User ready to select features

---

## Next Steps After Onboarding

```bash
✅ Onboarding complete!

📁 Created: /one-platform/
📊 Ontology mapping: /one-platform/knowledge/ontology-mapping.md
🎨 Brand guide: /one-platform/knowledge/brand-guide.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ RECOMMENDED FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Based on https://one.ie analysis:

FOUNDATION (Always recommended)
  [x] Landing page (Infer 1-10, ~5 min)
  [x] Authentication (Infer 11-20, ~10 min)
  [x] Multi-tenant groups (Infer 21-30, ~10 min)

DETECTED FROM YOUR SITE
  [ ] Blog CMS (Infer 31-40, ~15 min)
  [ ] Real-time sync (Infer 41-50, ~15 min)
  [ ] Discord integration (Infer 51-60, ~10 min)

AI & AUTOMATION
  [ ] AI agents (Infer 61-70, ~20 min)
  [ ] RAG knowledge base (Infer 71-80, ~15 min)

? Select features to build: › (Space to toggle, Enter to continue)
```

---

**agent-onboard makes onboarding personal, intelligent, and fast!** 🚀
