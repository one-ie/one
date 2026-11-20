// The front desk's settings — the ONE switch for the chat embed (Layout.astro),
// the plugin registration (one.config.ts), the lead form (/api/lead) and the
// newsletter route. `oneie create site <name> --ws <slug>` rewrites the values
// below for a client; nothing else in the site names the workspace.
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
//
//   ws      the client's workspace on ONE: chat bills to it, leads land in it
//   agent   the agent the embed opens (the same default /settings/embed prints)
//   page    the page in that workspace lead:capture files this site's form under
//   enabled the front desk on or off
//   greeting the line the widget shows before the visitor types; '' shows none
//
// ONE's own site runs the guide (ai/agents/guide.md, published as
// template--guide), which walks every visitor along data/lifecycles/launch.toml:
// make my key → add your website → sell my product. `oneie create site`
// rewrites ws/agent/page/enabled for a client and clears the greeting.
const ws = 'template'
const agent = 'template--guide'
const page = 'template-site'
const enabled = true
const greeting = 'Hi! Three steps to selling: make your key, add your website, sell your product. Which one are you on?'

export const chatConfig = {
  ws,
  agent,
  page,
  enabled,
  greeting,
  view: 'icon' as const,
  position: 'right' as const,
}
