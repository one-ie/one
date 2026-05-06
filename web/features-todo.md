# TODO — features map

**Goal:** produce `features.md` — a complete inventory of every user-visible and developer-facing feature in `web/`. Haiku agents scan slices in parallel; output is consolidated by zone (page / api / component / lib).

**Mode:** lean · **Lifecycle:** discovery · **Deterministic exit:** `features.md` exists and lists every file from the eight zones below with one feature line per file (or `—` if file is internal/utility only).

---

## Zones (one haiku agent per zone, run in parallel)

Each agent gets the same prompt template, swapping `{ZONE}` and `{GLOB}`:

> Read every file matching `{GLOB}` from repo root `/Users/toc/Server/one-ie/one/web/`. For each file, emit one bullet:
> `- path/to/file.ext — <feature in ≤15 words>` (use `—` if pure utility/internal with no user-facing or API behavior).
> Do not summarize, do not group, do not skip. Output the bullets only, one per file, sorted by path.

| # | Zone | Glob |
|---|------|------|
| 1 | pages | `src/pages/*.astro` |
| 2 | user-pages | `src/pages/u/**/*.astro` |
| 3 | api | `src/pages/api/**/*.ts` |
| 4 | components-root | `src/components/*.tsx` |
| 5 | components-nested | `src/components/{chat,pay,motion,showcase,sidebar,ai-elements}/**/*.tsx` |
| 6 | lib | `src/lib/**/*.ts` |
| 7 | hooks-layouts | `src/hooks/**/*.{ts,tsx}` + `src/layouts/**/*.astro` |
| 8 | scripts-config | `scripts/**/*.{ts,sh}` + `wrangler.toml` + `astro.config.mjs` + `middleware.ts` |

---

## Tasks

1. **Spawn 8 haiku agents in parallel**, one per zone, using the prompt above. Subagent type: `Explore` is fine; force `model: "haiku"` on each Agent call.
2. **Collect the 8 bullet lists** verbatim into `features.md` with this shape:

   ```markdown
   # web — features map

   _Generated {YYYY-MM-DD} from haiku zone scans._

   ## Pages (`src/pages/*.astro`)
   <bullets from zone 1>

   ## User pages (`src/pages/u/**`)
   <bullets from zone 2>

   ## API routes (`src/pages/api/**`)
   <bullets from zone 3>

   ## Root components
   <bullets from zone 4>

   ## Nested components
   <bullets from zone 5>

   ## Lib
   <bullets from zone 6>

   ## Hooks + layouts
   <bullets from zone 7>

   ## Scripts + config
   <bullets from zone 8>
   ```

3. **Verify exit:** every file in every glob appears as a bullet. Run `find src/pages src/components src/lib scripts -type f \( -name '*.astro' -o -name '*.ts' -o -name '*.tsx' \) | wc -l` and confirm count matches bullets ± config files.

---

## Don't

- Don't group, theme, or editorialize — one file = one line.
- Don't read files outside the assigned glob (an agent staying in its zone is the parallelism win).
- Don't use Sonnet/Opus — haiku is the budget. The map is descriptive, not analytic.
- Don't write `features.md` until all 8 agents return; partial overwrites lose lines.

---

## Close

Report: `{zoneCount: 8, fileCount: N, bulletsWritten: N, durationMs: N}`. Append one-line learning to `web/README.md`-adjacent log only if a zone glob missed files (i.e., the map has gaps).
