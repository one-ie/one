---
name: mcp:chrome-devtools
description: Debug web applications, inspect DOM, monitor network, and access Chrome DevTools Protocol. Use for frontend debugging and performance profiling.
---

# Chrome DevTools MCP

## Purpose

Provides on-demand access to Chrome DevTools for debugging web applications, inspecting elements, monitoring network activity, and performance profiling.

## When to Use

- Debugging frontend issues
- Inspecting DOM and styles
- Monitoring network requests
- Performance profiling
- Analyzing Core Web Vitals
- Testing responsive designs

## MCP Server Details

**Server:** `chrome-devtools`
**Type:** Command-based (npx)
**Status:** Available on-demand
**Token Cost:** ~2,000 tokens when loaded
**Requirements:** Node.js 20.19.0+, Chrome browser running

## Available Tools

### 1. DOM Inspection
Inspect elements:
- View DOM structure
- Inspect element styles
- Check computed values
- Analyze CSS specificity

### 2. Network Monitoring
Track requests:
- View all network requests
- Analyze request/response headers
- Monitor timing metrics
- Debug CORS issues

### 3. Performance Profiling
Measure performance:
- Record performance profiles
- Analyze JavaScript execution
- Measure render times
- Identify bottlenecks

### 4. Console Access
JavaScript console:
- Execute JavaScript
- View console logs
- Debug errors
- Test functions

### 5. Core Web Vitals
Measure metrics:
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)
- TTFB (Time to First Byte)

## Usage Pattern

**Before using this skill:**
```bash
# Ensure Chrome is running
# Requires Node.js 20.19.0+ (run: nvm use)
```

**Common workflows:**
1. Debug layout: "Inspect the header component"
2. Network issues: "Show network requests for this page"
3. Performance: "Profile page load performance"
4. Responsive: "Test mobile viewport"

## Examples

### Debugging CSS Issues
```typescript
// MCP provides:
// - Element selector
// - Applied styles
// - Computed values
// - Style inheritance chain
```

### Analyzing Page Performance
```typescript
// MCP shows:
// - Load timeline
// - JavaScript execution time
// - Render blocking resources
// - Optimization opportunities
```

### Testing Responsive Design
```typescript
// MCP enables:
// - Viewport simulation
// - Device emulation
// - Touch event testing
// - Media query debugging
```

## Token Efficiency

**Traditional approach (MCP always loaded):**
- Context: 2,000 tokens always consumed
- Usage: Even when not debugging

**Skill approach (load on-demand):**
- Default: 0 tokens
- When invoked: ~50 tokens (metadata)
- When using: ~500 tokens (instructions)
- Savings: ~1,500 tokens (75%)

## Integration

**Works with:**
- `agent-frontend:create-page` - Debug pages
- `agent-frontend:optimize-performance` - Performance tuning
- `agent-designer:create-wireframe` - Visual debugging

**Complements:**
- Lighthouse (performance audits)
- React DevTools
- Astro DevTools

## Related Skills

- `agent-frontend:optimize-performance` - Performance optimization
- `mcp:astro-docs` - Framework debugging
- `mcp:shadcn-components` - Component debugging

## Common Debugging Scenarios

### Layout Issues
- Element positioning problems
- Flexbox/Grid debugging
- Overflow issues
- Z-index stacking

### Performance Issues
- Slow JavaScript execution
- Large bundle sizes
- Render blocking resources
- Layout thrashing

### Network Issues
- Failed requests
- CORS errors
- Slow API calls
- Missing resources

### Responsive Issues
- Breakpoint problems
- Mobile layout bugs
- Touch interaction issues
- Viewport configuration

## Best Practices

1. **Profile before optimizing** - Measure actual performance
2. **Use network throttling** - Test on slower connections
3. **Test multiple devices** - Check responsive designs
4. **Monitor Core Web Vitals** - Track user experience metrics
5. **Use breakpoints** - Debug JavaScript effectively

## Performance Targets

**Core Web Vitals:**
- LCP: < 2.5s (good)
- FID: < 100ms (good)
- CLS: < 0.1 (good)

**Lighthouse Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 90+
- SEO: 95+

## Environment Setup

**Required:**
- Chrome browser installed
- Node.js 20.19.0+
- Development server running

**Optional:**
- React DevTools extension
- Lighthouse CLI

## Troubleshooting

### Can't connect to Chrome
- Ensure Chrome is running
- Check remote debugging port
- Verify DevTools protocol enabled

### Node version errors
- Requires Node 20.19.0+
- Run `nvm use` to switch
- Check `.nvmrc` file

### Performance data missing
- Enable performance recording
- Check browser permissions
- Verify profiler access

## Debugging Workflow

```bash
# 1. Start development server
cd web/ && bun run dev

# 2. Open Chrome to localhost:4321

# 3. Use this skill to:
# - Inspect elements
# - Monitor network
# - Profile performance
# - Debug JavaScript
```

## Version History

- **1.0.0** (2025-11-15): Initial MCP skill migration from always-loaded MCP server

---

**Token-optimized:** Load only when debugging, save ~1,500 tokens per session
