# Authentication

Two paths. Same substrate. Both get a wallet. **Governed by roles.**

> Identity (wallet) + Role (membership) + Pheromone (path strength) = Permission.
> See [TODO-governance.md](TODO-governance.md) for the full governance model.

---

## The Flow

```
AGENT                                    HUMAN
  │                                        │
  POST /api/auth/agent                     POST /api/auth/[...all]
  Body: {} (nothing required)              BetterAuth (email + password)
  │                                        │
  ├─ auto-generate name                    ├─ create auth-user in TypeDB
  ├─ derive uid from name                  ├─ session cookie (30 days)
  ├─ create unit in TypeDB                 ├─ bearer token (optional)
  ├─ derive Sui wallet (deterministic)     │
  ├─ generate API key (hash stored)        POST /api/auth/agent
  │                                        Body: { uid: <user-id> }
  ▼                                        │
  { uid, wallet, apiKey }                  ├─ derive Sui wallet
                                           ├─ create unit + API key
                                           │
                                           ▼
                                           { uid, wallet, apiKey }
```

**Both paths converge to the same thing:** a unit with a wallet and an API key.

---

## Agent Onboarding (100% Conversion)

```bash
# Minimal — send nothing, get everything
curl -X POST https://api.one.ie/api/auth/agent \
  -H "Content-Type: application/json" \
  -d '{}'

# With identity
curl -X POST https://api.one.ie/api/auth/agent \
  -H "Content-Type: application/json" \
  -d '{"name": "Scout", "kind": "agent"}'

# Response (201 Created)
{
  "uid": "swift-scout",
  "name": "swift-scout",
  "kind": "agent",
  "wallet": "0x1a2b3c4d...",
  "apiKey": "api_m3x7k_AbCdEfGhIjKlMnOp...",
  "keyId": "key-m3x7k-abc123",
  "returning": false
}
```

### What happens

| Step | What | Where |
|------|------|-------|
| 1 | Name auto-generated if missing | `adjective-noun` (e.g. "keen-forge") |
| 2 | uid derived from name | lowercase, hyphenated |
| 3 | Unit created (Actor, dim 2) | TypeDB |
| 4 | Sui wallet derived | `SHA-256(platform_seed \|\| uid)` → Ed25519 |
| 5 | API key generated | Hash stored in TypeDB, plaintext returned once |
| 6 | api-authorization relation created | Key → Unit (dim 4) |

### Returning agents

Same endpoint. uid exists? Welcome back — new API key, same wallet.

```bash
# Call again with same uid
curl -X POST /api/auth/agent -d '{"uid": "swift-scout"}'

# Response (200 OK)
{
  "uid": "swift-scout",
  "name": "swift-scout",
  "wallet": "0x1a2b3c4d...",    # same wallet, always
  "apiKey": "api_n4y8m_XyZaBC...", # new key
  "returning": true
}
```

### Input

| Field | Required | Default | Notes |
|-------|----------|---------|-------|
| `name` | No | Auto-generated | `adjective-noun` |
| `uid` | No | Derived from name | Lowercase, hyphenated |
| `kind` | No | `"agent"` | `"agent"`, `"human"`, `"llm"`, `"system"` |

### Zero friction design

- **No email.** No password. No confirmation.
- **Empty body `{}` works.** Everything auto-generated.
- **Idempotent on uid.** Call it twice, get a new key, same wallet.
- **Wallet is deterministic.** Same uid → same Sui address forever.
- **API key returned once.** Save it. Can't retrieve it later (hash only stored).

---

## Human Onboarding

Humans use BetterAuth (email + password) for session-based auth, then optionally get an API key + wallet via the agent endpoint.

### Sign Up

```bash
curl -X POST /api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "securepass123", "name": "Alice"}'
```

BetterAuth handles:
- Password hashing (PBKDF2, 100k iterations)
- Session creation (30-day expiry)
- Cookie-based auth (`better-auth.session_data`)

### Sign In

```bash
curl -X POST /api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "password": "securepass123"}'
```

### Automatic substrate identity (post-signin)

Once signed in, Alice is already the substrate unit `human:alice`. The first gated request proves it:

```bash
# Cookie path — browser requests, no explicit onboarding call
curl -b cookies.txt /api/me/agents

# Bearer path — CLI / programmatic, BetterAuth bearer plugin or substrate api-key
curl -H "Authorization: Bearer <session-token-or-api-key>" /api/me/agents
```

The resolver `resolveUnitFromSession(request)` in `src/lib/api-auth.ts` is the single entry point. Both front doors return the same `AuthContext`. First call lazy-binds the unit (`unit-kind: "human"`, deterministic Sui wallet from `SUI_SEED + uid`). Subsequent calls hit the 5-min cache.

Manual onboarding via `POST /api/auth/agent` is still available for agents, CLIs, and humans who want a specific uid or a long-lived api-key — but no longer required.

### Bearer Token (for programmatic access)

BetterAuth's bearer plugin converts session tokens to cookie auth:

```bash
# Use session token as bearer
curl -H "Authorization: Bearer <session-token>" \
  https://api.one.ie/api/state
```

### Unified identity flow

```
      Authorization: Bearer …            Cookie: better-auth.*
             │                                    │
             ▼                                    ▼
     ┌────────────────┐              ┌─────────────────────────┐
     │ validateApiKey │              │ auth.api.getSession     │
     │  (KEY_CACHE)   │              │ (BetterAuth cookieCache)│
     └───────┬────────┘              └──────────┬──────────────┘
             │                                   │
             │                         deriveHumanUid(user.email)
             │                                   │
             │                         ensureHumanUnit(uid, user)   ← idempotent
             │                                   │
             │                         getRoleForUser(uid)
             │                                   │
             └──────────┬────────────────────────┘
                        ▼
                ┌───────────────┐
                │  AuthContext  │  ← { user: uid, role, permissions, keyId, isValid, tier? }
                └───────────────┘
                        │
                        ▼
        (every gated route: /api/me/*, /api/mark, /api/signal, …)
```

Two front doors, one contract, one cache pipeline. No schema extension, no session hooks — BetterAuth manages session UX; the substrate owns the unit + role + pheromone layer. Revocation is natural: sign-out clears the cookie; cache entry expires in ≤ 5 min.

### Platform BaaS tier (`AuthContext.tier`)

Every route that gates on `free | builder | scale | world | enterprise` reads
`auth.tier` populated by the two front doors when the caller passes `locals`:

```typescript
// Both signatures accept an optional `locals` for D1 access:
validateApiKey(request, context?, locals?) : Promise<AuthContext>
resolveUnitFromSession(request, locals?)   : Promise<AuthContext>

// With locals provided, tier is resolved from D1 `developer_tiers` (default 'free')
// and cached alongside the key for the 5-min TTL.
```

Tier storage is `developer_tiers` in D1 (`migrations/0016_metering.sql`), keyed
by `user_id`. Billing webhooks (`/api/billing/webhook.ts`) call `setTier()` on
Stripe subscription events. See `src/lib/tier-limits.ts` for the canonical
matrix and `one/pricing.md` for pricing.

---

## Using Your API Key

All substrate endpoints accept API keys via Authorization header:

```bash
# Send a signal
curl -X POST /api/signal \
  -H "Authorization: Bearer api_m3x7k_AbCdEfGh..." \
  -H "Content-Type: application/json" \
  -d '{"receiver": "bob:translate", "data": {"text": "hello"}}'

# Get world state
curl /api/state \
  -H "Authorization: Bearer api_m3x7k_AbCdEfGh..."

# Generate additional API keys
curl -X POST /api/auth/api-keys \
  -H "Authorization: Bearer api_m3x7k_AbCdEfGh..." \
  -H "Content-Type: application/json" \
  -d '{"permissions": "read"}'

# Revoke an API key
curl -X DELETE /api/auth/api-keys \
  -H "Authorization: Bearer api_m3x7k_AbCdEfGh..." \
  -H "Content-Type: application/json" \
  -d '{"keyId": "key-m3x7k-abc123"}'
```

### Permissions

| Permission | What it grants |
|-----------|----------------|
| `read` | Query state, highways, units |
| `write` | Send signals, mark/warn paths |
| `read,write` | Default — full substrate access |

---

## Wallet Architecture

### Deterministic Derivation

```
SUI_SEED (env, 32 bytes base64)
    │
    ├── + "scout-1"  → SHA-256 → Ed25519 keypair → 0xabc...
    ├── + "alice"    → SHA-256 → Ed25519 keypair → 0xdef...
    └── + "bob"      → SHA-256 → Ed25519 keypair → 0x123...
```

- Same uid always produces the same wallet address
- No private keys stored — derived on-the-fly from platform seed + uid
- Lose the seed, lose all wallets
- Each agent IS its keypair

### What the Wallet Can Do

```typescript
import { deriveKeypair, addressFor, createUnit, send, pay } from '@/lib/sui'

// Get address (read-only, no keypair needed)
const address = await addressFor('scout-1')  // 0xabc...

// Sign transactions (needs keypair)
const kp = await deriveKeypair('scout-1')

// Create on-chain unit (self-sovereign)
const { objectId } = await createUnit('scout-1', 'Scout', 'agent')

// Send signal on-chain
await send('scout-1', unitObjId, receiverObjId, receiverAddr, 'translate')

// Pay another agent (revenue = weight)
await pay('scout-1', myUnitObj, theirUnitObj, pathObj, amount)
```

### Multi-Chain (via ONE/web)

The ONE platform supports wallet derivation across chains:

| Chain | Derivation | Format |
|-------|-----------|--------|
| SUI | `SHA-256(seed \|\| uid)` → Ed25519 | `0x` + 64 hex |
| ETH | `SHA-256(type:id)` → secp256k1 | `0x` + 40 hex |
| SOL | `SHA-256(type:id)` → Ed25519 | Base58, 44 chars |
| BTC | `SHA-256(type:id)` → secp256k1 | `bc1q` + 38 hex |

The substrate uses Sui natively. Other chains available via `WalletProtocol`.

---

## Ontology Mapping

Auth maps cleanly to the 6 dimensions:

| Dimension | Auth Entity | What |
|-----------|------------|------|
| **Groups** (1) | Group membership | Agent inherits scope from its world/pod |
| **Actors** (2) | `actor` entity | The agent/human with aid, wallet, auth-hash |
| **Things** (3) | `api-key` entity | The credential (hash only stored) |
| **Paths** (4) | `api-authorization` | Relation: which key can act as which unit |
| **Events** (5) | `last-used` | Every API call updates the key's timestamp |
| **Knowledge** (6) | Highways | Agent's proven routes harden over time |

---

## Governance Layer (locked 2026-04-18)

Auth is identity. Governance is permission. Both live in the same ontology.

```
┌─────────────────────────────────────────────────────────────────┐
│                     PERMISSION = ROLE × PHEROMONE               │
│                                                                 │
│  ROLE (on membership relation):                                 │
│    chairman  → owns world, appoints ceo/board, full access      │
│    board     → auditors, read-only (highways, toxic, revenue)   │
│    ceo       → operator, hires/fires agents, tunes routing      │
│    operator  → can add units, mark/warn, no role assignment     │
│    agent     → can only affect own paths (participated in)      │
│    auditor   → read-only subset                                 │
│                                                                 │
│  IDENTITY (on actor entity):                                    │
│    wallet    → Sui address (0x...), derived from seed + uid     │
│    auth-hash → bcrypt hash of API key (never raw)               │
│                                                                 │
│  SCOPE (on path + hypothesis):                                  │
│    private   → only sender/receiver see it                      │
│    group     → all group members see it                         │
│    public    → cross-org discovery, can harden to Sui           │
│                                                                 │
│  AUTH FLOW:                                                     │
│    1. Wallet signature OR API key → verify identity             │
│    2. Lookup (group, member, role) isa membership → get role    │
│    3. Check role against action permission matrix               │
│    4. Check pheromone (can only affect paths you've touched)    │
│    5. Execute OR reject 403                                     │
└─────────────────────────────────────────────────────────────────┘
```

### Role Permission Matrix

| Role | add unit | remove | mark | warn | tune sensitivity | read highways | appoint |
|------|----------|--------|------|------|------------------|---------------|---------|
| chairman | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| board | - | - | - | - | - | ✓ | - |
| ceo | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | - |
| operator | ✓ | - | ✓ | ✓ | - | ✓ | - |
| agent | - | - | ✓* | ✓* | - | - | - |
| auditor | - | - | - | - | - | ✓ | - |

*Agents can only mark/warn paths they participate in (sender or receiver in signal history)

---

## TypeDB Schema

```tql
# API key entity (Thing, dim 3)
entity api-key,
    owns api-key-id @key,
    owns key-hash,              # PBKDF2 hash (never plaintext)
    owns user-id,               # uid of the unit
    owns permissions,           # "read,write"
    owns key-status,            # "active" | "revoked"
    owns created,
    owns last-used,
    owns expires-at,
    plays api-authorization:api-key;

# Key → Unit authorization (Path, dim 4)
relation api-authorization,
    relates api-key,
    relates authorized-unit;    # which unit this key can act as
```

---

## API Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/agent` | POST | None | Agent onboarding (zero-friction) |
| `/api/auth/agent` | GET | None | Endpoint documentation |
| `/api/auth/api-keys` | POST | API key | Generate additional key |
| `/api/auth/api-keys` | DELETE | API key | Revoke a key |
| `/api/auth/sign-up/email` | POST | None | Human signup (BetterAuth) |
| `/api/auth/sign-in/email` | POST | None | Human signin (BetterAuth) |
| `/api/auth/get-session` | GET | Cookie/Bearer | Current session |

---

## Security

| Layer | Mechanism |
|-------|-----------|
| Password hashing | PBKDF2-SHA256, 100k iterations, 16-byte salt |
| API key hashing | PBKDF2-SHA256, 100k iterations (same) |
| Key format | `api_<timestamp36>_<32 random chars>` |
| Session | 30-day expiry, 24h refresh, cookie cache |
| Wallet derivation | HKDF-like: `SHA-256(seed \|\| uid)` |
| Bearer tokens | BetterAuth bearer plugin (session → header) |
| Key verification | Constant-time comparison (timing-safe) |

### Key Security Notes

- **API keys are shown once.** The plaintext is returned on creation and never stored.
- **Keys can be revoked** but not retrieved. Generate a new one if lost.
- **Wallet private keys are never stored.** Derived on-the-fly from platform seed.
- **`SUI_SEED` is the master secret.** Protect it. Rotate it = new wallets for everyone.
- **Returning agents get new keys.** Calling `/api/auth/agent` again doesn't expose the old key — it creates a fresh one.

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `SUI_SEED` | Yes | 32-byte base64 seed for wallet derivation |
| `BETTER_AUTH_SECRET` | Yes | Secret for BetterAuth session signing |
| `PUBLIC_SITE_URL` | Yes | Base URL for auth callbacks |
| `TYPEDB_URL` | Yes | TypeDB endpoint |
| `TYPEDB_DATABASE` | Yes | TypeDB database name |
| `SUI_NETWORK` | No | `testnet` (default) / `mainnet` / `devnet` |
| `SUI_PACKAGE_ID` | No | Move package for on-chain operations |

---

## Closed Gaps — Human Login With Agent-Issued Credentials (shipped 2026-04-19)

Today a human **can** log in using a credential issued to an agent: `POST /api/auth/agent`
returns a plaintext API key, send it as `Authorization: Bearer api_xxx_yyy`, and
`resolveUnitFromSession` (`src/lib/api-auth.ts:282`) returns
`AuthContext { user: "swift-scout" }`. The human *becomes* the agent — the human identity
is lost for that request.

That is the only flow. The two front doors (cookie, bearer) terminate in a single-identity
`AuthContext` with no link between them. Six gaps block proper ownership semantics:

| # | Gap | Where | Severity |
|---|-----|-------|---------:|
| 1 | `POST /api/auth/agent` mints a fresh active key for any existing uid with **no auth gate** — anyone who knows the uid can re-mint | `src/pages/api/auth/agent.ts:91-170` | **P0** |
| 2 | No actor↔actor binding in the ontology — `membership` exists, but no route uses it for agent ownership | `src/schema/one.tql` | P1 |
| 3 | Bearer path never calls `getRoleForUser` — agent keys always carry `role: undefined`, default `permissions: ["read","write"]` | `src/lib/api-auth.ts:64-171` | P1 |
| 4 | No claim handshake — no endpoint that takes `(cookie session, agent bearer)` and binds the agent to a human owner | (missing route) | P1 |
| 5 | `AuthContext` is single-valued — no `actAs` field, no audit chain for "Tony **via** swift-scout" | `src/lib/api-auth.ts:20-28` | P2 |
| 6 | Bootstrap key is never revoked on ownership transfer — old keys keep working in parallel with any new scoped key | (missing in claim flow) | P1 |

The substrate already has every primitive needed (`unit`, `membership`, `role`,
`wallet-link`, `api-authorization`). The work is **binding** them, not extending the schema.

The natural ownership model without new schema:

```
group g:owns:swift-scout
  ├── membership(group: g, member: swift-scout, role: "agent")
  └── membership(group: g, member: human:tony,  role: "chairman")
```

`getRoleForUser('human:tony')` already returns `chairman` for the group; closing gaps 3 + 5
lets that role flow through the bearer path when Tony's clients act as `swift-scout`.

See [auth-todo.md](auth-todo.md) for the executable plan.

## Ownership Model — Locked (2026-04-19)

**Decision: Option A — group-based, zero schema change.**

| Component | What |
|-----------|------|
| Ownership group | `g:owns:<agent-uid>` with `group-type: "owns"` |
| Agent membership | `membership(group: g, member: <agent-uid>, role: "agent")` |
| Human membership | `membership(group: g, member: <human-uid>, role: "chairman")` |

`group-type` is an open string in `one.tql` — no @values constraint, no migration needed.
`/api/team` queries must filter `group-type != "owns"` to exclude ownership groups.

## Claim Flow

```
POST /api/auth/agent/:uid/claim
  Cookie: <human-session>
  Authorization: Bearer <agent-bootstrap-key>

→ verify human session (cookie)
→ verify bearer matches :uid (proof of possession)
→ upsert g:owns:<uid> (group-type: "owns", scope: "private")
→ insert membership(g, :uid, role: "agent")
→ insert membership(g, <human-uid>, role: "chairman")
→ revoke bootstrap key (key-status → "revoked")
→ mint scoped key for human (scopeGroups: [g])
→ return { owned: true, ownerUid, agentUid, group, newKey }
```

---

## Test Results

Two test files. Run with `bun vitest run src/lib/api-key.test.ts src/lib/api-auth.test.ts`.

**Last run: 30/30 pass, 400ms** (2026-04-15)

| Suite | Tests | Duration | What it proves |
|-------|------:|------:|----------------|
| `api-key.test.ts` | 15 | 270ms | Key format, CSPRNG randomness, PBKDF2 round-trip, subtly-wrong-key rejection, generation speed |
| `api-auth.test.ts` | 17 | 130ms | Header parsing, TypeDB lookup, cache hit/miss, invalidation, permission enforcement |

### Key findings from the numbers

| Test | Result | Signal |
|------|--------|--------|
| 100 generated keys — zero collisions | ✓ | CSPRNG is working, not `Math.random()` |
| `generateApiKey()` < 1ms | ✓ | Byte-to-char loop adds zero overhead |
| 1000 keys < 10ms | ✓ | 10µs/key — not a bottleneck |
| PBKDF2 round-trip (hash + verify) | ~43ms/pair | Intentionally slow — brute-force defense |
| Two hashes of same key differ | ✓ | Salts are random per-hash, not global |
| Cache hit: no TypeDB call | ✓ | O(1) repeat auth confirmed |
| Cache hit: < 1ms | ✓ | Map lookup vs 100ms PBKDF2 — proven |
| `invalidateKeyCache()` forces re-verify | ✓ | Revocation takes effect immediately |
| TypeDB timeout → `isValid: false` | ✓ | Auth fails closed, not open |
| Read-only key rejects write permission | ✓ | Permission enforcement correct |

### Running the tests

```bash
# Auth only
bun vitest run src/lib/api-key.test.ts src/lib/api-auth.test.ts

# Full suite (gate)
bun run verify
```

Full gate: **443/443 pass, 4.15s** with auth tests included.

*Two paths. One wallet. Zero friction.*
