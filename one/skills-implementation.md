---
mode: lean
lifecycle: construction
spec: agent-spec.md
exit: end-to-end receipt appended to this file — third-party skill imported, paid for, invoked
---

# Skills implementation plan

The runtime is wired but three gaps prevent the canonical receipt:
**"import a third-party skill into a chat sandbox, pay $0.02, invoke it."**

This plan closes them and produces a numeric receipt.

---

## Goal

Reproducible receipt appended to this file's `## Receipt` section (below) showing:

```
1. import: github:qwibitai/nanoclaw/.claude/skills/add-discord  → ms, bytes, hash
2. price:  $0.02 (set at import time)
3. invoke: chat → skill tool → pending-payment → user signs → payment tool → skill-result
4. settle: x402 tx hash, amount USD, settlement ms
5. mark:   substrate path strengthened; pheromone +1
```

If those five lines have real numbers, the runtime claim is verified.

---

## Speed

| Step | Budget |
|---|---:|
| A — promote imports to named path | 1h |
| B — `skillTool` uses `loadSkill` | 15m |
| C — `price` param on import | 30m |
| C2 — shared `POST /api/skill/import` route | 30m |
| D1 — `import_skill` tool in chat (primary surface) | 1h |
| D2 — settings panel import form | 45m |
| D3 — SDK `client.skills.import()` | 30m |
| D4 — wire `oneie skill import` CLI | 30m |
| E — run receipts on all four surfaces | 1h |
| F — append rows to `## Receipt` table | 15m |
| **Total** | **~6.25h** |

---

## Tasks

### A — Imported skills reachable by name

**Files:** `web/src/lib/skill/import.ts`, `web/src/pages/api/skill/import.ts` (new or existing)

**Current state:** `importSkill()` writes to `<slug>/skills/_remote/<hash>/SKILL.md`. `skillTool` (chat.ts:212) reads `<slug>/skills/<name>.md`. Mismatch — imports are invisible.

**Decision:** promote on import. After cache write, also write a stable directory shim at `<slug>/skills/<chosen-name>/SKILL.md` with the (possibly price-injected) content. The `_remote/` cache stays for refresh; the named copy is what the LLM sees.

**Diff shape:**

```ts
// import.ts — after r2.put(cacheKey, text, ...)
const { meta } = parse(text, { pathStem: stem })
const finalName = chosenName ?? String(meta.name ?? stem)
const namedKey = `${slug}/skills/${finalName}/SKILL.md`
await r2.put(namedKey, withPrice(text, price), {
  customMetadata: { sourceUrl: url, importedAt: new Date().toISOString(), cacheKey },
})
```

### B — `skillTool` uses `loadSkill`

**File:** `web/src/pages/api/chat.ts` (line ~211)

**Diff:**

```ts
// before
const obj = await (env.CONTENT as R2Bucket).get(`${slug}/skills/${skillName}.md`)
if (!obj) return { kind: 'error' as const, error: 'skill not found' }
const md = await obj.text()

// after
import { loadSkill } from '../../lib/skill/loader'
const skill = await loadSkill(`${slug}/skills/${skillName}`, env.CONTENT as R2Bucket)
if (!skill) return { kind: 'error' as const, error: 'skill not found' }
const md = `---\nprice: ${skill.price ?? 0}\n---\n${skill.body}`
```

Same change in `paymentTool` (line ~234).

### C — `price` param on import

**Files:** `web/src/lib/skill/import.ts`, `web/src/pages/api/skill/import.ts` (new)

`importSkill(ref, slug, r2, opts?: { price?: number; chosenName?: string })`.
Helper `withPrice(yaml, price)` injects/replaces `price:` line in frontmatter.

API route accepts `{ ref, slug, price, name? }` body.

### C2 — Shared `POST /api/skill/import` route

**File:** `web/src/pages/api/skill/import.ts` (new)

Single backend that all four surfaces (chat / settings / SDK / CLI) call. Body shape:

```ts
{
  ref?: string         // URL or github:owner/repo/path
  content?: string     // raw SKILL.md text (used by chat paste)
  slug: string         // owner sandbox
  name?: string        // override; defaults to frontmatter name or path stem
  price?: number       // USD; default 0.02
}
```

Authn: passkey cookie (web) **or** `Authorization: Bearer <token>` (SDK/CLI). Returns `{ skill, key, preview, diagnostics }`. Owner approval still gates the actual write — the route only stages the cache + returns the preview; the final commit happens through the existing passkey-gated `write` path.

### D — Import surfaces (four)

Product UX is **paste into chat**. The other three are batch / programmatic / scriptable variants. All four ship and all four call the same backend.

#### D1 — Chat paste (primary)

**File:** `web/src/pages/api/chat.ts`

Register a new tool alongside `skill`/`payment`/`eval`:

```ts
import_skill: tool({
  description: 'Import a third-party skill from a URL/github ref or pasted SKILL.md content. Use when the user pastes a skill link, a SKILL.md body starting with frontmatter, or asks to "add"/"install"/"import" a skill. Always confirm price before calling.',
  parameters: z.object({
    ref: z.string().optional().describe('URL or github:owner/repo/path ref'),
    content: z.string().optional().describe('Raw SKILL.md text if user pasted it'),
    name: z.string().optional().describe('Override name; defaults to frontmatter name or path stem'),
    price: z.number().min(0).default(0.02).describe('USD price the owner sets for this skill'),
  }),
  execute: async ({ ref, content, name, price }) => {
    if (!slug) return { kind: 'error', error: 'no slug context' }
    const text = content ?? (ref ? await fetchSkillText(ref) : null)
    if (!text) return { kind: 'error', error: 'need ref or content' }
    const parsed = parse(text, { pathStem: name ?? deriveStem(ref) })
    if (parsed.diagnostics.some(d => d.level === 'warn'))
      return { kind: 'preview', diagnostics: parsed.diagnostics, meta: parsed.meta, requiresApproval: true }
    const finalName = name ?? String(parsed.meta.name)
    const namedKey = `${slug}/skills/${finalName}/SKILL.md`
    return {
      kind: 'pending-write',
      key: namedKey,
      content: withPrice(text, price),
      preview: { name: finalName, price, body: parsed.body.slice(0, 280) },
    }
  },
}),
```

The existing approval pattern (passkey-gated `write`) commits the file. No new UI — `pending-write` cards already render in the chat surface.

**System prompt nudge** (added to `chat.ts` system message when slug is present):

> When the user pastes a skill URL, github ref, or markdown beginning with YAML frontmatter (`---\nname: ...`), call `import_skill` with the appropriate argument. Confirm the price first if not specified.

#### D2 — Settings panel

**File:** `web/src/pages/u/[slug]/settings.astro`

Add an "Import skill" form (ref + name + price) → `POST /api/skill/import`. Useful for batch imports. Owner-only via the existing passkey gate.

#### D3 — SDK `client.skills.import()`

**Files:** `sdk/src/client.ts`, `sdk/src/index.ts`

Add `skills` namespace with `import` method:

```ts
client.skills.import({ ref?, content?, slug, price?, name? })
  → Promise<{ skill: Skill; key: string; preview: Preview; diagnostics: Diagnostic[] }>
```

Implementation: `POST /api/skill/import` with `Authorization: Bearer <apiKey>`. The `ref` form fetches server-side (substrate's `crawl` tool); the `content` form uploads inline.

```ts
const result = await client.skills.import({
  ref: 'github:qwibitai/nanoclaw/.claude/skills/add-discord',
  slug: 'alice',
  price: 0.02,
})
// result.skill.name === 'add-discord', result.skill.price === 0.02
```

Export `Skill`, `Diagnostic`, `Preview` types from `sdk/src/index.ts`.

#### D4 — `oneie skill import` (wire the stub)

**File:** `cli/src/skill.ts`

Replace the current stub (`out(cmd, { ok: false, ... reason: 'requires substrate API access' })`) with a working implementation:

```ts
cmd.command('import <ref>')
  .description('Import a skill from URL, npm, or github shorthand')
  .option('--slug <slug>', 'Owner slug to import into', readDefaultSlug())
  .option('--price <usd>', 'Price in USD', '0.02')
  .option('--name <name>', 'Override skill name')
  .option('--yes', 'Skip approval prompt (CI-friendly)')
  .action(async (ref, opts) => {
    const token = readToken()  // from ~/.oneie/auth.json or ONEIE_TOKEN env
    if (!token) { out(cmd, { ok: false, error: 'not authenticated — run `oneie auth login`' }); return }
    const client = new OneieClient({ apiKey: token })
    const result = await client.skills.import({
      ref, slug: opts.slug, price: Number(opts.price), name: opts.name,
    })
    if (!opts.yes) {
      // render preview, confirm via stdin (skipped in --json mode)
    }
    out(cmd, { ok: true, ref, slug: opts.slug, name: result.skill.name,
               price: result.skill.price, key: result.key,
               diagnostics: result.diagnostics })
  })
```

Graceful failure when offline: suggest `oneie skill validate <path>` as the offline alternative.

### E — Run the receipt path on all four surfaces

Same backend, four entry points. One row per surface in the receipt table.

**E1 — Chat paste (primary, proves product UX)**
```
1. /u/test/chat → user types:
   "import github:qwibitai/nanoclaw/.claude/skills/add-discord at $0.02"
2. LLM calls import_skill → pending-write card → passkey approval
3. /u/test/chat → "use add-discord"
4. skill tool → pending-payment → passkey signs → payment → skill-result
```

**E2 — Settings panel (proves headless web API)**
```
1. /u/test/settings → Import skill form → ref + price → submit
2. /u/test/chat → "use add-discord" → pay → invoke
```

**E3 — SDK (proves programmatic)**
```ts
const c = new OneieClient({ apiKey: process.env.ONEIE_TOKEN })
await c.skills.import({ ref: 'github:.../add-discord', slug: 'test', price: 0.02 })
const out = await c.skills.use({ slug: 'test', name: 'add-discord' })  // pays via SDK wallet
```

**E4 — CLI (proves scriptable)**
```bash
oneie auth login                                    # one-time
oneie --json skill import github:qwibitai/nanoclaw/.claude/skills/add-discord \
  --slug test --price 0.02 --yes
oneie --json skill use add-discord --slug test      # future task — invoke via CLI
```

Capture for each: import latency ms, bytes, sha16, payment tx hash, settle ms, body bytes, signal emitted.

### F — Write receipt

Append a `## Receipt` section to **this file** (below) on close. One run per row in a table; multiple runs accumulate. Substrate also emits `ui:chat:claim` signals — the file is the human-readable record, the substrate is the machine-readable one.

Receipt row columns:
- date / run id
- import: ref, latency ms, bytes, content sha16
- price set (USD)
- payment: tx hash, amount, settlement ms
- skill body bytes delivered to LLM
- substrate signal emitted (yes/no, receiver)
- pass/fail per W4 verify list

---

## Verify (W4)

Pass conditions:
- [ ] `oneie skill validate /u/test/skills` → ok=true after import
- [ ] Chat surfaces `pending-payment` for the imported skill
- [ ] `verifyReceipt` returns `{verified:true}` with real tx
- [ ] Skill body reaches the LLM (visible in stream)
- [ ] Substrate emits `ui:chat:claim` with `{skill,amount,tx}`
- [ ] Receipt file exists with all 5 numeric lines populated

Fail conditions are diagnostics, not blockers — the parser already reports them.

---

## Risks

| Risk | Mitigation |
|---|---|
| x402 gateway unavailable in local dev | Mock `verifyReceipt` to return verified, mark receipt as "test mode" |
| Passkey wallet not provisioned on test slug | Use `web/src/lib/passkey.ts` provision flow first |
| Imported skill body too large (>5000 tok) | Cap or `references/` extraction (deferred — not blocking the receipt) |

---

## Rubric targets

- **security** ≥ 0.85 — x402 verifyReceipt is the trust boundary; no skip
- **stability** ≥ 0.85 — receipt must reproduce on second run
- **simplicity** ≥ 0.85 — total diff ≤200 LOC across 4 files
- **speed** ≥ 0.80 — full path under 5s end-to-end (excluding human pay-tap)

Gate: composite ≥ 0.65.

---

## See also

- `agent-spec.md` — spec the implementation must satisfy
- `web/src/pages/api/chat.ts` — chat tool registration
- `web/src/pages/api/skill/import.ts` — shared backend (new in C2)
- `web/src/lib/skill/{import,loader,parser}.ts` — parser + loader + lib
- `web/src/lib/x402.ts` — payment verification
- `sdk/src/client.ts` — `client.skills.import()` (D3)
- `cli/src/skill.ts` — `oneie skill import` (D4)

---

## Receipt

*Populated on close. Each run appends a row.*

| Run | Surface | Date | Import ref | Import ms / bytes / sha16 | Price | TX / amount / settle ms | Body bytes | Signal | W4 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| _(empty)_ | chat | | | | | | | | |
| _(empty)_ | settings | | | | | | | | |
| _(empty)_ | sdk | | | | | | | | |
| _(empty)_ | cli | | | | | | | | |

---

*Three gaps + one shared route. ~6.25 hours. Four import surfaces, one backend, four reproducible receipts — appended below. Spec → code → numbers.*
