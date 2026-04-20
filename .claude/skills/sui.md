# Sui Move Skill

Build secure, production-ready Move contracts for the ONE substrate and agent ecosystem.

**Status:** Phase 1 (testnet) ✅ · Phase 2 (identity & wallets) ✅ shipped 2026-04-18 · Phase 3 (escrow) scaffolding shipped, W3-W4 ready per `docs/TODO-SUI.md`. Phase 4-6 next.

**Package versions (locked):** `@mysten/sui@^2.16.0`, `@mysten/dapp-kit@^1.0.4`. SDK is **v2** — imports are NOT backward-compatible with v1. See "SDK Imports (Sui v2)" below before writing any Sui code.

## What This Skill Does

- **Generate Move modules** — scaffolding, best practices, gas optimization
- **Agent wallet integration** — keypair derivation, signing, address generation (Sui + ONE)
- **Envelope contracts** — payment channels, multi-sig, conditional execution
- **TypeDB ↔ Sui sync** — contract state ↔ substrate knowledge (paths, units, skills) via `bridge.ts`
- **Testing & deployment** — Move test suites, devnet/testnet/mainnet
- **ONE patterns** — pheromone trails as contract state, agent reputation on-chain

## Phases (from docs/TODO-SUI.md)

| Phase | What | Status |
|-------|------|--------|
| 1 | Testnet, contract publish, protocol funded | ✅ DONE |
| 2 | Deterministic keypair derivation, agent identity, `syncAgentWithIdentity()` | ✅ DONE (2026-04-18) |
| 3 | Escrow (`createEscrow/releaseEscrow/cancelEscrow`), x402 settlement, treasury fee 50 bps | 🟡 Scaffolding shipped in `sui.ts`; W3-W4 wiring next |
| 4 | On-chain fade, harden highways, frozen Path objects | 📋 Next |
| 5 | Group economics, treasury, federation | 📋 Next |
| 6 | Mainnet, audit, SDK, multi-chain | 📋 Next |

## When to Use

- Writing Move smart contracts for ONE agents or payment flows (Phase 2-6)
- Generating agent wallets and keypairs from substrate identity (Phase 2)
- Syncing on-chain state back to TypeDB (via `src/engine/bridge.ts` absorb loop)
- Building envelope payment channels or multi-agent coordination contracts (Phase 3)
- Deploying to Sui (devnet, testnet, mainnet)
- Auditing Move code for security, gas, or ONE patterns

## Core Components (What's Built)

| File | Lines | What |
|------|------:|------|
| `src/move/one/sources/one.move` | 691 | Move contract: Unit, Signal, Path, Escrow, fade, harden |
| `src/lib/sui.ts` | 652 | Sui client: Six Verbs + escrow + wallet derivation + faucet |
| `src/engine/bridge.ts` | 479 | Mirror/absorb: Runtime ↔ Sui ↔ TypeDB sync |
| `src/schema/world.tql` | — | `sui-unit-id`, `sui-path-id`, `wallet` attributes on unit/path |
| `src/engine/persist.ts` | — | Auto-mirror on mark/warn/actor |

**Exported API surface (from `src/lib/sui.ts` — read before reinventing):**

| Category | Functions |
|----------|-----------|
| Client | `getClient()` — returns cached `SuiJsonRpcClient` |
| Wallet | `deriveKeypair(uid)`, `addressFor(uid)`, `platformKeypair()`, `signAndExecute()` |
| Units | `createUnit()`, `registerTask()`, `getOwnedUnits()`, `getObject()`, `resolveUnit(uid)` |
| Paths (Six Verbs) | `mark()`, `warn()`, `send()`, `consume()`, `pay()`, `createPath()`, `harden()` |
| Escrow | `createEscrow()`, `releaseEscrow()`, `cancelEscrow()`, `viewEscrow()` + `*Tx()` builders |
| Ops | `ensureFunded()` (faucet) |

**Testnet Package:** `0xa5e6bddae833220f58546ea4d2932a2673208af14a52bb25c4a603492078a09e`  
**Protocol Object:** `SUI_PROTOCOL_ID` (treasury, fee_bps = 50 → 0.5%)

---

## SDK Imports (Sui v2) — LOCKED

The SDK is v2 since commit `74c15a0`. The JSON-RPC client moved out of `/client` and was renamed. **The v1 imports silently survive editor autocomplete from stale docs — they do not exist at runtime.** Vite throws `does not provide an export named 'SuiClient'` and cascades up through `src/pages/api/signal.ts`, taking down every page that routes a UI click.

### Rename map (v1 → v2)

| v1 (removed)                              | v2 (use this)                                         |
|-------------------------------------------|-------------------------------------------------------|
| `SuiClient` from `@mysten/sui/client`       | `SuiJsonRpcClient` from `@mysten/sui/jsonRpc`           |
| `getFullnodeUrl` from `@mysten/sui/client`  | `getJsonRpcFullnodeUrl` from `@mysten/sui/jsonRpc`      |
| `SuiClientOptions`                          | `SuiJsonRpcClientOptions`                               |
| `SuiHTTPTransport`                          | `JsonRpcHTTPTransport`                                  |
| `isSuiClient`                               | `isSuiJsonRpcClient`                                    |
| `SuiTransactionBlockResponse` (either path) | Same name, now also exported from `/jsonRpc`            |
| `SuiClientProvider` (dapp-kit)              | **Same name — unchanged.** dapp-kit 1.0.4+ already uses v2 types internally |

Migration guide: `node_modules/@mysten/sui/docs/migrations/sui-2.0/sui.md`.

### Constructor now requires `network`

```ts
// WRONG (v1 — crashes with type error in v2)
const client = new SuiClient({ url: getFullnodeUrl('testnet') })

// RIGHT (v2)
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc'
const client = new SuiJsonRpcClient({
  url: getJsonRpcFullnodeUrl('testnet'),
  network: 'testnet',  // REQUIRED — used by MVR resolver and future multi-network tooling
})
```

Same applies to every `NetworkConfig` entry passed to `createNetworkConfig({...})` in dapp-kit — each entry must include `network: 'testnet'` (or 'mainnet'/'devnet'/'localnet') alongside `url`.

### Use `@/lib/sui`, not the raw SDK

If you find yourself importing directly from `@mysten/sui/jsonRpc` outside `src/lib/sui.ts` or `src/components/pay/PayPage.tsx`, you are probably reinventing something. `getClient()` in `src/lib/sui.ts` returns the singleton; every Six-Verb function (`mark`, `warn`, `send`, `pay`, etc.) already exists. Two legitimate exceptions:
- `PayPage.tsx` — needs `getJsonRpcFullnodeUrl` for the dapp-kit `createNetworkConfig` call
- New contract tooling that reads types like `SuiTransactionBlockResponse`

### Defensive pattern: lazy-import `@/lib/sui` from hot routes

`src/pages/api/signal.ts` (applied 2026-04-18) imports `@/lib/sui` **dynamically inside the Sui-mirror try block** rather than at module scope:

```ts
// Top of signal.ts: no @/lib/sui import

// Inside the POST handler, after TypeDB write:
try {
  const { resolveUnit, send: suiSend } = await import('@/lib/sui')
  // ...Sui mirror...
} catch {
  // Sui not configured, SDK broken, or tx failed — TypeDB signal still recorded
}
```

**Why:** `/api/signal` is imported transitively by every page that routes a UI click. A top-level `import { ... } from '@/lib/sui'` means any Sui SDK type break bricks the entire API route (and thus every dependent page). Lazy import contains the blast radius to just the mirror step. Apply this same pattern to any other hot route that touches Sui only as fire-and-forget.

---

## Works With /typedb — The Same Ontology, Two Deterministic Fires

`src/schema/sui.tql:1` already put it best: **"The same ontology. Two deterministic fires."** Move is the permanent, economic fire (path revenue, escrow, treasury — expensive to write, cheap to trust). TypeDB is the learning, classification fire (hypotheses, frontiers, tags — cheap to write, rich to query). The runtime is the fast nervous system between them. Both skills speak the same vocabulary by design — `strength`, `resistance`, `revenue`, `path`, `unit` — so the bridge is a **1:1 rename, not a translation**.

### Canonical crosswalk

`src/schema/sui.tql` (336 lines) is the Rosetta Stone — every Move struct has a matching TQL entity, every Move function has a matching TQL `fun`. Read it when names or shapes drift. The runtime schema is `src/schema/world.tql`; `sui.tql` is the parallel declaration that proves the two layers agree.

### Attribute mapping (Move struct ⇌ TypeDB attribute)

| Move field (`one.move`)         | TQL attribute (`world.tql`)    | Move type   | TQL type | Direction                     |
|---------------------------------|--------------------------------|-------------|----------|-------------------------------|
| `Unit.id` (address)             | `unit.sui-unit-id`             | address     | string   | Sui → TQL on `mirrorActor()`  |
| *derived by* `addressFor(uid)`  | `unit.wallet`                  | address     | string   | Runtime → TQL on agent sync   |
| `Unit.name`                     | `unit.name`                    | String      | string   | bidirectional                 |
| `Unit.balance`                  | `unit.balance`                 | u64         | double   | Sui → TQL via `absorb()`      |
| **`Path.strength`**             | **`path.strength`**            | u64         | double   | bidirectional — load-bearing  |
| **`Path.resistance`**           | **`path.resistance`**          | u64         | double   | bidirectional — load-bearing  |
| `Path.revenue`                  | `path.revenue`                 | u64         | double   | Sui → TQL via `absorb()`      |
| `Path.id` (address)             | `path.sui-path-id`             | address     | string   | Sui → TQL on mirror           |
| `Highway.id` (address)          | `path.sui-highway-id`          | address     | string   | Sui → TQL on `mirrorHarden()` |
| `Signal.payload` (vector<u8>)   | `signal.data`                  | bytes       | string   | one-way, usually TQL-only     |

**Name drift to know about:** Move still has `struct Colony` (one.move:71). TypeDB moved to `entity group` per `docs/dictionary.md`, but the Move contract hasn't been migrated yet because that requires a package upgrade. When bridging, read Move `Colony` → TQL `group`.

**Load-bearing invariant:** `strength` and `resistance` share the same name in both layers. If you rename one, rename both — `bridge.ts` is a pass-through, there's no translation logic. Type-width (`u64` ↔ `double`) is handled by JSON serialization at the bridge; don't write logic that depends on sub-integer precision.

### Bridge contract (`src/engine/bridge.ts`, 479 lines)

| Function                          | Fires when                  | Maps                                                                   |
|-----------------------------------|-----------------------------|------------------------------------------------------------------------|
| `mirrorMark(from, to, amount?)`   | every `persist.mark()`       | Runtime strength++ → Sui `mark_path()`                                   |
| `mirrorWarn(from, to, amount?)`   | every `persist.warn()`       | Runtime resistance++ → Sui `warn_path()`                                 |
| `mirrorPay(from, to, amount)`     | L4 payment signal            | Runtime payment → Sui `pay()` → `Path.revenue +=`                        |
| `mirrorHarden(from, to)`          | L6 highway promotion         | TQL harden → Sui `harden_path()` → Highway object created                |
| `mirrorActor(uid, name)`          | `/api/agents/register`       | `addressFor(uid)` + `createUnit()` → writes `wallet` + `sui-unit-id` back |
| `resolve(uid)`                    | before any outbound Sui call | TQL lookup → `{ wallet, unitId }` — no on-chain twin? dissolve           |
| `resolvePath(from, to)`           | on-chain path ops            | TQL `sui-path-id` lookup — memoized via edge cache                       |
| `absorb(cursor?)`                 | `/api/absorb` cron (1 min)   | Sui events → TQL writes: UnitCreated, Marked, Warned, Paid, Hardened     |
| `settleEscrow(...)` *(Phase 3)*   | `releaseEscrow()` succeeds   | on-chain settlement → TQL `path.revenue` + `path.strength` mark          |

**Guarantee:** `mirror*` functions are fire-and-forget. They never block the TypeDB write or the runtime signal loop. If Sui is down, TypeDB still learns; pheromone re-converges when `absorb()` catches up.

### When to load /typedb alongside this skill

- Writing or reading any attribute prefixed with `sui-*` in TQL
- Querying `unit.wallet` — the value comes from `addressFor(uid)` in `src/lib/sui.ts`, not stored by default
- Editing `src/engine/bridge.ts` — every function there touches both worlds
- Adding a TQL entity that has a Move twin — name alignment is a maintenance contract

## Capabilities

### 1. Mirror to Sui (mark/warn auto-propagate)

```typescript
// From src/engine/bridge.ts
mirrorMark(from, to, strength)     // Runtime → Sui: fire-and-forget
mirrorWarn(from, to, strength)     // Runtime → Sui: fire-and-forget
```

- Called automatically by `persist.ts` on every `mark()` or `warn()`
- Creates Signal object on-chain, fires Marked event
- Zero latency (async, doesn't block signal loop)
- Graceful fallback (Sui down? Signal completes anyway)

### 2. Absorb from Sui (events → TypeDB)

```typescript
// /api/absorb { cursor? }
absorb(cursor?)                    // Sui → TypeDB: poll events, write state
```

- Polls on-chain events (Marked, UnitCreated, SignalSent)
- Writes back to TypeDB (strength updates, new units)
- Cursor-based pagination (resume from last event)
- Runs every 1 min via `/grow` tick

**Events queryable:**
```typescript
queryEvents()  // Returns all events since genesis
getPath(from, to)  // Resolve TypeDB unit ↔ Sui path
```

### 3. Agent Wallet Derivation (Phase 2 — shipped)

```typescript
// From src/lib/sui.ts (shipped 2026-04-18)
addressFor(uid)          // UID → stable Sui address (Promise<string>)
deriveKeypair(uid)       // UID → Ed25519 keypair (Promise<Ed25519Keypair>)
                         // Seed read from SUI_SEED env, never passed as arg
```

- Deterministic: same `SUI_SEED + uid` → same SHA-256 secret → same keypair, always
- No private key storage: derives on-the-fly per call
- `syncAgentWithIdentity()` in `src/engine/agent-md.ts` wires wallet into TypeDB unit on markdown sync
- Multi-chain-ready (same pattern could emit Ethereum/Solana addresses)

### 4. Payment Flow (Phase 3: escrow)

```move
// Move contract functions (one.move)
create_escrow(unit, receiver, amount)  // Lock tokens, await settlement
release_escrow(escrow, result?)        // Success: pay + mark + fee (atomic)
cancel_escrow(escrow)                  // Timeout: return tokens, warn path
```

- Atomic: fee + mark + transfer in single transaction
- Revenue: protocol collects `fee_bps` (50 = 0.5%)
- Idempotent: releasing same escrow twice fails safely
- Enables x402 workflow (402 → create escrow → execute → release)

### 5. Path Strength on-Chain (permanent learning)

```move
// Every path is a Sui object with:
Path {
  from: address,
  to: address,
  strength: u64,      // Marked increments
  resistance: u64,    // Warned increments
  hits: u64,          // Total signals
  type: String,       // "interaction", "payment", etc.
}
```

- Strength = gas rewards (proportional to agent value)
- Resistance = slashing (accumulates from failures)
- Toxic when: `resistance >= 10 && resistance > 2x strength && (r+s) > 5`
- Read by `/api/highways` → mirrors to TypeDB → guides future signals

## Phase 2 — Shipped (2026-04-18)

Already exported from `src/lib/sui.ts`. **Do not reimplement.**

```typescript
import { deriveKeypair, addressFor, platformKeypair } from '@/lib/sui'

// Deterministic Ed25519 keypair from SUI_SEED + uid (SHA-256 → 32-byte secret)
const kp = await deriveKeypair('marketing:creative')
const addr = await addressFor('marketing:creative')   // stable forever

// Integrated into agent sync: syncAgentWithIdentity() in src/engine/agent-md.ts
// writes `wallet` attribute to TypeDB unit on markdown → TypeDB sync
```

**Verified:** 14 tests pass — determinism + uniqueness + idempotency. Unblocks Phase 3 (escrow on-chain) and marketplace on-chain discovery. Browser-side wallet connect uses `@mysten/dapp-kit` `ConnectButton` + `WalletProvider` (see `src/components/pay/PayPage.tsx`).

## Phase 3 — Escrow (W3-W4 ready)

Transaction builders and high-level wrappers already in `src/lib/sui.ts`:

```typescript
import { createEscrow, releaseEscrow, cancelEscrow, viewEscrow } from '@/lib/sui'

// Poster locks tokens
const { escrowId } = await createEscrow(posterUid, workerUnitId, amountMist, pathId)

// Worker settles (atomic: pay + mark + protocol fee)
await releaseEscrow(posterUid, escrowId, workerUnitId, pathId)

// Timeout path
await cancelEscrow(posterUid, escrowId, posterUnitId, pathId)

// Read current state
const view: EscrowView | null = await viewEscrow(escrowId)
```

Protocol fee: **50 bps (0.5%)** collected to treasury on every `releaseEscrow`. W3 wires the UI side (claim button → `ui:chat:claim` signal); W4 adds deterministic sandwich gates (isToxic → skip escrow creation).

## Real Examples (from Testnet)

### Agent Created on-Chain

```typescript
// Scout was created with this call:
const unitId = await createUnit("scout", "agent")
// Sui object ID: 0x6fd45656222db69f81dbf61c70873fd466ebd8b157bf6694f81314e3e0c13af8
// TypeDB marked: sui-unit-id = "0x6fd4..."
```

### Signal Sent & Path Created

```typescript
// Signal from scout → analyst using the exported `send` wrapper
import { send } from '@/lib/sui'
const { digest } = await send(
  'scout',               // sender uid (keypair derived)
  scoutUnit.objectId,
  analystUnit.objectId,
  analystUnit.wallet,
  'default',             // task type
  new TextEncoder().encode('hello from scout'),
  0,                     // amount in MIST (0 = no payment attached)
)
// Sui Signal object created; Path (scout → analyst) strength += 1
// Absorb loop reads the event and writes strength delta back to TypeDB
```

*(The Phase 3 escrow example is in the "Phase 3 — Escrow (W3-W4 ready)" section above with the accurate 4-arg signature — don't duplicate it here.)*

## Safety (Deterministic Sandwich)

```
PRE:   isToxic(edge)?  → skip contract call (no Sui interaction)
PRE:   capability exists? → TypeDB lookup → skip if missing
LLM:   (if applicable) generates response
POST:  success? → mark(). timeout? → neutral. dissolved? → warn(0.5).
```

- **No private keys in code** — use `$SUI_SEED` environment variable (derives on-the-fly)
- **Pre-flight checks** — isToxic(), capability exists? before contract call (prevents wasted gas)
- **Gas limits** — escrow functions must settle within gas budget
- **Auditability** — all math is deterministic; randomness only from LLM prompts

## Env & Setup

```bash
# .env (required for Phase 2+)
SUI_NETWORK=testnet
SUI_SEED=<32 bytes base64>  # Generates all agent keypairs

SUI_PACKAGE_ID=0xa5e6...  # Published contract package
SUI_PROTOCOL_ID=0x...     # Protocol object (treasury, fee_bps)

# Verify setup
sui client object $SUI_PROTOCOL_ID
# Output: Protocol { treasury: 0, fee_bps: 50 }
```

## When This Skill Is Invoked

The `/sui` skill is a reading guide, not a CLI. When loaded, Claude should:

1. **Before writing any Sui code**, re-read "SDK Imports (Sui v2)" above — the v1 patterns in `node_modules/@mysten/sui/docs/migrations/sui-2.0/sui.md` have been removed from the SDK but linger in every older doc, blog post, and Anthropic-era training snapshot. Autocomplete will suggest them. **Do not use them.**
2. **Before adding a function to `@/lib/sui`**, check the "Exported API surface" table above. The Six Verbs plus escrow are already there; new work should compose them.
3. **Before importing from `@mysten/sui/jsonRpc` directly**, check whether `getClient()` + an existing wrapper already covers the use case. The only legitimate direct importers are `src/lib/sui.ts` and `src/components/pay/PayPage.tsx`.
4. **Before adding a top-level Sui import to any API route**, consider the lazy-import defense: if the route handles Sui as fire-and-forget (like `/api/signal`), `await import('@/lib/sui')` inside the relevant try block keeps the route resilient to SDK breakage.
5. **For contract work**, read `src/move/one/sources/one.move` — all 691 lines define six object types (Unit, Signal, Path, Escrow, Highway, Treasury) and the six on-chain verbs. New Move should fit this surface, not grow a parallel one.

## Reference

- **Live contract:** `src/move/one/sources/one.move`
- **Client API:** `src/lib/sui.ts` (always use this, never the raw SDK)
- **Bridge:** `src/engine/bridge.ts` (mirror/absorb/resolve)
- **Integration point:** `src/engine/persist.ts` (auto-mirror on mark/warn)
- **Schema:** `src/schema/world.tql` (sui-unit-id, sui-path-id, wallet attributes)
- **Testnet explorer:** `https://suiscan.xyz/testnet/object/{OBJECT_ID}`
- **Full roadmap:** `docs/TODO-SUI.md` (phases 1-6, all tasks)
- **v2 migration guide:** `node_modules/@mysten/sui/docs/migrations/sui-2.0/sui.md`
- **dapp-kit reference:** `node_modules/@mysten/dapp-kit/docs/sui-client-provider.md`

---

**ONE + Sui = agent wallets, envelope routing, pheromone as on-chain rewards, and deterministic contract security.**
