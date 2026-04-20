# Documentation Rules

Apply to all TODOs and `/do` workflows.

**Principle:** Document BEFORE implementation (W2), edit alongside code (W3), verify consistency (W4).

---

## The Three Phases

### **W2 — Planning Phase: Document the Plan**

Before any code is written, explicitly list which docs will change:

```markdown
### Documentation Updates (W2)

**New docs:**
- `docs/feature.md` — {purpose}

**Docs modified:**
- `docs/dictionary.md` — add term {name}
- `docs/routing.md` — update loop L{N}
- `docs/rubrics.md` — add dimension {name}

**Schema changes:**
- New TypeDB entities, D1 migrations, TypeQL functions
```

**Why:** Naming decisions, API design, and lifecycle implications must be documented before code is written. The docs ARE the spec.

---

### **W3 — Edit Phase: Update Docs + Code in Parallel**

**For every code file edited, edit the corresponding doc:**

| Code File | Related Doc |
|-----------|-------------|
| `nanoclaw/src/types.ts` | `docs/dictionary.md` — add new type terms |
| `src/engine/world.ts` | `docs/DSL.md` — update signal grammar |
| `src/engine/loop.ts` | `docs/routing.md` — update L1-L7 loops |
| `src/pages/api/*.ts` | `docs/lifecycle.md` — update lifecycle stage |
| `src/schema/*.tql` | `docs/one-ontology.md` — update dimension/entity |
| Feature-specific file | `docs/feature.md` — update feature spec |

**Pattern:** If you're adding a new field to a TypeScript interface, add it to the doc that defines that interface. If you're changing a loop, update the loop diagram in the doc.

---

### **W4 — Verify Phase: Check Docs Match Code**

**Docs consistency checklist:**

1. **Terminology** — All renamed concepts updated everywhere
   ```bash
   grep -r "old-name" docs/ -- ignore new-name where intentional (dead names)
   ```

2. **Examples** — Code examples in docs match actual implementation
   ```
   - TypeScript interfaces in examples match src/types.ts
   - TypeQL in examples match src/schema/*.tql
   - Function signatures match actual exports
   ```

3. **Cross-references** — Links don't 404
   ```
   - [dictionary.md](dictionary.md) exists and links back to source
   - Code file references match real paths (no moved files)
   ```

4. **Metaphor consistency** — 7-skin mappings still valid
   ```
   - Ant: pheromone/strength/resistance → brain: synapse/weight
   - Team: signal/mark → org: decision/approval
   - Check metaphors.md if touching path/signal semantics
   ```

5. **Rubric dimensions** — New quality scoring documented
   ```
   - If W4 adds a rubric dimension (e.g., "documentation"), it goes in rubrics.md
   - Scoring rules and edge cases documented
   ```

---

## Which Docs Are Always in Scope

These six docs are the **source of truth** and must stay in sync with code:

| Doc | Locks | Update when |
|-----|-------|-------------|
| **dictionary.md** | Canonical names, types, entities | Any naming change |
| **DSL.md** | Signal grammar, mark/warn/fade verbs | Signal behavior changes |
| **one-ontology.md** | 6 dimensions, actor/group/thing/path/signal/hypothesis | Type system changes |
| **routing.md** | L1-L7 loops, signal flow, priority formula | Loop/routing changes |
| **lifecycle.md** | Agent journey stages, revenue flow | Lifecycle/economic changes |
| **rubrics.md** | Quality dimensions (fit/form/truth/taste) and scoring | Rubric changes or new dimensions |

**Feature-specific docs** (rich-messages.md, webhooks.md, etc.) are updated per feature. Always link back to the six core docs.

---

## The Workflow Integration

### Hook: Pre-W2 — Load Source Docs

When a TODO is created, auto-load relevant source docs:

```
/do TODO-{name}.md
├─ [Hook] Load: dictionary.md, DSL.md, rubrics.md
├─ [W1] Recon code (reads files)
├─ [W2] Decide code + **document changes needed in docs**
│       (explicit list: what terms change, what loops change, what's new)
├─ [W3] Edit code (spawns Sonnet agents)
│       + [Hook] Suggest: "Also edit X doc for {Y change}"
└─ [W4] Verify code + **verify docs match** (cross-check task)
```

### Hook: Post-W4 — Validate Doc Consistency

After W4 completes, auto-run consistency checks:

```bash
# Terminology consistency
grep -r "old-term" docs/ | flag if > 0 (not on deadname list)

# Cross-references
markdown-link-check docs/*.md

# Metaphor alignment (if touching signal/path semantics)
grep -l "signal\|strength\|resistance" src/changed-files.txt | xargs -I {} \
  check if metaphors.md still applies

# Rubric scoring (if W4 added dimensions)
grep "rubric\|dimension" src/changed-files.txt | flag for rubrics.md review
```

---

## Example: TODO-rich-messages (Retrospective)

**What should have happened (W2):**

```markdown
### Documentation Updates (W2)

**New docs:**
- None (extends existing types)

**Docs modified:**
- `docs/dictionary.md` — add "Rich Messages" section, explain `data.rich` convention
- `docs/rich-messages.md` — add PaymentMetadata type, Payment flow section
- `docs/TODO-template.md` — add "Documentation Updates (W2 + W4)" section

**Schema changes:**
- `nanoclaw/src/types.ts` — RichMessage.thread, RichMessage.payment added (Cycle 1 & 3)
- `migrations/0010_payment_columns.sql` — new D1 columns for payment tracking
```

**What actually happened:**

- ✅ Docs updated (rich-messages.md, dictionary.md, TODO-template.md) — **AFTER W4**
- ⚠️ Should have been planned in W2, preventing surprises in W3

**Lesson:** Next TODO follows: document in W2, edit in W3, verify in W4. No surprises.

---

## Rules for `/do` (The Command)

When running `/do TODO-{name}.md`, the workflow enforces:

1. **W2 must explicitly call out doc changes** — no surprise doc edits in W3
2. **W3 spawns edit agents for both code AND docs** — parallel edits
3. **W4 includes doc consistency check** — not just code tests
4. **Every rubric score (fit/form/truth/taste) applies to docs too** — documentation quality matters

---

*Documentation is not a post-mortem. It's the blueprint. Build it first. Verify it matches.*

---

## Loop Close

Every wave and cycle close triggers a propagate step — see [loop-close.md](../docs/loop-close.md).

**When to propagate to which doc:**

| Target | Update when |
|--------|-------------|
| Source-of-truth doc | always — even if only touch-verified |
| `CLAUDE.md` root | 6 dimensions, L1-L8, or locked rules changed |
| Nested `CLAUDE.md` | directory contract changed |
| `README.md` | public surface changed (CLI verbs, API routes, SDK exports) |
| Feature doc | always if one exists |

**Learnings entry** (append to `docs/learnings.md` on each close):

```
- YYYY-MM-DD · cycle N · wave N|gate · {one sentence} · rubric=0.NN · source=w1|w2|w3|w4|cycle
```

W4 rubric applies to docs too: fit (solves stated problem), form (clean, no dead links), truth (accurate), taste (consistent style).
