import { defineOne } from '@oneie/frontend'
import { auth } from '@oneie/plugin-auth'
import { backend } from '@oneie/plugin-backend'
import { blog } from '@oneie/plugin-blog'
import { chat } from '@oneie/plugin-chat'
import { docs } from '@oneie/plugin-docs'
import { newsletter } from '@oneie/plugin-newsletter'
import { pages } from '@oneie/plugin-pages'
import { track } from '@oneie/plugin-track'
import { chatConfig } from './src/lib/chat-config'

// workspace slug — funded via world:create-workspace credit grants; chatConfig
// (./src/lib/chat-config.ts) carries the same value for Layout.astro's mount,
// kept in its own side-effect-free module — see that file's header comment
// for why it must not live here.
const ws = chatConfig.ws

// Chat widget switch — flip to re-enable the @oneie/plugin-chat registration
// below AND the <OneChat> mount in src/layouts/Layout.astro (both must match;
// this const only gates the plugin() entry, not the widget component import).
const CHAT_ENABLED = false

// ONE configuration — the single control surface for this site.
// Two separate switches:
//   1. Backend mode: set ONE_API_KEY + ONE_BASE_URL in .env to connect to the
//      ONE backend. Without ONE_API_KEY the app runs standalone (local auth + D1).
//   2. Which widgets ship: each plugin below is a build-time Astro integration
//      (see @oneie/frontend's defineOne) — install it (`bun add @oneie/plugin-x`)
//      AND list it here. ONE_API_KEY alone does not mount a chat widget or
//      tracking pixel that isn't in this array.
export default defineOne({
  backend: {
    baseUrl: 'https://one.ie',
    // apiKey: loaded from CF binding at runtime — not set here at build time
  },
  brand: {
    tokens: {
      primary: 'hsl(216 55% 25%)',
      secondary: 'hsl(219 14% 28%)',
      tertiary: 'hsl(105 22% 25%)',
      background: 'hsl(0 0% 93%)',
      foreground: 'hsl(0 0% 100%)',
      font: 'hsl(0 0% 13%)',
    },
  },
  plugins: [
    auth(),
    backend(),
    // injectRoutes:false — the plugin's page components are bare fragments,
    // not full documents. This site wraps them in its own <Layout> (nav,
    // <head>, globals.css) via src/pages/blog/* and src/pages/docs/*.
    blog({ injectRoutes: false }),
    docs({ injectRoutes: false }),
    newsletter({ workspace: ws }),
    // /p/[slug] is hand-written below (SSR, not prerendered — every request
    // re-fetches pages:view so a publish in ONE's editor is live on refresh).
    pages({ ws, injectRoutes: false }),
    track({ ws }),
    ...(CHAT_ENABLED ? [chat(chatConfig)] : []),
  ],
})
