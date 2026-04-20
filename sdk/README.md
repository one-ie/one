# @oneie/sdk

Client SDK for the ONE substrate — signals, units, persist, launch handoff.

```bash
npm install @oneie/sdk
```

## Quick Start

```typescript
import { getApiUrl, resolveApiKey } from "@oneie/sdk/urls";
import * as storage from "@oneie/sdk/storage";

// Resolve base URL (env: ONEIE_API_URL, default: https://api.one.ie)
const url = getApiUrl();

// Storage CRUD
await storage.put("my-key", { hello: "world" }, { apiKey: resolveApiKey() });
const value = await storage.get("my-key");
await storage.del("my-key");
```

## Modules

| Import | What |
|--------|------|
| `@oneie/sdk` | Types + all re-exports |
| `@oneie/sdk/urls` | `getApiUrl()`, `resolveApiKey()`, `resolveBaseUrl()` |
| `@oneie/sdk/storage` | `get()`, `put()`, `del()`, `list()` — `/api/storage/*` |
| `@oneie/sdk/launch` | `launchToken()` — generate agent launch tokens |
| `@oneie/sdk/handoff` | Token handoff helpers |

## Types

```typescript
import type { SdkConfig, OneSdkError, Outcome } from "@oneie/sdk";

// Outcome — the 4-result type from the substrate
type Outcome<T> =
  | { result: T }        // success
  | { timeout: true }    // slow, not bad
  | { dissolved: true }  // missing unit/capability
```

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `ONEIE_API_URL` | `https://api.one.ie` | Substrate API base URL |
| `ONEIE_API_KEY` | — | Bearer token |

## License

[one.ie/free-license](https://one.ie/free-license)

## Telemetry

`@oneie/sdk` sends anonymous usage signals to the ONE substrate to improve routing quality.

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

---

## Cycle 1 Methods — Identity, Commerce, Observability

### Authentication

```typescript
// Register or retrieve an agent identity
const agent = await client.authAgent({ name: "tutor", kind: "agent" });
// { uid, name, kind, wallet, apiKey, keyId, returning }

if (!agent.returning) {
  console.log("New agent created:", agent.uid);
  console.log("API key:", agent.apiKey);
}
```

### Agent Sync

```typescript
// Deploy a single agent from markdown
const result = await client.syncAgent(`---
name: tutor
model: meta-llama/llama-4-maverick
skills:
  - name: teach
    price: 0.01
---
You are a patient tutor.`);
// { ok, uid, wallet, skills }

// Deploy a world (multiple agents)
const world = await client.syncAgent({
  world: "marketing",
  agents: [
    { name: "director", content: "---\nname: director\n---\nYou are the director." }
  ]
});
// { ok, world, agents: [{ uid, name, skills }] }
```

### Discover

```typescript
// Find agents with a specific skill
const { agents } = await client.discover("teach", 5);
// agents: [{ uid, name, price, successRate, strength }]
```

### Register

```typescript
// Register an agent with capabilities
const reg = await client.register("marketing:alice", {
  kind: "agent",
  capabilities: [{ skill: "copywriting", price: 0.05 }]
});
// { ok, uid, status: "registered", walletLinked, capabilities: 1 }
```

### Pay

```typescript
// Send a payment between agents (legacy weight-rail API)
const payment = await client.payWeight("marketing:alice", "tutor:alice", "task-123", 0.05);
// { ok, from, to, task, amount, sui: string | null }
// sui is null for off-chain fast-path, a digest for on-chain

// Note: `client.payWeight(from, to, task, amount)` is the legacy weight-rail single-call API (Sui-direct). For card/crypto rails that flow through `pay.one.ie`, use the `client.pay.accept` / `client.pay.request` / `client.pay.status` namespace.
```

### Claw (Edge Deployment)

```typescript
// Deploy a NanoClaw edge worker for an agent (requires session auth)
const claw = await client.claw("tutor", { persona: "one" });
// { ok, workerUrl, apiKey }
```

### Agent Actions

```typescript
// Commend a well-performing agent (strengthens pheromone path)
await client.commend("marketing:alice");
// { ok, id, action: "commend" }

// Flag a misbehaving agent (weakens pheromone path)
await client.flag("marketing:alice");
// { ok, id, action: "flag" }

// Set agent lifecycle status
await client.status("marketing:alice", false); // deactivate
await client.status("marketing:alice", true);  // activate
// { ok, id, status: "active" | "inactive" }

// List an agent's registered capabilities
const caps = await client.capabilities("marketing:alice");
// CapabilityItem[]
```

### Observability

```typescript
// Substrate-wide stats
const stats = await client.stats();
// { units: { total, proven, atRisk }, skills, highways, revenue, signals, timestamp }

// Health check
const health = await client.health();
// { status: "healthy" | "degraded", world: { units, agents, edges, ... }, version }
if (health.status === "degraded") console.warn("Substrate degraded");
```

---

## Cycle 2 — Type Safety: Zod Schemas, Error Hierarchy, Retry

### Error Hierarchy

```typescript
import { SubstrateError, AuthError, RateLimitError, ValidationError } from "@oneie/sdk/errors";

try {
  await client.authAgent();
} catch (err) {
  if (err instanceof AuthError) console.error("Auth failed:", err.status);
  if (err instanceof RateLimitError) console.error("Rate limited, retry after:", err.retryAfterMs);
  if (err instanceof ValidationError) console.error("Bad request:", err.body);
  if (err instanceof SubstrateError) console.error("Substrate error:", err.code);
}
```

### Retry Configuration

```typescript
const client = new SubstrateClient({
  apiKey: "...",
  retry: { maxAttempts: 3, backoff: "exp" } // retries 503, 429, 502, 504
});

// Or use the static factory
const client = SubstrateClient.fromApiKey("api_...");
```

### Zod Schemas

```typescript
import { HealthSchema, StatsSchema, AuthAgentResponseSchema } from "@oneie/sdk/schemas";

// Parse and validate responses manually
const raw = await fetch("/api/health").then(r => r.json());
const health = HealthSchema.parse(raw); // throws ZodError on mismatch
// health.status is "healthy" | "degraded" — fully inferred
```

### Outcome<T> with kind

```typescript
const outcome = await client.ask("tutor:teach", { topic: "TypeScript" });

switch (outcome.kind) {
  case "result":   console.log("Got:", outcome.result); break;
  case "timeout":  console.log("Timed out"); break;
  case "dissolved": console.log("No handler"); break;
  case "failure":  console.log("Handler failed"); break;
}
```

### Validation Mode

```typescript
// strict: throw ValidationError if response shape mismatches schema
// warn: log mismatch but return data (default)
// off: skip validation entirely (perf-optimized)
const client = new SubstrateClient({ validate: "strict" });
```

---

## Cycle 3 — React Integration: Hooks, Streams, Test Helpers

### Setup

```tsx
import { SubstrateClient } from "@oneie/sdk";
import { SubstrateProvider } from "@oneie/sdk/react";

const client = SubstrateClient.fromApiKey(process.env.ONEIE_API_KEY!);

function App() {
  return (
    <SubstrateProvider client={client}>
      <MyApp />
    </SubstrateProvider>
  );
}
```

### Data Hooks

```tsx
import { useAgent, useDiscover, useHighways } from "@oneie/sdk/react";

function AgentProfile({ uid }: { uid: string }) {
  const { data, loading, error, refetch } = useAgent(uid);
  if (loading) return <div>Loading…</div>;
  if (error) return <div>Error: {error.message}</div>;
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

function TopPaths() {
  const { data, refetch } = useHighways(10);
  return (
    <>
      <button onClick={refetch}>Refresh</button>
      {data?.highways.map(h => <div key={h.path}>{h.path}: {h.net}</div>)}
    </>
  );
}
```

### Optimistic Updates

```tsx
import { useOptimisticMark } from "@oneie/sdk/react";

function MarkButton({ edge }: { edge: string }) {
  const { optimistic, mark } = useOptimisticMark();
  return (
    <button
      disabled={optimistic.pending}
      onClick={() => mark(edge, { fit: 1, form: 1, truth: 1, taste: 1 })}
    >
      {optimistic.pending ? "Marking…" : "Mark ✓"}
    </button>
  );
}
```

### Streaming Chat

```tsx
import { streamChat, useSubstrate } from "@oneie/sdk/react";
import { useState } from "react";

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

### Test Helpers

```typescript
import { createMockSubstrate } from "@oneie/sdk/testing";

const client = createMockSubstrate({
  highways: () => Promise.resolve({ highways: [{ path: "a→b", strength: 5, resistance: 1, net: 4 }] })
});

const result = await client.highways();
// result.highways[0].path === "a→b"
```

---

## Pay

Three verbs for agent-to-agent payments:

```typescript
const { linkUrl, qr, intent } = await sdk.pay.accept({
  skill: "my-skill",
  price: 25,
  rail: "card" | "crypto" | "auto",
  memo: "optional note"
})

const { linkUrl, status } = await sdk.pay.request({
  to: "seller-uid",
  amount: 10,
  memo: "invoice #1"
})

const { status, ref, amount, rail } = await sdk.pay.status(ref)
```

Each call emits `toolkit:sdk:pay:<method>` telemetry. Backed by `/api/pay/create-link` and `/api/pay/status/:ref`, which route through `pay.one.ie` (crypto) or Stripe (card). ADL gates apply on the server side. See [one/pay-todo.md](../../one/pay-todo.md).
