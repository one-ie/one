/// <reference types="astro/client" />
/// <reference types="astro/server" />

interface ImportMetaEnv {
  // Add your environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}