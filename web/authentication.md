# Authentication — ONE Web

Custom, stateless WebAuthn system. No passwords, no sessions, no JWTs.
Users own a **slug** (8-char workspace handle) secured by a passkey on their device.
Every write operation requires a live biometric signature — read access is open.

---

## Libraries

| Package | Role |
|---------|------|
| `@simplewebauthn/browser` | Client-side ceremony (`startRegistration`, `startAuthentication`) |
| `@simplewebauthn/server` | Server-side verification (`verifyRegistrationResponse`, `verifyAuthenticationResponse`) |
| `@scure/bip39` | BIP39 mnemonic generation for paper break-glass |

No third-party auth service. Runs entirely on Cloudflare Workers + D1.

---

## Database Schema (D1)

```sql
-- Primary identity
owners (
  slug TEXT PRIMARY KEY,          -- e.g. "ab3x7z9q"
  pubkey TEXT NOT NULL,           -- base64 COSE public key
  credential_id TEXT NOT NULL,    -- WebAuthn credential ID
  recovery_hash TEXT,             -- PBKDF2(mnemonic, slug, 100k, SHA-256)
  recovery_email TEXT,            -- for magic-link recovery
  tos_hash TEXT,                  -- ToS version accepted ("v1")
  tos_signed_at INTEGER,          -- unix timestamp
  display_name TEXT,
  wallet TEXT,                    -- linked SUI wallet address
  agentverse_key_enc TEXT,        -- encrypted Agentverse API key
  ts INTEGER DEFAULT (unixepoch())
)

-- Additional devices
owners_keys (
  slug TEXT REFERENCES owners(slug) ON DELETE CASCADE,
  pubkey TEXT NOT NULL,
  label TEXT DEFAULT 'device',    -- human-readable ("laptop", "phone")
  registered_at INTEGER DEFAULT (unixepoch()),
  PRIMARY KEY (slug, pubkey)
)

-- Custom domain → slug mapping
domains (
  host TEXT PRIMARY KEY,
  slug TEXT REFERENCES owners(slug) ON DELETE CASCADE,
  verified INTEGER DEFAULT 0,
  verify_token TEXT,
  ts INTEGER DEFAULT (unixepoch())
)
```

---

## Core Primitives (`src/lib/passkey.ts`)

### `rpFromRequest(request)`
Derives `rpId` (hostname, no port) and `origin` from the request host header.
Handles `localhost` / `127.0.0.1` → `http://` automatically; everything else → `https://`.
This is how the same code serves `one.ie`, `*.one.ie`, and custom domains correctly.

### `makeChallenge(secret)` → `{ challenge, token }`
1. Generates 32 cryptographically random bytes → URL-safe base64 `challenge`
2. Sets expiry: `Date.now() + 120_000` (2 minutes)
3. Signs `"${challenge}:${exp}"` with HMAC-SHA256 keyed on `SERVER_SECRET`
4. Returns `challenge` (sent to WebAuthn) and `token` (HMAC sig + expiry, opaque to client)

### `checkToken(secret, challenge, token)` → `boolean`
1. Parses `token` → `sig` + `exp`
2. Rejects if `Date.now() > exp` (expired)
3. Rejects if `challenge` is in the `used` Set (replay)
4. Verifies HMAC — only adds to `used` Set on success

### `verifyCommitAssertion(opts)` → `boolean`
Fetches the primary device pubkey from `owners` table, then calls
`verifyAuthenticationResponse`. Does NOT call `checkToken` — callers are
responsible for calling `checkToken` first. (See gap below.)

---

## Auth Flows

### 1. Registration — `GET + POST /api/provision`

```
Browser                          Server
  |                                |
  |── GET /api/provision ─────────►|  makeChallenge(SERVER_SECRET)
  |◄── { challenge, token, userId, rpId, rpName: 'ONE' } ──|
  |                                |
  |  startRegistration({ challenge, rp, user })
  |  → Touch ID / Face ID
  |                                |
  |── POST /api/provision ────────►|  checkToken(challenge, token)
  |   { registration, challenge,   |  verifyRegistrationResponse(...)
  |     token, slug?, displayName, |  generateMnemonic(128 bits) → 12 words
  |     tosTimestamp }             |  PBKDF2(mnemonic, slug, 100k) → recoveryHash
  |                                |  INSERT INTO owners
  |◄── { slug, recoveryWords,      |  autoImportSkillCreator(slug, CONTENT)
  |      redirectTo: /u/{slug}/chat }
```

Slug: user may request a specific slug; falls back to `randomSlug()` (8-char nanoid) if taken.
Recovery words: returned once, never stored in plaintext — hash only in DB.

---

### 2. Write Authentication — `GET + POST /api/commit`

Every file write requires a fresh WebAuthn assertion.

```
Browser                          Server
  |                                |
  |── GET /api/commit?slug= ───────►|  getSlugOwner(slug, DB)
  |◄── { credentialId } ───────────|
  |                                |
  |  makeChallenge() (client-side, HMAC with token from separate /api/provision GET)
  |  startAuthentication({ challenge, allowCredentials: [credentialId] })
  |  → Touch ID
  |                                |
  |── POST /api/commit ───────────►|  checkToken(challenge, token)
  |   { slug, file, content,       |  getSlugOwner(slug, DB)
  |     challenge, token,          |  verifyAuthenticationResponse(assertion, pubkey)
  |     assertion, expectedSha? }  |  conflict check (SHA match)
  |                                |  R2: archive previous version to _versions/
  |◄── { ok, sha, url } ──────────|  R2: write new content with SHA metadata
```

`content: null` → delete the file.
`expectedSha` → optimistic locking; 409 if current SHA doesn't match.

---

### 3. Media Upload — `POST /api/commit-media`

Same passkey assertion as commit, but uses `verifyCommitAssertion` directly.
Accepts PNG, JPG, JPEG, WEBP, GIF, SVG. Content addressed: key = `{slug}/media/{sha256}.{ext}`.

---

### 4. Device Enrollment — `POST /api/settings?action=add-key`

```
Browser                          Server
  |── GET /api/provision ─────────►|  makeChallenge(SERVER_SECRET)
  |◄── { challenge, token, ... } ──|
  |                                |
  |  startRegistration(...)
  |  → Touch ID on new device
  |                                |
  |── POST /api/settings?action=add-key ──►|  checkToken(challenge, token)
  |   { slug, registration,        |  verifyRegistrationResponse(...)
  |     challenge, token }         |  INSERT INTO owners_keys (slug, pubkey, label='device')
  |◄── { ok: true } ──────────────|
```

---

### 5. Account Recovery — `POST + GET /api/recover`

```
Browser                          Server
  |── POST /api/recover ──────────►|  verify slug exists in owners
  |   { slug, email }              |  HMAC-sign payload: "${slug}:${email}:${ts}"
  |                                |  SESSION.put("recover:{token}", { slug, email, ts }, TTL=900s)
  |◄── { ok, token, link } ───────|
  |                                |
  |  [user clicks email link]      |
  |── GET /api/recover?token= ────►|  SESSION.get("recover:{token}")
  |                                |  SESSION.delete (single-use)
  |◄── { ok, slug,                 |
  |      action: 'begin-passkey-registration' }
  |                                |
  |  → standard registration flow (POST /api/provision) with returned slug
```

Token TTL: 15 minutes. Single-use: KV entry deleted on first GET.

---

### 6. Custom Domain Verification — `POST /api/domain`

Requires a valid `checkToken` (challenge + token from a prior `GET /api/provision`).
Two-step: `action=register` (creates DNS challenge TXT record token) → `action=verify`
(polls Cloudflare DNS-over-HTTPS for `_one-verify.{host}` TXT, marks verified in DB).

---

## Middleware (`src/middleware.ts`)

Workspace context resolution only — not an auth gate.

| Host | Resolution |
|------|-----------|
| `one.ie`, `demo.one.ie`, `localhost`, `127.0.0.1` | Primary — `workspace: undefined`, viewer forced to `'developer'` |
| `{slug}.one.ie` | Subdomain — `workspace: slug`, viewer defaults to `'end_user'` |
| Custom domain | D1 lookup `domains WHERE host = ? AND verified = 1` → rewrite to `/u/{slug}{path}` |

Auth enforcement happens per-route, not in middleware.

---

## Viewer Role (`src/lib/viewer.ts`)

Pure function — no DB, no IO.

```
staffRole=true            → 'creator'   (platform staff)
ownerSlug === workspaceSlug → 'developer' (owns the workspace)
otherwise                 → 'end_user'  (visitor or anonymous)
```

`SessionInfo` has a `hasSession` flag but there is currently no server-side mechanism
that populates it — see Gaps section.

---

## Replay Protection

`checkToken` uses an in-memory `Set<string>` (`used`) to prevent a challenge from being
submitted twice within its 2-minute window. Challenges expire after 120 seconds.

---

## Gaps & Known Issues

### 1. In-memory replay set is per-Worker-instance

`const used = new Set<string>()` in `passkey.ts` is module-level. Cloudflare Workers may
run multiple instances simultaneously. A challenge can be replayed against a different
instance that hasn't seen it yet. **Fix:** store used challenges in KV with a 120s TTL.

### 2. WebAuthn counter hardcoded to `0`

Both `verifyCommitAssertion` and `commit.ts` pass `counter: 0` to
`verifyAuthenticationResponse`. This disables authenticator clone/replay detection
(the counter monotonicity check). **Fix:** store the counter per credential and
increment on each successful assertion.

### 3. Secondary device keys (`owners_keys`) are not checked on commit

`verifyCommitAssertion` and `commit.ts` only check `owners.pubkey` (primary device).
A user who enrolled an additional device via `add-key` cannot commit — their assertion
will fail because their public key isn't in `owners`. **Fix:** extend `getSlugOwner` (or
add a new function) to check `owners_keys` and try each enrolled key.

### 4. `commit-media.ts` skips `checkToken`

`/api/commit-media` calls `verifyCommitAssertion` directly without calling `checkToken`
first. This bypasses the 120-second expiry and the in-memory replay protection.
The WebAuthn assertion itself has no built-in expiry, so a captured network request
could be replayed indefinitely. **Fix:** accept a `token` field and call `checkToken`
before `verifyCommitAssertion`.

### 5. `POST /api/settings` (non `add-key` path) has no auth

Updating `wallet`, `agentverse_key_enc`, `recovery_email`, and `display_name` via
form POST requires only knowing the slug. No WebAuthn assertion is verified.
**Fix:** require a valid `checkToken` + assertion for any mutation, or at minimum
require the challenge token for sensitive fields (`wallet`, `agentverse_key_enc`).

### 6. Recovery flow does not send email

`POST /api/recover` returns `{ ok, token, link }` but does NOT send an email.
The comment reads "caller emails the link" — meaning the email delivery step is
not implemented. Until it is, recovery requires out-of-band link distribution.
**Fix:** integrate a mail provider (Resend, Postmark, CF Email Workers) and send
the magic link directly from the API.

### 7. `SessionInfo.hasSession` is never populated

`viewer.ts` exports `SessionInfo` and `deriveViewer()` but nothing in the codebase
sets `hasSession: true`. All role derivation currently treats every request as
`end_user` unless `staffRole` or matching slug is explicitly set. The framework is
correct; the session hydration layer is missing.

### 8. Middleware hardcodes primary domain as `'developer'`

`buildContext(undefined, pathname, 'developer')` for `one.ie` / `localhost` means
every request to the primary domain is tagged `developer` regardless of whether
the requester is authenticated. This is benign (mutations still require WebAuthn)
but semantically wrong — should be `'end_user'` until a slug is confirmed.

---

## Security Properties (What Works Today)

- No password database — only COSE public keys stored
- No long-lived tokens in localStorage or cookies
- Challenge is HMAC-signed server-side — client cannot forge one
- 2-minute challenge window + in-memory replay guard (single-instance only)
- `rpId` / `origin` verified from the live request — DNS rebinding mitigated
- BIP39 recovery hash is PBKDF2 with 100k iterations, keyed on slug as salt
- Recovery tokens are single-use, KV-stored with 15-minute TTL
- File writes are content-addressed (SHA-256) with optimistic-locking support
- Attestation is `none` — any authenticator accepted (Touch ID, Face ID, hardware key)
