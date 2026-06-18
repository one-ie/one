import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'
import oneIntegration from './one.config.ts'

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'passthrough',
    sessions: false,
  }),
  integrations: [react(), oneIntegration],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
    ssr: {
      noExternal: ['react', 'react-dom', '@astrojs/react', 'better-auth'],
    },
  },
})
