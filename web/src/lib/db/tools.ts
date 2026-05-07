export interface ToolConnection {
  id: string
  owner_id: string
  provider: string
  account: string
  scopes: string
  refresh_at: number | null
  created_at: number
}

export type ToolConnectionInsert = Omit<ToolConnection, 'id' | 'created_at'>

export async function listConnections(db: D1Database, ownerId: string): Promise<ToolConnection[]> {
  const { results } = await db
    .prepare('SELECT * FROM tool_connections WHERE owner_id = ? ORDER BY created_at DESC')
    .bind(ownerId)
    .all<ToolConnection>()
  return results
}

export async function getConnection(db: D1Database, id: string): Promise<ToolConnection | null> {
  return db
    .prepare('SELECT * FROM tool_connections WHERE id = ?')
    .bind(id)
    .first<ToolConnection>()
}

export async function createConnection(db: D1Database, data: ToolConnectionInsert): Promise<ToolConnection> {
  const id = crypto.randomUUID()
  const now = Date.now()
  await db
    .prepare(
      'INSERT INTO tool_connections (id, owner_id, provider, account, scopes, refresh_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(id, data.owner_id, data.provider, data.account, data.scopes, data.refresh_at ?? null, now)
    .run()
  return { id, ...data, created_at: now }
}

export async function deleteConnection(db: D1Database, id: string): Promise<{ success: boolean }> {
  return db
    .prepare('DELETE FROM tool_connections WHERE id = ?')
    .bind(id)
    .run()
}
