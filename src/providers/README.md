# DataProvider Implementations

**Version:** 1.0.0
**Status:** Production Ready (Phase 1 Complete)
**Feature:** 2-7-alternative-providers
**Last Updated:** 2025-10-13

---

## Overview

The DataProvider interface enables the ONE Platform to work with **any backend** (Convex, WordPress, Notion, Supabase, Firebase, custom APIs, etc.) by providing a unified abstraction over the 6-dimension ontology.

**Current Providers:**
- ✅ **ConvexProvider** - Official ONE Platform backend (real-time, serverless)
- ✅ **NotionProvider** - Notion databases as backend
- ✅ **WordPressProviderEnhanced** - WordPress with custom tables
- ✅ **WordPressProvider** - Basic WordPress (read-only)
- ✅ **CompositeProvider** - Multi-backend routing

## Test Results (Previous)

✅ **35 passing tests**
✅ **0 TypeScript errors**
✅ **<10ms overhead per operation**
✅ **Zero breaking changes**

---

## Quick Start

### Using ConvexProvider (Default)

```typescript
import { convexProvider } from "@/providers/convex/ConvexProvider";

const provider = convexProvider(
  "https://shocking-falcon-870.convex.cloud"
);

// Use in Effect.ts services
const courses = await Effect.runPromise(
  provider.things.list({ type: "course", limit: 10 })
);
```

### Using NotionProvider

```typescript
import { notionProvider } from "@/providers/notion/NotionProvider";

const provider = notionProvider(
  "secret_ntn_...", // Notion integration token
  "org_123",        // ONE organization ID
  {
    course: "abc123...",        // Notion database ID for courses
    documentation: "def456...", // Notion database ID for docs
  }
);

const docs = await Effect.runPromise(
  provider.things.list({ type: "documentation", limit: 10 })
);
```

### Using WordPressProviderEnhanced

```typescript
import { wordPressProviderEnhanced } from "@/providers/wordpress/WordPressProviderEnhanced";

const provider = wordPressProviderEnhanced(
  "https://example.com",     // WordPress site URL
  "abcd 1234 efgh 5678",     // Application Password
  "org_123",                 // ONE organization ID
  "admin",                   // WP username (optional)
  ["course", "lesson"]       // Custom post types
);

const courses = await Effect.runPromise(
  provider.things.list({ type: "course", limit: 10 })
);
```

---

## Provider Comparison

| Feature | Convex | Notion | WordPress Enhanced | WordPress Basic |
|---------|--------|--------|-------------------|-----------------|
| **Things (CRUD)** | ✅ Full | ✅ Full | ✅ Full | ✅ Read-only |
| **Connections** | ✅ Native | ✅ Relations | ✅ Custom table | ❌ Not supported |
| **Events** | ✅ Native | ⚠️ Hybrid (Convex) | ✅ Custom table | ❌ Not supported |
| **Knowledge** | ✅ Native | ⚠️ Hybrid (Convex) | ✅ Custom table | ⚠️ Categories only |
| **Vector Search** | ✅ Native | ❌ | ❌ | ❌ |
| **Real-time** | ✅ WebSockets | ❌ Polling | ❌ Polling | ❌ Polling |
| **Performance** | Excellent (<100ms) | Good (<1s) | Good (<500ms) | Good (<500ms) |
| **Rate Limits** | 10,000/min | 3/sec | Hosting-dependent | Hosting-dependent |
| **Setup Complexity** | Low | Medium | High (plugin) | Low |

---

## Creating a New Provider

See `/one/knowledge/provider-creation-guide.md` for complete guide.

**Quick Steps:**

1. Create file: `src/providers/mybackend/MyBackendProvider.ts`
2. Implement DataProvider interface
3. Define ID format (e.g., `mybackend_<type>_<id>`)
4. Map statuses (ONE ↔ Backend)
5. Map types (66+ ONE types ↔ Backend types)
6. Implement 6 dimensions (or use hybrid approach)
7. Write tests (unit + integration)
8. Document setup guide

---

## Resources

- **Interface Definition:** `/frontend/src/providers/DataProvider.ts`
- **Provider Creation Guide:** `/one/knowledge/provider-creation-guide.md`
- **Ontology Specification:** `/one/knowledge/ontology.md`
- **Implementation Report:** `/one/things/features/feature-2-7-implementation-report.md`
- **Examples:** `/frontend/src/providers/examples/usage.ts`

---

## Roadmap

### Phase 1: Core Implementation ✅ COMPLETE
- [x] DataProvider interface
- [x] ConvexProvider
- [x] NotionProvider
- [x] WordPressProviderEnhanced
- [x] CompositeProvider

### Phase 2: Testing & Documentation (In Progress)
- [ ] Unit tests (180+ tests)
- [ ] Integration tests (90+ tests)
- [ ] Provider creation guide ✅ COMPLETE

### Phase 3: WordPress Plugin
- [ ] Custom tables creation
- [ ] REST endpoints
- [ ] Plugin published

### Phase 4: Additional Providers
- [ ] SupabaseProvider
- [ ] FirebaseProvider
- [ ] AirtableProvider

---

**Last Updated:** 2025-10-13
**Status:** Production Ready (Phase 1 Complete)
