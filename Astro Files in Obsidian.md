# 🚀 Astro Files in Obsidian

> VSCode Editor configuration for `.astro` files

## ✅ Configuration Complete

The VSCode editor plugin is now configured to handle `.astro` files with:
- Syntax highlighting
- Code folding
- Line numbers
- Word wrap
- IntelliSense support

## 📁 Quick Access to Astro Files

### Pages
- [[src/pages/index.astro]] - Homepage
- [[src/pages/chat.astro]] - Chat page
- [[src/pages/docs/index.astro]] - Docs index
- [[src/pages/blog/index.astro]] - Blog index

### Layouts
- [[src/layouts/Layout.astro]] - Main layout
- [[src/layouts/Blog.astro]] - Blog layout
- [[src/layouts/Docs.astro]] - Docs layout
- [[src/layouts/Landing.astro]] - Landing layout

### Components
- [[src/components/Header.astro]] - Header
- [[src/components/Footer.astro]] - Footer
- [[src/components/Hero.astro]] - Hero section
- [[src/components/Features.astro]] - Features

### Configuration
- [[astro.config.mjs]] - Astro config

## 🎯 How It Works

When you click any `.astro` file link:
1. VSCode editor opens automatically
2. Full syntax highlighting for Astro syntax
3. Component props recognition
4. Frontmatter JavaScript support
5. HTML/JSX highlighting in template

## 💡 Tips for Astro Files

### Frontmatter Section
```astro
---
// This JavaScript/TypeScript code runs at build time
import Layout from '../layouts/Layout.astro';
import Card from '../components/Card.astro';

const title = "My Page";
---
```

### Template Section
```astro
<Layout title={title}>
  <h1>Welcome to {title}</h1>
  <Card client:load />
</Layout>
```

## 🔧 VSCode Editor Features

- **Syntax**: Full Astro language support
- **Props**: Auto-complete for component props
- **Imports**: Path suggestions for imports
- **Formatting**: Preserves Astro structure
- **Errors**: Shows syntax errors inline

## 🚨 Troubleshooting

If `.astro` files don't open in VSCode editor:
1. Reload Obsidian (`Cmd+R`)
2. Check Settings → Community plugins → VSCode Editor is enabled
3. Verify the file extension is exactly `.astro`

## 📋 Supported File Types

The VSCode editor now handles:
- `.astro` - Astro components
- `.ts`, `.tsx` - TypeScript
- `.js`, `.jsx` - JavaScript
- `.vue` - Vue components
- `.svelte` - Svelte files
- `.scss`, `.css` - Styles
- And many more...

---

*Enjoy coding Astro files directly in Obsidian! 🎉*