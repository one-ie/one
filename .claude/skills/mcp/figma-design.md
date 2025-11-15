---
name: mcp:figma-design
description: Access Figma designs, extract design tokens, export assets, and retrieve component specs. Use for design-to-code workflows.
---

# Figma Design MCP

## Purpose

Provides on-demand access to Figma designs for extracting design tokens, exporting assets, and retrieving component specifications for implementation.

## When to Use

- Extracting design tokens from Figma
- Exporting design assets (images, icons)
- Retrieving component specifications
- Accessing design system definitions
- Converting designs to code

## MCP Server Details

**Server:** `framelink-figma`
**Type:** Command-based with authentication
**Status:** Available on-demand
**Token Cost:** ~2,500 tokens when loaded
**Authentication:** Requires `FIGMA_ACCESS_TOKEN` in `.env`

## Available Tools

### 1. Access Figma Files
Retrieve design files:
- File structure
- Page organization
- Frame hierarchy
- Component library

### 2. Extract Design Tokens
Get design system values:
- Color palettes
- Typography scales
- Spacing system
- Border radius values
- Shadow definitions

### 3. Export Assets
Download design assets:
- Images (PNG, SVG, JPG)
- Icons
- Logos
- Illustrations

### 4. Component Specifications
Get component details:
- Component properties
- Variants
- Auto-layout rules
- Constraints

### 5. Styles & Variables
Access styles:
- Color styles
- Text styles
- Effect styles
- Grid styles

## Usage Pattern

**Before using this skill:**
```bash
# Ensure FIGMA_ACCESS_TOKEN is in .env
# Get token from: https://www.figma.com/developers/api#access-tokens
```

**Common workflows:**
1. Extract tokens: "Get color palette from Figma file"
2. Export assets: "Export all icons as SVG"
3. Component specs: "Show button component variants"
4. Design sync: "Check latest design changes"

## Examples

### Extracting Color Tokens
```typescript
// MCP retrieves:
// - Primary colors
// - Secondary colors
// - Semantic colors
// - Dark mode variants

// Convert to Tailwind v4:
// @theme {
//   --color-primary: #2563eb;
//   --color-secondary: #7c3aed;
// }
```

### Exporting Icons
```typescript
// MCP exports:
// - All icon frames
// - SVG format
// - Optimized code
// - Naming conventions

// Save to: web/public/icons/
```

### Component Specifications
```typescript
// MCP provides:
// - Button variants (primary, secondary, ghost)
// - Size options (sm, md, lg)
// - State variations (default, hover, disabled)
// - Spacing values
```

## Token Efficiency

**Traditional approach (MCP always loaded):**
- Context: 2,500 tokens always consumed
- Usage: Even when not accessing Figma

**Skill approach (load on-demand):**
- Default: 0 tokens
- When invoked: ~50 tokens (metadata)
- When using: ~600 tokens (instructions)
- Savings: ~1,900 tokens (76%)

## Integration

**Works with:**
- `agent-designer:create-wireframe` - Design implementation
- `agent-designer:set-design-tokens` - Token generation
- `agent-frontend:create-component` - Component building

**Complements:**
- Tailwind v4 (design tokens)
- shadcn/ui (component library)
- Astro Image (asset optimization)

## Related Skills

- `agent-designer:set-design-tokens` - Token configuration
- `agent-designer:create-wireframe` - Design specs
- `mcp:chrome-devtools` - Visual QA

## Design-to-Code Workflow

### 1. Extract Design Tokens
```bash
# Use this skill to:
# - Get color palette
# - Extract typography
# - Get spacing scale

# Output: Tailwind v4 theme
```

### 2. Export Assets
```bash
# Use this skill to:
# - Export icons (SVG)
# - Export images (optimized)
# - Export logos (all sizes)

# Output: /web/public/
```

### 3. Component Specs
```bash
# Use this skill to:
# - Get component variants
# - Extract dimensions
# - Document states

# Output: Component requirements
```

### 4. Implement Components
```bash
# Use agent-frontend to:
# - Build React components
# - Apply design tokens
# - Match Figma specs
```

## Environment Setup

**Required in `.env`:**
```bash
FIGMA_ACCESS_TOKEN=figd_your-token-here
```

**Get Figma token:**
1. Go to https://www.figma.com/developers/api#access-tokens
2. Generate personal access token
3. Add to `.env` file

## Best Practices

1. **Extract tokens first** - Start with design system
2. **Export assets optimized** - Use SVG for icons
3. **Document variants** - Track component states
4. **Sync regularly** - Check for design updates
5. **Validate contrast** - Ensure WCAG compliance

## Common Patterns

### Design System Setup
```typescript
// 1. Extract design tokens from Figma
// 2. Convert to Tailwind v4 @theme
// 3. Generate color scales
// 4. Validate WCAG contrast
// 5. Apply to components
```

### Component Library
```typescript
// 1. Get component specs from Figma
// 2. Match to shadcn/ui components
// 3. Customize with design tokens
// 4. Test in Storybook
// 5. Document variants
```

## Figma File Structure

**Recommended organization:**
```
Figma File
├── 🎨 Design System
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Components
├── 📄 Pages
│   ├── Homepage
│   ├── Product
│   └── Dashboard
└── 📦 Assets
    ├── Icons
    ├── Logos
    └── Images
```

## Troubleshooting

### Authentication errors
- Verify `FIGMA_ACCESS_TOKEN` in `.env`
- Check token permissions
- Regenerate token if expired

### File not found
- Verify Figma file URL
- Check access permissions
- Ensure file is shared

### Export failures
- Check file size limits
- Verify export settings
- Try smaller batches

## Version History

- **1.0.0** (2025-11-15): Initial MCP skill migration from always-loaded MCP server

---

**Token-optimized:** Load only during design work, save ~1,900 tokens per session
