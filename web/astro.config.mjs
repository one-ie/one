import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'
import node from '@astrojs/node'

const isDev = process.env.NODE_ENV !== 'production'
const adapter = isDev
  ? node({ mode: 'standalone' })
  : cloudflare({
      prerenderEnvironment: 'node',
      imageService: 'passthrough',
      sessions: false,
    })

export default defineConfig({
  output: 'server',
  adapter,
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        ...(isDev ? {} : { 'react-dom/server': 'react-dom/server.edge' }),
      },
    },
    ssr: {
      external: ['node:async_hooks'],
    },
  },
  markdown: { syntaxHighlight: false },
  security: { checkOrigin: false },
})
