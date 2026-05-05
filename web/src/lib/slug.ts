import { customAlphabet } from 'nanoid'
import type { SiteConfig } from './site'
import { parseSite } from './site'

const alpha = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 8)

export function randomSlug(): string {
  return alpha()
}

export type SlugOwner = { slug: string; pubkey: string; credential_id: string }

export async function getSlugOwner(slug: string, db: D1Database): Promise<SlugOwner | null> {
  return db
    .prepare('SELECT slug, pubkey, credential_id FROM owners WHERE slug = ?')
    .bind(slug)
    .first<SlugOwner>()
}

export async function listFiles(slug: string, content: R2Bucket): Promise<string[]> {
  const listed = await content.list({ prefix: `${slug}/` })
  return listed.objects.map(o => o.key.slice(slug.length + 1))
}

export async function slugExists(slug: string, db: D1Database): Promise<boolean> {
  const row = await db.prepare('SELECT slug FROM owners WHERE slug = ?').bind(slug).first()
  return row !== null
}

interface SlugContext {
  owner: Awaited<ReturnType<typeof getSlugOwner>>
  site: SiteConfig | null
  styleBlock: string
}

export async function getSlugContext(slug: string, db: D1Database, content: R2Bucket): Promise<SlugContext | null> {
  const owner = await getSlugOwner(slug, db)
  if (!owner) return null
  const siteObj = await content.get(`${slug}/site.md`)
  if (!siteObj) return { owner, site: null, styleBlock: '' }
  const md = await siteObj.text()
  const site = parseSite(md)
  return { owner, site, styleBlock: site.styleBlock }
}
