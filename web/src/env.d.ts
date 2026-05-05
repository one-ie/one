/// <reference types="astro/client" />

declare module '*.md?raw' {
  const content: string
  export default content
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  first<T = Record<string, unknown>>(): Promise<T | null>
  run(): Promise<{ success: boolean }>
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>
}
interface D1Database {
  prepare(query: string): D1PreparedStatement
}
interface R2Object { key: string; size: number; httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }
interface R2ObjectBody extends R2Object { body: ReadableStream; text(): Promise<string>; arrayBuffer(): Promise<ArrayBuffer> }
interface R2Objects { objects: R2Object[] }
interface R2Bucket {
  put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: { httpMetadata?: { contentType?: string }; customMetadata?: Record<string, string> }): Promise<R2Object>
  get(key: string): Promise<R2ObjectBody | null>
  list(options?: { prefix?: string }): Promise<R2Objects>
  delete(key: string): Promise<void>
}
interface KVNamespace {
  get(key: string): Promise<string | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
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
    SESSION?: KVNamespace
  }
}

declare namespace App {
  interface Locals {
    runtime?: Runtime
  }
}
