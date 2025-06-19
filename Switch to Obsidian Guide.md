# 🔄 Switch Everything to Obsidian

> Complete guide to make Obsidian your default editor for ALL file types

## 🎯 Quick Method: Change Default Apps

### For Code Files (.ts, .tsx, .js, .jsx)
1. Find any `.ts` file in Finder
2. Right-click → "Get Info" (or `Cmd+I`)
3. Under "Open with:" select **Obsidian**
4. Click "Change All..." 
5. Confirm to apply to all `.ts` files

### Repeat for Each File Type:
- `.tsx` - TypeScript React
- `.js` - JavaScript  
- `.jsx` - JavaScript React
- `.json` - JSON files
- `.env` - Environment files
- `.md` - Markdown (if not already)
- `.mdx` - MDX files
- `.css` - Stylesheets
- `.yaml`/`.yml` - YAML files
- `.toml` - TOML files
- `.sh` - Shell scripts

## 🛠️ Terminal Method (Faster)

Run these commands to set Obsidian as default:

```bash
# Install duti if you don't have it
brew install duti

# Set Obsidian as default for common code files
duti -s md.obsidian .ts all
duti -s md.obsidian .tsx all
duti -s md.obsidian .js all
duti -s md.obsidian .jsx all
duti -s md.obsidian .json all
duti -s md.obsidian .css all
duti -s md.obsidian .scss all
duti -s md.obsidian .yaml all
duti -s md.obsidian .yml all
duti -s md.obsidian .toml all
duti -s md.obsidian .env all
duti -s md.obsidian .gitignore all
duti -s md.obsidian .sh all
duti -s md.obsidian .bash all
```

## 📁 File Association List

### Source Code
- `.ts`, `.tsx` → TypeScript
- `.js`, `.jsx` → JavaScript
- `.mjs`, `.cjs` → JS modules
- `.vue` → Vue components
- `.svelte` → Svelte files

### Config Files
- `.json` → JSON
- `.yaml`, `.yml` → YAML
- `.toml` → TOML
- `.ini` → INI files
- `.env*` → Environment

### Web Files
- `.html` → HTML
- `.css`, `.scss`, `.sass` → Styles
- `.xml` → XML

### Development
- `.gitignore`, `.dockerignore`
- `.eslintrc`, `.prettierrc`
- `Dockerfile`, `Makefile`
- `.sh`, `.bash` → Scripts

## 🚀 Verify Changes

After changing defaults, test by:
1. Double-clicking files in Finder
2. Using `open filename` in Terminal
3. Clicking links in other apps

All should now open in Obsidian!

## 💡 Pro Tips

### VSCode Keybindings in Obsidian
Add familiar shortcuts to Obsidian:
- Settings → Hotkeys
- Search for commands
- Set VSCode-style bindings

### Terminal Alias
Add to your `~/.zshrc` or `~/.bashrc`:
```bash
alias code='open -a Obsidian'
```

Now `code .` opens current directory in Obsidian!

### Project Opening
Drag project folders onto Obsidian icon to open as vaults

## 🔧 Troubleshooting

If files still open in Windsurf:
1. Check "Open with" in Finder
2. Reset Launch Services:
   ```bash
   /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user
   ```
3. Restart Finder:
   ```bash
   killall Finder
   ```

## ✅ Benefits

With everything opening in Obsidian:
- Single editor for all files
- Unified search across codebase
- Wiki-style linking between files
- Graph view of dependencies
- Markdown notes alongside code
- No context switching

---

*Welcome to Obsidian as your primary development environment! 🎉*