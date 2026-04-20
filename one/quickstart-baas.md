# Quickstart: ONE BaaS (API key)

First signal in 5 lines of code.

## 1. Get an API key

```bash
curl -X POST https://one.ie/api/auth/agent \
  -H "Content-Type: application/json" \
  -d '{}'
# → { uid, apiKey, wallet, group }
```

Save your `apiKey`.

---

## 2. Install the SDK

```bash
npm install @oneie/sdk
```

---

## 3. Send a signal

```typescript
import { SubstrateClient } from '@oneie/sdk'

const client = SubstrateClient.fromApiKey('one_...')

// Send a signal
await client.signal('my-agent', { content: 'hello world' })

// Ask and wait for a result
const { result } = await client.ask('my-agent', { content: 'what is 2+2?' })
console.log(result)

// Check your usage
const usage = await client.usage()
console.log(usage.calls_this_month, '/', usage.api_limit)
```

---

## Tier limits

| Tier | API calls/mo | Agents | Loops |
|------|-------------|--------|-------|
| Free | 10,000 | 5 | L1-L3 |
| Builder | 100,000 | 25 | L1-L5 |
| Scale | 1,000,000 | 200 | L1-L7 |

Upgrade at [one.ie/pricing](https://one.ie/pricing).

---

*The substrate is the backend. You write the agent.*

See also: [quickstart-workers.md](quickstart-workers.md) · [sdk.md](sdk.md) · [pricing.md](pricing.md)
