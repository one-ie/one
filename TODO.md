# TODO — Integrate moved docs into canonical structure

**Goal:** Make `ai-elements.md`, `aisdk.md`, `design.md`, `integrate.md`, `mcp.md` discoverable, consistent, and cross-referenced within the `one/` canonical docs.

---

## W1 — Understand scope

- [ ] Read each file:
  - `one/ai-elements.md` — what's its purpose and audience?
  - `one/aisdk.md` — what does it define?
  - `one/design.md` — design system or design doc?
  - `one/integrate.md` — what patterns does it cover?
  - `one/mcp.md` — MCP server / tool definitions?
- [ ] Check current canonical docs (`dictionary.md`, `DSL.md`, `one-ontology.md`, `routing.md`, `lifecycle.md`, `rubrics.md`) for overlaps or gaps
- [ ] List which root `*.md` files still reference the old locations (in `/Users/toc/Server/`)

---

## W2 — Plan integration

- [ ] Decide: is each file a **new canonical doc** or an **extension** of an existing one?
  - `ai-elements.md` → new? or part of `one-ontology.md`?
  - `aisdk.md` → new SDK reference? or part of existing docs?
  - `design.md` → new design doc? or replaces something?
  - `integrate.md` → new integration patterns? or part of `routing.md` or `DSL.md`?
  - `mcp.md` → new MCP reference? or belongs in agents doc?
- [ ] Plan cross-references (which canonical docs link to which moved docs)
- [ ] Plan root `CLAUDE.md` updates to reflect new locations

---

## W3 — Integrate & reconcile

- [ ] Update `one/MEMORY.md` index to list new docs (if they're part of the canonical set)
- [ ] Add backlinks: each new doc should link to related canonical docs
- [ ] Update root `/Users/toc/Server/CLAUDE.md` "Quick links" table if docs are surface-critical
- [ ] Update any hardcoded paths in:
  - Root `CLAUDE.md` references
  - `.claude/` rules or commands that cite these files
  - `web/` or `claw/` code comments that reference them
- [ ] Reconcile terminology:
  - grep each file for terms that should be in `dictionary.md`
  - add missing entries if needed

---

## W4 — Verify consistency

- [ ] Run cross-reference check:
  ```bash
  grep -r "aisdk\|ai-elements\|design\.md\|integrate\.md\|mcp\.md" . \
    --exclude-dir=.git --exclude-dir=node_modules --exclude="*.bun.lock"
  ```
- [ ] Verify all links point to `one/` locations, not root
- [ ] Spot-check: do code examples in these files match actual implementation?
- [ ] Rubric gate: fit (solves stated problem), form (clean links, no 404s), truth (accurate), taste (consistent style with other canonical docs)

---

## Exit & pheromone

Close with:
- [ ] Commit with tag (e.g., `docs-integrate:ai-elements:design:aisdk:integrate:mcp`)
- [ ] Update `.md` files with final link anchors
- [ ] Post result: files integrated, cross-references verified, {count} new canonical docs or extensions added
