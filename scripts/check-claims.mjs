#!/usr/bin/env node
/**
 * check-claims.mjs — the claims gate.
 *
 * Four classes of defect shipped to this public repo in a single day. Each had
 * a human looking straight at it. A rule enforced by remembering to look is not
 * a rule, so it lives here:
 *
 *   A  fabricated people      invented names at invented companies giving named
 *                             product endorsements. Fixed once in the top-of-file
 *                             ARRAYS; the INLINE usages twenty lines below survived,
 *                             because the sweep grepped for names it had already seen.
 *                             This check is STRUCTURAL: it pairs an identity slot with
 *                             a role slot inside ONE element or ONE object literal, so
 *                             it finds a person it has never heard of.
 *   B  unsourced statistics   "4,217 sites deployed +12%". Nobody measured it. A fake
 *                             quote is a fake opinion; a fake number reads as proof.
 *   C  stale version strings  the page said "Astro 6" while the tree ran Astro 7.
 *   D  foreign scaffold       the primary CTA copied `npm create one-app` to the
 *                             clipboard. That package is real, owned by a stranger,
 *                             last published 2022.
 *
 * Zero dependencies. Node only. Run from the repo root:  node scripts/check-claims.mjs
 * Exits non-zero on any violation, naming the file and the line.
 *
 * ── HOW TO SATISFY EACH CHECK ────────────────────────────────────────────────
 *  A  Use a placeholder (APPROVED_ATTRIBUTIONS below). A REAL, attributable person
 *     is added to that allowlist in the same PR, so a human reads the name.
 *  B  Either use a placeholder figure — all zeros ("00%", "0.0d") or a prefix of
 *     1234567890 ("1,234") — or cite the source: a `source`/`sourceUrl` sibling
 *     attribute/key, or a `// source: …` / URL comment within 3 lines above.
 *     A genuinely MEASURED number is welcome; it just has to say where it came from.
 *  C  Say the major the manifest says. It is read from site/package.json.
 *  D  The scaffold is `npx oneie create node <name>`. The CLI is `@oneie/cli`.
 *
 * NOTE ON COMMENTS: comments are deliberately NOT excluded. A usage docblock is
 * the most-copied text in a component file — a fabricated person or figure in an
 * example is a fabricated person or figure. (This is not theoretical: it is how
 * `stat="4,217" … trendLabel="+12% MoM"` survived in Card.astro's own docblock
 * after the rendered stat cards had been fixed.)
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, extname, sep } from 'node:path'

const ROOT = process.cwd()
if (!existsSync(join(ROOT, 'site/package.json'))) {
  console.error('check-claims: run me from the repository root (`node scripts/check-claims.mjs` or `bun run check:claims`).')
  console.error(`  cwd is ${ROOT}, which has no site/package.json — that is a wrong directory, not a violation.`)
  process.exit(2)
}

/* ── what we read ───────────────────────────────────────────────────────────── */

const ROOTS = ['site/src', 'docs', 'README.md']
const EXTS = new Set(['.astro', '.tsx', '.jsx', '.ts', '.js', '.md', '.mdx'])
const SKIP_DIRS = new Set(['node_modules', 'dist', '.astro', '.git', 'build', '.output', '.vercel', '.wrangler'])

function walk(p, out) {
  let st
  try { st = statSync(p) } catch { return out }
  if (st.isFile()) { if (EXTS.has(extname(p))) out.push(p); return out }
  if (!st.isDirectory()) return out
  for (const e of readdirSync(p)) {
    if (SKIP_DIRS.has(e) || e.startsWith('.') && e !== '.github') continue
    walk(join(p, e), out)
  }
  return out
}

const FILES = ROOTS.flatMap((r) => walk(join(ROOT, r), []))
const rel = (f) => relative(ROOT, f).split(sep).join('/')

/* ── the shared parser ──────────────────────────────────────────────────────── */
/* Quote- and brace-aware. Single/double-quoted strings are LINE-BOUNDED, which is
 * correct for JS and stops an apostrophe in prose ("don't") from swallowing a file. */

function lineIndex(text) {
  const starts = [0]
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') starts.push(i + 1)
  return (off) => {
    let lo = 0, hi = starts.length - 1
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= off) lo = mid; else hi = mid - 1 }
    return lo + 1
  }
}

/** Walk from `i` (at a quote char) to just past the closing quote. */
function skipString(text, i, backtickStrings) {
  const q = text[i]
  if (q === '`' && !backtickStrings) return i + 1
  let j = i + 1
  while (j < text.length) {
    const c = text[j]
    if (c === '\\') { j += 2; continue }
    if (c === q) return j + 1
    if (c === '\n' && q !== '`') return j // unterminated on this line: not a string
    j++
  }
  return j
}

/** slots is a MULTIMAP. One element or object literal can carry several
 *  attributions or several figures; collapsing them to the last value is how a
 *  fabricated person hides behind the legitimate placeholder two lines below it. */
function push(map, key, value, line) {
  const k = key.toLowerCase()
  if (!map.has(k)) map.set(k, [])
  map.get(k).push({ key, value, line })
}
const slotValues = (r, keys) => keys.flatMap((k) => r.slots.get(k) || [])

const ATTR_RE = /([A-Za-z_][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)')/g
const KEY_RE = /(?:^|[{,;])\s*(?:['"]?)([A-Za-z_$][\w$]*)(?:['"]?)\s*:\s*(?:'([^'\n]*)'|"([^"\n]*)"|`([^`]*)`)/g

/**
 * @returns {{ tags: Record<string,{key:string,value:string,line:number}[]>[], objects: [] }}
 * Each record is { kind, name, line, slots: Map<lowerKey, {key,value,line}> }.
 */
function parse(file, text) {
  const ext = extname(file)
  const isMarkdown = ext === '.md' || ext === '.mdx'
  const backtickStrings = !isMarkdown
  const doObjects = !isMarkdown
  const lineOf = lineIndex(text)
  const records = []

  // ── tags: <Name ...> honouring quotes and brace depth, so `{() => x}` and
  //    `onclick="...=>..."` cannot truncate the attribute list early.
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (c === '"' || c === "'" || c === '`') { i = skipString(text, i, backtickStrings) - 1; continue }
    if (c !== '<' || !/[A-Za-z]/.test(text[i + 1] || '')) continue
    let j = i + 1, depth = 0, end = -1
    const cap = Math.min(text.length, i + 8000)
    while (j < cap) {
      const d = text[j]
      if (d === '"' || d === "'" || d === '`') { j = skipString(text, j, backtickStrings); continue }
      if (d === '{') depth++
      else if (d === '}') depth--
      else if (d === '>' && depth <= 0) { end = j; break }
      else if (d === '<' && depth <= 0 && j > i + 1) break // ran into the next tag: not a tag
      j++
    }
    if (end < 0) continue
    const inner = text.slice(i, end)
    const name = (inner.match(/^<([A-Za-z_][\w.:-]*)/) || [, '?'])[1]
    const slots = new Map()
    ATTR_RE.lastIndex = 0
    let m
    while ((m = ATTR_RE.exec(inner))) {
      const value = m[2] !== undefined ? m[2] : m[3]
      push(slots, m[1], value, lineOf(i + m.index))
    }
    if (slots.size) records.push({ kind: 'tag', name, line: lineOf(i), slots })
    i = end
  }

  // ── object literals: brace frames, direct string key:value pairs only.
  if (doObjects) {
    const stack = []
    const frames = []
    for (let i = 0; i < text.length; i++) {
      const c = text[i]
      if (c === '"' || c === "'" || c === '`') { i = skipString(text, i, backtickStrings) - 1; continue }
      if (c === '{') stack.push({ start: i, children: [] })
      else if (c === '}') {
        const f = stack.pop()
        if (!f) continue
        f.end = i
        if (stack.length) stack[stack.length - 1].children.push(f)
        frames.push(f)
      }
    }
    for (const f of frames) {
      // blank nested frames so only DIRECT pairs of this object are read
      let body = text.slice(f.start + 1, f.end)
      const base = f.start + 1
      for (const ch of f.children) {
        const s = ch.start - base, e = ch.end - base + 1
        body = body.slice(0, s) + body.slice(s, e).replace(/[^\n]/g, ' ') + body.slice(e)
      }
      const slots = new Map()
      KEY_RE.lastIndex = 0
      let m
      while ((m = KEY_RE.exec(body))) {
        const value = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4]
        push(slots, m[1], value, lineOf(base + m.index))
        KEY_RE.lastIndex = m.index + m[0].length - 1 // allow adjacent pairs sharing a comma
      }
      if (slots.size) records.push({ kind: 'object', name: '{…}', line: lineOf(f.start), slots })
    }
  }
  return records
}

/* ── CHECK A — no fabricated person ─────────────────────────────────────────── */

/* Full WAI-ARIA 1.2 role vocabulary, not merely the values this tree happens to
 * use today. The first `<input name="q" role="searchbox">` anyone adds must not
 * turn this gate into a false positive: a noisy gate gets disabled, and a
 * disabled gate protects nothing. */
const ARIA_ROLES = new Set(`alert alertdialog application article associationlist associationlistitemkey
associationlistitemvalue banner blockquote button caption cell checkbox code columnheader combobox comment
complementary contentinfo definition deletion dialog directory document emphasis feed figure form generic grid
gridcell group heading image img insertion link list listbox listitem log main mark marquee math menu menubar
menuitem menuitemcheckbox menuitemradio meter navigation none note option paragraph presentation progressbar radio
radiogroup region row rowgroup rowheader scrollbar search searchbox separator slider spinbutton status strong
subscript suggestion superscript switch tab table tablist tabpanel term textbox time timer toolbar tooltip tree
treegrid treeitem`.split(/\s+/).filter(Boolean))

const IDENTITY_SLOTS = ['author', 'name', 'authorname', 'personname', 'fullname', 'byline', 'speaker']
const ROLE_SLOTS = ['role', 'jobtitle', 'titlerole']

/* Approved placeholders. A REAL person goes here in the same PR that adds them,
 * so a human reads the name before it ships. There is no other escape hatch. */
const APPROVED_NAMES = new Set(['customer name', 'team member', 'your name', 'name', 'full name', 'author name', '—', '-'])
const APPROVED_ROLES = new Set(['role, company', 'role · company', 'role', 'your role', 'title, company', 'role/company', '—', '-'])

function checkA(all) {
  const v = []
  let examined = 0, aria = 0, allowed = 0
  for (const { file, records } of all) {
    for (const r of records) {
      const ids = slotValues(r, IDENTITY_SLOTS)
      const roles = slotValues(r, ROLE_SLOTS)
      if (!ids.length || !roles.length) continue
      examined++
      const human = roles.filter((x) => !ARIA_ROLES.has(x.value.trim().toLowerCase()))
      if (!human.length) { aria++; continue }
      const where = r.kind === 'tag' ? `<${r.name}>` : 'object literal'
      const bad = []
      for (const id of ids) if (!APPROVED_NAMES.has(id.value.trim().toLowerCase())) bad.push([id, 'name'])
      for (const ro of human) if (!APPROVED_ROLES.has(ro.value.trim().toLowerCase())) bad.push([ro, 'role'])
      if (!bad.length) { allowed++; continue }
      for (const [slot, what] of bad) {
        v.push(`${file}:${slot.line}: fabricated person? ${slot.key}="${slot.value}" is a real-sounding ${what} in an attribution (${where} at line ${r.line}, paired with ${what === 'name' ? `role="${human[0].value}"` : `${ids[0].key}="${ids[0].value}"`}). Use an approved placeholder, or add this real, attributable person to APPROVED_NAMES/APPROVED_ROLES in scripts/check-claims.mjs.`)
      }
    }
  }
  return { name: 'A  fabricated person', v, note: `${examined} name+role attribution record(s) examined — ${aria} ARIA-filtered, ${allowed} approved placeholder(s)` }
}

/* ── CHECK B — no unsourced statistic ───────────────────────────────────────── */
/* NARROW BY DESIGN. Only slots whose whole job is to hold a figure. Any digit in
 * one of these is a claim, and a claim either cites a source or is visibly a
 * placeholder. See "WHAT B DELIBERATELY DOES NOT CATCH" at the foot of this file. */

const STAT_SLOTS = ['stat', 'statvalue', 'metric', 'metricvalue', 'kpi', 'figure', 'trendlabel', 'datapoint']
const SOURCE_SLOTS = ['source', 'sourceurl', 'statsource', 'citation', 'cite', 'measured', 'measuredat', 'measuredon', 'evidence']
const SOURCE_COMMENT = /source\s*[:=]|https?:\/\/|measured|benchmark/i

function isPlaceholderFigure(value) {
  const digits = value.replace(/\D/g, '')
  if (!digits) return true                          // no number at all: not a statistic
  if (/^0+$/.test(digits)) return true              // 00% · 0.0d · +0% · 00 KB
  // A counting sequence is visibly fake — but only once it is long enough to read as
  // one. Four digits, not two: "+12%" is a plausible growth rate and shipped as one,
  // and an escape hatch that swallows "12%" makes B green on the very defect it exists
  // for. Proven: red proof B-2 caught stat="4,217" and MISSED trendLabel="+12% MoM"
  // until this line said 4.
  if (digits.length >= 4 && '1234567890'.startsWith(digits)) return true  // 1,234
  return false
}

function checkB(all, textOf) {
  const v = []
  let examined = 0, placeholder = 0, sourced = 0
  for (const { file, records } of all) {
    const lines = textOf(file).split('\n')
    for (const r of records) {
      for (const s of slotValues(r, STAT_SLOTS)) {
        examined++
        if (isPlaceholderFigure(s.value)) { placeholder++; continue }
        const sib = SOURCE_SLOTS.some((k) => r.slots.has(k))
        const near = lines.slice(Math.max(0, s.line - 4), s.line - 1).some((l) => SOURCE_COMMENT.test(l))
        if (sib || near) { sourced++; continue }
        v.push(`${file}:${s.line}: unsourced statistic ${s.key}="${s.value}" (in ${r.kind === 'tag' ? `<${r.name}>` : 'object literal'} at line ${r.line}). Cite it — a \`source\`/\`sourceUrl\` sibling, or a \`// source: …\` or URL comment within 3 lines above — or use a placeholder figure.`)
      }
    }
  }
  return { name: 'B  unsourced statistic', v, note: `${examined} stat-slot literal(s) examined — ${placeholder} placeholder, ${sourced} sourced` }
}

/* ── CHECK C — version strings match the manifest ───────────────────────────── */

function checkC(all, textOf) {
  const decl = JSON.parse(readFileSync(join(ROOT, 'site/package.json'), 'utf8'))
  const spec = (decl.dependencies?.astro || decl.devDependencies?.astro || '')
  const major = (spec.match(/(\d+)/) || [])[1]
  const v = []
  let examined = 0
  if (!major) return { name: 'C  version strings', v: ['site/package.json: no `astro` dependency found — cannot determine the major'], note: 'manifest unreadable' }
  const RE = /\bastro[\s@]+[\^~]?v?(\d+)(?:\.\d+)*\b/gi
  for (const { file } of all) {
    const lines = textOf(file).split('\n')
    lines.forEach((line, i) => {
      RE.lastIndex = 0
      let m
      while ((m = RE.exec(line))) {
        examined++
        if (m[1] !== major) {
          v.push(`${file}:${i + 1}: version string "${m[0]}" but site/package.json declares astro ${spec} (major ${major}) — ${line.trim().slice(0, 120)}`)
        }
      }
    })
  }
  return { name: 'C  version strings', v, note: `${examined} Astro version mention(s) examined against manifest major ${major} (${spec})` }
}

/* ── CHECK D — no foreign scaffold / install command ────────────────────────── */
/* An ALLOWLIST of packages this repo owns, not a blocklist of yesterday's typo.
 * A blocklist cannot catch the stranger's package nobody has typed yet — the same
 * objection this file raises against name-greps in check A. */

const OWNED_PACKAGES = new Set(['oneie', '@oneie/cli', '@oneie/sdk', '@oneie/mcp', '@oneie/react', '@oneie/evals', '@oneie/design'])
const OWNED_SCOPE = '@oneie/'
const REAL_SCAFFOLD = 'npx oneie create node <name>'
/* Third-party SCAFFOLDS this repo may legitimately point at. Installing or running
 * any third-party library (`bun add kysely`, `npx lighthouse`) is normal and is not
 * a claim about this project — D does not look at those at all. */
const ALLOWED_SCAFFOLDS = new Set(['astro', 'cloudflare', 'vite', 'create-astro', 'create-cloudflare', 'create-vite'])

/* Our brand namespace. A package that wears this project's name and is not ours is
 * the exact defect: `create-one-app` is REAL, owned by an unrelated maintainer, last
 * published 2022 — and it sat behind the home page's copy-to-clipboard CTA. An
 * allowlist of what we own catches the NEXT squatter; a blocklist of `one-app`
 * catches only the one already typed. */
/* Matches a package that wears this project's name. NOTE the deliberate absence of
 * a bare `one`: "You can npm install one of the plugins later" is a sentence, and a
 * gate that reds ordinary English gets disabled — which is the one outcome worse than
 * no gate at all. (Measured: it fired on exactly that line in docs/tutorial.md.) Bare
 * `one` is only a package name after an unambiguous `create`, so BRAND_SCAFFOLD adds
 * it back there. Known miss: a foreign package literally named `one`, installed. */
const BRAND_RE = /one-?app|oneie|one\.ie|(?:^|[@/])one[-/]|-one$/i
const BRAND_SCAFFOLD = /^one$/i

const CMD_PATTERNS = [
  { kind: 'scaffold', re: /\b(?:npm|yarn|pnpm|bun)\s+create\s+(@?[\w.@/-]+)/gi },
  { kind: 'scaffold', re: /\b(?:npx|bunx|pnpm\s+dlx)\s+(create-[\w.@/-]+)/gi },
  { kind: 'run', re: /\b(?:npx|bunx|pnpm\s+dlx)\s+(@?[\w.@/-]+)/gi },
  { kind: 'install', re: /\b(?:npm|yarn|pnpm|bun)\s+(?:i|install|add)\s+(?:-{1,2}[\w-]+\s+)*(@?[\w.@/-]+)/gi },
]

/** `one-app@latest` → `one-app`; `@oneie/cli@4` → `@oneie/cli`; trailing punctuation dropped. */
function normalizePkg(raw) {
  let p = raw.replace(/[.,;:)`'"\\]+$/, '')
  const at = p.indexOf('@', p.startsWith('@') ? 1 : 0)
  if (at > 0) p = p.slice(0, at)
  return p
}

const isOwned = (pkg) => OWNED_PACKAGES.has(pkg) || pkg.startsWith(OWNED_SCOPE) || OWNED_PACKAGES.has(pkg.replace(/^create-/, ''))

function checkD(all, textOf) {
  const v = []
  let examined = 0, owned = 0, thirdParty = 0
  for (const { file } of all) {
    const lines = textOf(file).split('\n')
    lines.forEach((line, i) => {
      const seen = new Set()
      for (const { kind, re } of CMD_PATTERNS) {
        re.lastIndex = 0
        let m
        while ((m = re.exec(line))) {
          const pkg = normalizePkg(m[1])
          if (!pkg || seen.has(pkg)) continue
          seen.add(pkg)
          const brand = BRAND_RE.test(pkg) || (kind === 'scaffold' && BRAND_SCAFFOLD.test(pkg))
          // Two questions only: is this a SCAFFOLD (a command that claims to create a
          // project here), and does it wear OUR NAME? Everything else is not our business.
          if (kind !== 'scaffold' && !brand) continue
          examined++
          if (isOwned(pkg)) { owned++; continue }
          if (kind === 'scaffold' && !brand && ALLOWED_SCAFFOLDS.has(pkg)) { thirdParty++; continue }
          const why = brand
            ? `names "${pkg}" — a package wearing this project's name that we do not publish`
            : `scaffolds with "${pkg}", which this project does not own`
          v.push(`${file}:${i + 1}: ${kind} command ${why}. The scaffold is \`${REAL_SCAFFOLD}\`; the CLI is \`@oneie/cli\`. — ${line.trim().slice(0, 120)}`)
        }
      }
      // Belt and braces: the literal package name, in any context at all — prose,
      // a code fence, an onclick handler that writes it to the clipboard.
      for (const lit of ['create-one-app', 'create one-app']) {
        if (seen.has('one-app') || seen.has('create-one-app')) break // already named above
        if (line.toLowerCase().includes(lit)) {
          examined++
          v.push(`${file}:${i + 1}: names the foreign scaffold "${lit}". That package is real and owned by an unrelated maintainer. The scaffold is \`${REAL_SCAFFOLD}\`. — ${line.trim().slice(0, 120)}`)
        }
      }
    })
  }
  return { name: 'D  foreign scaffold command', v, note: `${examined} scaffold/brand-namespace command(s) examined — ${owned} owned by this project, ${thirdParty} allowlisted third-party scaffold(s); third-party installs and npx tools are out of scope by design` }
}

/* ── run ────────────────────────────────────────────────────────────────────── */

const cache = new Map()
const textOf = (f) => cache.get(f)
const all = FILES.map((f) => {
  const text = readFileSync(f, 'utf8')
  const r = rel(f)
  cache.set(r, text)
  return { file: r, records: parse(f, text) }
})

const results = [checkA(all), checkB(all, textOf), checkC(all, textOf), checkD(all, textOf)]
let failed = 0
console.log(`check-claims — ${all.length} file(s) under ${ROOTS.join(', ')}\n`)
for (const r of results) {
  if (r.v.length) {
    failed += r.v.length
    console.log(`FAIL  ${r.name} — ${r.v.length} violation(s)   [${r.note}]`)
    for (const line of r.v) console.log(`      ${line}`)
  } else {
    console.log(`ok    ${r.name} — 0 violations   [${r.note}]`)
  }
}
if (failed) {
  console.log(`\n${failed} violation(s). Nothing here is a style preference: each of these four shipped to production on a public repo in one day.`)
  process.exit(1)
}
console.log('\nAll four checks green.')

/* ── WHAT B DELIBERATELY DOES NOT CATCH ──────────────────────────────────────
 * B is scoped to stat SLOTS (stat/metric/kpi/figure/trendLabel/datapoint). A broad
 * "any number in a marketing file" rule produced 170 hits on this tree — almost all
 * of them CSS `color-mix(… 14%)`, Tailwind `size-2.5`, and `calc(100% - 2px)`. A gate
 * that cries wolf gets deleted, so B does not see:
 *   · a figure in free prose or in a `label`/`title`/heading  ("thousands of sites")
 *   · a figure in Markdown body text
 *   · a value bound from a variable — `stat={total}` — only string literals are read
 *   · prices, chart data arrays, CSS lengths and percentages, class names
 *   · whether a CITED number is TRUE. B checks that a source is claimed, not that
 *     the source says what the number says. That is a human's job in review.
 * The bet: the defect shape that actually shipped was a big number in a stat card,
 * and that is caught exactly. Widen it only with a measurement of the new noise.
 *
 * ── KNOWN MISSES ELSEWHERE ───────────────────────────────────────────────────
 * A: an attribution split across two objects (name in one, role in another) or
 *    composed from variables. A: a person with no role slot at all.
 * C: a composed version string — `Astro {major}` — has no literal to compare.
 * D: a raw `git clone` of a stranger's repo, or a curl-to-shell installer.
 */
