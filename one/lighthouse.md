# Lighthouse — `web/` (demo.one.ie)

**Captured:** 2026-05-02 · Lighthouse 13.0.1 · Moto G Power emulation · Slow 4G

## Scores

| Category | Score |
|----------|-------|
| Performance | **99** |
| Accessibility | **100** → target after fix below |
| Best Practices | **100** |
| SEO | **100** |

### Performance metrics

| Metric | Score | Value |
|--------|-------|-------|
| FCP | 🟡 | 1.1 s |
| LCP | 🟡 | 2.0 s |
| TBT | ✅ | 0 ms |
| CLS | ✅ | 0 |
| SI | 🟡 | 2.4 s |

---

## Issues (ranked by impact)

### 1. Unused JavaScript — Est. 59 KiB savings · LCP · FCP

| File | Transfer | Unused | Ratio |
|------|----------|--------|-------|
| `/_astro/Chat.uSaOiYmZ.js` | 38.7 KiB | 31.4 KiB | 81% |
| `/_astro/client.CjtoOYy-.js` | 57.4 KiB | 28.1 KiB | 49% |

**Root cause:** `Chat.js` is in the critical path but 81% of its code runs only after
interaction. `client.CjtoOYy-.js` is likely the React runtime bundled without tree-shaking.

**Fix:**
- Change `<Chat client:load />` → `<Chat client:visible />` in `chat.astro` (defers hydration until visible)
- Audit what `client.js` exports — if it includes all of React 19, enable `react` deduplication in `astro.config.mjs`
- Split the Chat component: load the shell eagerly, lazy-import heavy sub-components (streaming renderer, message history)

---

### 2. Render-blocking CSS — Est. 150 ms · LCP · FCP

| File | Size | Block duration |
|------|------|----------------|
| `/_astro/Layout.BpGyojXU.css` | 5.9 KiB | 160 ms |

**Root cause:** The global layout stylesheet loads synchronously in `<head>`, blocking
first paint for 160 ms on slow connections.

**Fix:**
- Split critical (above-fold tokens + reset) from deferred (component-specific) styles
- Inline the critical ~1 KiB into `<style>` in `Layout.astro`; load the rest with `media="print" onload="this.media='all'"`
- Alternatively, move component styles into scoped `<style>` blocks so Astro can scope/defer per-island

---

### 3. Network dependency chain — 1,025 ms critical path

```
/chat (128 ms)
└── Layout.css (439 ms)
    └── Sidebar.js (751 ms)
        └── jsx-runtime.js (1,003 ms)
            └── ui-signal.js (1,025 ms)   ← chain end
    └── client.js (724 ms)
        └── index.js (989 ms)
    └── Chat.js (937 ms)
```

**Root cause:** Five sequential network hops before the page is interactive. Each
hop adds 250-300 ms on Slow 4G.

**Fix:**
- Add `<link rel="modulepreload">` hints for `Sidebar.js`, `client.js`, and `Chat.js`
  in `Layout.astro` so the browser fetches them in parallel with the CSS
- Consider inlining `jsx-runtime.js` (0.92 KiB) and `ui-signal.js` (1.62 KiB) — at
  2.5 KiB combined, the round-trip cost exceeds the transfer cost
- In `astro.config.mjs`, set `vite.build.rollupOptions.output.manualChunks` to
  co-locate `jsx-runtime` + `ui-signal` with the first JS chunk that needs them

---

### 4. Cache TTL — 4 KiB · LCP · FCP

| File | Current TTL |
|------|-------------|
| `static.cloudflareinsights.com/beacon.min.js` | 1 day |

**Root cause:** Cloudflare's own beacon script caches for only 1 day; repeat visitors
re-fetch it. This is a third-party asset — limited control.

**Fix:** No action needed for first-visit score. For repeat-visit gains, Cloudflare
Analytics respects `Cache-Control` on its own CDN — nothing to configure on our end.

---

---

## Accessibility issues

### Insufficient contrast — sidebar section labels

**Failing elements:** `MONEY` and `ACCOUNT` section headers in `Sidebar.tsx` and `SheetMenu.tsx`

```html
<p class="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-font/40">
```

**Root cause:** `text-font/40` (40% opacity) on `bg-background` fails WCAG AA for small text
(requires 4.5:1). `text-xs uppercase tracking-wider` is 12 px — regular (non-bold) size,
so the stricter 4.5:1 ratio applies. 40% opacity produces roughly 2.5:1 depending on the
active theme.

**Fix:** Raise to `text-font/60` (muted, per design rules) — sufficient contrast at all theme
values while maintaining the visual hierarchy between section labels and nav items.

| File | Line | Change |
|------|------|--------|
| `src/components/sidebar/Sidebar.tsx` | 65 | `text-font/40` → `text-font/60` |
| `src/components/sidebar/SheetMenu.tsx` | 85 | `text-font/40` → `text-font/60` |

**Status:** Fixed (see edits below).

---

## Action plan (lean mode)

| # | File to edit | Change | Expected gain |
|---|-------------|--------|---------------|
| 1 | `src/pages/chat.astro` | `client:load` → `client:visible` on `<Chat>` | LCP −300ms, FCP unchanged |
| 2 | `src/layouts/Layout.astro` | Inline critical CSS; defer rest | FCP −150ms |
| 3 | `src/layouts/Layout.astro` | Add `<link rel="modulepreload">` for Sidebar + Chat | chain −250ms |
| 4 | `astro.config.mjs` | `manualChunks`: merge `jsx-runtime` + `ui-signal` into Sidebar chunk | 1 fewer round-trip |
| 5 | `astro.config.mjs` | Verify React dedup; audit `client.js` exports | −28 KiB JS |

## Verify

```bash
bun run build && bun run preview
# Then: Lighthouse CI or PageSpeed against preview URL
# Gate: FCP < 0.9 s, LCP < 1.6 s, Score = 100
```
