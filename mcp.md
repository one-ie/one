# mcp

> **Position:** layer 4 of 4 — [`integrate`](integrate.md) → [`aisdk`](aisdk.md) → [`ai-elements`](ai-elements.md) → `mcp`
> **Prereq:** `aisdk.md` Stage 1–3 (`streamText` + `tool()` map merged into `tools` dict)
> **Enables:** integrations-as-config; every new outbound capability becomes an env-var, not a code change
> **Owns:** the `experimental_createMCPClient` loader, `MCP_SERVERS` env grammar, namespacing rule.

How `claw` consumes [Model Context Protocol](https://modelcontextprotocol.io) servers as runtime tools — turning **integrations into config**.

**Principle:** add MCP client support once. After that, every new outbound capability — Slack, Gmail, GitHub, Notion, Linear, Vercel, anything that speaks MCP — is an env var, not a code change.

---

## Why this matters

Today's claw has 7 hard-coded tools (`browse`, `remember`, `recall`, `mark`, `warn`, `highways`, `discover`). To add Slack-send, you'd write `lib/slack.ts`, register it in `tools.ts`, redeploy.

With MCP:

```toml
MCP_SERVERS = "slack=https://slack-mcp.example.com,gmail=https://gmail-mcp.example.com"
```

Restart claw. The LLM now has `slack_send_message`, `slack_list_channels`, `gmail_send`, `gmail_search` — every tool the upstream MCP server exposes. **No claw code touched.**

This is the same pattern Claude Desktop and Cursor use. claw becomes an MCP host the same way they are.

---

## The shape

```
                  ┌── MCP server: slack ──→ Slack API
                  │
claw ── tools ────┼── MCP server: gmail ──→ Gmail API
                  │
                  ├── MCP server: github ─→ GitHub API
                  │
                  └── claw's own substrate tools (in-process)
```

Each MCP server is its own deployable. Could be ours, could be community-built, could be one of nanoclaw's. claw is a host that aggregates them.

---

## Wiring (~50 lines, one-time)

`src/mcp.ts`:

```ts
import { experimental_createMCPClient } from 'ai'
import type { Env } from './types'

interface McpServerSpec {
  name: string
  url: string
}

/** Parse "name=url,name=url" into an array. Empty/invalid → []. */
function parseServers(raw: string | undefined): McpServerSpec[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [name, ...rest] = s.split('=')
      return { name: name.trim(), url: rest.join('=').trim() }
    })
    .filter((s) => s.name && s.url)
}

/**
 * Connect to all configured MCP servers and return their tools, namespaced
 * by server name (e.g. `slack_send_message`).
 *
 * Failures are logged and skipped — one bad server can't kill the request.
 */
export async function loadMcpTools(env: Env): Promise<Record<string, unknown>> {
  const servers = parseServers(env.MCP_SERVERS)
  if (servers.length === 0) return {}

  const tools: Record<string, unknown> = {}

  await Promise.all(
    servers.map(async ({ name, url }) => {
      try {
        const client = await experimental_createMCPClient({
          transport: { type: 'sse', url },
        })
        const remote = await client.tools()
        // Namespace tools to prevent collisions across servers
        for (const [key, def] of Object.entries(remote)) {
          tools[`${name}_${key}`] = def
        }
      } catch (e) {
        console.warn(`[mcp] ${name} failed:`, e)
      }
    }),
  )

  return tools
}
```

In `src/index.ts`, merge MCP tools into the `streamText` call:

```ts
import { clawTools } from './aitools'
import { loadMcpTools } from './mcp'

const [substrateTools, mcpTools] = await Promise.all([
  Promise.resolve(clawTools(c.env, group)),
  loadMcpTools(c.env),
])

streamText({
  model: pickModel(context.model, c.env),
  system: enhancedPrompt,
  messages,
  tools: { ...substrateTools, ...mcpTools },
  stopWhen: stepCountIs(5),
})
```

That's the entire wiring. AI SDK handles MCP transport, schema validation, tool dispatch.

---

## Config

Add to `src/types.ts`:

```ts
export interface Env {
  // ... existing
  MCP_SERVERS?: string  // "name=url,name=url"
}
```

Set per environment:

```bash
# Local dev
echo 'MCP_SERVERS=slack=http://localhost:3001/mcp,gmail=http://localhost:3002/mcp' >> .dev.vars

# Production
wrangler secret put MCP_SERVERS
# value: slack=https://slack-mcp.acme.com,gmail=https://gmail-mcp.acme.com
```

Adding a new integration:

```bash
# Edit the secret, no code, no rebuild
wrangler secret put MCP_SERVERS
# value: slack=...,gmail=...,linear=https://linear-mcp.acme.com
```

Tools appear on next request. Hot-add by adding a refresh route if you don't want to restart.

---

## Public MCP servers worth dropping in

Pick the ones you need; ignore the rest. Each is a URL.

| Server | What it gives the LLM |
|---|---|
| `slack` | send/read messages, list channels, react |
| `gmail` | send/search/read email, draft, label |
| `github` | issues, PRs, comments, repo content, code search |
| `notion` | pages, databases, blocks, search |
| `linear` | issues, projects, cycles, comments |
| `vercel` | deploys, logs, env vars |
| `cloudflare` | Workers, D1, KV, Pages |
| `filesystem` | (local only) read/write files in a sandbox |
| `puppeteer` / `playwright` | browse, screenshot, scrape |
| `postgres` / `sqlite` | query a DB read-only |
| `web-search` | Brave / Tavily search |

Most are open source, dockerized, deploy in 60 seconds to a Worker or container. Many have hosted versions you can point at directly.

---

## What still needs code

MCP solves **outbound** tools beautifully. **Inbound** (a new channel sending webhooks to claw) needs a small adapter, because webhooks have channel-specific normalize rules and signature verification.

The contract is small — copy `channels.ts` Telegram adapter and edit:

```ts
// add to src/channels.ts
interface SlackEvent { /* … */ }

export const normalizeSlack = (payload: SlackEvent): Signal | null => {
  // turn slack event into { id, group, channel, sender, content, ts }
}

export const sendSlack = async (env: Env, groupId: string, text: string): Promise<void> => {
  // POST to slack web API
}

// register in normalize() + send() dispatchers
```

~30 lines per channel. Repeatable shape. No way around this part — webhook signatures and payload schemas are inherently per-vendor.

(In Mode B with one.ie, the cloud could maintain a registry of channel adapters as MCP servers exposing a `normalize` tool. That'd push inbound into config too. Not a Stage 1 problem.)

---

## How tools surface in chat

MCP namespacing makes tool names predictable: `<server>_<tool>` (e.g. `slack_send_message`, `github_create_issue`). The `<Tool>` element from [`ai-elements`](ai-elements.md) renders every `tool-*` part — substrate tools and MCP tools alike — by switching on `part.type`. One component, every source. No `<ToolCard>` redefinition here.

---

## Federation (Mode B)

In cloud mode, claw can also **expose itself** as an MCP server. Agents elsewhere on the one.ie substrate can call your `mark` / `warn` / `highways` / `recall` tools without speaking claw's HTTP API. AI SDK supports both directions; one-time addition of an MCP transport endpoint at `/mcp` makes claw an MCP server too.

That's how the network compounds: every claw deploy is both a host *and* a server. Tools flow in either direction.

---

## What not to do

- **Don't put credentials in `MCP_SERVERS` URLs.** Each MCP server holds its own auth. claw just calls the URL.
- **Don't aggregate every public MCP server "just in case."** Tools you load are tools the LLM might call — load only what you want available. Each adds latency at boot.
- **Don't share state across MCP clients.** Treat them as black boxes. If two servers expose `send_message`, namespace prevents the collision but you still get two tools.
- **Don't proxy MCP through web.** claw is the host. Web sees tools as stream events, never invokes them.
- **Don't skip the namespace prefix.** `slack_send_message` not `send_message`. Two integrations with the same tool name will silently overwrite each other.
- **Don't ship MCP support without a fallback.** If the upstream is down, the tool is gone — `streamText` should still work with whatever tools loaded successfully.

---

## Health check

See [`integrate.md` § Health checks](integrate.md#health-checks-canonical--referenced-by-aisdkmd--mcpmd) — case 1 surfaces `mcpServers` + `mcpToolsLoaded`; case 4 streams a `tool-slack_send_message` round-trip.

---

## Recommendation

1. **Ship aisdk.md Stage 1–3 first** (streamText, useChat, tool() definitions). MCP rides on that foundation.
2. **Add `src/mcp.ts`** — the parser + loader (50 lines).
3. **Wire `loadMcpTools` into `streamText` tools merge** in `index.ts`.
4. **Document `MCP_SERVERS` in `wrangler.toml` comments and README.**
5. **Pick three public MCP servers to spotlight in docs** — recommend `web-search`, `slack`, `github`. Demonstrably useful, easy to set up, immediate value.
6. (Stage 2 — federation) **Expose claw's own tools as an MCP server** at `/mcp` so other claws can consume them.

After step 4, nanoclaw.dev's skill catalog becomes a config menu. After step 6, the substrate becomes a tool fabric.

---

*MCP turns integrations into URLs. URLs into config. Config into capability.*
