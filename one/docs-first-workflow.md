# Documentation-First Workflow

**Shipped:** 2026-04-15 · **Status:** Live framework for all future TODOs

---

## What Changed

The `/do TODO-{name}` workflow now explicitly enforces:

1. **W2 (Decide) includes documentation planning** — call out which docs change before any code is written
2. **W3 (Edit) updates docs + code in parallel** — one Sonnet agent per code file, one per doc update
3. **W4 (Verify) validates doc consistency** — verify terminology, examples, cross-refs, metaphors, rubrics

**Result:** Documentation is no longer a post-implementation artifact. It's the specification that code implements.

---

## The Three Phases

### **Phase 1: Plan (W2)**

Before editing code, document what will change:

```markdown
## Documentation Updates (W2)

### New docs created
- `docs/feature.md` — {purpose and spec}

### Docs modified
- `docs/dictionary.md` — add term X, remove dead term Y
- `docs/routing.md` — update L{N} loop description
- `docs/rubrics.md` — add dimension {name}

### Schema changes
- TypeDB entities, D1 migrations, TypeQL functions
```

**Why:** Naming, API design, and lifecycle implications are decided here, before code. The plan IS the specification.

---

### **Phase 2: Execute (W3)**

Edit docs and code in parallel (same wave):

```
W3: Sonnet edit agents
  ├─ Agent 1: src/file1.ts → implement feature
  ├─ Agent 2: src/file2.ts → implement feature
  ├─ Agent 3: docs/dictionary.md → add new terms
  ├─ Agent 4: docs/feature.md → write feature spec
  └─ Agent 5: .claude/rules/feature.md → add rules
```

**Each code change gets a corresponding doc update.**

---

### **Phase 3: Verify (W4)**

Check that docs match code:

```
W4: Sonnet verification agents
  ├─ Consistency Agent: terminology, examples, cross-refs
  ├─ Metaphor Agent: 7-skin mappings still valid
  ├─ Rubric Agent: new dimensions scored fit/form/truth/taste
  └─ Main Agent: fold all reports, score cycle
```

**If docs are inconsistent with code, treat it as a W4 failure and loop back to W3.**

---

## Six Core Docs (Always in Scope)

These are the **source of truth**. Code implements them. Docs define them.

| Doc | What It Locks | Updated when |
|-----|---------------|--------------|
| **dictionary.md** | Canonical names, all terms, type definitions | Any naming/terminology change |
| **DSL.md** | Signal grammar, mark/warn/fade verbs, signal contract | Signal behavior changes |
| **one-ontology.md** | The 6 dimensions, actor/group/thing/path/signal/hypothesis | Type system changes |
| **routing.md** | L1-L7 loops, signal flow, priority formula, ask outcome | Loop/routing changes |
| **lifecycle.md** | Agent journey stages (Register → Harden), revenue flow | Lifecycle/economic changes |
| **rubrics.md** | Quality dimensions (fit/form/truth/taste), scoring rules | Rubric/quality changes |

---

## Integration with `/do`

The `/do TODO-{name}` command now:

1. **Loads source docs as context before W1** — you read them first
2. **Requires W2 to list doc updates** — explicit plan
3. **Spawns doc editors in W3** — parallel with code editors
4. **Validates docs in W4** — consistency check is part of cycle gate

---

## Retrospective: TODO-rich-messages

**What should have happened:**

```
W2 Decide: "We're adding RichMessage.payment type and reactions."
  → Document in W2:
    - dictionary.md: add "Rich Messages" section
    - rich-messages.md: add PaymentMetadata type, Payment flow
    - TODO-template.md: add "Documentation Updates" section (meta)

W3 Edit: In parallel, 5 Sonnet agents:
  - types.ts: add RichMessage.payment field
  - channels/index.ts: add thread_id routing
  - ChatMessage.tsx: add ReactionButtons component
  - dictionary.md: ✏️ update with new terms
  - rich-messages.md: ✏️ update with Payment section

W4 Verify: Check docs match code
  - RichMessage interface in types.ts matches dictionary.md definition ✓
  - Payment lifecycle described in rich-messages.md matches code ✓
```

**What actually happened:**

- Cycles 1-3 shipped and verified (code + tests)
- Documentation updated AFTER (this doc you're reading)
- Lesson learned: next TODO will follow the plan

**The framework is now in place.** The next TODO will be documentation-first.

---

## Hook System

Three hooks enforce the workflow:

### Hook 1: Pre-W2 — Load Source Docs

When `/do TODO-{name}` starts, auto-load:

```
dictionary.md, DSL.md, one-ontology.md, routing.md, lifecycle.md, rubrics.md
```

These are your spec. W1 reads code. W2 decides what docs change.

### Hook 2: Post-W3 — Flag Doc Edits

When W3 finishes editing, flag if any doc updates were mentioned in W2 but not executed:

```
W2 said: "update dictionary.md"
W3 executed: types.ts ✓, channels/index.ts ✓, ChatMessage.tsx ✓
W3 missing: dictionary.md ✗ → Flag for W3 re-loop
```

### Hook 3: W4 — Validate Consistency

After code is verified, run consistency checks:

```bash
# Terminology
grep -r "old-term" docs/ | flag if unexpected

# Examples
compare TypeScript in docs/examples/ with actual src/types.ts

# Cross-refs
markdown-link-check docs/*.md

# Metaphor (if touching signal/path)
grep "signal\|strength\|resistance" src/changed-files.txt → check metaphors.md

# Rubric (if adding dimensions)
W4 report mentions new dimension → ensure in rubrics.md
```

---

## For Future Implementers

When you run `/do TODO-{name}`:

1. **In W2, write the "Documentation Updates" section first.** Don't implement code until you've documented what will change.

2. **In W3, spawn doc editors alongside code editors.** One agent per file (code + doc).

3. **In W4, verify docs match code.** Treat doc inconsistency as a test failure.

4. **Update MEMORY with lessons learned.** Add to user memory: what naming decisions stuck, what metaphors held up, what was harder than expected.

---

## Files Changed

**Core framework:**
- ✅ `docs/TODO-template.md` — added "Documentation Updates (W2 + W4)" section
- ✅ `.claude/rules/documentation.md` — new hook system + workflow rules

**Rich Messages example:**
- ✅ `docs/rich-messages.md` — added PaymentMetadata, Payment flow section
- ✅ `docs/dictionary.md` — added "Rich Messages (Cycle 1-3 extension)" section
- ✅ `docs/TODO-rich-messages.md` — added "Documentation Updates" + retrospective

---

## Next Steps

1. **Apply to TODO-claw** (next TODO in queue) — document before implementing
2. **Add to /do skill** — mention doc requirement in command help
3. **Add to CI/CD** — markdown link check on every PR
4. **Build doc dashboard** — track which docs are up-to-date, which are stale

---

*Documentation is not a post-mortem. It's the specification that code implements. Write it first.*
