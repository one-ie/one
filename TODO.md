# TODO — Integrate moved docs into canonical structure

**Goal:** Make `aisdk.md`, `ai-elements.md`, `integrate.md`, `mcp.md` discoverable, consistent, and cross-referenced within the `one/` canonical docs.

**Out of scope:** `design.md` (stays paired with `.claude/rules/design.md`), `routing.md` (routing logic lives in `integrate.md` and `DSL.md`).

---

## W1 — Understand scope ✅

**Receipt:** files=4 | matches=3 (consistent) | cross_refs=2 (validate) | open_questions=1

### Findings:

**aisdk.md** — Vercel AI SDK spec (streamText ↔ useChat, tool() dispatch, generateObject). Layer 2 of 4. Dual-package (ai + @ai-sdk/react). Provider-agnostic. Consistent with `DSL.md` mark/warn semantics.

**ai-elements.md** — Install 48 React + shadcn components. UI-only for `web/`. Audience: frontend devs. Dependency for `mcp.md` (tools render via canonical `<Tool>` component). **Open:** missing substrate entity/relation mappings.

**integrate.md** — web ↔ claw composition patterns. Two modes (standalone vs. federated with one.ie). Owns health checks, env-var seams, stages 1–5. References mark/warn/highways correctly.

**mcp.md** — MCP server consumption in claw. Turns integrations (Slack, Gmail, GitHub) into runtime tools via `MCP_SERVERS` env. ~50 lines wiring. Consistent with `DSL.md` signal dispatch.

### Cross-ref validation:
- ✅ vs. `dictionary.md`: No conflicts (four docs are *above* substrate level)
- ✅ vs. `DSL.md`: Consistent semantics (mark/warn closes loop, highways routing)
- ⚠️ vs. `one-ontology.md`: ai-elements.md missing entity/relation mappings
- ✅ vs. `.claude/rules/design.md`: design.md stays out of scope; enforcement solid

---

## W2 — Plan integration

**One decision:**

### **ai-elements.md scope** ⚠️
- **Q:** Should it live in `one/` (canonical docs) or `web/README.md` (package-level)?
- **Context:** Deeply specific to web build (48 components, shadcn, Astro). No other package uses it. But `mcp.md` depends on it (tools render via canonical `<Tool>`).
- **Options:**
  - **Keep in `one/`** — make it a canonical surface-layer spec; add substrate entity/relation mappings
  - **Move to `web/README.md`** — if it's internal to web only

**Decided out of scope:**
- `design.md` stays paired with `.claude/rules/design.md` (spec + enforcement)
- `routing.md` stays absent; routing logic lives in `integrate.md` + `DSL.md`

Then:
- [ ] Decide on `ai-elements.md` placement
- [ ] Plan cross-references for 4 docs (aisdk, ai-elements, integrate, mcp)
- [ ] Plan root `CLAUDE.md` updates if needed

---

## W3 — Integrate & reconcile

**After W2 decision on ai-elements.md:**

- [ ] **aisdk.md:** Add cross-references to:
  - Link to `DSL.md` for mark/warn/fade semantics
  - Cite `.claude/rules/engine.md` for loop closing
  
- [ ] **mcp.md:** Add cross-references to:
  - Link to agents pattern (if canonical agents doc exists)
  - Cite `DSL.md` for signal/tool dispatch
  
- [ ] **integrate.md:** Add/clarify:
  - Cite `DSL.md` for mark/warn/highway routing (already consistent)
  - Clarify health-check loop stage ownership
  
- [ ] **ai-elements.md:** (depends on W2 decision)
  - If stays in `one/`: add substrate entity/relation mappings (how `<Message>` queries `event:signal`, renders rich parts)
  - If moves to `web/README.md`: remove from `one/` index, keep `mcp.md` reference
  
- [ ] Update `one/MEMORY.md` index with final placements
- [ ] Update root `/Users/toc/Server/CLAUDE.md` quick links if needed
- [ ] grep root `*.md` for paths referencing old locations; update to `one/`

---

## W4 — Verify consistency

- [ ] **Cross-reference audit:**
  ```bash
  grep -r "aisdk\|ai-elements\|integrate\.md\|mcp\.md" . \
    --exclude-dir=.git --exclude-dir=node_modules --exclude="*.bun.lock" \
    | grep -v "TODO.md" | grep -v ".git"
  ```
  - [ ] All backlinks present (canonical docs cite the 4 docs)
  - [ ] No circular references
  - [ ] design.md and routing.md not referenced from integration scope

- [ ] **DSL.md parity check:**
  - [ ] `aisdk.md` line 130 (mark/warn semantics) matches `DSL.md`
  - [ ] `integrate.md` mark/warn/highways references are accurate
  - [ ] `mcp.md` signal dispatch aligns with `DSL.md` flow

- [ ] **ai-elements.md mapping** (if staying in `one/`):
  - [ ] Add substrate entity/relation mappings
  - [ ] E.g., `<Message>` → queries `event:signal`, renders rich parts

- [ ] **Code examples:** Spot-check one example per file
  - [ ] `aisdk.md` tool() definition vs. `claw/src/` actual
  - [ ] `integrate.md` env-var seam vs. `.env.example`
  - [ ] `mcp.md` wiring vs. `src/mcp.ts`

- [ ] **Rubric gate:**
  - **Fit (0.92+):** Each doc solves stated scope; ai-elements decision made
  - **Form (0.85+):** All links valid; no 404s; consistent style
  - **Truth (0.90+):** Code examples match implementation
  - **Taste (0.80+):** Consistent with canonical docs (terminology, tone, structure)

---

## Exit & pheromone

**Expected outcome:** 4 docs + 1 decision = 1 integrated doc cluster

Close with:
- [ ] Commit: `docs: integrate 4 surface docs into canonical structure`
- [ ] Update `.md` files with cross-ref anchors
- [ ] Update `one/MEMORY.md` if building a canonical index

**Final numbers:**
- Docs integrated: 4 (aisdk, ai-elements, integrate, mcp)
- Decision made: 1 (ai-elements: stay in `one/` or move to `web/README.md`)
- New cross-refs added: 2–4 (DSL.md citations, entity mappings)
- Rubric target: fit≥0.92, form≥0.85, truth≥0.90, taste≥0.80
