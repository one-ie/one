import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'
import node from '@astrojs/node'
import { readFileSync, existsSync } from 'node:fs'

const isDev = process.env.NODE_ENV !== 'production'

if (isDev && existsSync('.dev.vars')) {
  for (const line of readFileSync('.dev.vars', 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
const adapter = isDev
  ? node({ mode: 'standalone' })
  : cloudflare({
      prerenderEnvironment: 'node',
      imageService: 'passthrough',
      sessions: false,
      remoteBindings: false,
    })

export default defineConfig({
  output: 'server',
  adapter,
  integrations: [react()],
  build: { inlineStylesheets: 'always' },
  vite: {
    server: { fs: { allow: ['..'] } },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        ...(isDev ? {} : { 'react-dom/server': 'react-dom/server.edge' }),
      },
    },
    ssr: {
      external: [
        'node:async_hooks',
        'cookie',
        'cytoscape',
        '@xyflow/react',
        'shiki',
        'media-chrome',
        'media-chrome/react',
        'motion',
      ],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('jsx-runtime') || id.includes('ui-signal')) return 'sidebar'
          },
        },
      },
    },
  },
  markdown: { syntaxHighlight: false },
  security: { checkOrigin: false },
})
