# Multi-Ontology Architecture: Interactive Tutorial

**Version:** 1.0.0
**Purpose:** Learn the multi-ontology system from basics to advanced patterns
**Audience:** Developers, AI agents, platform builders

---

## Table of Contents

1. [Tutorial Overview](#tutorial-overview)
2. [Part 1: Understanding Ontology Composition](#part-1-understanding-ontology-composition)
3. [Part 2: Creating Your First Feature](#part-2-creating-your-first-feature)
4. [Part 3: Advanced Patterns](#part-3-advanced-patterns)
5. [Exercises](#exercises)
6. [Solutions](#solutions)

---

## Tutorial Overview

This tutorial will teach you how to:

1. Understand the ontology composition system
2. Create your first feature ontology
3. Use types in mutations and queries
4. Test your feature
5. Deploy to production

**Time Required:** 60-90 minutes
**Prerequisites:** Basic TypeScript, understanding of databases
**What You'll Build:** A complete newsletter feature with subscriptions, campaigns, and analytics

---

## Part 1: Understanding Ontology Composition

### The Core Ontology

Every ONE installation starts with the **core ontology** defined in `/one/knowledge/ontology-core.yaml`.

The core ontology provides the foundation:

```yaml
feature: core
version: "1.0.0"
description: "Foundation ontology with 6 dimensions"

thingTypes:
  - name: creator
    description: "Human creator with role and permissions"

  - name: ai_clone
    description: "Digital twin with voice + appearance"

  - name: group
    description: "Multi-tenant container with hierarchical nesting"

connectionTypes:
  - name: owns
    description: "Ownership relationship"
    fromType: any
    toType: any

  - name: member_of
    description: "Group membership with role metadata"
    fromType: creator
    toType: group

eventTypes:
  - name: thing_created
    description: "Any entity created"
    thingType: any

  - name: thing_updated
    description: "Any entity updated"
    thingType: any
```

**Key Concepts:**

- **6 Dimensions:** groups, people, things, connections, events, knowledge
- **Core Types:** Foundation types that all features build upon
- **Composability:** Features extend core without breaking changes

### Feature Ontologies

Features extend the core with specialized types. Here's a simplified example:

```yaml
feature: blog
extends: core
version: "1.0.0"
description: "Blogging platform feature"

thingTypes:
  - name: blog_post
    description: "Written blog content"
    properties:
      title: string
      content: string
      slug: string
      publishedAt: number

  - name: blog_category
    description: "Blog post category"
    properties:
      name: string
      slug: string

connectionTypes:
  - name: categorized_as
    description: "Post belongs to category"
    fromType: blog_post
    toType: blog_category

  - name: authored
    description: "Creator authored post"
    fromType: creator      # From core ontology
    toType: blog_post      # From this feature

eventTypes:
  - name: post_published
    description: "Blog post published"
    thingType: blog_post

  - name: post_viewed
    description: "Someone viewed post"
    thingType: blog_post
```

**How Features Compose:**

1. **Extends Core:** `extends: core` means you get all core types
2. **References Core Types:** You can use `creator` from core in your connections
3. **Adds Feature Types:** New types only exist when feature is enabled
4. **Type Safety:** TypeScript types are auto-generated

---

## Part 2: Creating Your First Feature

Let's create a **newsletter** feature step-by-step.

### Step 1: Plan Your Data Model

Before writing YAML, answer these questions:

**What entities do we need?** (Things)
- `newsletter` - The newsletter publication
- `newsletter_issue` - Individual issues/editions
- `subscriber` - Someone subscribed to newsletter
- `newsletter_campaign` - Email campaign sending issues

**How do they relate?** (Connections)
- `creator` → `newsletter` (owns)
- `newsletter` → `newsletter_issue` (part_of)
- `subscriber` → `newsletter` (subscribed_to)
- `newsletter_campaign` → `newsletter_issue` (sends)

**What actions happen?** (Events)
- `newsletter_created` - New newsletter created
- `newsletter_subscribed` - Someone subscribed
- `newsletter_unsubscribed` - Someone unsubscribed
- `issue_published` - New issue published
- `issue_sent` - Issue sent to subscribers

### Step 2: Create the YAML File

Create `/one/knowledge/ontology-newsletter.yaml`:

```yaml
# Newsletter Feature Ontology
# Provides newsletter publications, subscriptions, and campaigns

feature: newsletter
extends: core
version: "1.0.0"
description: "Newsletter platform with subscriptions and campaigns"

# ============================================================================
# Thing Types - What exists
# ============================================================================

thingTypes:
  # Newsletter publication
  - name: newsletter
    description: "Newsletter publication container"
    properties:
      title: string
      description: string
      slug: string
      schedule: string              # daily, weekly, monthly
      subscriberCount: number
      issueCount: number

  # Individual newsletter issue
  - name: newsletter_issue
    description: "Individual newsletter edition"
    properties:
      title: string
      content: string               # HTML or Markdown
      slug: string
      publishedAt: number           # Timestamp
      sentAt: number                # When sent to subscribers
      openRate: number              # Percentage
      clickRate: number             # Percentage

  # Newsletter subscriber
  - name: subscriber
    description: "Newsletter subscriber"
    properties:
      email: string
      firstName: string
      lastName: string
      subscribedAt: number
      source: string                # Where they signed up
      tags: string[]                # Subscriber tags/segments
      active: boolean               # Active subscription

  # Email campaign for sending issues
  - name: newsletter_campaign
    description: "Email campaign for newsletter delivery"
    properties:
      subject: string
      previewText: string
      fromName: string
      fromEmail: string
      scheduledFor: number          # When to send
      sentAt: number                # When actually sent
      recipientCount: number
      deliveredCount: number
      openCount: number
      clickCount: number
      status: string                # draft, scheduled, sending, sent

# ============================================================================
# Connection Types - How things relate
# ============================================================================

connectionTypes:
  # Creator owns newsletter
  - name: owns_newsletter
    description: "Creator owns newsletter publication"
    fromType: creator               # From core ontology
    toType: newsletter
    metadata:
      role: string                  # owner, editor, contributor
      permissions: string[]         # What they can do

  # Newsletter contains issues
  - name: part_of_newsletter
    description: "Issue belongs to newsletter"
    fromType: newsletter_issue
    toType: newsletter
    metadata:
      issueNumber: number           # Sequential issue number

  # Subscriber subscribed to newsletter
  - name: subscribed_to
    description: "Subscriber subscribed to newsletter"
    fromType: subscriber
    toType: newsletter
    metadata:
      subscribedAt: number
      source: string                # Where they subscribed
      doubleOptIn: boolean          # Confirmed subscription
      preferences: object           # Email preferences

  # Campaign sends issue
  - name: sends
    description: "Campaign delivers issue"
    fromType: newsletter_campaign
    toType: newsletter_issue
    metadata:
      scheduledFor: number
      sentAt: number

  # Subscriber received campaign
  - name: received
    description: "Subscriber received campaign"
    fromType: subscriber
    toType: newsletter_campaign
    metadata:
      deliveredAt: number
      openedAt: number
      clicked: boolean
      unsubscribed: boolean

# ============================================================================
# Event Types - What happens
# ============================================================================

eventTypes:
  # Newsletter lifecycle
  - name: newsletter_created
    description: "Newsletter publication created"
    thingType: newsletter

  - name: newsletter_updated
    description: "Newsletter settings updated"
    thingType: newsletter

  # Subscription events
  - name: newsletter_subscribed
    description: "New subscriber joined newsletter"
    thingType: subscriber

  - name: newsletter_unsubscribed
    description: "Subscriber left newsletter"
    thingType: subscriber

  - name: subscription_confirmed
    description: "Subscriber confirmed double opt-in"
    thingType: subscriber

  # Issue events
  - name: issue_created
    description: "New newsletter issue created"
    thingType: newsletter_issue

  - name: issue_published
    description: "Newsletter issue published"
    thingType: newsletter_issue

  - name: issue_sent
    description: "Issue sent to subscribers via campaign"
    thingType: newsletter_issue

  # Campaign events
  - name: campaign_created
    description: "Email campaign created"
    thingType: newsletter_campaign

  - name: campaign_scheduled
    description: "Campaign scheduled for delivery"
    thingType: newsletter_campaign

  - name: campaign_sent
    description: "Campaign successfully delivered"
    thingType: newsletter_campaign

  # Engagement events
  - name: issue_opened
    description: "Subscriber opened newsletter issue"
    thingType: newsletter_issue

  - name: issue_clicked
    description: "Subscriber clicked link in issue"
    thingType: newsletter_issue
```

### Step 3: Generate Types

Run the type generator to create TypeScript types:

```bash
# Generate types with newsletter feature enabled
PUBLIC_FEATURES="newsletter" bun run backend/scripts/generate-ontology-types.ts

# Or enable multiple features
PUBLIC_FEATURES="blog,newsletter,shop" bun run backend/scripts/generate-ontology-types.ts
```

**Output:**

```
🚀 Ontology Type Generator
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Features: newsletter

📖 Loading ontologies...

✅ Ontologies loaded successfully!
   - Features: core, newsletter
   - Thing Types: 70
   - Connection Types: 30
   - Event Types: 79

⚙️  Generating TypeScript types...
📝 Writing to: backend/convex/types/ontology.ts

✅ Types generated successfully!
```

---

## Part 3: Advanced Patterns

### Pattern 1: Multi-Feature Interactions

Features can reference each other's types.

### Pattern 2: Conditional Features

Check if features are enabled at runtime.

### Pattern 3: Performance Optimization

Optimize type checking and batch operations.

---

## Exercises

### Exercise 1: Create a Bookmarks Feature

Create a feature for bookmarking content.

### Exercise 2: Add Event Logging

Enhance analytics with detailed event tracking.

### Exercise 3: Cross-Feature Connections

Integrate shop products with newsletter campaigns.

---

## Solutions

Solutions provided for all exercises.

---

## Next Steps

**Further Reading:**

- `/one/knowledge/ontology.md` - Complete specification
- `/one/knowledge/ontology-engineering.md` - Advanced patterns
- `/backend/examples/ontology-types-usage.ts` - More examples

**Happy building!**
