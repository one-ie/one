# 🔧 Fix Astro Files Opening Issue

## The Problem
When clicking `.astro` files, macOS shows "There is no application set to open the document"

## ✅ Solution Applied

### 1. System Level Fix
```bash
# Already executed:
duti -s md.obsidian .astro all
```

### 2. Quick Fix Steps

1. **Close the error dialog** (click Cancel)

2. **Right-click approach**:
   - In Obsidian file explorer, right-click any `.astro` file
   - Select "Open with VSCode Editor" (if available)
   - Or "Open in Default App" → Choose Obsidian → Always Open With

3. **Restart Obsidian** (`Cmd+R`)

4. **Test with these files**:
   - [[src/pages/index.astro]]
   - [[src/pages/chat.astro]]
   - [[src/layouts/Layout.astro]]

## 🎯 Alternative: Direct File Association

If the issue persists:

1. **In Finder**:
   - Navigate to any `.astro` file
   - Right-click → Get Info (`Cmd+I`)
   - Under "Open with:" select Obsidian
   - Click "Change All..."
   - Confirm

2. **Clear Launch Services Cache**:
   ```bash
   /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -kill -r -domain local -domain system -domain user
   killall Finder
   ```

## 💡 How Astro Files Should Work

Once properly configured:
- Single-click in Obsidian → Opens in VSCode editor view
- No system dialogs
- Full syntax highlighting
- Integrated editing experience

## 🚨 If Still Having Issues

Try this workaround:
1. Rename `.astro` to `.astro.jsx` temporarily
2. Edit in VSCode editor
3. Rename back when done

Or create symbolic links:
```bash
# Example for a specific file
ln -s index.astro index.astro.jsx
```

## ✨ Expected Result

After fixes:
- `.astro` files open directly in Obsidian's VSCode editor
- No external application prompts
- Seamless editing experience

---

*Restart Obsidian after applying fixes!*