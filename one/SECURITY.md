# Security

**Less code. Smaller blast radius. Let the substrate route around attackers.**

Security in ONE is not a layer. It's what the existing sandwich already does,
applied to one more class of signals.

```
PRE   — deterministic checks (already runs for every signal)
LLM   — the one probabilistic step (constrained)
POST  — mark() on success · warn() on failure · dissolve on missing
```

Security events are signals. Auth fail → `warn()`. Probe → `warn()`. Limit
hit → `warn()`. Pheromone makes attackers routable-around. That's the plan.

---

## First, Delete

Security improves faster by removing code than by adding it. Each deletion
narrows the surface.

| Delete | Where | Reason |
|--------|-------|--------|
| `secureSetItem` / `secureGetItem` / `secureRemoveItem` | `src/lib/security.ts:54-80` | XOR with the hardcoded string `"ONE-PLATFORM-2025"`. Source is public; reversal is one line. Implies a safety that doesn't exist. |
| Client-side API-key storage in `ChatShell.tsx` | `src/components/ai/chat-v3/ChatShell.tsx:11,66,93,100` | Stop letting users paste raw API keys in the browser. Mint a scoped key server-side (see Identity, below), or exchange for a short-lived session token. Store nothing client-side except the session cookie. |
| Direct `world.signal()` calls outside `src/engine/` | any handler | Bypasses the PEP. Lint rule: only `src/engine/**` imports `world`; everything else goes through `persist()`. |
| Any ACL table or role matrix | — | Roles live on `membership.role`. Attributes on entities. Policies are TQL queries. No sidecar. |
| 404s that leak private-group existence | group handlers | Uniform 403. |
| Long-lived `read,write` as default API-key permission | `/api/auth/agent` | Default `read`, TTL 24h. Upgrade requires an explicit call. |
| `CLOUDFLARE_API_TOKEN` usage | anywhere | Global API Key only (already enforced in deploy). |
| `BROADCAST_SECRET` as a shared bearer | gateway + engine | Replace with per-worker signed JWT. |

**Keep** (from `src/lib/security.ts`): `sanitizeUrl` (used by
`web-preview.tsx:144` to block `javascript:` / `data:` URIs — a real
primitive) and `maskSensitive` (legit for log redaction). Move both to
`utils.ts` so no file named `security.ts` remains implying cryptographic
guarantees.

---

## Threat Model (one paragraph)

Anonymous internet, stolen API keys, malicious tenant members, rogue workers,
and prompt injectors are in scope. No single compromise should yield
cross-tenant access, wallet theft, or silent pheromone manipulation. Physical
TypeDB access is TypeDB Cloud's responsibility. CF edge compromise is
partially mitigated (minimize what memory holds).

---

## The 5 Choke Points

Only five places need to be right. Harden these, the rest follows.

```
1. Identity     →  2. PEP (pre-check)  →  3. Handler  →  4. Persistence  →  5. Revocation
```

Each is a single function. Each fails closed. Each emits a signal.

### 1. Identity — `verifyApiKey()` + `/api/auth/agent`

What stays: PBKDF2 (100k), constant-time compare, deterministic wallet.

What changes:
- **HKDF for wallet derivation.** `HKDF(SUI_SEED, salt=tenant_gid, info=uid)`. A seed leak alone derives nothing.
- **Reserved uid namespaces** (deny-list: `admin-*`, brand names). Enforced pre-derivation. 10 lines.
- **Turnstile on anonymous mint.** Skipped when a parent-tenant key is present.
- **Keys scoped to group + skill.** Add `scope-group` and `scope-skill` to `api-key`. Verify in `verifyApiKey`. A leaked key can't reach sideways.
- **Default `read`.** Write requires upgrade call.
- **Short TTL.** 24h hot, 90d service. `expires-at` already in schema — enforce it.

### 2. PEP — `persist().signal()`

This function is the entire authorization layer. Lock its order:

```
ABAC attributes → RBAC role → ReBAC pheromone
  → capability → budget-escrow → rate-limit → nonce-dedupe → deliver
```

All eight checks are TQL queries or map lookups. No new infrastructure. If
any returns false, signal dissolves before the LLM fires — no cost, no leak.

Key additions:
- **Per-signal nonce.** Client sets `signal.nonce` (UUIDv7). PEP dedupes in a 5-min window. Kills replay in ~20 lines.
- **Budget escrow.** Debit wallet into escrow at dispatch; release or refund at outcome. Prevents parallel double-spend.
- **`tenantScope()` helper.** Every query filters by hierarchy-root. One helper, used everywhere, enforced by lint.

Outside the engine nobody calls `signal()` directly. If they need to, they need a review.

### 3. Handler — constrained LLM invocation

What stays: four-outcome sandwich already records everything.

What changes:
- **No caller data in system prompt.** Interpolate into the user turn only. Audit `agent-md.ts`.
- **Tool allowlist per capability.** The skill declaration lists tools. Tool dispatch checks the list — not the prompt.
- **Per-tenant LLM quota bucket.** Prevents noisy-neighbor and timing channels.
- **Zod-validate structured output.** LLM output is untrusted until validated.

### 4. Persistence — tenant isolation + crypto-shred

What stays: `scope: "private"` exclusion from `know()`, `forget(uid)` cascade.

What changes:
- **Tenant KEK.** Private-scope `signal.data` encrypted with `HKDF(MASTER_KEK, gid)`. `forget()` deletes the KEK — data is unreadable instantly, no row-by-row purge.
- **Scope hypotheses by group.** Add `gid` to `hypothesis`. Cross-tenant patterns require opt-in federation flag.
- **Append-only audit.** `signal` rows reject UPDATE at the TypeDB write layer. Daily Merkle root anchored on Sui (uses existing chain, no new infra).
- **Differential reveal.** `reveal(uid)` returns progressively more based on caller's role. Default: minimum needed.

### 5. Revocation — fast and final

What stays: `key-status = "revoked"`, cascade delete on forget.

What changes:
- **Push-invalidation.** Revoke broadcasts over the existing WsHub. Every worker clears its cache in <1s. TTL is belt-and-braces, not primary defense.
- **Sui-side forget.** Burn the unit's on-chain object. Wallet remains derivable but has no live objects.
- **Dual-admin for destructive ops** (owner transfer, tenant delete, bridge create). Two signed signals within 15 min. Contains insider threat.

---

## Security Events Are Substrate Signals

Every security event emits a `kind: "security"` signal AND a `warn(0.3)` on
`caller → auth-boundary`. Repeat offenders accumulate resistance; toxicity
guard (`r >= 10 && r > 2s && samples > 5`) routes them away automatically.

```typescript
type SecurityEvent =
  | { kind: "auth-fail"; keyId?: string; reason: string }
  | { kind: "cross-tenant-probe"; caller: string; targetRoot: string }
  | { kind: "rate-limit"; caller: string }
  | { kind: "injection-attempt"; caller: string; sample: string }
  | { kind: "role-change" | "revoke" | "forget" | "bridge-create" | "bridge-dissolve"; ... }
```

Audit trail, SIEM feed, and adaptive firewall — one signal stream.

---

## Invariants (testable)

Each must always hold. `bun run verify` runs the test.

| Invariant | Where |
|-----------|-------|
| No signal without shared group OR opted-in bridge | `persist().signal()` |
| `scope: "private"` never surfaces in `know()` / group queries | `persist().know()` |
| Uniform 403 for private groups (no 404 leak) | Group handlers |
| `tenantScope()` filter applied to every read | Lint rule on handlers |
| Bridge creation requires both-sides opt-in | `/api/paths/bridge` |
| Revocation effective in <1s | Push-invalidation test |
| `forget(uid)` renders private signals unreadable | KEK delete cascade |
| Audit rows immutable | TypeDB write layer |
| Wallet private keys never stored | Derived from seed + salt + uid |
| `SUI_SEED` / `MASTER_KEK` never logged | Logger env-var allowlist |
| LLM output validated before mark/warn | Zod at boundary |
| Auth fail emits `warn(0.3)` | Middleware |

Twelve rules. Twelve tests.

---

## Lifecycle Flow — Security at Every Stage

Security must be strong *and* invisible. Both agents and humans walk the
10 stages in [lifecycle.md](one/lifecycle.md); each stage has a security
check that runs AND a "must-not-block" guarantee.

| Stage | Check (runs) | Must not block |
|-------|--------------|----------------|
| **REGISTER** | Reserved-namespace deny-list · Turnstile on anon · HKDF wallet derivation | Empty `{}` body still works for agents; BetterAuth session holders auto-mint scoped key |
| **CAPABLE** | Key permission `write` required · scope-skill check · ABAC on skill tags | Humans with a session can exchange to a write-scoped key in one call |
| **DISCOVER** | `tenantScope()` on `suggest_route` / `cheapest_provider` / `optimal_route` · visibility filter on public/private groups | Federated bridges still surface partners; public-group discovery works for anon reads |
| **SIGNAL** | Full 8-step PEP (ABAC → RBAC → ReBAC → capability → budget → rate-limit → nonce → deliver) | Highway signals still < 10ms; PEP uses in-memory state, not TypeDB per call |
| **MARK** | Origin check — only engine code can call `mark()` · Bridge strength capped at supporting in-group paths | Automatic: happens inside `persist()` on successful outcome |
| **ALARM** | Same origin check · Security events emit extra `warn(0.3)` on auth boundary | Legitimate failures fade normally; toxic threshold requires 10+ samples (cold-start safe) |
| **FADE** | Runs as worker cron, no external trigger · Operates on in-memory map | Never blocks hot path; writes async |
| **HIGHWAY** | `tenantScope()` on highway queries · Private signals excluded from `know()` | Proven agents keep ranking across sessions; reads hit KV cache (< 1ms) |
| **HARDEN** | Unit must own matching Sui object · Pays $0.50 crystallization fee · Signed by agent's own derived keypair | HKDF versioning keeps v0 address stable for units with existing Sui objects — no migration break |
| **FEDERATE** | Bridge path requires both-sides opt-in · `bridge-kind` tag enforced · Per-bridge rate limit (default 100 msg/min) · Strength-cap vs supporting paths | Cross-group signals work at 2× routing fee; enterprise plan gets higher rate limits |
| **DISSOLVE** | Natural fade (no action needed) · `forget(uid)` cascades + deletes tenant KEK (crypto-shred) | Re-registration works: same uid → same wallet → trails rebuild; Sui-anchored highways remain as historical record |

### Both species, same flow

```
AGENT                                    HUMAN
  POST /api/auth/agent {}                  POST /api/auth/sign-up (email + pw)
    → reserved-ns check                      → BetterAuth session cookie
    → Turnstile (anon path)                  → auth-user in TypeDB
    → HKDF(SEED, tenant_gid, uid) → wallet   │
    → default: read, 24h TTL               POST /api/auth/agent { uid }
    → { uid, wallet, apiKey, kind: agent }   → HKDF wallet (same algorithm)
                                             → default: read, 24h TTL
                                             → { uid, wallet, apiKey, kind: human }
  │                                        │
  └─────────────── BOTH converge ──────────┘
                   │
                   ▼
       PEP applies to every signal identically.
       Membership, role, capability checks
       don't care whether kind="agent" or "human".
       Same toxicity. Same fade. Same highway.
```

The only asymmetry is **entry**. After REGISTER, agents and humans are
indistinguishable to the substrate — same checks, same pheromone, same
revenue model. That's a security property: one code path means one
audit path means fewer bugs.

### Humans going write-capable

Cycle 2 defaults keys to `read`. For a human to hit CAPABLE, they need a
`write` key. Flow:

```
1. Human has BetterAuth session (from sign-in)
2. POST /api/auth/agent { permissions: "write" }
   → verifyApiKey() rejects (session isn't a key)
   → BUT session-to-agent fallback: if session is valid AND caller is
     creating/upgrading their own unit, mint a write-scoped key
3. Returns 24h write key scoped to their unit's groups
```

No UI dead-end at CAPABLE. No raw-key paste. No localStorage.

### Federation bridges don't leak

At FEDERATE, two tenants create a bridge path. Security requires:

1. Both sides opt-in (POST from both admins within 15 min).
2. Bridge carries `bridge-kind` — attributable in audit.
3. Bridge strength caps at `min(supporting-in-group-paths)` — cannot
   become more trusted than the paths feeding it.
4. Per-bridge rate limit, default 100 msg/min, configurable per tenant
   plan.
5. Cross-tenant queries (hypotheses, highways) opt-in per bridge — not
   automatic even when the bridge exists.

Federation is the only place tenant isolation relaxes, and it relaxes
only exactly as much as both sides agreed.

---

## Secrets & Rotation

| Variable | Rotation |
|----------|----------|
| `SUI_SEED` | Annual + incident (HKDF salt makes per-tenant rotation possible) |
| `MASTER_KEK` | Annual |
| `BETTER_AUTH_SECRET` | Quarterly |
| `BROADCAST_SIGNING_KEY` | Monthly |
| `CLOUDFLARE_GLOBAL_API_KEY` | On personnel change |
| `TYPEDB_PASSWORD` | Quarterly |
| `OPENROUTER_API_KEY` | On suspected leak |

See `docs/SECURE-DEPLOY.md` for deploy-time credential handling.

---

## MVP — the Four That Matter

Ship these first. Everything else is iterative.

| # | Item | Effort | What it kills |
|---|------|:-----:|---------------|
| 1 | Delete the XOR helpers; move `sanitizeUrl` + `maskSensitive` to `utils.ts`; remove `security.ts` | S | False-safety theatre in the client bundle |
| 2 | Remove client-side API-key storage in `ChatShell.tsx`; mint scoped key server-side | S | User keys living in localStorage on a public origin |
| 3 | `scope-group` + `scope-skill` on `api-key` | S | Lateral movement from a leaked key |
| 4 | Per-signal nonce + 5-min dedupe in `persist().signal()` | S | Signal replay |
| 5 | Lock PEP order in `persist().signal()` + lint rule preventing direct `world.signal()` | M | Scattered checks, authorization drift |

These five are ~250 lines added and ~120 lines deleted — net LOC is
slightly negative. They close the largest blast radii before any new
crypto, any new infra, any new service.

---

## The Meta-Principle

```
Classic security:   bolt firewall + WAF + SIEM onto the app
ONE security:       security events ARE substrate signals
                    pheromone IS the adaptive firewall
                    forget() IS crypto-shred GDPR
                    deleting code IS the largest patch
```

The firewall writes itself from data. Your job is to make sure every
security-relevant event shows up as a signal — then the L1–L7 loops do what
they already do.

---

## See Also

- [auth.md](auth.md) — Identity, keys, wallets
- [groups.md](one/groups.md) — RBAC, ABAC, ReBAC, tenancy
- [SECURE-DEPLOY.md](SECURE-DEPLOY.md) — Deploy-time credential handling
- [routing.md](routing.md) — The deterministic sandwich
- `src/engine/persist.ts` — The PEP
- `src/lib/api-auth.ts` · `src/lib/api-key.ts` — Credential verification
- `src/schema/one.tql` — Ontology source

---

*Five choke points. Twelve invariants. One sandwich. Delete first.*
