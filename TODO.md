# TODO — Integrate moved docs into canonical structure

**Goal:** Make `ai-elements.md`, `aisdk.md`, `design.md`, `integrate.md`, `mcp.md` discoverable, consistent, and cross-referenced within the `one/` canonical docs.

---

## W1 — Understand scope ✅

**Receipt:** files=5 | matches=3 (consistent) | cross_refs=2 (validate) | open_questions=3

### Findings:

**ai-elements.md** — Install 48 React + shadcn components. UI-only for `web/`. Audience: frontend devs. Dependency for `mcp.md` (tools render via canonical `<Tool>` component).

**aisdk.md** — Vercel AI SDK spec (streamText ↔ useChat, tool() dispatch, generateObject). Layer 2 of 4. Dual-package (ai + @ai-sdk/react). Provider-agnostic.

**design.md** — Not a design doc; a **design system spec**. 6 tokens (bg, fg, font, primary, secondary, tertiary), 3 depth levels (L0/L1/L2), component patterns. CSS-only for `web/`.

**integrate.md** — web ↔ claw composition patterns. Two modes (standalone vs. federated with one.ie). Owns health checks, env-var seams, stages 1–5.

**mcp.md** — MCP server consumption in claw. Turns integrations (Slack, Gmail, GitHub) into runtime tools via `MCP_SERVERS` env. ~50 lines wiring.

### Cross-ref validation:
- ✅ vs. `dictionary.md`: No conflicts (five docs are *above* substrate level, don't use vocabulary)
- ⚠️ vs. `DSL.md`: Consistent semantics (mark/warn closes loop), but no citations — W4 validates
- ⚠️ vs. `one-ontology.md`: ai-elements.md missing entity/relation mapping to substrate
- ✅ vs. `.claude/rules/design.md`: Paired correctly (spec + enforcement)

---

## W2 — Plan integration

**Three critical decisions:**

### 1. **ai-elements.md scope** ⚠️
   - **Q:** Should it live in `one/` (canonical docs) or `web/` (package-level README)?
   - **Context:** Deeply specific to web build (48 components, shadcn, Astro). No other package uses it.
   - **Options:**
     - **Keep in `one/`** — if canonical docs should include all surface-layer component specs
     - **Move to `web/README.md`** — if it's internal to the web package only

### 2. **design.md location & scope** ⚠️
   - **Q:** Is it a **product spec** (belongs in root `/Users/toc/Server/`) or **implementation guide** (stays in `one/`)?
   - **Context:** Reads like a system specification (design tokens, depth model, patterns). Lives alongside root `simple.md`, `website.md`. But currently in `one/`.
   - **Current rules:** Root `*.md` = spec. `one.ie/` = product code. `one-ie/one/` = SDK/opensource.
   - **Options:**
     - **Move to root** — if it's a foundational product spec that shapes all surfaces
     - **Keep in `one/`** — if it's implementation-specific to the web build

### 3. **routing.md missing** ⚠️
   - **Q:** Should a `routing.md` doc exist for L1-L7 loops, or is loop logic already owned by `integrate.md`?
   - **Context:** `integrate.md` references health checks (Stages 1–5), but no doc owns L1-L7 loop definitions. `.claude/CLAUDE.md` slot map lists `routing.md` as needed.
   - **Options:**
     - **Create `routing.md`** — specify L1-L7 explicitly (health checks, signal flow, priority formula)
     - **Fold into `integrate.md` §3** — extend integrate.md to own loop lifecycle
     - **Fold into `DSL.md`** — if loops belong with signal grammar

Then:
- [ ] Plan cross-references (which canonical docs link to which moved docs)
- [ ] Plan root `CLAUDE.md` updates to reflect new locations
- [ ] Decide on `ai-elements.md`, `design.md`, `routing.md` above

---

## W3 — Integrate & reconcile

**After W2 decisions:**

- [ ] **aisdk.md:** Add cross-references to:
  - Link to `DSL.md` for mark/warn/fade semantics
  - Cite `.claude/rules/engine.md` for loop closing
  - Back-ref from `one-ontology.md` if it covers LLM layer
  
- [ ] **mcp.md:** Add cross-references to:
  - Link to agents doc (if one exists) for MCP tool pattern
  - Cite `DSL.md` for signal/tool dispatch
  
- [ ] **integrate.md:** Add/clarify:
  - Link to `routing.md` (or `DSL.md` if routing folds there) for L1-L7
  - Cite health-check loop definition
  
- [ ] **design.md:** (depends on W2 decision)
  - If stays in `one/`: add link back to root design spec (if separate)
  - If moves to root: remove from `one/` index
  
- [ ] **ai-elements.md:** (depends on W2 decision)
  - If stays: add substrate entity/relation mappings (how `<Message>` queries `event:signal`, etc.)
  - If moves to `web/README.md`: remove from `one/` index
  
- [ ] Update `one/MEMORY.md` index with final placements
- [ ] Update root `/Users/toc/Server/CLAUDE.md` "Quick links" if any moved to product-spec layer
- [ ] grep root `*.md` for old paths and update references

---

## W4 — Verify consistency

- [ ] **Cross-reference audit:**
  ```bash
  grep -r "aisdk\|ai-elements\|design\.md\|integrate\.md\|mcp\.md" . \
    --exclude-dir=.git --exclude-dir=node_modules --exclude="*.bun.lock" \
    | grep -v "TODO.md" | grep -v ".git"
  ```
  - [ ] All backlinks present (canonical docs cite the new docs)
  - [ ] No circular references

- [ ] **DSL.md parity check:**
  - [ ] `aisdk.md` line 130 (`mark` on success, `warn` on failure) matches `DSL.md` semantics
  - [ ] `integrate.md` references to mark/warn/highways are accurate

- [ ] **ai-elements.md entity mapping** (if staying in `one/`):
  - [ ] Document which substrate entities each component queries/emits
  - [ ] E.g., `<Message>` → queries `event:signal`, renders rich parts

- [ ] **design.md enforcement:**
  - [ ] `.claude/rules/design.md` hook still active (post-tool-use check for banned patterns)
  - [ ] No CSS drift between spec and enforcement

- [ ] **Code examples:** Spot-check one example per file matches actual implementation
  - [ ] `aisdk.md` tool() definition matches `claw/src/` actual
  - [ ] `integrate.md` env-var seam matches `.env.example` or docs
  - [ ] `mcp.md` wiring matches `src/mcp.ts`

- [ ] **Rubric gate:**
  - **Fit (0.92+):** Each doc solves its stated scope; no orphans
  - **Form (0.85+):** All links valid; no dead refs; consistent style
  - **Truth (0.90+):** Code examples match actual implementation
  - **Taste (0.80+):** Consistent with other canonical docs (terminology, tone, structure)

---

## Exit & pheromone

**Expected outcome:** 5 docs + 3 decisions = 1 integrated doc cluster

Close with:
- [ ] Commit with message: `docs: integrate {x} docs into canonical structure — {decisions resolved}`
- [ ] Update `.md` files with final cross-ref anchors
- [ ] Update root `CLAUDE.md` if `design.md` or others moved
- [ ] Add entry to `one/MEMORY.md` (if building a docs index)

**Final numbers:**
- Docs consolidated: 5 (aisdk, ai-elements, design, integrate, mcp)
- Decisions made: 3 (ai-elements scope, design.md location, routing.md ownership)
- New cross-refs added: 3–5 (depends on decisions)
- Rubric target: fit≥0.92, form≥0.85, truth≥0.90, taste≥0.80
