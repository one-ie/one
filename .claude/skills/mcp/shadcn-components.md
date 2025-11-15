---
name: mcp:shadcn-components
description: Access shadcn/ui component registry to add, search, and manage UI components in projects. Use when building frontend UI with React components.
---

# shadcn Components MCP

## Purpose

Provides on-demand access to the shadcn/ui component registry for adding pre-built, accessible React components to projects.

## When to Use

- Adding shadcn/ui components to a project
- Searching for available UI components
- Viewing component details and dependencies
- Managing component configuration

## MCP Server Details

**Server:** `shadcn`
**Type:** Command-based (npx)
**Status:** Available on-demand
**Token Cost:** ~2,000 tokens when loaded

## Available Tools

### 1. Add Component
Add shadcn/ui components to your project:
- Automatically installs dependencies
- Adds component files to `components/ui/`
- Configures TypeScript imports

### 2. Search Components
Search the component registry:
- Browse all available components
- Filter by category
- View component descriptions

### 3. View Component Details
Get detailed information:
- Component API and props
- Dependencies and peer dependencies
- Usage examples
- Installation requirements

### 4. Manage Configuration
Project configuration:
- View current shadcn config
- Update component paths
- Configure style preferences

## Usage Pattern

**Before using this skill:**
```bash
# Ensure MCPs are enabled (only if needed)
# This skill will auto-load when invoked
```

**Common workflows:**
1. Search for component: "I need a button component"
2. Add component: "Add the shadcn button component"
3. View details: "Show me the API for the select component"

## Examples

### Adding a Button Component
```typescript
// The MCP handles this automatically:
// 1. Installs dependencies
// 2. Adds components/ui/button.tsx
// 3. Configures imports
```

### Building a Form
```typescript
// Components needed: form, input, button, label
// The MCP can add all dependencies in sequence
```

## Token Efficiency

**Traditional approach (MCP always loaded):**
- Context: 2,000 tokens always consumed
- Usage: Whether you need it or not

**Skill approach (load on-demand):**
- Default: 0 tokens
- When invoked: ~50 tokens (metadata)
- When using: ~500 tokens (instructions)
- Savings: ~1,500 tokens (75%)

## Integration

**Works with:**
- `agent-frontend:create-page` - Adding components to Astro pages
- `agent-frontend:create-component` - Building React components
- `agent-designer:create-wireframe` - Component specification

**Complements:**
- React Hook Form (form handling)
- Zod (validation)
- Tailwind v4 (styling)

## Related Skills

- `mcp:chrome-devtools` - Debug components in browser
- `agent-frontend:create-component` - Build custom components
- `agent-designer:create-wireframe` - Design component layouts

## Configuration

**Required in project:**
- `components.json` - shadcn configuration file
- Tailwind CSS configured
- React 19+ installed

**Optional:**
- TypeScript (recommended)
- React Hook Form integration

## Troubleshooting

### Component not found
- Search the registry first
- Check spelling
- Verify shadcn version compatibility

### Installation fails
- Check Node.js version (20.19.0+)
- Verify package.json exists
- Check for conflicting dependencies

### Styling issues
- Ensure Tailwind is configured
- Check theme variables in globals.css
- Verify component path in components.json

## Best Practices

1. **Search before adding** - Use search to find the right component
2. **Add dependencies first** - Some components depend on others
3. **Check examples** - Review component API before using
4. **Customize minimally** - Prefer composition over modification

## Version History

- **1.0.0** (2025-11-15): Initial MCP skill migration from always-loaded MCP server

---

**Token-optimized:** Load only when needed, save ~1,500 tokens per session
