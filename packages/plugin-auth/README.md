# @oneie/plugin-auth

better-auth client plugin for ONE. Auth lives on ONE's backend — this plugin wires the client-side pieces.

```ts
import { auth } from '@oneie/plugin-auth'

export default defineOne({
  plugins: [auth()],
})
```

Adds sign-in/sign-up UI components, session management, and the better-auth client configured to point at the ONE backend. The auth server never ships to your repo.

## What ships

- `auth()` — plugin factory
- `<SignIn />`, `<SignUp />` Astro components
- `useSession()` React hook (via better-auth)
