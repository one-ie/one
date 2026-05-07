# routing.md — Host → Context resolution

Every request resolves workspace, agent, viewer, and brand from the HTTP host header before reaching any page or API handler. This is **M10** — workspace routing via subdomain and path.

**Three layers:**
1. Host header parser (`web/src/middleware.ts`)
2. Context injected into `Astro.locals`
3. Pages and API routes read context, set masks

---

## M10 — Workspace routing (host → context)

Every request resolves `{workspace, agent, viewer, brand}` from the HTTP host header before reaching any page or API handler. Implemented in `web/src/middleware.ts`.

| Host pattern              | workspace        | agent               | viewer      | brand       |
|---------------------------|------------------|---------------------|-------------|-------------|
| `one.ie`, `localhost`     | undefined        | none                | developer   | default     |
| `{slug}.one.ie`           | slug             | none (in /path)     | end_user    | slug        |
| `{slug}.one.ie/{agent}`   | slug             | agent (from path)   | end_user    | slug        |
| Custom domain (CNAME)     | DB-resolved slug | from path or query  | end_user    | resolved    |

### Context Derivation

**workspace** — extracted from host subdomain or custom domain CNAME lookup
```
tony.one.ie         → workspace = "tony"
acme.com (CNAME)    → lookup domain in D1 → workspace = "acme"
one.ie              → workspace = undefined (default)
```

**agent** — extracted from URL path (e.g., `/refunds`, `/support`)
```
tony.one.ie/refunds       → agent = "refunds"
tony.one.ie/             → agent = none (root path)
tony.one.ie/refunds/chat  → agent = "refunds" (nested routes)
```

**viewer** — derived from identity + workspace relationship
```
undefined workspace   → viewer = "developer" (internal tools)
workspace defined
  + passkey exists    → viewer = "developer" (owner)
  + no passkey        → viewer = "end_user"  (guest)
```

`viewer` drives the sidebar mask: `developer`/`creator` see all 7 surfaces; `end_user` sees only `/chat`.

**brand** — follows workspace
```
undefined workspace   → brand tokens = defaults (ONE tokens)
workspace = "tony"    → brand tokens = tony's saved theme (from themes D1 table)
workspace = "acme"    → brand tokens = acme's saved theme
```

Custom tokens load via `web/src/layouts/Layout.astro` `onLabel()` function, which reads from stored themes and applies CSS overrides.

---

## Implementation Details

### Middleware Layers

**1. Host Parser** (`web/src/middleware.ts`)

```typescript
// Pseudocode
const host = request.headers.get('host');
const { workspace, agent } = parseHost(host);
const viewer = deriveViewer(workspace, passkey);
const brand = resolveBrand(workspace);

Astro.locals.context = { workspace, agent, viewer, brand };
```

**2. Custom Domain CNAME Lookup**

```sql
-- D1 domains table
CREATE TABLE domains (
  domain       TEXT PRIMARY KEY,    -- acme.com
  workspace_id TEXT NOT NULL,
  verified_at  INTEGER,
  cert_expires INTEGER
);
```

When host is not a `*.one.ie` subdomain, middleware queries `domains` table:

```typescript
if (!host.endsWith('.one.ie')) {
  const domain = await db.query(
    'SELECT workspace_id FROM domains WHERE domain = ?',
    [host]
  );
  workspace = domain?.workspace_id;
}
```

**3. Astro.locals context** (all pages, API routes can read)

```typescript
// src/pages/chat.astro (or any page)
---
const { workspace, agent, viewer, brand } = Astro.locals.context;
---
<Layout title="Chat" workspace={workspace} brand={brand}>
  <ChatInterface agent={agent} viewer={viewer} />
</Layout>
```

---

## Routing Table

| URL                      | Resolves to                                    | Renders        |
|--------------------------|------------------------------------------------|----------------|
| `one.ie`                 | `{ workspace: undefined, viewer: dev }`        | `/chat` (demo) |
| `one.ie/agents`          | `{ workspace: undefined, viewer: dev }`        | `/agents`      |
| `tony.one.ie`            | `{ workspace: "tony", viewer: end_user }`      | `/chat` index  |
| `tony.one.ie/refunds`    | `{ workspace: "tony", agent: "refunds" }`      | `/chat` (agent) |
| `refunds.acme.com`       | `{ workspace: "acme", agent: "refunds" }`      | `/chat` (agent) |
| `acme.com/support`       | `{ workspace: "acme", agent: "support" }`      | `/chat` (agent) |

**All resolve to the same `/chat.astro` route.** No per-agent route tree. Context determines what the page renders.

---

## Brand Loading (M2 × M10)

**Default tokens:**
```css
/* Layout.astro @theme */
--color-primary: hsl(216 55% 65%);
--color-secondary: hsl(219 14% 65%);
--color-tertiary: hsl(105 22% 65%);
/* ... 6 tokens + 5 invariants */
```

**Workspace-specific tokens:**

```typescript
// In Layout.astro
const { brand } = Astro.locals.context;
const customTokens = brand ? await loadTheme(brand.workspace) : null;
```

```tsx
// React islands read from CSS variables
<Button className={cn(
  "bg-primary text-on-primary",
  // CSS applies --color-primary from Layout theme
)} />
```

---

## API Routes with Context

Every API route can read workspace context:

```typescript
// src/pages/api/chat.ts
export const POST: APIRoute = async ({ request }) => {
  const { workspace, agent, viewer } = request.locals?.context ?? {};
  
  // Permission check
  if (viewer === 'end_user' && !agent) {
    return new Response('Forbidden', { status: 403 });
  }
  
  // Load agent and run it
  const agentRecord = await db.query(
    'SELECT * FROM agents WHERE workspace_id = ? AND slug = ?',
    [workspace, agent]
  );
  
  // ... chat logic ...
};
```

---

## Custom Domains (CNAME)

Users can add custom domains:

1. User enters `refunds.acme.com` in settings
2. System creates DNS verification record
3. Middleware verifies CNAME points to `one.ie`
4. Cloudflare cert auto-issued via Workers API
5. Future requests to `refunds.acme.com` resolve to `workspace=acme, agent=refunds`

**Verification endpoint:**
```
POST /api/domains/verify
{ domain: "refunds.acme.com", cname_target: "one.ie" }
```

---

## Mobile Handoff (M9 Callout)

Mobile clients (sm breakpoint) accessing non-chat routes see a toast:

```
"Configure on desktop"
Sidebar tools aren't designed for phones.
[open on desktop] [continue anyway]
```

This applies regardless of workspace context — the screen size drives it, not workspace or viewer.

---

## Edge Cases

**Subdomain + path both present:**
```
tony.one.ie/refunds
→ workspace from subdomain: "tony"
→ agent from path: "refunds"
→ both apply; /chat renders tony.refunds context
```

**Query string overrides (debug only):**
```
?workspace=override&viewer=force_dev
(Only enabled in dev mode; removed in production)
```

**Missing or invalid context:**
```
host = unknown.one.ie (not in D1)
→ workspace = undefined
→ viewer = end_user (safe default)
→ Renders public demo agent, no save option
```

---

## Lighthouse & Performance

Host header resolution happens in `web/src/middleware.ts` — **synchronous, <1ms**. No per-request database query unless custom domain lookup is needed (cached in memory for 60s).

The context is stamped on `Astro.locals` before SSR, so pages can access it synchronously:

```typescript
// In .astro frontmatter — zero async cost
const { workspace, agent, viewer } = Astro.locals.context;
```

---

## See Also

- `ui.md` — M10 definition and URL anatomy
- `ui-backend.md` — implementation wave plan (W4)
- `web/src/middleware.ts` — actual host parser
- `web/src/layouts/Layout.astro` — brand token application
- `modify.md` — workspace + domain CRUD
