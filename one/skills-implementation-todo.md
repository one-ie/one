---
mode: lean
lifecycle: construction
spec: skills-implementation.md
exit: third-party skill imported via 4 surfaces, paid for, invoked; receipt rows appended to spec
---

# skills-implementation — TODO

Source plan: [skills-implementation.md](skills-implementation.md). This TODO splits the
plan into independent agent tasks that run in parallel. Each task targets distinct files
so agents can edit concurrently without write conflicts.

---

## Parallel agent layout

```
A1 (Sonnet)  web/src/lib/skill/import.ts                 ← Tasks A + C (foundation)
A2 (Sonnet)  web/src/pages/api/chat.ts                   ← Tasks B + D1
A3 (Sonnet)  web/src/pages/api/skill/import.ts (new)     ← Task C2
A4 (Haiku)   web/src/pages/u/[slug]/settings.astro       ← Task D2
A5 (Sonnet)  sdk/src/{client.ts,skills.ts,index.ts}      ← Task D3
A6 (Haiku)   cli/src/skill.ts                            ← Task D4
```

All six edit non-overlapping files. `A2` and `A3` import `withPrice` from `web/src/lib/skill/import.ts`
(A1's export). `A6` uses the SDK from `A5`. Both are safe — agents do not read each other's
in-flight edits, only the final exported shapes specified below.

---

## Shared contracts (lock these — every agent reads from the same spec)

### `withPrice(yaml: string, price: number): string`
Exported from `web/src/lib/skill/import.ts`. Parses the YAML frontmatter block at the top of a
SKILL.md, replaces or inserts a top-level `price:` line, leaves everything else verbatim.
If no frontmatter, prepends `---\nprice: <n>\n---\n`.

### `importSkill(ref, slug, r2, opts?)` — extended signature
```ts
export async function importSkill(
  ref: string,
  slug: string,
  r2: R2Bucket,
  opts?: { price?: number; chosenName?: string },
): Promise<{ skill: Skill; cacheKey: string; namedKey: string } | null>
```
After existing cache write, **also** writes named-shim copy at `<slug>/skills/<finalName>/SKILL.md`
with `withPrice(text, opts?.price ?? skill.price ?? 0)` body. `finalName = opts?.chosenName ?? skill.name ?? stem`.

### `POST /api/skill/import` request body
```ts
{ ref?: string; content?: string; slug: string; name?: string; price?: number }
```
Returns `{ skill, key, preview, diagnostics }` on success. Auth: passkey cookie (web) **or**
`Authorization: Bearer <SERVER_SECRET-token-or-apiKey>`. For now follow `refresh.ts` pattern
— `Bearer ${env.SERVER_SECRET}` is the passing token.

### SDK `client.skills.import(opts)` shape
```ts
client.skills.import({
  ref?: string; content?: string; slug: string; price?: number; name?: string
}): Promise<{ skill: Skill; key: string; preview: { name: string; price: number; body: string }; diagnostics: Diagnostic[] }>
```

---

## Tasks

### A1 — Sonnet — `web/src/lib/skill/import.ts`

**Edits:**
1. Extend `importSkill` signature with `opts?: { price?: number; chosenName?: string }`.
2. Add and export `withPrice(yaml: string, price: number): string`.
3. After existing R2 cache write, write a **named shim** at `<slug>/skills/<finalName>/SKILL.md`
   with `withPrice(text, opts?.price ?? parsedPrice ?? 0)`. `customMetadata` includes
   `sourceUrl`, `importedAt`, `cacheKey`.
4. Return shape gains `namedKey: string`.

**Acceptance:** `tsc` clean, file exports `importSkill` + `withPrice`, `withPrice` round-trips
on a SKILL.md with no frontmatter (prepends a fresh block) and on one with existing `price:` (replaces).

### A2 — Sonnet — `web/src/pages/api/chat.ts`

**Edits:**
1. Add `import { loadSkill } from '../../lib/skill/loader'` and `import { withPrice } from '../../lib/skill/import'` at top.
2. Replace `skillTool.execute` body (line ~210): use `loadSkill(\`\${slug}/skills/\${skillName}\`, env.CONTENT)`;
   read `price` from skill record (number); reconstruct md as `\`---\nprice: \${skill.price ?? 0}\n---\n\${skill.body}\``.
3. Same swap in `paymentTool.execute` (line ~234) — use `loadSkill`, `expectedAmount = skill.price ?? 0`.
4. Register a new `import_skill` tool alongside `skill`/`payment`/`eval` per spec §D1. Returns
   `{ kind: 'preview', diagnostics, requiresApproval: true }` if parser warns, else
   `{ kind: 'pending-write', key, content: withPrice(text, price), preview }`. Use `parse` from `../../lib/skill/parser`
   and the existing `fetch` allowlist by reusing `importSkill` for the network path — but DO NOT call
   importSkill (which writes R2). Instead inline a fetcher that mirrors `resolveSkillUrl` semantics:
   call `POST /api/skill/import` is overkill; just `fetch` the resolved URL when `ref` is provided,
   `text = content` when content is provided. Keep it under 60 lines added.
5. Add system-prompt nudge to `buildSystem(slug,...)`: when slug present, append:
   "When the user pastes a skill URL, github ref (github:owner/repo/...), or markdown beginning with YAML frontmatter, call import_skill with the appropriate argument. Confirm price first if not specified."

**Acceptance:** `tsc` clean. New tool wires into `tools` object. `skillTool` and `paymentTool`
no longer reach for `\`\${slug}/skills/\${name}.md\`` directly.

### A3 — Sonnet — `web/src/pages/api/skill/import.ts` (new file)

**Create** following the shape of `web/src/pages/api/skill/refresh.ts`:

- `export const prerender = false`
- `POST` handler reads JSON body `{ ref?, content?, slug, name?, price? }`.
- Auth: accept `Authorization: Bearer ${env.SERVER_SECRET}` like `refresh.ts`. Cookie auth
  can be added later — comment a TODO.
- Validate `slug` matches `/^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/`.
- If `content`, parse it directly with `parse()` and write named shim via `r2.put`. Use `withPrice`.
- If `ref`, call `importSkill(ref, slug, r2, { price, chosenName: name })`.
- If neither, 400.
- Returns `{ skill, key: namedKey, preview: { name, price, body: skill.body.slice(0, 280) }, diagnostics }`.

**Acceptance:** file compiles, body shape matches contract above.

### A4 — Haiku — `web/src/pages/u/[slug]/settings.astro`

**Edits:** Add an "Import skill" section. A simple HTML form posting to `/api/skill/import` with
fields `ref` (text), `name` (text, optional), `price` (number, default 0.02), and a submit button.
Use existing token-bearing fetch pattern in that file (or fall back to a `<form method="post">` + a
small inline `<script>` that fetches with `Authorization: Bearer ${SERVER_SECRET-equivalent-cookie}`
— if there's an existing pattern in settings.astro for authenticated POSTs, follow it; otherwise wire
to `/api/skill/import` with the slug pulled from `Astro.params`).

Match design tokens (`bg-background`, `text-font`, `border-font/10`, `bg-primary`/`text-on-primary`)
per `.claude/rules/design.md`. Keep the section under 80 lines.

**Acceptance:** form renders, submits, shows JSON response inline.

### A5 — Sonnet — SDK `client.skills.import()`

**Files:** `sdk/src/skills.ts` (new), `sdk/src/client.ts` (extend), `sdk/src/index.ts` (export).

1. Create `sdk/src/skills.ts` exporting `skillsImport(config, opts)` that POSTs to
   `${baseUrl}/api/skill/import` with `Authorization: Bearer <apiKey>` and the body shape above.
2. Add a `skills` getter on `SubstrateClient` returning `{ import: (opts) => skillsImport(this.config, opts) }`.
3. Re-export from `index.ts`. Also export an alias `export { SubstrateClient as OneieClient }`.
4. Export `Skill`, `Diagnostic`, `Preview` types — `Skill` and `Diagnostic` already live in `web/src/lib/skill/{loader,parser}`;
   in the SDK, declare slim local equivalents in `skills.ts` and export them from `index.ts`. Don't import from web/.

**Acceptance:** `tsc` clean inside `sdk/`, `client.skills.import` callable.

### A6 — Haiku — CLI `oneie skill import`

**File:** `cli/src/skill.ts`.

Replace the existing `cmd.command('import <url>')` stub. New shape per spec §D4:

```ts
cmd.command('import <ref>')
  .description('Import a skill from URL, npm, or github shorthand')
  .option('--slug <slug>', 'Owner slug', process.env.ONEIE_SLUG ?? 'local')
  .option('--price <usd>', 'Price USD', '0.02')
  .option('--name <name>', 'Override skill name')
  .option('--yes', 'Skip approval prompt (CI-friendly)')
  .action(async (ref, opts) => {
    const keyFile = resolve(homedir(), '.config', 'oneie', 'key')
    const token = process.env.ONEIE_API_KEY ?? (existsSync(keyFile) ? readFileSync(keyFile, 'utf8').trim() : '')
    if (!token) { out(cmd, { ok: false, error: 'not authenticated — run `oneie auth login`' }); return }
    const baseUrl = process.env.ONEIE_BASE_URL ?? 'https://one.ie'
    const res = await fetch(`${baseUrl}/api/skill/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ref, slug: opts.slug, price: Number(opts.price), name: opts.name }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { out(cmd, { ok: false, status: res.status, ...data }); return }
    out(cmd, { ok: true, ref, slug: opts.slug, name: data?.skill?.name, price: data?.skill?.price, key: data?.key, diagnostics: data?.diagnostics })
  })
```

Add the imports (`resolve`, `homedir`, `existsSync`, `readFileSync`) at the top if missing.

**Acceptance:** `oneie --json skill import --help` prints. With `ONEIE_API_KEY` set, the command issues the POST.

---

## Verify (W4)

After agents return, run:

```bash
cd /Users/toc/Server/one-ie/one/web && bun run typecheck 2>&1 | tail -20
cd /Users/toc/Server/one-ie/one/sdk && bun run build 2>&1 | tail -10
cd /Users/toc/Server/one-ie/one/cli && bun run build 2>&1 | tail -10
```

Pass conditions:
- [x] typecheck clean across web, sdk, cli
- [x] `web/src/pages/api/chat.ts` no longer has `\`\${slug}/skills/\${skillName}.md\`` direct R2 reads in skillTool/paymentTool
- [x] `withPrice` exported from `web/src/lib/skill/import.ts`
- [x] `web/src/pages/api/skill/import.ts` exists, exports `POST`
- [x] `sdk/src/skills.ts` exists; `client.skills.import` is callable in TS
- [x] `cli/src/skill.ts` `import <ref>` no longer returns `ok: false, reason: 'requires substrate API access'`

---

## Receipt

Receipts (per spec §F) are appended to `skills-implementation.md` `## Receipt` table after a live
end-to-end run. This TODO produces the *code* — running the receipts on all four surfaces is
the close step.

---

*One spec. Six parallel agents. Six non-overlapping files. Shared contract above.*
