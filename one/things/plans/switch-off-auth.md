# Switch Off Auth

## TL;DR
- Set `PUBLIC_BACKEND_PROVIDER=one` to keep authentication features active when the frontend talks to the ONE backend.
- Remove the value or set it to anything other than `one` to suppress auth surfaces and skip session fetches in `web/src/components/Sidebar.tsx`.

## Why
- The sidebar now reads the backend identifier from `import.meta.env.PUBLIC_BACKEND_PROVIDER`.
- Only the ONE backend currently supports the Better Auth APIs that power account menus.
- Guarding on the env flag prevents broken sign-in links when experimenting with other data providers.

## How
1. Edit the project `.env`.
2. For ONE backend: `PUBLIC_BACKEND_PROVIDER=one`.
3. For other backends or static demos: leave the variable unset or change its value.
4. Reload the site so the Astro build picks up the new environment value.

## Notes
- When auth is off the sidebar shows a passive “Authentication disabled” state and no calls are made to `/api/auth/get-session`.
- The flag is evaluated at build time, so restart the dev server after changes.
