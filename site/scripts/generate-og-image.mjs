// Generates public/og.png — the default social-share image every page falls
// back to (Layout.astro passes it as ogImage when a page doesn't set its own).
// Not a build step: OG images are a stable, versioned asset, not something
// that needs regenerating on every `astro build`. Re-run this by hand
// (`bun scripts/generate-og-image.mjs` — needs Bun's native TS import
// support for the seo-site.ts import below; plain `node` won't resolve it)
// after a brand-color or copy change.
//
// Colors are a deliberate literal copy of `one.config.ts`'s `brand.tokens`
// (primary background, foreground text) — this script runs standalone via
// plain Node, outside the Astro/Vite pipeline that resolves `one.config.ts`'s
// own module graph, so importing it directly isn't reliable here. If you
// change the brand tokens, update both places.
import sharp from 'sharp'
import { writeFile } from 'node:fs/promises'
import { SITE } from '../src/lib/seo-site.ts'

const PRIMARY = 'hsl(216, 55%, 25%)' // one.config.ts brand.tokens.primary
const FOREGROUND = 'hsl(0, 0%, 100%)' // one.config.ts brand.tokens.foreground

const WIDTH = 1200
const HEIGHT = 630

function escapeXml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Rough word-wrap for the tagline — SVG <text> doesn't wrap on its own.
// ~19px/char is a conservative estimate for this font/weight at 34px; good
// enough for a fixed, hand-regenerated asset (not runtime-rendered text).
function wrap(text, maxWidth, approxCharWidth) {
  const words = text.split(' ')
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length * approxCharWidth > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  return lines
}

const taglineLines = wrap(SITE.description, WIDTH - 160, 19)
const taglineTspans = taglineLines
  .map((line, i) => `<tspan x="80" dy="${i === 0 ? 0 : 46}">${escapeXml(line)}</tspan>`)
  .join('')

const svg = `
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${PRIMARY}" />
  <text x="80" y="280" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="140" font-weight="800" letter-spacing="-0.02em" fill="${FOREGROUND}">${escapeXml(SITE.name)}</text>
  <text x="80" y="360" font-family="-apple-system, 'Segoe UI', Helvetica, Arial, sans-serif" font-size="34" font-weight="500" fill="${FOREGROUND}" opacity="0.72">${taglineTspans}</text>
  <rect x="80" y="440" width="72" height="6" rx="3" fill="${FOREGROUND}" opacity="0.5" />
</svg>
`.trim()

const outPath = new URL('../public/og.png', import.meta.url)
await writeFile(outPath, await sharp(Buffer.from(svg)).png().toBuffer())
console.log(`Wrote ${outPath.pathname} (${WIDTH}x${HEIGHT})`)
