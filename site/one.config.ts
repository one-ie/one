import { defineOne } from '@oneie/frontend'
import { auth } from '@oneie/plugin-auth'
import { backend } from '@oneie/plugin-backend'
import { blog } from '@oneie/plugin-blog'
import { chat } from '@oneie/plugin-chat'
import { docs } from '@oneie/plugin-docs'
import { track } from '@oneie/plugin-track'

const ws = 'template' // workspace slug — funded via world:create-workspace credit grants

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
    chat({ ws }),
    docs({ injectRoutes: false }),
    track({ ws }),
  ],
})
