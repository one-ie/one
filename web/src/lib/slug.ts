import { customAlphabet } from 'nanoid'

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
