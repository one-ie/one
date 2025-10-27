# ONE Platform Demo Page Layouts

## Version 1.0.0 - Page Structure Specification

This document defines the complete layout structure for all ONE Platform demo pages. Every demo page follows a consistent 5-section pattern that teaches the 6-dimension ontology through interactive examples.

---

## Standard Demo Page Structure

### 5-Section Pattern (Every Page)

```
┌─────────────────────────────────────────┐
│  SECTION 1: HERO                        │  Hero introduction
├─────────────────────────────────────────┤
│  SECTION 2: PLAYGROUND                  │  Interactive demo
├─────────────────────────────────────────┤
│  SECTION 3: CODE EXAMPLES               │  Implementation patterns
├─────────────────────────────────────────┤
│  SECTION 4: RELATIONSHIP EXPLORER       │  Visualize connections
├─────────────────────────────────────────┤
│  SECTION 5: CTA SECTION                 │  Call to action
└─────────────────────────────────────────┘
```

---

## Section 1: Hero Section

### Purpose

Introduce the dimension with a compelling headline, description, and visual hierarchy that prepares users for hands-on exploration.

### Structure

```astro
<section class="
  relative overflow-hidden
  px-4 py-20 sm:px-6 sm:py-24 md:px-8 md:py-32
  bg-gradient-to-br from-primary/5 via-background to-background
">
  <!-- Background visual elements -->
  <div class="absolute inset-0 -z-10">
    <!-- Gradient orbs -->
    <div class="absolute left-1/4 top-0 h-96 w-96 rounded-full
      bg-primary/10 blur-[120px]"></div>
  </div>

  <!-- Content container -->
  <div class="max-w-4xl mx-auto text-center">
    <!-- Icon or small badge -->
    <div class="inline-flex items-center gap-2 mb-6
      px-3 py-1.5 rounded-full bg-primary/10 text-primary">
      <span class="text-sm font-medium">Dimension Name</span>
    </div>

    <!-- Main headline -->
    <h1 class="text-4xl md:text-5xl lg:text-6xl
      font-bold leading-tight tracking-tight
      mb-6 text-foreground">
      The {Dimension} Layer of Reality
    </h1>

    <!-- Subheading -->
    <p class="text-xl md:text-2xl text-muted-foreground
      mb-12 max-w-2xl mx-auto leading-relaxed">
      {One-sentence description of what this dimension represents}
    </p>

    <!-- CTA buttons -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <!-- Primary CTA: Start playground -->
      <button class="
        px-6 py-3.5 rounded-md font-semibold
        bg-primary text-primary-foreground
        hover:bg-primary/90
        transition-all duration-200
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-ring
        h-12
      ">
        Explore Playground <span class="ml-2">→</span>
      </button>

      <!-- Secondary CTA: Learn more -->
      <button class="
        px-6 py-3.5 rounded-md font-semibold
        border border-border
        bg-background hover:bg-muted
        transition-colors duration-200
        h-12
      ">
        Read Documentation
      </button>
    </div>
  </div>

  <!-- Scroll indicator (optional) -->
  <div class="flex justify-center mt-12 text-muted-foreground">
    <svg class="w-6 h-6 animate-bounce" fill="none" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
    </svg>
  </div>
</section>
```

### Responsive Behavior

| Breakpoint | Width | Padding | Font Size |
|-----------|-------|---------|-----------|
| Mobile (320px) | 100% | px-4 py-20 | 28px title |
| Tablet (768px) | 100% | px-6 py-24 | 36px title |
| Desktop (1024px+) | max-w-4xl | px-8 py-32 | 48px title |

### Hero Section Specifications

| Element | Font Size | Line Height | Max Width |
|---------|-----------|-------------|-----------|
| Badge | text-sm | normal | auto |
| Headline (h1) | text-4xl→6xl | 1.2 | 100% |
| Subheading (p) | text-xl→2xl | 1.5 | 560px |
| Button text | text-base | normal | auto |

---

## Section 2: Playground Section

### Purpose

Provide **interactive, hands-on experience** with the dimension through a form + live data display pattern.

### Structure

```astro
<section class="px-4 py-16 md:px-6 md:py-20 bg-card border-y border-border">
  <div class="max-w-7xl mx-auto">
    <!-- Section title -->
    <h2 class="text-3xl md:text-4xl font-bold mb-3">
      Try It Yourself
    </h2>
    <p class="text-muted-foreground mb-12 max-w-xl">
      Use the playground below to create and explore {dimension} entities
      in real time.
    </p>

    <!-- Two-column layout: Form | Data Display -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- LEFT: Form Input -->
      <div class="space-y-6">
        <div class="bg-background rounded-lg p-6 border border-border">
          <h3 class="text-lg font-semibold mb-4">Create New {Entity}</h3>

          <!-- Form fields -->
          <form class="space-y-4" client:load>
            <!-- Text input -->
            <div class="flex flex-col">
              <label for="entity-name" class="mb-2 text-sm font-medium">
                Entity Name
              </label>
              <input
                id="entity-name"
                type="text"
                placeholder="Enter a unique name"
                class="
                  px-4 py-2.5 rounded-md
                  border border-input
                  bg-background text-foreground
                  placeholder:text-muted-foreground
                  focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-ring
                  transition-colors duration-200
                "
              />
            </div>

            <!-- Select dropdown -->
            <div class="flex flex-col">
              <label for="entity-type" class="mb-2 text-sm font-medium">
                Entity Type
              </label>
              <select
                id="entity-type"
                class="
                  px-4 py-2.5 rounded-md
                  border border-input
                  bg-background text-foreground
                  focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-ring
                "
              >
                <option>Select type...</option>
                <option value="type1">Type 1</option>
                <option value="type2">Type 2</option>
              </select>
            </div>

            <!-- Textarea -->
            <div class="flex flex-col">
              <label for="entity-desc" class="mb-2 text-sm font-medium">
                Description
              </label>
              <textarea
                id="entity-desc"
                placeholder="Describe this entity..."
                rows={4}
                class="
                  px-4 py-2.5 rounded-md
                  border border-input
                  bg-background text-foreground
                  placeholder:text-muted-foreground
                  focus-visible:outline-2 focus-visible:outline-offset-2
                  focus-visible:outline-ring
                  font-mono text-sm
                  resize-none
                "
              ></textarea>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              class="
                w-full px-4 py-2.5 rounded-md
                bg-primary text-primary-foreground
                font-semibold
                hover:bg-primary/90
                active:scale-95
                transition-all duration-200
                focus-visible:outline-2 focus-visible:outline-offset-2
                focus-visible:outline-ring
              "
            >
              Create Entity <span class="ml-2">→</span>
            </button>
          </form>
        </div>
      </div>

      <!-- RIGHT: Live Data Display -->
      <div class="space-y-6">
        <div class="bg-background rounded-lg p-6 border border-border">
          <h3 class="text-lg font-semibold mb-4">Live Data (JSON)</h3>

          <!-- Output code block -->
          <div class="
            bg-foreground/5 rounded-md p-4
            border border-border
            overflow-x-auto
            max-h-80 overflow-y-auto
            font-mono text-sm
            text-foreground/80
          ">
            <pre>{`{
  "id": "entity_123",
  "name": "Example Entity",
  "type": "thing",
  "properties": {
    "key": "value"
  },
  "createdAt": 1729880400000,
  "status": "active"
}`}</pre>
          </div>

          <!-- Info badge -->
          <p class="mt-4 text-xs text-muted-foreground flex items-center gap-2">
            <span class="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            Data updates in real-time as you interact with the playground
          </p>
        </div>

        <!-- Stats cards -->
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-background rounded-lg p-4 border border-border text-center">
            <p class="text-2xl font-bold text-primary">42</p>
            <p class="text-xs text-muted-foreground mt-1">Entities Created</p>
          </div>
          <div class="bg-background rounded-lg p-4 border border-border text-center">
            <p class="text-2xl font-bold text-accent">18</p>
            <p class="text-xs text-muted-foreground mt-1">Relationships</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Tips section -->
    <div class="mt-8 p-4 rounded-lg bg-accent/5 border border-accent/20">
      <p class="text-sm text-foreground">
        <strong>Pro Tip:</strong> Click "Create Entity" to see real-time updates in the JSON viewer on the right.
        Watch how the ontology captures your input.
      </p>
    </div>
  </div>
</section>
```

### Playground Variations by Dimension

#### Groups Demo Playground

```astro
<!-- Create hierarchical groups -->
<form class="space-y-4">
  <div class="flex flex-col">
    <label class="mb-2 text-sm font-medium">Group Name</label>
    <input type="text" placeholder="e.g., Engineering Team" />
  </div>

  <div class="flex flex-col">
    <label class="mb-2 text-sm font-medium">Group Type</label>
    <select>
      <option value="organization">Organization</option>
      <option value="business">Business</option>
      <option value="community">Community</option>
      <option value="dao">DAO</option>
      <option value="friend_circle">Friend Circle</option>
      <option value="government">Government</option>
    </select>
  </div>

  <div class="flex flex-col">
    <label class="mb-2 text-sm font-medium">Parent Group (Optional)</label>
    <select>
      <option>Select parent...</option>
      <option value="parent1">Parent Org 1</option>
      <option value="parent2">Parent Org 2</option>
    </select>
  </div>

  <button type="submit">Create Group</button>
</form>
```

#### Things Demo Playground

```astro
<!-- Create entities with flexible properties -->
<form class="space-y-4">
  <div class="flex flex-col">
    <label class="mb-2 text-sm font-medium">Entity Name</label>
    <input type="text" placeholder="Name of the thing..." />
  </div>

  <div class="flex flex-col">
    <label class="mb-2 text-sm font-medium">Entity Type (66+ types)</label>
    <select>
      <option value="creator">Creator / Person</option>
      <option value="course">Course</option>
      <option value="product">Product</option>
      <option value="token">Token</option>
      <option value="agent">Agent</option>
    </select>
  </div>

  <div class="flex flex-col">
    <label class="mb-2 text-sm font-medium">Properties (JSON)</label>
    <textarea
      placeholder={'{\n  "customField": "value"\n}'}
      rows={4}
      class="font-mono text-sm"
    ></textarea>
  </div>

  <button type="submit">Create Thing</button>
</form>
```

### Responsive Grid

| Breakpoint | Layout | Gap |
|-----------|--------|-----|
| Mobile (< 1024px) | 1 column | 6 spacing units |
| Desktop (1024px+) | 2 columns | 8 spacing units |

---

## Section 3: Code Examples Section

### Purpose

Show **developers exactly how** to implement features using the ontology through progressive, copy-paste-ready code examples.

### Structure

```astro
<section class="px-4 py-16 md:px-6 md:py-20">
  <div class="max-w-7xl mx-auto">
    <!-- Section title -->
    <h2 class="text-3xl md:text-4xl font-bold mb-3">
      Implementation Patterns
    </h2>
    <p class="text-muted-foreground mb-12 max-w-2xl">
      Copy-paste ready examples for common {dimension} tasks.
    </p>

    <!-- Tabs: Different examples -->
    <div class="space-y-8">
      <!-- Example 1 -->
      <div class="rounded-lg border border-border overflow-hidden">
        <!-- Header -->
        <div class="bg-muted px-6 py-4 border-b border-border flex items-center justify-between">
          <h3 class="font-semibold text-foreground">Create {Entity}</h3>
          <span class="text-xs font-mono text-muted-foreground">TypeScript</span>
        </div>

        <!-- Code block -->
        <div class="relative">
          <pre class="
            p-6 bg-foreground/5 border-t border-border
            overflow-x-auto
            text-sm font-mono text-foreground/80
          "><code>{`// Create a new thing in the ontology
export const create = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    properties: v.any(),
  },
  handler: async (ctx, args) => {
    const thingId = await ctx.db.insert('things', {
      groupId: args.groupId,
      type: args.type,
      name: args.name,
      properties: args.properties,
      status: 'draft',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Log the creation event
    await ctx.db.insert('events', {
      groupId: args.groupId,
      type: 'thing_created',
      targetId: thingId,
      actorId: ctx.auth?.getUserIdentity()?.tokenIdentifier,
      timestamp: Date.now(),
      metadata: { entityType: args.type },
    });

    return thingId;
  },
});`}</code></pre>

          <!-- Copy button -->
          <button
            class="
              absolute top-4 right-4
              px-3 py-1.5 rounded-md
              bg-primary text-primary-foreground
              text-xs font-medium
              hover:bg-primary/90
              transition-colors duration-200
              focus-visible:outline-2 focus-visible:outline-ring
            "
            aria-label="Copy code to clipboard"
          >
            Copy
          </button>
        </div>

        <!-- Details -->
        <div class="px-6 py-4 bg-background border-t border-border text-sm text-muted-foreground">
          <p><strong>Location:</strong> <code class="font-mono">convex/mutations/things.ts</code></p>
          <p class="mt-2"><strong>Key Points:</strong></p>
          <ul class="mt-2 ml-4 list-disc space-y-1">
            <li>All entities stored in the <code class="font-mono">things</code> table</li>
            <li>Every creation logs an event for audit trail</li>
            <li>Properties field is flexible JSON</li>
            <li>Status lifecycle: draft → active → published → archived</li>
          </ul>
        </div>
      </div>

      <!-- Example 2 -->
      <div class="rounded-lg border border-border overflow-hidden">
        <!-- Similar structure -->
      </div>

      <!-- Example 3 -->
      <div class="rounded-lg border border-border overflow-hidden">
        <!-- Similar structure -->
      </div>
    </div>

    <!-- All examples CTA -->
    <div class="mt-12 text-center">
      <button class="
        px-6 py-3 rounded-md
        bg-secondary text-secondary-foreground
        font-semibold
        hover:bg-secondary/90
        transition-colors
      ">
        View All Examples <span class="ml-2">→</span>
      </button>
    </div>
  </div>
</section>
```

### Code Example Template

Each code example should include:

1. **File location** (where to put the code)
2. **Language** (TypeScript, SQL, etc.)
3. **Syntax-highlighted code** (copy-paste ready)
4. **Key points** (what to understand)
5. **Related patterns** (see also links)

### Code Themes

```css
/* Light theme */
.code-light {
  background: hsl(var(--color-background));
  color: hsl(var(--color-foreground));
  border: 1px solid hsl(var(--color-border));
}

/* Dark theme */
.code-dark {
  background: hsl(0 0% 13%);
  color: hsl(210 40% 98%);
  border: 1px solid hsl(215 16.3% 20%);
}
```

---

## Section 4: Relationship Explorer Section

### Purpose

Visualize **how entities connect** through an interactive network graph that demonstrates the power of relationships in the ontology.

### Structure

```astro
<section class="px-4 py-16 md:px-6 md:py-20 bg-card border-y border-border">
  <div class="max-w-7xl mx-auto">
    <!-- Section title -->
    <h2 class="text-3xl md:text-4xl font-bold mb-3">
      Visualize Relationships
    </h2>
    <p class="text-muted-foreground mb-12 max-w-2xl">
      See how {dimension} entities connect and relate to each other.
    </p>

    <!-- Two-column layout: Graph | Properties -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- LEFT: Graph visualization (takes 2 columns on desktop) -->
      <div class="lg:col-span-2">
        <div class="
          rounded-lg border border-border
          bg-background
          aspect-square md:aspect-auto md:h-[500px]
          flex items-center justify-center
          overflow-hidden
        ">
          <!-- Relationship graph component -->
          <DemoRelationshipGraph client:load />
          <!-- Or SVG/Canvas for non-interactive demo -->
        </div>

        <!-- Legend -->
        <div class="mt-4 flex flex-wrap gap-4 text-sm">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-primary"></div>
            <span>Thing</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-accent"></div>
            <span>Connection</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-secondary"></div>
            <span>Event</span>
          </div>
        </div>
      </div>

      <!-- RIGHT: Entity properties -->
      <div class="flex flex-col gap-4">
        <!-- Selected entity info -->
        <div class="rounded-lg border border-border bg-background p-6">
          <p class="text-xs text-muted-foreground uppercase tracking-wide mb-2">
            Selected Entity
          </p>
          <h3 class="text-xl font-bold text-foreground mb-4">
            Entity Name
          </h3>

          <!-- Properties list -->
          <div class="space-y-3 text-sm">
            <div>
              <p class="text-xs text-muted-foreground uppercase">Type</p>
              <p class="font-mono text-foreground">thing</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground uppercase">Status</p>
              <span class="inline-block px-2 py-1 rounded-md bg-green-500/10 text-green-700 text-xs font-medium">
                active
              </span>
            </div>
            <div>
              <p class="text-xs text-muted-foreground uppercase">Created</p>
              <p class="font-mono text-foreground">Oct 25, 2024</p>
            </div>
            <div>
              <p class="text-xs text-muted-foreground uppercase">Group</p>
              <p class="font-mono text-foreground">org_demo_123</p>
            </div>
          </div>

          <!-- Related connections -->
          <div class="mt-6 pt-6 border-t border-border">
            <p class="text-xs text-muted-foreground uppercase tracking-wide mb-3">
              Connected To
            </p>
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 rounded-full bg-accent"></div>
                <span class="font-mono">owns</span>
                <span class="text-muted-foreground">→ 3 items</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div class="w-2 h-2 rounded-full bg-accent"></div>
                <span class="font-mono">authored_by</span>
                <span class="text-muted-foreground">← 1 item</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tips -->
        <div class="rounded-lg p-4 bg-primary/5 border border-primary/20">
          <p class="text-sm text-foreground">
            <strong>Try:</strong> Click nodes in the graph to explore relationships.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
```

### Relationship Graph Component

**Requirements:**

- Interactive node-link diagram
- Click nodes to select and show properties
- Hover to highlight connections
- Zoom and pan support (desktop)
- Touch-friendly (mobile)
- Legend showing connection types
- Responsive canvas sizing

**Libraries:**

- Recommended: Vis.js, D3.js, or Three.js
- Alternative: Canvas/SVG with Framer Motion

### Graph Data Structure

```typescript
interface GraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: 'thing' | 'connection' | 'event';
    color: string;
    size: number;
  }>;
  edges: Array<{
    from: string;
    to: string;
    label: string;
    relationship: 'owns' | 'authored' | 'holds' | 'connected';
  }>;
}
```

---

## Section 5: CTA Section

### Purpose

Close with a clear **call to action** and next steps to encourage user engagement.

### Structure

```astro
<section class="
  relative overflow-hidden
  px-4 py-20 md:px-6 md:py-28
  bg-gradient-to-br from-primary to-primary/80
  text-primary-foreground
">
  <!-- Background element -->
  <div class="absolute inset-0 -z-10 opacity-10">
    <svg class="absolute inset-0 w-full h-full">
      <defs>
        <pattern id="dots" x="20" y="20" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dots)" />
    </svg>
  </div>

  <!-- Content -->
  <div class="max-w-4xl mx-auto text-center relative z-10">
    <!-- Icon -->
    <div class="mb-6 flex justify-center">
      <div class="p-3 rounded-lg bg-primary-foreground/10 backdrop-blur-sm">
        <svg class="w-8 h-8" fill="none" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
    </div>

    <!-- Headline -->
    <h2 class="text-4xl md:text-5xl font-bold leading-tight mb-6">
      Ready to build with the ONE Ontology?
    </h2>

    <!-- Description -->
    <p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
      The playground above is just the beginning. Create your own applications
      with the complete ontology framework.
    </p>

    <!-- CTAs -->
    <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
      <!-- Primary CTA -->
      <a
        href="/docs/getting-started"
        class="
          inline-flex items-center justify-center
          px-8 py-4 rounded-md
          bg-primary-foreground text-primary
          font-semibold
          hover:shadow-lg hover:scale-105
          transition-all duration-200
          focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-primary-foreground
        "
      >
        Get Started <span class="ml-2">→</span>
      </a>

      <!-- Secondary CTA -->
      <a
        href="/docs"
        class="
          inline-flex items-center justify-center
          px-8 py-4 rounded-md
          border-2 border-primary-foreground
          text-primary-foreground
          font-semibold
          hover:bg-primary-foreground/10
          transition-colors duration-200
          focus-visible:outline-2 focus-visible:outline-offset-2
          focus-visible:outline-primary-foreground
        "
      >
        Read Docs
      </a>
    </div>

    <!-- Quick stats -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 border-t border-primary-foreground/20">
      <div>
        <p class="text-3xl font-bold">66+</p>
        <p class="text-sm opacity-75 mt-2">Thing Types</p>
      </div>
      <div>
        <p class="text-3xl font-bold">25+</p>
        <p class="text-sm opacity-75 mt-2">Connection Types</p>
      </div>
      <div>
        <p class="text-3xl font-bold">6</p>
        <p class="text-sm opacity-75 mt-2">Dimensions</p>
      </div>
    </div>
  </div>
</section>
```

### CTA Variations

**For "Groups" page:**
```
"Ready to organize your community?"
"Create your first group and start collaborating"
```

**For "Things" page:**
```
"Ready to model your domain?"
"Define your first entity type and start building"
```

**For "Connections" page:**
```
"Ready to define relationships?"
"Create your first connection and discover patterns"
```

---

## Dimension-Specific Pages

### /ontology/groups

**Hero:** "The Groups Dimension - Containers for Collaboration"

**Playground:** Create hierarchical groups with parent-child relationships

**Examples:**
1. Create organization with child departments
2. List all groups in hierarchy
3. Move group between parents

**Graph:** Show organization tree structure

**CTA:** "Organize Your Community"

### /ontology/people

**Hero:** "The People Dimension - Authorization & Governance"

**Playground:** Assign roles (org_owner, org_user, customer, platform_owner) to people

**Examples:**
1. Create user with role
2. Update user permissions
3. Query users by role

**Graph:** Show role hierarchy and access patterns

**CTA:** "Manage Your Team"

### /ontology/things

**Hero:** "The Things Dimension - All Entities"

**Playground:** Create entities (66+ types) with custom properties

**Examples:**
1. Create course entity with metadata
2. Create token with balance properties
3. Create agent with capabilities

**Graph:** Show entity types and their relationships

**CTA:** "Model Your Domain"

### /ontology/connections

**Hero:** "The Connections Dimension - Relationships Matter"

**Playground:** Create relationships (25+ types) between things

**Examples:**
1. Create "owns" connection with metadata
2. Create "enrolled_in" with dates
3. Create bidirectional "follows"

**Graph:** Visualize connection network

**CTA:** "Define Your Relationships"

### /ontology/events

**Hero:** "The Events Dimension - Complete Audit Trail"

**Playground:** Create events (67+ types) logging all actions

**Examples:**
1. Log entity creation event
2. Log transaction event with amount
3. Log user action with timestamp

**Graph:** Show event timeline

**CTA:** "Track Your History"

### /ontology/knowledge

**Hero:** "The Knowledge Dimension - RAG & Search"

**Playground:** Create embeddings and semantic search

**Examples:**
1. Create knowledge chunk with embedding
2. Search similar documents
3. Build taxonomy of topics

**Graph:** Show knowledge graph connections

**CTA:** "Build Your Knowledge Base"

---

## Page Layout Implementation

### Astro Page Template

```astro
---
// src/pages/ontology/[dimension].astro
import Layout from '../../layouts/Layout.astro';
import DemoHero from '../../components/demo/DemoHero.astro';
import DemoPlayground from '../../components/demo/DemoPlayground.astro';
import DemoCodeExamples from '../../components/demo/DemoCodeExamples.astro';
import DemoRelationshipGraph from '../../components/demo/DemoRelationshipGraph.tsx';
import DemoCTA from '../../components/demo/DemoCTA.astro';

const { dimension } = Astro.params;
const dimensionData = getDimensionData(dimension);
---

<Layout title={`${dimensionData.title} - ONE Platform`}>
  <DemoHero {...dimensionData.hero} />
  <DemoPlayground {...dimensionData.playground} client:load />
  <DemoCodeExamples {...dimensionData.examples} />

  <section class="px-4 py-16 md:px-6 md:py-20 bg-card border-y border-border">
    <div class="max-w-7xl mx-auto">
      <DemoRelationshipGraph {...dimensionData.graph} client:load />
    </div>
  </section>

  <DemoCTA {...dimensionData.cta} />
</Layout>
```

---

## Responsive Design Matrix

| Section | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Hero | 1-col, 20px v-padding | 1-col, 24px | 1-col, 32px |
| Playground | Stack (1 col) | Stack (1 col) | 2-col grid |
| Code | 1-col, scroll-x | 1-col | 1-col |
| Graph | Full width | Full width | 2/3 width |
| CTA | 1-col buttons | 2-col buttons | 2-col buttons |

---

## Accessibility Checklist

- [ ] All headings have proper hierarchy (h1 → h2 → h3)
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Code blocks have `lang` attribute for syntax highlighting
- [ ] Images have alt text
- [ ] Interactive elements have focus states
- [ ] Colors meet WCAG AAA contrast
- [ ] Touch targets minimum 44px height

---

## Performance Targets

- **Largest Contentful Paint (LCP):** < 2.5 seconds
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms
- **Lighthouse Score:** 95+ across all metrics

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Oct 2024 | Initial page layout specifications |

---

**Page Layouts Maintained By:** Design Agent
**Last Updated:** October 25, 2024
**Status:** Production Ready
