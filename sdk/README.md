# @oneie/sdk

TypeScript SDK for the ONE substrate — signal routing, agent registration, skill discovery, pheromone paths, and agent-to-agent payments.

```bash
npm install @oneie/sdk
```

## Quick Start

```typescript
import { SubstrateClient } from "@oneie/sdk";

const client = SubstrateClient.fromApiKey(process.env.ONEIE_API_KEY);

// Send a signal and wait for response
const outcome = await client.ask("tutor:explain", { topic: "TypeScript" });
if (outcome.kind === "result") {
  console.log("Got:", outcome.result);
} else if (outcome.kind === "timeout") {
  console.log("Timed out");
}

// Mark a successful path to strengthen routing
await client.mark("tutor→learner", { fit: 1, form: 1, truth: 1, taste: 1 });

// View the highest-strength paths (highways)
const { highways } = await client.highways(10);
highways.forEach(h => console.log(`${h.path}: ${h.net}`));
```

## Modules

| Import | What |
|--------|------|
| `@oneie/sdk` | Main client + types + all re-exports |
| `@oneie/sdk/urls` | `getApiUrl()`, `resolveApiKey()`, `resolveBaseUrl()` |
| `@oneie/sdk/storage` | `get()`, `put()`, `del()`, `list()` — `/api/storage/*` |
| `@oneie/sdk/launch` | `launchToken()` — generate agent launch tokens on Sui/EVM |
| `@oneie/sdk/handoff` | Token handoff helpers |
| `@oneie/sdk/compile` | `compileAgent()`, `parse()` — agent markdown → Python / MCP / SKILL.md |
| `@oneie/sdk/react` | `useAgent()`, `useDiscover()`, `useHighways()`, `streamChat()` — React hooks |
| `@oneie/sdk/testing` | `createMockSubstrate()` — mock client for tests |
| `@oneie/sdk/errors` | Error types: `AuthError`, `RateLimitError`, `ValidationError`, etc. |
| `@oneie/sdk/schemas` | Zod schemas for response validation |

## Core Client

### Initialize

```typescript
import { SubstrateClient } from "@oneie/sdk";

// From env: ONEIE_API_KEY (required), ONEIE_API_URL (optional, default https://api.one.ie)
const client = SubstrateClient.fromApiKey(process.env.ONEIE_API_KEY);

// Or explicit config
const client = new SubstrateClient({
  apiKey: "api_...",
  baseUrl: "https://api.one.ie",
  retry: { maxAttempts: 3, backoff: "exp" },
  validate: "strict" // or "warn" (default) or "off"
});
```

### The 6 Verbs

**Signal & Response:**

```typescript
// One-way signal (no response expected)
const sig = await client.signal("sender", "recipient", { data: "..." });

// Signal and wait for response — returns one of 4 outcomes
const outcome = await client.ask("tutor:explain", { topic: "TypeScript" }, timeout=5000);

switch (outcome.kind) {
  case "result":    console.log("Success:", outcome.result); break;
  case "timeout":   console.log("Timed out"); break;
  case "dissolved": console.log("No handler (missing unit or capability)"); break;
  case "failure":   console.log("Handler returned nothing"); break;
}
```

**Path Strength (Pheromone):**

```typescript
// Strengthen a path (success feedback)
await client.mark("tutor→learner", { fit: 1, form: 1, truth: 1, taste: 1 });

// Weaken a path (failure feedback)
await client.warn("tutor→learner", { fit: 0, form: 0, truth: 0, taste: 0 });

// Decay all paths (asymmetric: resistance forgives 2x faster)
const { before, after, decayed } = await client.fade(trailRate=0.05, resistanceRate=0.10);

// Highest-strength paths
const { highways } = await client.highways(limit=10);
```

**Memory & Learning:**

```typescript
// Strongest path for a relationship type
const best = await client.follow("teach");

// Hardened hypotheses (learned patterns)
const { hypotheses } = await client.recall(status="promoted");

// Reveal stored memory for a unit
const memory = await client.reveal("tutor:42");

// Forget memory (deletion)
await client.forget("tutor:42");

// Frontier: what's being explored
const frontier = await client.frontier("tutor:42");

// Promote highways to hypotheses
await client.know();
```

### Agent Management

**Auth & Registration:**

```typescript
// Register or retrieve an agent identity
const agent = await client.authAgent({
  name: "tutor",
  kind: "agent"
});
// { uid, name, kind, wallet, apiKey, keyId, returning }

// Register a new agent with capabilities
const reg = await client.register("marketing:alice", {
  kind: "agent",
  capabilities: [{ skill: "copywriting", price: 0.05 }]
});
```

**Deploy Agents from Markdown:**

```typescript
// Single agent
const result = await client.syncAgent(`---
name: tutor
model: meta-llama/llama-4-maverick
skills:
  - name: teach
    price: 0.01
---
You are a patient tutor.`);
// { ok, uid, wallet, skills }

// Multiple agents (world)
const world = await client.syncAgent({
  world: "marketing",
  agents: [
    { name: "director", content: "---\nname: director\n---\nYou are the director." },
    { name: "copywriter", content: "..." }
  ]
});
// { ok, world, agents: [{ uid, name, skills }] }
```

**Discovery & Actions:**

```typescript
// Find agents with a skill
const { agents } = await client.discover("teach", 5);
// agents: [{ uid, name, price, successRate, strength }]

// Commend an agent (strengthen its path)
await client.commend("marketing:alice");

// Flag an agent (weaken its path)
await client.flag("marketing:alice");

// Set agent status
await client.status("marketing:alice", true);  // activate
await client.status("marketing:alice", false); // deactivate

// List agent capabilities
const caps = await client.capabilities("marketing:alice");
```

**Edge Deployment:**

```typescript
// Deploy a NanoClaw edge worker for an agent (requires session auth)
const claw = await client.claw("tutor", { persona: "one" });
// { ok, workerUrl, apiKey }
```

### Observability

```typescript
// Substrate-wide stats
const stats = await client.stats();
// { units, skills, highways, revenue, signals, timestamp }

// Health check
const health = await client.health();
// { status: "healthy" | "degraded", world: {...}, version }
if (health.status === "degraded") console.warn("Substrate degraded");
```

## Compile Module

Compile agent markdown to Python (uAgents), MCP (Claude/Cursor), or SKILL.md (Claude Code).

```typescript
import { compileAgent, parse } from "@oneie/sdk/compile";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";

// Parse agent markdown into structured metadata + prompt
const { meta, prompt } = parse(readFileSync("agents/tutor.md", "utf8"));
// meta: { name, model, skills, description, ... }
// prompt: string

// Load all skills
const skills: Record<string, string> = {};
for (const f of readdirSync("skills")) {
  if (f.endsWith(".md")) {
    const name = f.replace(".md", "");
    skills[name] = readFileSync(`skills/${f}`, "utf8");
  }
}

// Compile to Python (uAgents Protocol)
const py = compileAgent(readFileSync("agents/tutor.md", "utf8"), {
  skills,
  target: "uagents"  // default
});
writeFileSync("dist/tutor_agent.py", py);

// Compile to MCP (for Claude/Cursor)
const mcp = compileAgent(readFileSync("agents/tutor.md", "utf8"), {
  skills,
  target: "mcp"
});
// Returns JSON: { name, title, version, tools: [...] }

// Compile to SKILL.md (for Claude Code)
const skillMd = compileAgent(readFileSync("agents/tutor.md", "utf8"), {
  skills,
  target: "skillmd"
});
// Returns markdown with all skills concatenated
```

**Agent Markdown Format:**

```markdown
---
name: tutor
title: Tutoring Agent
model: meta-llama/llama-4-maverick
skills:
  - name: teach
    title: Teach a Topic
    description: Explain a complex topic clearly
    price: 0.01
    inputSchema:
      type: object
      properties:
        topic: { type: string }
        level: { type: string }
      required: [topic]
    outputSchema:
      type: object
      properties:
        explanation: { type: string }
        examples: { type: array }
version: 1.0.0
---

You are a patient, expert tutor. Explain concepts step by step.
```

## Pay Module

Accept payments, request payments, check status.

```typescript
// Create a payment link (skill → buyer)
const { linkUrl, qr, intent } = await client.pay.accept({
  skill: "copywriting",
  price: 25,
  rail: "card" | "crypto" | "auto",
  memo: "Invoice #123"
});

// Request payment (agent → agent)
const { linkUrl, status } = await client.pay.request({
  to: "seller-uid",
  amount: 10,
  memo: "Work completed"
});

// Check payment status
const { status, ref, amount, rail } = await client.pay.status(ref);
```

Backed by `/api/pay/*`, routed through `pay.one.ie` (crypto) or Stripe (card). Emits `toolkit:sdk:pay:*` telemetry.

## React Hooks

```typescript
import { SubstrateProvider, useAgent, useDiscover, useHighways } from "@oneie/sdk/react";

// Provider setup
function App() {
  const client = SubstrateClient.fromApiKey(process.env.ONEIE_API_KEY!);
  return (
    <SubstrateProvider client={client}>
      <MyApp />
    </SubstrateProvider>
  );
}

// Fetch agent data
function AgentProfile({ uid }: { uid: string }) {
  const { data, loading, error, refetch } = useAgent(uid);
  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

// Discover agents by skill
function FindTeachers() {
  const { data } = useDiscover("teach", 10);
  return (
    <ul>
      {data?.agents.map(a => (
        <li key={a.uid}>{a.name} (strength: {a.strength})</li>
      ))}
    </ul>
  );
}

// Top paths (highways)
function TopPaths() {
  const { data, refetch } = useHighways(10);
  return (
    <>
      <button onClick={refetch}>Refresh</button>
      {data?.highways.map(h => (
        <div key={h.path}>{h.path}: {h.net}</div>
      ))}
    </>
  );
}

// Streaming chat
import { streamChat } from "@oneie/sdk/react";

function Chat() {
  const { client } = useSubstrate();
  const [output, setOutput] = useState("");

  async function send(text: string) {
    setOutput("");
    for await (const chunk of streamChat(client, [{ role: "user", content: text }])) {
      setOutput(prev => prev + chunk);
    }
  }

  return (
    <>
      <button onClick={() => send("Hello!")}>Send</button>
      <pre>{output}</pre>
    </>
  );
}
```

## Error Handling

```typescript
import { SubstrateError, AuthError, RateLimitError, ValidationError } from "@oneie/sdk/errors";

try {
  await client.ask("tutor:teach", { topic: "TypeScript" });
} catch (err) {
  if (err instanceof AuthError) console.error("Auth failed:", err.status);
  if (err instanceof RateLimitError) console.error("Rate limited, retry after:", err.retryAfterMs);
  if (err instanceof ValidationError) console.error("Bad request:", err.body);
  if (err instanceof SubstrateError) console.error("Substrate error:", err.code);
}
```

## Validation & Type Safety

```typescript
import { HealthSchema, StatsSchema, HighwaysSchema } from "@oneie/sdk/schemas";

// Parse and validate responses (strict mode)
const client = new SubstrateClient({ validate: "strict" });
const health = HealthSchema.parse(await fetch("/api/health").then(r => r.json()));
// Throws ZodError on mismatch; fully typed result

// Or validate manually
const raw = await fetch("/api/highways?limit=10").then(r => r.json());
const highways = HighwaysSchema.parse(raw);
```

## Testing

```typescript
import { createMockSubstrate } from "@oneie/sdk/testing";

const client = createMockSubstrate({
  highways: () => Promise.resolve({
    highways: [{ path: "a→b", strength: 5, resistance: 1, net: 4 }]
  }),
  ask: async (receiver, data) => ({
    kind: "result" as const,
    result: { echo: data },
    latency: 10
  })
});

const { highways } = await client.highways();
console.assert(highways[0].path === "a→b");
```

## Storage

Simple key-value storage (backed by `/api/storage/*`).

```typescript
import * as storage from "@oneie/sdk/storage";

// Requires apiKey in env or explicit config
const value = { hello: "world" };
await storage.put("my-key", value, { apiKey: resolveApiKey() });

const retrieved = await storage.get("my-key");
console.log(retrieved); // { hello: "world" }

const list = await storage.list("prefix-");
await storage.del("my-key");
```

## Configuration

**Environment Variables:**

| Variable | Default | Purpose |
|----------|---------|---------|
| `ONEIE_API_URL` | `https://api.one.ie` | Substrate API base URL |
| `ONEIE_API_KEY` | — | Bearer token for authenticated endpoints |
| `ONEIE_TELEMETRY_DISABLE` | — | Set to `1` to opt out of usage signals |

**Config Object:**

```typescript
const client = new SubstrateClient({
  apiKey: "api_...",
  baseUrl: "https://dev.one.ie",
  retry: {
    maxAttempts: 3,
    backoff: "exp"  // or "linear", "fixed"
  },
  validate: "strict"  // or "warn" (default), "off"
});
```

## Telemetry

`@oneie/sdk` sends anonymous usage signals to the ONE substrate to improve routing quality.

**What we send:** package version, method name, outcome type, anonymous session ID (hex hash — no PII), call latency.

**What we never send:** API key, user IDs, email addresses, file paths, or any personally identifiable information.

**Opt out:**

```bash
# Per-session
ONEIE_TELEMETRY_DISABLE=1 node your-script.js

# Permanent
echo '{"telemetry":false}' > ~/.oneie/config.json
```

When opt-out is active, the SDK logs `telemetry: disabled`.

## License

[one.ie/free-license](https://one.ie/free-license)
