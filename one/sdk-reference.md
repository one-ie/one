---
title: "@oneie/sdk reference"
type: reference
version: 0.1.0
---

# `@oneie/sdk` Reference

Conceptual overview: [sdk.md](one/sdk.md). This doc is the surface API.

**Install:** `npm install @oneie/sdk`
**Zero runtime deps** · dual ESM/CJS ready (ESM built now, CJS in next minor).

**Platform-agnostic.** The SDK works from anywhere that can make HTTP calls —
Vercel, AWS Lambda, CF Pages, mobile apps, Python (via HTTP), CLI scripts.
It talks to `api.one.ie` (or your own gateway). No Cloudflare required.

**BaaS model:** ONE provides the backend (136 API endpoints, routing, memory,
learning, commerce). The SDK is the client. See [pricing.md](pricing.md) for tiers
and [infra-models.md](infra-models.md) for deployment options (BaaS / CF Pages / Managed).

---

## Exports

```ts
import {
  // Types
  OneSdkError,
  type SdkConfig,
  type Outcome,
  // URL resolution
  getApiUrl, getFrontendUrl, getEnvironment,
  resolveApiKey, resolveBaseUrl,
  PROD_API_URL, DEV_API_URL, PROD_FRONTEND_URL, DEV_FRONTEND_URL,
  // Namespaces
  storage,
  // Handoff
  validateEthAddress, generateDeployLink,
  // Launch (agent-launch handoff)
  launchToken,
  type LaunchOpts, type LaunchResult,
  // Version
  SDK_VERSION,
} from '@oneie/sdk'
```

---

## URLs

```ts
getApiUrl()        // process.env.ONEIE_API_URL → prod/dev default
getFrontendUrl()   // process.env.ONEIE_FRONTEND_URL → prod/dev default
getEnvironment()   // 'dev' | 'production'
```

## Storage (`sdk.storage.*`)

Proxies `/api/storage/:uid[/:key]`.

```ts
await storage.listStorage(uid, apiKey?)     // → StorageEntry[]
await storage.getStorage(uid, key, apiKey?) // → string | null
await storage.putStorage(uid, key, value, apiKey?)
await storage.deleteStorage(uid, key, apiKey?)
```

## Handoff helpers

```ts
validateEthAddress('0x…')                       // throws on bad address
generateDeployLink(agentUid, baseUrl?)          // → `${baseUrl}/deploy/${uid}`
```

## Launch

```ts
const res = await launchToken('agent-uid', {
  chain: 'sui',       // default 'sui'
  dryRun: true,       // sandbox mode
  agentLaunchUrl: 'https://agent-launch.ai/api',
  apiKey: process.env.AGENT_LAUNCH_KEY,
})
// res: { tokenId, address?, chain, dryRun, raw }
```

Posts to `${agentLaunchUrl}/v1/tokens`, then emits a best-effort `token-launched` signal into the substrate at `/api/signal`.

---

## See Also

- [sdk.md](one/sdk.md) — the conceptual "why"
- [cli-reference.md](cli-reference.md) — `oneie` CLI surface
- [launch-handoff.md](launch-handoff.md) — the launch contract
