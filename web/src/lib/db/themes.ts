export interface Theme {
  id: string
  owner_id: string | null
  name: string
  tokens: string
  is_public: number
  fork_of: string | null
  created_at: number
}

export type ThemeInsert = Omit<Theme, 'id' | 'created_at'>

export async function listThemes(db: D1Database, ownerId?: string | null): Promise<Theme[]> {
  if (ownerId == null) {
    const { results } = await db
      .prepare('SELECT * FROM themes WHERE is_public = 1 ORDER BY created_at DESC')
      .all<Theme>()
    return results
  }
  const { results } = await db
    .prepare('SELECT * FROM themes WHERE owner_id = ? ORDER BY created_at DESC')
    .bind(ownerId)
    .all<Theme>()
  return results
}

export async function getTheme(db: D1Database, id: string): Promise<Theme | null> {
  return db
    .prepare('SELECT * FROM themes WHERE id = ?')
    .bind(id)
    .first<Theme>()
}

export async function createTheme(db: D1Database, data: ThemeInsert): Promise<Theme> {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db
    .prepare(
      'INSERT INTO themes (id, owner_id, name, tokens, is_public, fork_of, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(id, data.owner_id ?? null, data.name, data.tokens, data.is_public, data.fork_of ?? null, now)
    .run()
  return { id, ...data, created_at: now }
}

export async function patchTheme(
  db: D1Database,
  id: string,
  tokens: string
): Promise<{ success: boolean }> {
  return db
    .prepare('UPDATE themes SET tokens = ? WHERE id = ?')
    .bind(tokens, id)
    .run()
}

export async function forkTheme(db: D1Database, id: string, ownerId: string): Promise<Theme | null> {
  const source = await getTheme(db, id)
  if (!source) return null
  return createTheme(db, {
    owner_id: ownerId,
    name: `${source.name} (fork)`,
    tokens: source.tokens,
    is_public: 0,
    fork_of: source.id,
  })
}
