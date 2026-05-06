# composio.md — BYO-accounts via Composio + Vercel AI SDK

**Goal:** every ONE user brings their own Gmail / GitHub / Slack / Linear /
Notion / … accounts. Our agents act *as the user*, with the user's own
OAuth grants. We never see a token — Composio holds them, scoped to a
`user_id` we assign.

This is the multi-tenant pattern: one server-side `COMPOSIO_API_KEY`,
N user-scoped `user_id`s, each with their own connected accounts.

```
ONE user (passkey identity)
  └─ user_id = <wallet address>     ← stable, opaque to Composio
       ├─ connected_account: GMAIL    (their inbox)
       ├─ connected_account: GITHUB   (their repos)
       └─ connected_account: SLACK    (their workspace)

claw load → composio.create(user_id) → session.tools()
  → tools execute against the user's own grants
```

**Sources:**
- https://docs.composio.dev/docs/providers/vercel
- https://docs.composio.dev/docs/authenticating-tools
- https://docs.composio.dev/docs/white-labeling-authentication

**Branding:** we white-label. The OAuth consent screen says **"ONE wants
to access your account"** — never "Composio". We register our own OAuth
apps with each provider; Composio relays them. See
[White-label setup](#white-label-setup) below.

---

## Why

`aitools.ts` defines our *internal* substrate tools (`discover`, `remember`,
`recall`, `highways`, `mark`, `warn`, `browse`). Composio extends the same
`tool()` map with *external* toolkits we don't want to wrap by hand. One
provider, hundreds of toolkits, one `user_id` — auth is delegated.

```
claw  ──┐
        ├── aitools.ts        (substrate: discover/recall/mark/warn …)
        └── composioTools     (external: gmail/github/slack/linear …)
                                  ↑ both shapes are AI SDK v6 tool()
```

---

## Install

```bash
bun add @composio/core @composio/vercel
```

`ai@^6` and the model provider (`@ai-sdk/openai-compatible`,
`@ai-sdk/anthropic`, …) are already in `claw`'s dep set — see
[`claw/package.json`](claw/package.json).

---

## Env

```bash
# claw/.dev.vars   (and Wrangler secret in prod)
COMPOSIO_API_KEY=ck_…
```

Add to `claw/wrangler.toml` `[vars]` block as a placeholder; bind the real
value with `wrangler secret put COMPOSIO_API_KEY`.

---

## Vocabulary

Composio renamed its primitives. Use the new names everywhere:

| Old        | New                  |
|------------|----------------------|
| entity ID  | `user_id`            |
| action     | tool                 |
| app        | toolkit              |
| integration| auth config          |
| connection | connected account    |

`user_id` is the *only* place auth lives. Never pass credentials to
individual tool calls.

---

## Minimal integration

```ts
// claw/src/composio.ts (new)
import { Composio } from '@composio/core'
import { VercelProvider } from '@composio/vercel'

const composio = new Composio({
  apiKey: process.env.COMPOSIO_API_KEY,
  provider: new VercelProvider(),
})

export async function composioTools(userId: string, toolkits?: string[]) {
  const session = await composio.create(userId)
  return session.tools({ toolkits })   // filter, e.g. ['GMAIL', 'GITHUB']
}
```

`session.tools()` returns an AI-SDK-v6-shaped tool map — each tool already
has an `execute` function, so the loop runs without manual dispatch.

---

## Wire into `ToolLoopAgent`

Drop the map next to our substrate tools in
[`claw/src/aitools.ts`](claw/src/aitools.ts):

```ts
import { generateText, stepCountIs } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { aitools } from './aitools'
import { composioTools } from './composio'

const tools = {
  ...aitools(ctx),                          // substrate
  ...(await composioTools(ctx.userId, ['GMAIL', 'GITHUB'])),
}

const { text } = await generateText({
  model: anthropic('claude-opus-4-7'),
  tools,
  prompt: 'Email john@example.com a summary of issue #42',
  stopWhen: stepCountIs(10),
})
```

Same shape works with `streamText` and `ToolLoopAgent` — Composio tools are
just AI SDK tools.

---

## `user_id` — the multi-tenant key

Pick **once, never change**. We use the user's wallet address (the
passkey-derived identity from [`passkeys.md`](passkeys.md)) — stable, opaque,
already unique. Don't use email (mutable) or session id (rotates).

```ts
const userId = wallet.address   // e.g. "0x1234…abcd" — the identity
```

Composio stores connected accounts under this id. Every request from this
user — chat, MCP, CLI, scheduled run — passes the same `user_id` and gets
the same toolbelt.

---

## Connect flow — user authorizes their own accounts

User clicks "Connect Gmail" in [`web/`](web/). The Worker initiates a
Composio link, redirects the user through Google's OAuth, Composio stores
the grant, we get back an `ACTIVE` connected account.

**1. Initiate (server, on user click):**

```ts
// web/src/pages/api/composio/connect.ts
import { Composio } from '@composio/core'

const composio = new Composio({ apiKey: env.COMPOSIO_API_KEY })

export async function POST({ request, locals }) {
  const { toolkit } = await request.json()           // 'GMAIL' | 'GITHUB' | …
  const userId = locals.user.walletAddress
  const authConfigId = AUTH_CONFIGS[toolkit]         // configured once in Composio dashboard

  const req = await composio.connectedAccounts.link(userId, authConfigId, {
    callbackUrl: `${env.PUBLIC_URL}/api/composio/callback?toolkit=${toolkit}`,
  })

  return Response.json({ redirectUrl: req.redirectUrl })
}
```

**2. Redirect** — frontend navigates the browser to `redirectUrl`. User
signs into Google / GitHub / etc. Composio handles the OAuth dance.

**3. Callback** — Composio bounces back to our `callbackUrl` with
`?status=success&connected_account_id=ca_…`. We just confirm and redirect
to the chat surface; the grant is already stored under `user_id`.

```ts
// web/src/pages/api/composio/callback.ts
export async function GET({ url }) {
  const status = url.searchParams.get('status')
  const accountId = url.searchParams.get('connected_account_id')
  if (status !== 'success') return Response.redirect('/settings?error=connect_failed')
  return Response.redirect(`/settings?connected=${accountId}`)
}
```

**4. List / status** — settings page shows what the user has connected:

```ts
const conns = await composio.connectedAccounts.list({
  userIds: [userId],
  statuses: ['ACTIVE'],
})
// render: GMAIL ✓  GITHUB ✓  SLACK –
```

Only `ACTIVE` accounts execute. `INITIATED` / `EXPIRED` / `FAILED` /
`INACTIVE` ⇒ surface a "reconnect" button.

---

## Auth configs — set up once per toolkit

`auth_config_id` (`ac_…`) is created in the Composio dashboard, *not* at
runtime. One per toolkit (one for GMAIL, one for GITHUB, …), shared across
all our users. Store the map in env or a constants file:

```ts
// claw/src/composio-toolkits.ts
export const AUTH_CONFIGS = {
  GMAIL:  'ac_gmail_xxx',
  GITHUB: 'ac_github_xxx',
  SLACK:  'ac_slack_xxx',
  LINEAR: 'ac_linear_xxx',
} as const
```

Never let users create auth configs themselves — that's our admin step.

---

## White-label setup

We use **developer-managed OAuth**: our own client_id/client_secret per
provider, so users see *"ONE wants to access your Gmail"* — not Composio.

### One-time per provider

1. **Register an OAuth app** with each provider (Google Cloud Console,
   GitHub Developer Settings, Slack API, …) under the **`one.ie`** brand
   — name, logo, homepage, privacy policy.
2. Set the OAuth callback URL on the provider side to Composio's relay:
   ```
   https://backend.composio.dev/api/v3.1/toolkits/auth/callback
   ```
3. Copy the **Client ID** + **Client Secret** the provider issues.
4. In **Composio dashboard → Authentication management → Create Auth
   Config**: pick the toolkit, scheme **OAuth2**, enable **"Use your own
   developer credentials"**, paste id + secret, save. Note the
   `ac_…` id.

Result: a per-toolkit auth config we own end-to-end. Branding,
scopes, throttling — all ours.

### Per-session — pin the white-label config

Pass the auth config map when creating the session so it overrides
Composio's defaults:

```ts
const session = await composio.create(userId, {
  authConfigs: {
    gmail:  AUTH_CONFIGS.GMAIL,
    github: AUTH_CONFIGS.GITHUB,
    slack:  AUTH_CONFIGS.SLACK,
    linear: AUTH_CONFIGS.LINEAR,
  },
})
const tools = await session.tools({ toolkits })
```

Toolkits not listed fall back to Composio-managed (which is fine for
internal/staging — but ship every production toolkit white-labelled).

### Composio's own consent surface

Two more places carry "Composio" branding by default:

| Surface | Fix |
|---------|-----|
| Connect Link landing page | Upload ONE logo + title in Composio dashboard → Project Settings → **Auth Screen** |
| Browser address bar during OAuth | Proxy `callbackUrl` through `one.ie` (we already do — `/api/composio/callback`) |
| Post-auth landing | We control via our own `callbackUrl` |

### Migration caveat

**Switching an auth config only affects new connections.** Users who
connected under Composio's default app keep working with that app until
they reconnect. When we flip a toolkit to white-label, surface a "reconnect
to update permissions" prompt in settings for affected users, but don't
force-revoke — silent breakage is worse than a stale-but-working grant.

---

## Substrate contract — closing the loop

Composio tool calls flow through the same dispatcher as substrate tools, so
[`engine.md`](.claude/rules/engine.md) Rule 1 still holds:

```ts
const r = await tool.execute(args)
if (r?.success)        net.mark(edge, depth)   // path strengthens
else if (r === undefined) net.warn(edge, 0.5)   // tool missing/dissolved
else                   net.warn(edge, 1)        // failure
```

Wrap Composio tools in a thin `mark/warn` shim if their result shape
diverges — most return `{ successful: true, data: … }`, easy to map.

---

## MCP alternative

For Claude Desktop / Cursor / `@oneie/mcp` consumers, skip the provider and
use `session.mcp.url` + `session.mcp.headers`. Same `user_id`, same
toolkits, no extra deps. See [`mcp/CLAUDE.md`](mcp/CLAUDE.md) for our MCP
host wiring.

---

## Per-request: load only what the user connected

At chat time, filter tools to the user's active connections so the model
isn't shown a Gmail tool when the user hasn't connected Gmail:

```ts
const conns = await composio.connectedAccounts.list({
  userIds: [userId], statuses: ['ACTIVE'],
})
const toolkits = conns.items.map(c => c.toolkit)   // ['GMAIL','GITHUB']
const tools = await (await composio.create(userId)).tools({ toolkits })
```

Cache the toolkit list per session — `connectedAccounts.list` is a network
hop; the set rarely changes mid-conversation.

---

## Don't

- Don't share a single `user_id` across users — that cross-grants their
  Gmails to each other. One ONE-user = one Composio `user_id`.
- Don't expose `COMPOSIO_API_KEY` to the browser. All `connectedAccounts.*`
  and `composio.create` calls happen server-side (Worker / claw).
- Don't pass tokens to individual tool calls — `user_id` only.
- Don't import `@composio/openai` when you mean `@composio/vercel`.
- Don't fan out unbounded `stepCountIs` — keep ≤10 in `claw` to bound
  Worker CPU.
- Don't catch-all tool errors to `success` — let real failures `warn(1)`
  per Rule 1.
- Don't let users create auth configs at runtime — admin-only, dashboard.

---

*One `user_id`. One provider. Hundreds of toolkits. Same loop.*
