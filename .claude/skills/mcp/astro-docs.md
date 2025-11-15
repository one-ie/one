---
name: mcp:astro-docs
description: Search Astro documentation for API references, guides, and tutorials. Use when working with Astro framework features.
---

# Astro Documentation MCP

## Purpose

Provides on-demand access to Astro framework documentation, API references, and integration guides.

## When to Use

- Looking up Astro API references
- Learning Astro features
- Finding integration guides
- Troubleshooting Astro issues
- Exploring best practices

## MCP Server Details

**Server:** `astro-docs`
**Type:** Remote HTTP endpoint
**Status:** Available on-demand
**Token Cost:** ~1,500 tokens when loaded
**Authentication:** None required (public endpoint)

## Available Tools

### 1. Search Documentation
Find relevant docs:
- API references
- Component guides
- Configuration options
- Integration tutorials

### 2. API References
Look up APIs:
- Astro.props
- Astro.slots
- Content Collections
- Middleware
- Server endpoints

### 3. Integration Guides
Framework integrations:
- React integration
- Tailwind CSS
- MDX support
- Image optimization
- RSS feeds

### 4. Best Practices
Learn patterns:
- Performance optimization
- SEO configuration
- Deployment strategies
- TypeScript usage

## Usage Pattern

**Common workflows:**
1. API lookup: "How do I use Astro.props?"
2. Integration: "How to set up React in Astro?"
3. Configuration: "Astro config for SSR"
4. Troubleshooting: "Why is my page not rendering?"

## Examples

### Looking Up Content Collections
```typescript
// Search: "content collections API"
// Returns:
// - Collection configuration
// - Schema definition
// - Query methods
// - Type generation
```

### React Integration
```typescript
// Search: "React integration guide"
// Returns:
// - Installation steps
// - Component usage
// - Client directives
// - Island architecture
```

### Image Optimization
```typescript
// Search: "image optimization"
// Returns:
// - Image component API
// - Optimization options
// - Format conversion
// - Responsive images
```

## Token Efficiency

**Traditional approach (MCP always loaded):**
- Context: 1,500 tokens always consumed
- Usage: Even when not searching docs

**Skill approach (load on-demand):**
- Default: 0 tokens
- When invoked: ~50 tokens (metadata)
- When using: ~400 tokens (instructions)
- Savings: ~1,100 tokens (73%)

## Integration

**Works with:**
- `agent-frontend:create-page` - Building Astro pages
- `astro/create-page` skill - Page templates
- `agent-frontend:optimize-performance` - Performance tuning

**Complements:**
- React documentation
- Tailwind CSS docs
- MDX guides

## Related Skills

- `agent-frontend:create-page` - Page generation
- `astro/create-component` - Component creation
- `mcp:chrome-devtools` - Browser debugging

## Common Queries

### Component Patterns
- Server components vs islands
- Client directives (client:load, client:visible)
- Props passing
- Slot usage

### Configuration
- Output modes (static, hybrid, server)
- Adapter setup
- Build configuration
- Environment variables

### Performance
- Code splitting
- Image optimization
- Font loading
- CSS bundling

### Content
- Content collections
- Markdown/MDX
- Frontmatter
- Dynamic routes

## Astro 5 Features

**Latest features to explore:**
- Content Layer API
- Server Islands
- Request Rewriting
- Toolbar API
- Markdown optimizations

## Best Practices

1. **Search before implementing** - Leverage official docs
2. **Check version compatibility** - Ensure Astro 5 docs
3. **Follow patterns** - Use recommended approaches
4. **Test integrations** - Verify compatibility
5. **Optimize builds** - Follow performance guides

## Troubleshooting

### Can't find feature
- Check Astro version (5.x)
- Search alternative terms
- Check integration docs
- Review changelogs

### Conflicting guidance
- Prefer latest Astro 5 docs
- Check deprecation warnings
- Review migration guides
- Test in local environment

## Quick Reference

**Core Concepts:**
- Islands architecture
- File-based routing
- Content collections
- SSR/SSG modes
- Integrations

**Key APIs:**
- `Astro.props` - Component props
- `Astro.slots` - Slot access
- `getCollection()` - Content queries
- `defineConfig()` - Configuration
- `middleware` - Server middleware

## Version History

- **1.0.0** (2025-11-15): Initial MCP skill migration from always-loaded MCP server

---

**Token-optimized:** Load only when searching docs, save ~1,100 tokens per session
