/// <reference types="astro/client" />

declare module '*.md?raw' {
  const content: string
  export default content
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
  }
}

declare namespace App {
  interface Locals {
    runtime?: Runtime
  }
}
