// The chat widget's layout default — single source of truth for both the
// plugin registration (one.config.ts) and the widget mount (Layout.astro).
//
// This lives in its OWN module, separate from one.config.ts, on purpose:
// one.config.ts's `export default defineOne({...})` runs the full plugin
// registration graph at module evaluation time. Layout.astro renders on
// every page, including statically prerendered ones — if Layout.astro
// imported one.config.ts directly, that graph (and whatever any plugin
// factory touches eagerly) would run during Cloudflare's prerender pass,
// which forbids random-value generation / async I/O / timers at module
// scope ("Disallowed operation called within global scope"). A prior
// version did import one.config.ts here and broke `astro build` this way.
// This module has zero side effects — just a plain object — so it's safe
// to import from anywhere, including prerendered routes.
const ws = 'template' // workspace slug — funded via world:create-workspace credit grants

export const chatConfig = {
  ws,
  view: 'icon' as const,
  position: 'right' as const,
}
