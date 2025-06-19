# 🗄️ All Files Access Guide

> Complete access to ALL file types in Obsidian with VSCode editor integration

## 📁 File Types Configuration

### Code Files (VSCode Editor)
These will open with syntax highlighting via VSCode editor plugin:

#### JavaScript/TypeScript
- [[src/pages/api/chat.ts|chat.ts]] - API endpoint
- [[src/lib/utils.ts|utils.ts]] - Utilities
- [[src/components/Chat.tsx|Chat.tsx]] - React component
- [[astro.config.mjs|astro.config.mjs]] - Astro config

#### Configuration Files
- [[package.json|package.json]] - NPM packages
- [[tsconfig.json|tsconfig.json]] - TypeScript config
- [[tailwind.config.mjs|tailwind.config.mjs]] - Tailwind config
- [[vitest.config.ts|vitest.config.ts]] - Test config

#### Environment Files
- [[.env|.env]] - Environment variables
- [[.env.local|.env.local]] - Local overrides
- [[.env.example|.env.example]] - Template

#### Git Files
- [[.gitignore|.gitignore]] - Git ignore rules
- [[.git/config|.git/config]] - Git configuration

#### AI Editor Configs
- [[.cursorrules|.cursorrules]] - Cursor rules
- [[.cursor/mcp.json|.cursor/mcp.json]] - MCP config
- [[.windsurfrules|.windsurfrules]] - Windsurf rules
- [[.clinerules|.clinerules]] - Cline rules

### Markdown Files (Native Obsidian)
- [[README.md|README.md]] - Project readme
- [[CLAUDE.md|CLAUDE.md]] - Claude guide
- All `.md` and `.mdx` files

### Other Files
- [[.DS_Store|.DS_Store]] - macOS metadata
- [[.nixpacks.toml|.nixpacks.toml]] - Deployment config
- [[wrangler.toml|wrangler.toml]] - Cloudflare config

## 🔧 Quick File Access by Type

### Frontend Files
```
src/
├── components/     # React components (.tsx)
├── pages/         # Routes (.astro, .ts)
├── layouts/       # Layouts (.astro)
├── lib/          # Utilities (.ts)
├── hooks/        # React hooks (.ts)
├── stores/       # State (.ts)
└── styles/       # CSS files
```

### Backend/API Files
```
src/pages/api/    # API endpoints (.ts)
convex/          # Convex functions
```

### Configuration Files
```
Root Directory:
├── .env files
├── .cursor/
├── .obsidian/
├── package.json
├── tsconfig.json
└── *.config.*
```

## 🚀 VSCode Editor Plugin Features

The VSCode editor plugin enables:
- ✅ Syntax highlighting for all languages
- ✅ Code folding
- ✅ Multi-cursor editing
- ✅ Find & replace with regex
- ✅ Bracket matching
- ✅ Auto-indentation

## 📝 File Type Associations

To ensure files open correctly:

1. **Code files** → VSCode editor
   - `.ts`, `.tsx`, `.js`, `.jsx`
   - `.json`, `.yaml`, `.toml`
   - `.css`, `.scss`
   - `.env`, `.gitignore`

2. **Markdown files** → Obsidian editor
   - `.md`, `.mdx`

3. **Binary files** → External viewer
   - Images, PDFs, etc.

## 🎯 Quick Commands

- **Create new code file**: Click ribbon icon or use command palette
- **Open any file**: `Cmd+O` and type filename
- **Switch editors**: Right-click → "Open with..."
- **Search all files**: `Cmd+Shift+F`

## 💡 Pro Tips

1. **Split View**: Open code and markdown side-by-side
2. **Quick Edit**: Double-click any file in explorer
3. **Terminal**: Use integrated terminal for git/npm commands
4. **Hotkeys**: Configure VSCode-style hotkeys in Obsidian

---

*All files are now accessible in Obsidian! 🎉*