---
name: build
description: Build the Envelope System for production
user-invocable: true
allowed-tools: Bash
---

# Build Envelope System

**Skills:** `/deploy` (wraps this as step 3 of the 8-step pipeline) · `/astro` (bundle-size rules — `markdown.syntaxHighlight: false`, `ssr.external`, keeps CF Pages worker under 10 MiB)

Build the Astro + React 19 project for production.

## Command

```bash
cd /Users/toc/Server/envelopes && bun run build
```

## Expected Output

```
╭────────────────────────────────────────────────╮
│  BUILD RESULTS                                 │
├────────────────────────────────────────────────┤
│  ✓ Astro build complete                        │
│  ✓ React components bundled                    │
│  ✓ Static pages generated                      │
│  ✓ Output: dist/                               │
╰────────────────────────────────────────────────╯
```

## Build Artifacts

- `dist/` - Production build output
- `dist/_astro/` - Bundled assets (JS, CSS)
- `dist/index.html` - Entry page

## Error Handling

If build fails:
1. Check TypeScript errors with `bun run build` output
2. Verify all imports resolve correctly
3. Check for missing dependencies

## Preview Production Build

```bash
bun preview
```

Opens at http://localhost:4321
