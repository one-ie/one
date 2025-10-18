import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';
import fs from 'fs-extra';
import path from 'path';

// Only use edge renderer in production builds for Cloudflare
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  site: 'https://one.ie',
  integrations: [
    react(),
    sitemap(),
    {
      name: 'copy-installation-folder',
      hooks: {
        'astro:build:done': async ({ dir }) => {
          const installationName = process.env.INSTALLATION_NAME;

          if (!installationName) {
            console.log('⚠️  No INSTALLATION_NAME set, skipping installation folder copy');
            return;
          }

          const sourcePath = path.resolve(`/${installationName}`);
          const destPath = path.join(dir.pathname, '_installation');

          if (fs.existsSync(sourcePath)) {
            console.log(`📦 Copying installation folder: ${installationName}`);
            await fs.copy(sourcePath, destPath);
            console.log(`✅ Installation folder copied to dist/_installation`);
          } else {
            console.log(`⚠️  Installation folder not found: ${sourcePath}`);
          }
        },
      },
    },
  ],
  vite: {
    plugins: [
      tailwindcss({
        content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
      }),
    ],
    resolve: {
      alias: isProd
        ? {
            'react-dom/server': 'react-dom/server.edge',
          }
        : {},
    },
    ssr: {
      external: ['node:async_hooks'],
    },
  },
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: false,
    },
    mode: 'directory',
    runtime: {
      mode: 'local',
    },
  }),
});
