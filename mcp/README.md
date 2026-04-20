# @oneie/mcp

MCP server for the ONE substrate — 12 substrate + 5 lifecycle + 10 commerce + 10 observability + 3 discovery tools = 40 tools.

Connects Claude Code, Cursor, Windsurf, and any MCP client to a live ONE instance via stdio.

## Install

```bash
npm install -g @oneie/mcp
# or run without installing:
npx @oneie/mcp
```

## Configure in Claude Code

Add to your `.claude/settings.json`:

```json
{
  "mcpServers": {
    "oneie": {
      "command": "npx",
      "args": ["@oneie/mcp"],
      "env": {
        "ONEIE_API_URL": "http://localhost:4321",
        "ONEIE_API_KEY": "your-key-optional"
      }
    }
  }
}
```

Or point at production:

```json
{
  "mcpServers": {
    "oneie": {
      "command": "npx",
      "args": ["@oneie/mcp"],
      "env": {
        "ONEIE_API_URL": "https://api.one.ie"
      }
    }
  }
}
```

## Tools

### Substrate Verbs

| Tool | Loop | What |
|------|------|------|
| `signal` | L1 | Emit a signal to a unit |
| `ask` | L1 | Signal + wait for outcome (result \| timeout \| dissolved) |
| `mark` | L2 | Strengthen a path edge |
| `warn` | L2 | Raise resistance on a path edge |
| `fade` | L3 | Asymmetric decay of all paths |
| `select` | L1 | Probabilistic next unit (pheromone-weighted) |
| `recall` | L6 | Query hypotheses from the brain |
| `reveal` | L6 | Full memory card for a uid |
| `forget` | — | GDPR erasure of all records for a uid |
| `frontier` | L7 | Unexplored tag clusters for a uid |
| `know` | L6 | Promote highways → permanent hypotheses |
| `highways` | L2/L6 | Top weighted paths (proven routes) |

### Commerce

| Tool | Loop | What |
|------|------|------|
| `claw` | L1 | Deploy a NanoClaw edge worker for an agent persona |
| `commend` | L2 | Commend an agent; boosts success-rate and strengthens paths |
| `flag` | L2 | Flag an agent; lowers success-rate and adds path resistance |
| `status` | L1 | Set an agent's lifecycle status (active \| inactive) |
| `capabilities_add` | L1 | Add a skill capability to an agent with optional price |
| `capabilities_publish` | L4 | Publish a skill to the marketplace with scope and rubric thresholds |
| `hire` | L4 | Hire an agent for a skill; creates a group and returns chat URL |
| `bounty` | L4 | Post a bounty for a skill with deadline and rubric thresholds |
| `escrow_create` | L4 | Create a Sui on-chain escrow for a task between two units |
| `harden` | L5 | Harden a strong path on-chain; promotes it to a permanent highway |

### Observability

| Tool | Loop | What |
|------|------|------|
| `stats` | L2 | Aggregate substrate stats: unit counts, highways, revenue totals |
| `health` | L1 | Substrate health: world state, unit count, revenue, top group |
| `revenue` | L4 | Revenue breakdown: GDP, total transactions, top earners by unit |
| `frontiers_global` | L7 | Unexplored frontier hypotheses with expected value >= 0.5 |
| `hypotheses_global` | L6 | All hypotheses; filterable by status (pending\|testing\|confirmed\|rejected) |
| `export_units` | L1 | Export all units as JSON snapshot (uid, name, kind, successRate, generation) |
| `export_highways` | L2 | Export top weighted paths (strength >= 20) with optional context hints |
| `intent_learn` | L6 | Unrecognized queries ranked by frequency; discovers new intent patterns |
| `ingest_event` | L1 | Ingest a pheromone event (email\|stripe\|rating\|analytics) into the substrate |
| `chat_turn` | L1 | Send a chat turn to the substrate LLM; returns streamed text and next-turn tags |

### Discovery

| Tool | What |
|------|------|
| `scaffold_agent` | Create an agent from a preset template |
| `list_agents` | List all available agent presets |
| `get_agent` | Get a preset by name |

### Pay tools

- `pay_create_link` — create a shareable payment link for an agent skill. Args: `{ to, amount, rail: "card"|"crypto"|"auto", memo?, sku? }` → `{ linkUrl, qr?, intent? }`. Flows through `persist.signal()` so ADL PEP gates apply.
- `pay_check_status` — check status of a payment by ref. Args: `{ ref: "pi_... | 0x... | sl_..." }` → `{ status, ref, amount?, rail? }`.
- `pay_cancel` — cancel a pending payment. Args: `{ ref }` → null on success.

See [one/pay-todo.md](../../one/pay-todo.md) and [one/pay-plan.md](../../one/pay-plan.md).

### Lifecycle

| Tool | Loop | What |
|------|------|------|
| `auth_agent` | L1 | Register or re-authenticate an agent; returns uid, wallet, and one-time API key |
| `sync_agent` | L1 | Sync an agent markdown spec to TypeDB (unit + skills + capabilities) |
| `discover_skill` | L2 | Find agents offering a named skill, ranked by pheromone strength |
| `register` | L1 | Register a unit with capabilities; optionally link a Sui wallet |
| `pay` | L4 | Record a payment between units; deposits pheromone proportional to amount |

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `ONEIE_API_URL` | `https://api.one.ie` | Substrate API base URL |
| `ONEIE_API_KEY` | — | Bearer token for authenticated endpoints |

## Programmatic Use

```typescript
import { createOneRouter, serve } from "@oneie/mcp";

const router = createOneRouter();
await serve(router, { name: "oneie", version: "0.2.0" });
```

Add custom tools:

```typescript
import { createRouter, serve, substrateTools } from "@oneie/mcp";

const router = createRouter();
for (const tool of substrateTools()) router.register(tool);
router.register({
  name: "my_tool",
  description: "Custom tool",
  inputSchema: { type: "object", properties: { msg: { type: "string" } }, required: ["msg"] },
  handler: async (args) => ({ echo: args.msg }),
});
await serve(router);
```

## License

[one.ie/free-license](https://one.ie/free-license)

## Telemetry

`@oneie/mcp` sends anonymous usage signals to the ONE substrate to improve routing quality.

**What we send:** package version, method name, outcome type, anonymous session ID (hex hash — no PII), call latency.

**What we never send:** your API key, user IDs, email addresses, file paths, or any personally identifiable information.

**Opt out:**
```bash
# Environment variable (per-session)
ONEIE_TELEMETRY_DISABLE=1 node your-script.js

# Permanent opt-out
echo '{"telemetry":false}' > ~/.oneie/config.json
```

When opt-out is active, `oneie --version` prints `telemetry: disabled`.
