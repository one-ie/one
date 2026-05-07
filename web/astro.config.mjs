import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import cloudflare from '@astrojs/cloudflare'

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    prerenderEnvironment: 'node',
    imageService: 'passthrough',
    sessions: false,
    remoteBindings: false,
  }),
  integrations: [react()],
  build: { inlineStylesheets: 'always' },
  vite: {
    server: { fs: { allow: ['..'] } },
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': new URL('./src', import.meta.url).pathname,
        ...(process.env.NODE_ENV === 'production' && {
          'react-dom/server': 'react-dom/server.edge',
        }),
      },
    },
    ssr: {
      noExternal: ['react', 'react-dom', '@astrojs/react'],
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
