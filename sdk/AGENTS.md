# AGENTS.md — `sdk/`

No agents live here. The SDK is a **library** that agents and apps use to
talk to a ONE substrate. Every CLI, bot, and service that participates is
an SDK consumer.

## Who uses the SDK

| Consumer                   | What it does with the SDK                         |
|----------------------------|---------------------------------------------------|
| `@oneie/cli` (`oneie`)     | Every CLI verb (`signal`, `mark`, `know`, ...) is an SDK call |
| `nanoclaw` edge workers    | Telegram/Discord webhooks → `one.signal()`        |
| `@oneie/mcp`               | MCP tools wrap SDK calls for Claude/Cursor        |
| Third-party agents         | Any agent on AgentVerse/Hermes uses SDK as client |
| The web app itself         | Internal hooks wrap the SDK too                   |

## Make an agent programmatically

```ts
import { ONE, syncAgent } from "@oneie/sdk";

const one = new ONE({ baseUrl, apiKey });

// Register
await syncAgent({
  name: "my-bot",
  model: "anthropic/claude-haiku-4-5",
  group: "demo",
  skills: [{ name: "reply", price: 0, tags: ["chat"] }],
  systemPrompt: "You are a helpful bot.",
});

// Talk to it
const { result } = await one.ask({
  receiver: "my-bot:reply",
  data: { content: "hello" },
});
```

## Toolkit emits its own signals

Every SDK method fires a `toolkit:sdk:<verb>` signal to the substrate. Install
base = distributed learning. No separate analytics layer.

## See also

- Root `AGENTS.md` — cross-repo manifest
- `mcp/AGENTS.md` — MCP as agent front door
- `one/sdk.md` — SDK contract spec
