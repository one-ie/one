# 🗂️ Hidden Files & Folders Directory

> Complete list of all dot-files and hidden folders in the ONE project

## 🔧 Configuration Files

### Environment & Secrets
- [[.env|.env]] - Main environment variables
- [[.env.local|.env.local]] - Local environment overrides  
- [[.env.example|.env.example]] - Environment template

### Git Configuration
- [[.gitignore|.gitignore]] - Git ignore rules
- `.git/` - Git repository data (folder)

### Editor Configurations
- [[.cursor/rules/cursor_rules.mdc|.cursor/]] - Cursor AI rules
- [[.windsurfrules|.windsurfrules]] - Windsurf editor rules
- `.roo/` - Roo configuration (folder)
- [[.roomodes|.roomodes]] - Roo modes
- [[.taskmasterconfig|.taskmasterconfig]] - Task Master config

### Obsidian Configuration
- `.obsidian/` - Obsidian vault settings
  - `app.json` - App settings
  - `appearance.json` - Theme settings
  - `workspace.json` - Workspace layout
  - `plugins/` - Installed plugins
  - `snippets/` - CSS snippets

## 📁 Hidden Folders Structure

```
/Users/toc/Server/ONE/one/
├── .cursor/
│   ├── mcp.json
│   └── rules/
│       ├── cursor_rules.mdc
│       ├── dev_workflow.mdc
│       ├── self_improve.mdc
│       └── taskmaster.mdc
├── .git/
├── .obsidian/
│   ├── app.json
│   ├── appearance.json
│   ├── community-plugins.json
│   ├── core-plugins.json
│   ├── hotkeys.json
│   ├── plugins/
│   ├── snippets/
│   │   └── env-files.css
│   ├── types.json
│   └── workspace.json
└── .roo/
```

## 🎯 Quick Access Links

### Development Tools
- [[.cursor/mcp.json|MCP Configuration]]
- [[.cursor/rules/cursor_rules.mdc|Cursor Rules]]
- [[.cursor/rules/dev_workflow.mdc|Dev Workflow]]
- [[.cursor/rules/self_improve.mdc|Self Improvement Rules]]
- [[.cursor/rules/taskmaster.mdc|Taskmaster Rules]]

### Project Configuration
- [[.gitignore|Git Ignore]]
- [[.taskmasterconfig|Taskmaster Config]]
- [[.windsurfrules|Windsurf Rules]]
- [[.roomodes|Roo Modes]]

## 💡 Obsidian Tips for Hidden Files

1. **File Explorer**: All dot-files should now be visible in the file explorer
2. **Quick Switch**: `Cmd+O` works with hidden files (e.g., type ".git")
3. **Search**: `Cmd+Shift+F` searches hidden files too
4. **Create Links**: Use `[[.filename]]` to link to any hidden file

## 🔍 Finding More Hidden Files

To discover all hidden files in terminal:
```bash
# List all dot-files
find . -name ".*" -type f

# List all dot-folders  
find . -name ".*" -type d
```

## ⚙️ Settings Applied

✅ `showUnsupportedFiles: true` - Show all file types
✅ `showHiddenFiles: true` - Show system hidden files
✅ `showDotFiles: true` - Show dot-files in explorer

---

*Note: Restart Obsidian if files don't appear immediately*