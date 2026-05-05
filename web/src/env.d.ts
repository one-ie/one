/// <reference types="astro/client" />

declare module '*.md?raw' {
  const content: string
  export default content
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(): Promise<T | null>
  run(): Promise<{ success: boolean }>
}
interface D1Database {
  prepare(query: string): D1PreparedStatement
}
interface R2Object { key: string; customMetadata?: Record<string, string> }
interface R2ObjectBody extends R2Object { text(): Promise<string>; arrayBuffer(): Promise<ArrayBuffer> }
interface R2Objects { objects: R2Object[] }
interface R2Bucket {
  put(key: string, value: string | ArrayBuffer | ReadableStream, options?: { customMetadata?: Record<string, string> }): Promise<R2Object>
  get(key: string): Promise<R2ObjectBody | null>
  list(options?: { prefix?: string }): Promise<R2Objects>
  delete(key: string): Promise<void>
}

interface Runtime {
  env: {
    OPENROUTER_API_KEY: string
    GROQ_API_KEY?: string
    TELEGRAM_TOKEN?: string
    DISCORD_TOKEN?: string
    AGENT_ID?: string
    AGENT_NAME?: string
    AGENT_MODEL?: string
    AGENT_PROMPT?: string
    ONE_API_URL?: string
    SERVER_SECRET: string
    DB: D1Database
    CONTENT: R2Bucket
  }
}

declare namespace App {
  interface Locals {
    runtime?: Runtime
  }
}
