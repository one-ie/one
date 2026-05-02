# layout-todo

> **Spec (source of truth):** [`layout.md`](layout.md)
> **Mode:** lean per spec — but multi-file (Layout.astro + ChatHost.tsx + Chat.tsx + routes); needs real W1-W4
> **Sequenced:** depends on `ai-elements-todo.md` (`<Chat />` must already render via AI Elements). Last in the chain.

The spec is canonical. Don't duplicate — read `layout.md`.

---

## Routing

```
W1 recon  →  W2 decide  →  W3 edit (parallel)  →  W4 verify
read         resolve mode   layout + boot +       Lighthouse 100×4
current      contracts      ChatHost + routes     CLS=0
```

---

## Source of truth

- `one/layout.md` — the spec (4 modes, 2 layers of control, geometry, persistence, perf budget)
- `.claude/rules/astro.md` — Astro 6 + hydration directives
- `.claude/rules/react.md` — React 19 + ref-as-prop
- `.claude/rules/design.md` — 6 tokens; rail = L1 (`--color-background`), content = L0 (`--color-page`)
- `.claude/rules/ui.md` — `emitClick('ui:layout:mode-switch')` on the switcher

---

## Cycles

### Cycle 1 — Shell + boot script + ChatHost

Goal: layout owns chat geometry; mode resolved before paint; `ChatHost`
hydrates `client:idle` and trusts the DOM dataset; no CLS.

**Tasks:**

| id | tags | exit | blocks |
|----|------|------|--------|
| C1-T1 | [layout, astro] | `Layout.astro` accepts `chat` + `chatLock` props; emits `<div id="chat-root">` and CSS Grid keyed off `html[data-chat-mode]` | C1-T2 |
| C1-T2 | [boot, astro] | inline `<script is:inline>` reads `localStorage.one:chat-mode`, applies mobile breakpoint, writes `data-chat-mode` to `<html>` before paint | C1-T3 |
| C1-T3 | [host, react] | `web/src/components/ChatHost.tsx` (new) — `client:idle`; reads DOM dataset; renders rail or icon chrome; owns switcher + `localStorage` writes | C1-T4 |
| C1-T4 | [css] | global stylesheet has `html[data-chat-mode="wide"\|"rail"\|"icon"\|"none"] #chat-root` rules; mobile @media collapses rails to icon | C2 |

#### Status

- [ ] **W1 recon** — read `web/src/layouts/Layout.astro`, `web/src/components/Chat.tsx`, `web/src/components/ChatWidget.tsx`, `web/src/pages/index.astro`, `web/src/pages/chat.astro`. Note the existing theme-bootstrap inline script (mirror its pattern).
- [ ] **W2 decide** — diff specs; how to keep theme bootstrap untouched while adding chat boot; ChatHost component shape; CSS placement (Layout.astro `<style>` vs separate)
- [ ] **W3 edit** — parallel: Layout.astro, ChatHost.tsx (new), CSS
- [ ] **W4 verify** — `bun run build` green; manual: load `/`, `/chat`, `/wallet`, `/legal` — DevTools Performance shows empty Layout Shift track; rubric ≥ 0.65

### Cycle 2 — Chat chrome variants + routes + Lighthouse gate

Goal: `<Chat />` renders three chrome variants from one tree; routes opted into modes per the assignment table; Lighthouse 100/100/100/100.

**Tasks:**

| id | tags | exit | blocks |
|----|------|------|--------|
| C2-T1 | [chat, chrome] | `Chat.tsx` accepts `mode: 'popover' \| 'rail-25' \| 'rail-45'`; chrome conditionals; switcher row; `canSwitch` honors `chatLock` | C2-T2 |
| C2-T2 | [chat, dynamic] | heavy parts dynamic-imported so icon/none pages don't pay (~25KB only when chat opens or rail mounts) | C2-T3 |
| C2-T3 | [routes] | per spec §Pages × modes table — `/chat` wide, `/buy` wide, `/sell` wide, `/wallet` rail, `/legal` + `/privacy` `none` + `chatLock`, default `icon` | C2-T4 |
| C2-T4 | [perf] | Lighthouse-CI on `/`, `/chat`, `/wallet`, `/legal` — gate 100/100/100/100; throttled-network manual check shows no flash-of-rail | done |

#### Status

- [ ] **W1 recon** — read `Chat.tsx` (post ai-elements), `ChatWidget.tsx`, all `web/src/pages/*.astro`
- [ ] **W2 decide** — diff specs; per-page edits; verify `chatWidget` icon mode reuses existing `ChatWidget.tsx` or replaces it
- [ ] **W3 edit** — parallel edits per file
- [ ] **W4 verify** — Lighthouse-CI 100×4; manual perf trace; preference round-trips through reload; mobile (768px) collapses; rubric ≥ 0.65

---

## Verify checklist (final ship gate)

Per `layout.md` §Verification:

```bash
cd web && bun run build
# Lighthouse-CI on / (icon), /chat (wide), /wallet (rail), /legal (none)
# gate at 100/100/100/100
```

Manual:
- DevTools → Performance → record navigation → Layout Shift track empty
- Slow 4G + 4× CPU → reload `/chat` with stored pref `none` → no flash of rail then collapse
- Resize 1920 → 1280 → 768 → rails collapse to icon at breakpoint
- Click switcher → reload → mode persists

**Rubric:** fit (4 modes work, page→user→mobile precedence respected) · form (one component tree, three chromes) · truth (Lighthouse 100×4, CLS=0) · taste (no 5th mode, no per-page chat imports, lock used only on `/legal`+`/privacy`).

---

## Don't

(Echoed from spec §Don't — block these in W2/W3 review)

- Don't import `<Chat />` directly in a page; set `chat="..."` on `<Layout>`
- Don't add a 5th mode
- Don't render two modes at once
- Don't tint the rail differently from a card; it's L1 with a left border
- Don't persist mode in a cookie; `localStorage` is correct

---

## See also

- `one/layout.md` — spec
- `one/aisdk-todo.md` — provides streaming `<Chat />`
- `one/ai-elements-todo.md` — provides `<Conversation>` + `<Message>` + `<PromptInput>` that `<Chat />` uses
- `one/sidebar.md` — peer surface (sidebar is its own L1 panel; layout doesn't own it)
- `one/motion.md` — mode-swap animation budget (200ms cap)
