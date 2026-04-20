# /release

**Source of truth:** `one/release.md` · **Script:** `scripts/release.ts`

Assemble `release/` from the monorepo, publish npm packages, and push to `github.com/one-ie/one`.

## Modes

| Invocation | What |
|-----------|------|
| `/release` | Stage + publish + push (full pipeline) |
| `/release --stage` | Assemble `release/` only, no publish, no push |
| `/release --push` | Stage + push to one-ie/one (skip npm publish) |
| `/release --dry-run` | Print manifest, no writes |

## The Three Packages

| Package | npm name | Publish from | Depends on |
|---------|----------|-------------|------------|
| SDK | `@oneie/sdk` | `release/sdk` | — |
| CLI | `oneie` | `packages/cli` | `@oneie/sdk` |
| MCP | `@oneie/mcp` | `release/mcp` | `@oneie/sdk` |

**Publish order:** SDK first, then CLI + MCP.

---

## Steps

### Step 1 — Stage (`bun run release`)

```bash
bun run release          # assembles release/ from monorepo
bun run release -- --dry-run  # preview only
```

The script (`scripts/release.ts`) runs six sub-steps:

| Sub-step | What |
|----------|------|
| `clean` | Wipe `release/` (preserve `.git`) |
| `copy` | Run manifest: `agents/templates`, `packages/sdk`, `packages/mcp`, `.claude`, `templates/web` |
| `one` | Copy `one/` docs filtered by public allowlist (strategy + in-flight work withheld) |
| `overlay` | Apply `scripts/release-templates/` on top (README.md, CLAUDE.md, AGENTS.md overrides) |
| `license` | Mirror root `LICENSE` into every slot |
| `verify` | Assert 4-file convention: `README.md`, `CLAUDE.md`, `AGENTS.md`, `LICENSE` in root + each slot |

**Slots:** `agents/` · `one/` · `sdk/` · `mcp/` · `.claude/` · `web/`

**Key copies:**
- `templates/web` → `release/web` (Astro + React template)
- `packages/sdk` → `release/sdk`
- `packages/mcp` → `release/mcp`
- `.claude` → `release/.claude` (excl. `settings.local.json`)
- `agents/templates` → `release/agents/templates` (real pods withheld)
- `one/` → `release/one` (allowlist filtered)

Report: files copied, bytes, ms per sub-step.

### Step 2 — Version Bump

Before publishing, sync versions. SDK must be bumped first:

1. Bump `packages/sdk/package.json` version
2. Update `packages/cli/package.json` `@oneie/sdk` dep to match
3. Update `packages/mcp/package.json` `@oneie/sdk` dep to match  
4. Bump CLI and MCP versions

**CRITICAL:** `cd packages/sdk` before `npm version` — running from monorepo root triggers lockfile relock.

```bash
cd packages/sdk && npm version patch && cd ../..
cd packages/cli && npm version patch && cd ../..
cd packages/mcp && npm version patch && cd ../..
```

Re-run `bun run release` after bumping so `release/sdk` and `release/mcp` reflect new versions.

### Step 3 — Build + Publish

SDK must publish before CLI and MCP resolve it.

```bash
# SDK
cd release/sdk && bun run build && npm publish --access public && cd ../..

# CLI (publishes from packages/cli, not release/)
cd packages/cli && npm run build && npm publish --access public && cd ../..

# MCP
cd release/mcp && bun run build && npm publish --access public && cd ../..
```

### Step 4 — Push to github.com/one-ie/one

```bash
bun run release -- --push
```

The `--push` flag (built into `scripts/release.ts`):
1. `git init` inside `release/` if no `.git` (first time)
2. `git remote add origin git@github.com:one-ie/one.git`
3. `git add .`
4. `git commit -m "release: v<version>"`
5. `git push -u origin main`

### Step 5 — Report

```
Stage:     clean 12ms  copy 340ms  one 28ms  overlay 5ms  license 2ms  verify 3ms
           487 files, 4.2MB  total 390ms
Publish:   @oneie/sdk@0.8.0 ✓  oneie@3.8.3 ✓  @oneie/mcp@0.2.0 ✓
Push:      ✓ github.com/one-ie/one  commit: release: v0.8.0
```

---

## Manifest Reference (`scripts/release.ts`)

```typescript
const manifest = [
  { from: 'agents/templates', to: 'agents/templates' },
  { from: 'packages/sdk',    to: 'sdk',    exclude: ['node_modules', 'dist'] },
  { from: 'packages/mcp',    to: 'mcp',    exclude: ['node_modules', 'dist'] },
  { from: '.claude',         to: '.claude', exclude: ['settings.local.json'] },
  { from: 'templates/web',   to: 'web',    exclude: ['node_modules', 'dist', '.astro'] },
]
// one/ is filtered separately by ONE_PUBLIC_DOCS allowlist
// README.md + CLAUDE.md come from scripts/release-templates/ overlay (NOT monorepo root)
```

---

## Gotchas

- **Internal CLAUDE.md never ships** — it's 43KB of private dev context; the overlay provides a clean public version
- **`one/` is default-deny** — only files in `ONE_PUBLIC_DOCS` allowlist ship; strategy/partnership docs stay private
- **SDK publishes first** — CLI and MCP declare `@oneie/sdk` as dependency; registry must have it before they resolve
- **`release/.git` persists** — `clean` step preserves `.git` so `release/` stays a live checkout of `one-ie/one`
- **CLI publishes from `packages/cli`** — not `release/`; there's no `release/cli` slot

---

*Stage. Publish. Push. The release/ directory IS the one-ie/one repo. Three packages, one truth.*
