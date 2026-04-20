---
title: TODO Memory C4 — Governance, Federation, Lifecycle
type: roadmap
version: 1.0.0
priority: Role Gates → Federation → GC Policy → Economics
total_tasks: 16
completed: 16
status: DONE (2026-04-18)
---

## Status

**Cycle 4: GOVERNANCE + FEDERATION + LIFECYCLE** — ✅ COMPLETE

W0 baseline ✅ | W1 recon ✅ | W2 decide ✅ | W3 edit ✅ | W4 verify ✅

---

## Routing

```
    signal DOWN                       result UP
    ──────────                        ─────────
    /do TODO-memory-c4.md             rubric marks on memory paths
         │                                 │
         ▼                                 │
    ┌─────────┐                            │
    │ C4 W1-4 │  gates: roleCheck()        │ mark(memory:c4, score)
    │ GOVERN  │  reveal/forget/frontier    │
    └────┬────┘  ACL enforcement           │
         ▼                                 │
    ┌─────────┐                            │
    │ C4 W1-4 │  federation + lifecycle    │ mark(memory:c4, score)
    │ EXTEND  │  policy + economics        │
    └─────────┘                            │
```

**Upstream dependency:** TODO-memory C3W4 DONE ✅

---

## Testing — Deterministic Sandwich

```
PRE  (W0)                        POST (W4)
─────────                        ─────────
bun run verify                   bun run verify + gate tests
  ├── biome check .                ├── biome check .
  ├── tsc --noEmit                 ├── tsc --noEmit
  ├── vitest run                   ├── vitest run
  └── routes live (smoke)          └── auth gates verified
                                   └── federation chain calls ok
```

---

## Cycle 4: GOVERNANCE + EXTEND

### W1 — Recon (Haiku, fan out ≥ 4)

| id | task | target |
|----|------|--------|
| R1 | Read `src/lib/api-auth.ts` | getRoleForUser, roleCheck signatures |
| R2 | Read `src/lib/role-check.ts` | ROLE_PERMISSIONS matrix (locked 2026-04-18) |
| R3 | Read `src/pages/api/memory/*.ts` | three routes — where to inject gates |
| R4 | Read `src/engine/federation.ts` | how worlds federate; memory scope implications |

### W2 — Decide (Opus)

- **D1** — gate spec: POST /api/memory/forget/:uid requires `role >= 'operator'` and `action = 'delete-memory'`; GET /api/memory/reveal/:uid allows `read-memory` (chairman+board+ceo+operator); GET /api/memory/frontier/:uid allows `discover` (any user).
- **D2** — federation spec: `net.recall(match, {federated: true})` queries cross-world memories with scope filtering (only public + shared-group scope visible to other worlds).
- **D3** — lifecycle spec: `recall()` has implicit GC — cap at 100 results (C3), add optional `retention: 'observed' | 'asserted' | 'all'` filter (default 'all').

### W3 — Edit (Sonnet, one per file)

| id | task | file | exit |
|----|------|------|------|
| E1 | Add roleCheck gates to reveal | `src/pages/api/memory/reveal/[uid].ts` | checks `read-memory` permission |
| E2 | Add roleCheck gates to forget | `src/pages/api/memory/forget/[uid].ts` | checks `delete-memory` + `operator+` role |
| E3 | Add roleCheck gates to frontier | `src/pages/api/memory/frontier/[uid].ts` | checks `discover` permission |
| E4 | Add scope filtering to recall | `src/engine/persist.ts` | public + group signals only when federated |
| E5 | Wire federation recall bridge | `src/engine/federation.ts` | cross-world memory queries via federation unit |
| E6 | Tests: role gates + federation | `src/pages/api/memory/*.test.ts` | 403 on denied, 200 on allowed, cross-world scope filtering |

### W4 — Verify (Sonnet, fan out ≥ 2)

- **V1** — unit tests: roleCheck('operator', 'delete-memory') returns true, roleCheck('user', 'delete-memory') returns false, scope filters work.
- **V2** — e2e: user (no role) → POST /api/memory/forget → 403; operator → DELETE → 204; cross-org recall filters public only.
- Rubric targets: fit ≥ 0.85, form ≥ 0.85, truth ≥ 0.90, taste ≥ 0.85

**Exit gate:** POST /api/memory/forget/{uid} rejects unauthorized with 403; CEO can delete, user cannot.

---

## Deferred (Phase 2+)

**Federation at scale** — memory sync across 100+ federated worlds requires async replication strategy (not C4). Document in federation-memory.md, defer to Phase 2.

**Lifecycle GC automation** — automated retention policy (delete observed >1y, asserted >30d). For now: manual cap at 100 results, policy documented. Implement in Phase 2.

**Economics integration** — memory operations (reveal, recall, forget) should deposit pheromone into L4 pricing loop. Define in revenue.md, implement when L4 pricing ships. For now: memory is free for operators.

---

## Task Metadata

```typeql
insert $t isa task,
  has task-id "memory:c4:E1",
  has task-name "add roleCheck to reveal",
  has task-wave "W3",
  has task-context "memory.md#governance",
  has value 7,
  has effort 2,
  has phase "governance",
  has persona "sonnet",
  has tag "memory", has tag "auth", has tag "P1",
  has exit "GET /api/memory/reveal/:uid checks read-memory role";
```

---

## Rubric Scoring (W4 markDims)

| Dim | What | Target |
|-----|------|--------|
| fit | gates on right endpoints, scope filtering correct | ≥ 0.85 |
| form | no duplication in auth checks, follows api-auth.ts pattern | ≥ 0.85 |
| truth | 403 on denied, federation scope tested | ≥ 0.90 |
| taste | zero surprise — governance feels inevitable | ≥ 0.85 |

---

## See Also

- [memory.md](memory.md) — design spec
- [TODO-memory.md](TODO-memory.md) — C1-C3 (DONE)
- [TODO-chat-memory.md](TODO-chat-memory.md) — parallel C3-C4 work
- [docs/TODO-governance.md](TODO-governance.md) — governance schema (locked)
- `src/lib/role-check.ts` · `src/lib/api-auth.ts` · `src/engine/federation.ts`

---

*Governance gates. Federate scope. Defer scale. Verify every path.*
