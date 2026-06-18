/**
 * Lazy D1 Dialect for Kysely (optional — requires `bun add kysely`)
 *
 * Defers the D1 binding lookup until the first query executes. Lets the
 * Kysely/Better Auth instance be constructed at module level (no CF env yet)
 * while actual DB access only happens inside a request handler.
 *
 * Usage with better-auth:
 *   import { Kysely } from 'kysely'
 *   import { LazyD1Dialect } from '@/lib/d1-kysely-dialect'
 *   const db = new Kysely<unknown>({ dialect: new LazyD1Dialect() })
 *   export const auth = betterAuth({ database: { db, type: 'sqlite' }, ... })
 */

// biome-ignore lint/suspicious/noExplicitAny: kysely interfaces — add `bun add kysely` for full types
type AnyDialect = any

class D1Connection {
  constructor(private readonly db: D1Database) {}

  async executeQuery<R>(query: { sql: string; parameters: readonly unknown[] }): Promise<{ rows: R[]; numAffectedRows?: bigint; insertId?: bigint }> {
    const stmt = this.db.prepare(query.sql).bind(...(query.parameters as unknown[]))
    const result = (await stmt.all<R>()) as unknown as {
      results?: R[]
      meta?: { changes?: number; last_row_id?: number }
    }
    return {
      rows: result.results ?? [],
      numAffectedRows: result.meta?.changes != null ? BigInt(result.meta.changes) : undefined,
      insertId: result.meta?.last_row_id != null ? BigInt(result.meta.last_row_id) : undefined,
    }
  }

  // biome-ignore lint/correctness/useYield: generator required by Kysely interface; D1 has no streaming
  async *streamQuery(): AsyncGenerator<never> {
    throw new Error('D1 does not support streaming queries')
  }
}

class LazyD1Driver {
  private connection: D1Connection | null = null

  async init(): Promise<void> {}

  async acquireConnection(): Promise<D1Connection> {
    if (!this.connection) {
      const mod = (await import('cloudflare:workers' as string)) as { env?: { DB?: D1Database } }
      const db = mod.env?.DB
      if (!db) throw new Error('D1 binding "DB" not found — add [[d1_databases]] binding = "DB" in wrangler.toml')
      this.connection = new D1Connection(db)
    }
    return this.connection
  }

  async beginTransaction(): Promise<void> { throw new Error('D1 does not support interactive transactions') }
  async commitTransaction(): Promise<void> {}
  async rollbackTransaction(): Promise<void> {}
  async releaseConnection(): Promise<void> {}
  async destroy(): Promise<void> { this.connection = null }
}

export class LazyD1Dialect implements AnyDialect {
  createAdapter() { return { supportsReturning: false, supportsTransactionalDdl: false, supportsUpdateFrom: false } }
  createDriver() { return new LazyD1Driver() }
  createIntrospector(db: unknown) { return db }
  createQueryCompiler() {
    // Requires: bun add kysely, then replace with SqliteQueryCompiler
    throw new Error('LazyD1Dialect: add `bun add kysely` and import SqliteQueryCompiler')
  }
}
