---
title: TODO Chat Sanitize — /chat renders only safe HTML
type: roadmap
version: 1.0.0
priority: Wire → Prove → Grow
total_tasks: 3
completed: 0
status: COMPLETE
---

# TODO: Chat Sanitize — /chat renders only safe HTML

> **Time units:** plan in **tasks → waves → cycles** only. Never days, hours,
> weeks, or sprints. (See `.claude/rules/engine.md` → The Three Locked Rules.)
>
> **Goal:** `MarkdownContent` never injects executable HTML. `<script>`,
> `<iframe>`, `on*=` handlers, and `javascript:` / `data:text/html` URLs get
> stripped before they hit the DOM.
>
> **Scope:** one file (`src/components/ai/MarkdownContent.tsx`) + one test file.
> Nothing else. Streaming auto-close, chrome-devtools probes, and a 12-case
> adversarial fixture are explicitly **out of scope** — revisit only if a real
> incident warrants it.
>
> **Source of truth:**
> [dictionary.md](dictionary.md) — `RichMessage` shape,
> `.claude/rules/engine.md` — Rule 3 (deterministic results),
> `.claude/rules/react.md` — React 19 patterns.

---

## Why now

`src/components/ai/MarkdownContent.tsx:28` runs `marked.parse(content)` then
injects via `dangerouslySetInnerHTML` on line 84. The inline comment claims
"sanitized markdown HTML from marked+shiki pipeline" — this is **factually
wrong**. `marked` removed its built-in sanitizer in v5; neither `marked` nor
`shiki` strips HTML. Model output containing `<script>alert(1)</script>` or
`<a href="javascript:...">` will execute. `@ts-nocheck` on line 1 hides the
problem from the type system.

Deterministic Sandwich lens:
```
PRE:  model streams arbitrary text (hostile or malformed is the null hypothesis)
LLM:  already happened (tokens in hand)
POST: renderer MUST strip dangerous HTML before DOM insertion
```

---

## Routing Diagram

```
  [W1 recon: 1 Haiku]
        │
        │ audit MarkdownContent + confirm no other dangerouslySetInnerHTML
        │ consumers; pick sanitizer (DOMPurify vs rehype-sanitize)
        ▼
  [W2 decide: skipped — scope tight, W1 output is the decision]
        ▼
  [W3 edit: 1 Sonnet]
        │
        │ wire sanitizer after marked.parse; remove @ts-nocheck; fix the
        │ misleading comment
        ▼
  [W4 verify: 1 Sonnet]
        │
        │ unit test: 5 hostile inputs produce DOM with no <script>/<iframe>/
        │ event handlers / unsafe schemes; bun run verify green
        ▼
  [mark(close loop) → /chat safe]
```

---

## Cycle 1 — Wire sanitizer, prove with 5 hostile inputs

### Deliverables

| Deliverable | Goal | Rubric (fit/form/truth/taste) |
|-------------|------|-------------------------------|
| Sanitizer between `marked.parse` and `dangerouslySetInnerHTML` | No executable HTML reaches DOM | **0.40** / 0.15 / **0.35** / 0.10 |
| `@ts-nocheck` removed from `MarkdownContent.tsx` | Type system catches future drift | 0.30 / 0.25 / 0.35 / 0.10 |
| 5-fixture vitest suite | Regression guard (deterministic result) | 0.20 / 0.20 / **0.50** / 0.10 |

### The 5 fixtures

1. `<script>alert(1)</script>` — raw script tag
2. `<img src=x onerror=alert(1)>` — event handler attribute
3. `[click](javascript:alert(1))` — unsafe URL scheme in markdown link
4. `<iframe src="data:text/html,..."></iframe>` — embedded iframe + data URI
5. `<a href="//evil" onclick="alert(1)">x</a>` — inline handler on link

All five must render with the dangerous payload stripped or neutralized; none may throw.

### Tasks

| id | wave | value | effort | phase | persona | blocks | exit | tags |
|----|------|------:|-------:|-------|---------|--------|------|------|
| `cs-1.1-recon` | W1 | 0.7 | XS | RECON | haiku | 1.2 | Confirm `MarkdownContent.tsx` is the only `dangerouslySetInnerHTML` site in `src/components/`; recommend sanitizer (DOMPurify smallest, isomorphic-dompurify for SSR) | chat-sanitize, recon |
| `cs-1.2-edit` | W3 | 1.0 | S | BUILD | sonnet | 1.3 | Sanitizer wired after `marked.parse`; `@ts-nocheck` removed; misleading comment replaced with truthful one; biome + tsc clean | chat-sanitize, build |
| `cs-1.3-verify` | W4 | 0.9 | XS | VERIFY | sonnet | cycle-close | 5/5 fixtures render without `<script>`, `<iframe>`, `on*=`, or unsafe URL schemes; no thrown errors; `bun run verify` green; `mark()` via `/api/signal` | chat-sanitize, verify |

### Exit condition

- 5/5 hostile fixtures neutralized
- `@ts-nocheck` removed without new type errors
- `bun run verify` green
- Rubric ≥ 0.65 on all four dimensions

---

## Self-checkoff

On `cs-1.3-verify` pass: mark TODO complete, emit `chat-sanitize:done` signal
to `/api/signal` with rubric scores.

---

## See Also

- [`.claude/rules/engine.md`](../.claude/rules/engine.md) — The Three Locked Rules
- [`.claude/rules/react.md`](../.claude/rules/react.md) — React 19 patterns
- [TODO-template.md](one/TODO-template.md) — canonical TODO shape
