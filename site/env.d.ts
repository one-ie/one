/// <reference path=".astro/types.d.ts" />

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(): Promise<T | null>
  run(): Promise<{ success: boolean }>
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
}
interface D1Database {
  prepare(query: string): D1PreparedStatement
}
