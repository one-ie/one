# Agent-Onboard Example Output

## Example Analysis for one.ie

### Input
```json
{
  "name": "Tom O'Connor",
  "organizationName": "ONE Platform",
  "websiteUrl": "https://one.ie",
  "email": "tom@one.ie"
}
```

### Website Analysis Result

```yaml
Brand Identity:
  colors:
    primary: "#FF6B6B"
    secondary: "#4ECDC4"
    accent: "#95E1D3"
  logo:
    url: "/logo.svg"
    format: "svg"
  fonts:
    heading: "Inter, sans-serif"
    body: "Inter, sans-serif"
  voice:
    tone: "Technical, friendly, empowering"
    audience: "Developers, creators, entrepreneurs"

Detected Features:
  contentTypes:
    - blog
    - products
  monetization:
    - subscriptions
    - one-time-sales
  community:
    - discord
  techStack:
    frontend: "Astro"
    backend: "Convex"
    hosting: "Cloudflare"

Business Model: "Development Platform"
```

### Generated Ontology Document

```markdown
# ONE Platform Custom Ontology

**Version:** 1.0.0
**Generated:** 2025-10-20T02:30:00.000Z
**Source:** https://one.ie
**Extends:** Core Universal Ontology

## Overview

Based on analysis of https://one.ie, this ontology models your Development platform for building AI-native applications with multi-tenant architecture.

## GROUPS: Organizations and communities for collaboration

- **organization**
- **community**

## PEOPLE: Platform builders, organization managers, and users

- **platform_owner**
- **group_owner**
- **group_user**
- **customer**

## THINGS: Core entities including content, products, and business objects

- **creator**
- **organization**
- **website**
- **blog_post**
- **article**
- **digital_product**
- **product**
- **subscription**
- **membership**
- **payment**
- **invoice**

## CONNECTIONS: Relationships between entities defining ownership and engagement

- **owns**
- **created_by**
- **authored**
- **member_of**
- **transacted**
- **following**
- **participated_in**

## EVENTS: Actions and state changes tracked for audit and analytics

- **entity_created**
- **entity_updated**
- **user_registered**
- **user_login**
- **content_event**
- **payment_event**
- **user_joined_group**

## KNOWLEDGE: Labels and semantic content for categorization and search

- **documentation**
- **label**
- **article_chunk**

---

**This ontology was automatically generated from your website analysis.**
**You can customize it by editing this file directly.**
```

### Generated Brand Guide

```markdown
# ONE Platform Brand Guide

**Generated:** 2025-10-20T02:30:00.000Z
**Source:** https://one.ie

## Brand Colors

### Primary Color
\`\`\`
#FF6B6B
\`\`\`

### Secondary Color
\`\`\`
#4ECDC4
\`\`\`

### Accent Color
\`\`\`
#95E1D3
\`\`\`

## Logo

- **URL:** /logo.svg
- **Format:** SVG

## Typography

### Heading Font
\`\`\`
Inter, sans-serif
\`\`\`

### Body Font
\`\`\`
Inter, sans-serif
\`\`\`

## Brand Voice

### Tone
Technical, friendly, empowering

### Target Audience
Developers, creators, entrepreneurs

---

## Usage Guidelines

### Colors in CSS

\`\`\`css
:root {
  --color-primary: #FF6B6B;
  --color-secondary: #4ECDC4;
  --color-accent: #95E1D3;
}
\`\`\`

### Colors in Tailwind Config

\`\`\`css
@theme {
  /* Convert hex to HSL for Tailwind v4 */
  --color-primary: /* #FF6B6B as HSL */;
  --color-secondary: /* #4ECDC4 as HSL */;
  --color-accent: /* #95E1D3 as HSL */;
}
\`\`\`

### Typography in CSS

\`\`\`css
:root {
  --font-heading: Inter, sans-serif;
  --font-body: Inter, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
}

body {
  font-family: var(--font-body);
}
\`\`\`

---

**This brand guide was automatically generated from your website.**
**You can customize it by editing this file directly.**
```

### Feature Recommendations

```yaml
Foundation (Always Recommended):
  - feature: Landing Page
    reason: Essential foundation for any platform
    priority: high
    inference: Infer 1-10
    time: 5 min

  - feature: Authentication
    reason: Required for user management and security
    priority: high
    inference: Infer 11-20
    time: 10 min

  - feature: Multi-Tenant Groups
    reason: Core architecture for scalable multi-tenant platform
    priority: high
    inference: Infer 21-30
    time: 10 min

Detected From Website:
  - feature: Blog CMS
    reason: Detected blog content on your website
    priority: high
    inference: Infer 31-40
    time: 15 min

  - feature: Product Store
    reason: Detected product sales on your website
    priority: medium
    inference: Infer 71-80
    time: 20 min

  - feature: Membership Tiers
    reason: Detected subscription business model
    priority: medium
    inference: Infer 61-70
    time: 15 min

  - feature: Discord Integration
    reason: Detected Discord community
    priority: medium
    inference: Infer 81-90
    time: 10 min

  - feature: Real-Time Sync
    reason: Convex enables powerful real-time features
    priority: medium
    inference: Infer 11-20
    time: 15 min

AI & Automation:
  - feature: AI Agents
    reason: AI agents can automate business operations
    priority: low
    inference: Infer 61-70
    time: 20 min

  - feature: RAG Knowledge Base
    reason: Semantic search improves content discoverability
    priority: low
    inference: Infer 71-80
    time: 15 min

Total Estimated Time: 145 minutes
```

### .onboarding.json Output

```json
{
  "status": "features_presented",
  "user": {
    "name": "Tom O'Connor",
    "email": "tom@one.ie"
  },
  "organization": {
    "name": "ONE Platform",
    "slug": "one-platform",
    "websiteUrl": "https://one.ie"
  },
  "analysis": {
    "completedAt": "2025-10-20T02:30:00.000Z",
    "brand": {
      "colors": {
        "primary": "#FF6B6B",
        "secondary": "#4ECDC4",
        "accent": "#95E1D3"
      },
      "logo": {
        "url": "/logo.svg",
        "format": "svg"
      },
      "fonts": {
        "heading": "Inter, sans-serif",
        "body": "Inter, sans-serif"
      },
      "voice": {
        "tone": "Technical, friendly, empowering",
        "audience": "Developers, creators, entrepreneurs"
      }
    },
    "features": {
      "contentTypes": ["blog", "products"],
      "monetization": ["subscriptions", "one-time-sales"],
      "community": ["discord"],
      "techStack": {
        "frontend": "Astro",
        "backend": "Convex",
        "hosting": "Cloudflare"
      }
    },
    "businessModel": "Development Platform"
  },
  "ontology": {
    "version": "1.0.0",
    "groups": ["organization", "community"],
    "people": ["platform_owner", "group_owner", "group_user", "customer"],
    "things": [
      "creator",
      "organization",
      "website",
      "blog_post",
      "article",
      "digital_product",
      "product",
      "subscription",
      "membership",
      "payment",
      "invoice"
    ],
    "connections": [
      "owns",
      "created_by",
      "authored",
      "member_of",
      "transacted",
      "following",
      "participated_in"
    ],
    "events": [
      "entity_created",
      "entity_updated",
      "user_registered",
      "user_login",
      "content_event",
      "payment_event",
      "user_joined_group"
    ],
    "knowledge": ["documentation", "label", "article_chunk"]
  },
  "recommendations": [
    {
      "id": "landing-page",
      "name": "Landing Page",
      "category": "foundation",
      "reason": "Essential foundation for any platform",
      "priority": "high",
      "required": true,
      "estimatedMinutes": 5
    },
    {
      "id": "authentication",
      "name": "Authentication",
      "category": "foundation",
      "reason": "Required for user management and security",
      "priority": "high",
      "required": true,
      "estimatedMinutes": 10
    },
    {
      "id": "multi-tenant",
      "name": "Multi-Tenant Groups",
      "category": "foundation",
      "reason": "Core architecture for scalable multi-tenant platform",
      "priority": "high",
      "required": true,
      "estimatedMinutes": 10
    },
    {
      "id": "blog-cms",
      "name": "Blog CMS",
      "category": "content",
      "reason": "Detected blog content on your website",
      "priority": "high",
      "required": false,
      "estimatedMinutes": 15
    },
    {
      "id": "product-store",
      "name": "Product Store",
      "category": "monetization",
      "reason": "Detected product sales on your website",
      "priority": "medium",
      "required": false,
      "estimatedMinutes": 20
    },
    {
      "id": "membership-tiers",
      "name": "Membership Tiers",
      "category": "monetization",
      "reason": "Detected subscription business model",
      "priority": "medium",
      "required": false,
      "estimatedMinutes": 15
    },
    {
      "id": "discord-integration",
      "name": "Discord Integration",
      "category": "community",
      "reason": "Detected Discord community",
      "priority": "medium",
      "required": false,
      "estimatedMinutes": 10
    },
    {
      "id": "real-time-sync",
      "name": "Real-Time Sync",
      "category": "platform",
      "reason": "Convex enables powerful real-time features",
      "priority": "medium",
      "required": false,
      "estimatedMinutes": 15
    },
    {
      "id": "ai-agents",
      "name": "AI Agents",
      "category": "ai",
      "reason": "AI agents can automate business operations",
      "priority": "low",
      "required": false,
      "estimatedMinutes": 20
    },
    {
      "id": "rag-knowledge",
      "name": "RAG Knowledge Base",
      "category": "ai",
      "reason": "Semantic search improves content discoverability",
      "priority": "low",
      "required": false,
      "estimatedMinutes": 15
    }
  ],
  "files": {
    "created": [
      "/one-platform/knowledge/ontology.md",
      "/one-platform/knowledge/brand-guide.md",
      "/one-platform/groups/one-platform/README.md"
    ]
  }
}
```

## CLI Output Experience

```bash
$ npx oneie init

    ██████╗ ███╗   ██╗███████╗
   ██╔═══██╗████╗  ██║██╔════╝
   ██║   ██║██╔██╗ ██║█████╗
   ██║   ██║██║╚██╗██║██╔══╝
   ╚██████╔╝██║ ╚████║███████╗
    ╚═════╝ ╚═╝  ╚═══╝╚══════╝

      Make Your Ideas Real

  https://one.ie  •  npx oneie

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Welcome to ONE Platform! Let's build something amazing.

? Your name: Tom O'Connor
? Organization name: ONE Platform
? Website URL: https://one.ie
? Email: tom@one.ie

✓ Analyzing website... (30s)
  ├─ Fetching https://one.ie
  ├─ Extracting brand colors
  ├─ Detecting features
  └─ Analyzing tech stack

✓ Generating custom ontology... (5s)
✓ Creating brand guide... (2s)
✓ Recommending features... (1s)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ ANALYSIS COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎨 Brand Identity:
   Primary: #FF6B6B
   Secondary: #4ECDC4
   Fonts: Inter

📊 Detected:
   Content: blog, products
   Business: subscriptions, one-time-sales
   Community: discord
   Tech: Astro + Convex + Cloudflare

📁 Created:
   /one-platform/knowledge/ontology.md
   /one-platform/knowledge/brand-guide.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ RECOMMENDED FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FOUNDATION (Always recommended)
  [x] Landing page (Infer 1-10, ~5 min)
  [x] Authentication (Infer 11-20, ~10 min)
  [x] Multi-tenant groups (Infer 21-30, ~10 min)

DETECTED FROM YOUR SITE
  [ ] Blog CMS (Infer 31-40, ~15 min)
  [ ] Product Store (Infer 71-80, ~20 min)
  [ ] Membership Tiers (Infer 61-70, ~15 min)
  [ ] Discord integration (Infer 81-90, ~10 min)
  [ ] Real-time sync (Infer 11-20, ~15 min)

AI & AUTOMATION
  [ ] AI agents (Infer 61-70, ~20 min)
  [ ] RAG knowledge base (Infer 71-80, ~15 min)

? Select features to build: › (Space to toggle, Enter to continue)

Total estimated time: 145 minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Next: Hand off to Claude Code for building!
```

---

## Key Capabilities Demonstrated

1. **Website Analysis**
   - Fetches and analyzes existing website
   - Extracts brand identity (colors, fonts, logo)
   - Detects content types and features
   - Identifies business model
   - Analyzes tech stack

2. **Ontology Generation**
   - Maps detected features to 6 dimensions
   - Generates custom thing types
   - Creates connection patterns
   - Defines event types
   - Produces markdown documentation

3. **Brand Guide Creation**
   - Documents colors, fonts, logos
   - Provides usage guidelines
   - Includes CSS/Tailwind examples
   - Generates markdown file

4. **Feature Recommendation**
   - Always recommends foundation (landing, auth, multi-tenant)
   - Recommends based on detected content types
   - Recommends based on monetization model
   - Recommends based on community features
   - Recommends based on tech stack
   - Calculates total estimated time

5. **.onboarding.json Update**
   - Sets status to "features_presented"
   - Stores complete analysis data
   - Includes brand information
   - Lists ontology summary
   - Provides feature recommendations
   - Tracks created files

---

**This agent makes onboarding intelligent, personalized, and fast!** 🚀
