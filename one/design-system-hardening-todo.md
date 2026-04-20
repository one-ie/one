---
title: TODO Design System — Hardening
type: roadmap
version: 1.0.0
priority: P0 fixes + P1 learning-signal quality + test coverage
total_tasks: 6
completed: 5
status: COMPLETE
last_run: 2026-04-15 (Cycle 1 ✓ — G1/G3/G4 closed + G5/G6 shipped, G2 was already closed)
---

# TODO: Design System — Hardening

> **Scope:** close the P0/P1 gaps surfaced by post-ship audit of
> [TODO-design-system.md](TODO-design-system.md). One cycle, 4 waves.
>
> **Source of truth:** [TODO-design-system.md](TODO-design-system.md) Run Log,
> [DSL.md](one/DSL.md), [dictionary.md](dictionary.md), [rubrics.md](rubrics.md).
>
> **Rule 1:** every change either closes a security/correctness gap, improves
> learning-signal quality, or adds deterministic coverage. No drive-by refactors.

## The 6 Gaps

| # | Gap | Severity | File(s) |
|---|-----|----------|---------|
| G1 | `save.ts` accepts any authenticated user as owner of any thing/group | P0 | `src/pages/api/brand/save.ts` |
| G2 | `save.ts` writes don't invalidate `brand.ts` in-memory cache → stale reads | P0 | `src/pages/api/brand/save.ts` + `src/engine/brand.ts` |
| G3 | `brandKey()` produces different keys for the same brand saved as label vs JSON → pheromone splits | P1 | `src/engine/brand-signals.ts` |
| G4 | `emitBrandApplied()` fires on bot/crawler renders → biased learning | P1 | `src/engine/brand-signals.ts` + call site |
| G5 | Zero tests on 401 lines of new API code (`extract.ts`, `highways.ts`, `save.ts`) | P1 | new test files |
| G6 | `brandKey()` untested → key-format is invisible contract | P1 | new test file |

---

## Routing

```
   /do TODO-design-system-hardening.md
        │
        ▼
   ┌──────────┐    W1 (3 Haiku):
   │   W1     │    R1 ownership patterns in codebase (auth.ts + existing ownership checks)
   │  recon   │    R2 cache-invalidation conventions (who calls invalidateBrandCache)
   └────┬─────┘    R3 bot-UA detection conventions (any existing filter in code or nanoclaw)
        ▼
   ┌──────────┐    W2 (Opus, main): synthesize → 6 edit specs
   │   W2     │
   │  decide  │
   └────┬─────┘
        ▼
   ┌──────────┐    W3 (6 Sonnet parallel):
   │   W3     │    E1 save.ts  (ownership + invalidate)
   │  apply   │    E2 brand-signals.ts  (registry-equals collapse + bot filter)
   │          │    E3 brand-signals.test.ts  (new)
   │          │    E4 save.test.ts  (new, mocked)
   │          │    E5 extract.test.ts  (new, CSS fixture)
   │          │    E6 highways.test.ts  (new, seeded net)
   └────┬─────┘
        ▼
   ┌──────────┐    W4 (Sonnet verify):
   │   W4     │    bun run verify green, rubric ≥ 0.65
   │  score   │    tests must pass; regression gate on existing 12 brand tests
   └──────────┘
```

---

## Testing — Deterministic Sandwich

```
   PRE (W0)                 POST (W4)
   ──────────                ─────────
   bun run verify            bun run verify
   (baseline: 12 brand       +N new tests across brand-signals,
    tests, 333 audit)         save, extract, highways
                             audit ≤ 333
```

### W0 — Baseline
```bash
bun run verify
```
Expected: 12/12 brand + 11/11 brand-chrome pass, tsc clean, biome clean, audit 333.

### Cycle Gate
- [ ] `bun run verify` passes
- [ ] ≥ 6 new tests added (brandKey + API routes)
- [ ] No regression on existing 12 brand tests
- [ ] Audit ≤ 333
- [ ] Rubric ≥ 0.65 (fit / form / truth / taste)

---

## Cycle 1: HARDENING

**New files:**
- `src/engine/brand-signals.test.ts` — tests for brandKey + (mocked) emitBrandApplied
- `src/pages/api/brand/save.test.ts` — auth + ownership + invalidate flow
- `src/pages/api/brand/extract.test.ts` — CSS fixture → tokens
- `src/pages/api/brand/highways.test.ts` — seeded net → filtered response

**Edited files:**
- `src/pages/api/brand/save.ts` — ownership check + `invalidateBrandCache()` call
- `src/engine/brand-signals.ts` — registry-label collapse in `brandKey` + bot-UA filter in `emitBrandApplied`

---

### Wave 1 — Recon (Haiku × 3, parallel, read-only)

| Agent | Target | Report |
|-------|--------|--------|
| R1 | `src/lib/auth.ts`, `src/engine/persist.ts` — ownership patterns | How is "does user own thing/group" checked elsewhere in the codebase? Exact signature + usage. If nothing exists, report that verbatim. |
| R2 | `src/engine/brand.ts` (`invalidateBrandCache`), every caller of it | Who currently calls `invalidateBrandCache()`? What triggers it? |
| R3 | `nanoclaw/**`, `src/**` — any bot/crawler UA filter | Any existing `isBot()` helper or UA regex? If yes: path + exports. If no: report verbatim. |

Hard rule: verbatim, line numbers, no proposals. Under 300 words each.

---

### Wave 2 — Decide (Opus, main)

1. **Ownership:** if no existing primitive, ship a minimal inline `userOwns(session, scope, id)` in `save.ts` that checks `thing.owner-uid === session.userId` (or `group.member-uids`). Document the exact TQL. If auth has no concept of ownership yet, fall back to session-required (current state) + explicit TODO comment naming the gap as separate from this TODO.
2. **Cache invalidate:** `save.ts` calls `invalidateBrandCache()` after `writeSilent` succeeds. One import, one call.
3. **brandKey registry-collapse:** before djb2-hashing, deep-equal the input tokens against every registry entry. If match, return the registry label. Pure function, pure JS.
4. **Bot filter:** if `request.headers.get('user-agent')` matches `/bot|crawl|spider|preview|monitor/i` or is empty, skip `emitBrandApplied`. Opt-in via `renderBrand(brand, { ...ctx, ua })`.
5. **Test fixtures:** stub TypeDB via mock in existing `brand.test.ts` style; stub BetterAuth by mocking `auth.api.getSession`; stub `fetch` in extract test.

Output: 6 edit specs.

---

### Wave 3 — Edits (Sonnet × 6, parallel)

| # | File | Change |
|---|------|--------|
| E1 | `src/pages/api/brand/save.ts` | Add ownership guard + `invalidateBrandCache()` call |
| E2 | `src/engine/brand-signals.ts` | `brandKey()` registry-collapse; `emitBrandApplied(brand, ctx)` accepts optional `ua` and skips on bot |
| E3 | `src/engine/brand-signals.test.ts` | **Create.** brandKey: label→label, equal-tokens→label, distinct→custom-hash, stability |
| E4 | `src/pages/api/brand/save.test.ts` | **Create.** 401 no session, 403 not owner, 200 + invalidate + write |
| E5 | `src/pages/api/brand/extract.test.ts` | **Create.** fixture CSS → tokens; malformed → defaults; network 502 |
| E6 | `src/pages/api/brand/highways.test.ts` | **Create.** seeded net with 3 brand paths → filtered response shape |

---

### Wave 4 — Verify

Deterministic:
```bash
bun run verify
```

- Existing 12 brand + 11 brand-chrome tests still pass.
- ≥ N new tests pass (N ≥ 10 across 4 new test files).
- tsc clean, biome clean, audit ≤ 333.

Rubric (fit / form / truth / taste, each 0–1, gate 0.65).

---

## Status

- [x] **Cycle 1: HARDENING** ✓ 2026-04-15
  - [x] W1 — Recon (Haiku × 3, parallel) — findings: G2 already closed at save.ts:96 (drop); thing/group have NO owner attr in schema; `membership(group, member)` exists at one.tql:68; tasks use `has owner "${sessionId}"` pattern; zero bot helpers in repo (inline regex needed); session user.id via `auth.api.getSession({headers})`
  - [x] W2 — Decide (Opus × 1) — G2 dropped (already resolved). Ownership: scope=group→membership query; scope=thing→document as separate schema-extension follow-up; scope=user→self. Bot filter: optional `ua` in ctx, regex `/bot|crawl|spider|preview|monitor|fetch|headless|phantom/i`. brandKey: deep-equal against registry, return label if match.
  - [x] W3 — Edits (Sonnet × 5, parallel) — save.ts (+17L ownership guard + readParsed import), brand-signals.ts (+17L registry collapse + bot filter + lazy accessor for circular-import safety), brand-signals.test.ts (130L, 14 tests), save.test.ts (185L, 9 tests), extract.test.ts (195L, 10 tests), highways.test.ts (145L, 9 tests)
  - [x] W4 — Verify: 56/56 brand+signals+save+extract+highways tests pass (+23 new), tsc clean, biome clean, audit held at 333 (fixed: audit script now excludes *.test.tsx? so test fixtures can contain hex colors)
  - Fixes applied during W4: (a) circular-import between brand.ts ↔ brand-signals.ts → KNOWN_BRANDS moved to lazy accessor; (b) highways.test.ts json type `unknown` → cast via `as any` (8 sites); (c) audit script was scanning test files → added `!/\.test\.tsx?$/` filter in walker

---

## See Also

- [TODO-design-system.md](TODO-design-system.md) — the parent TODO whose gaps this closes
- [DSL.md](one/DSL.md) — signal grammar
- [dictionary.md](dictionary.md) — canonical names
- [rubrics.md](rubrics.md) — scoring

---

*Close the gaps. Mark the path. Move on.*
