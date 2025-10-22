# Installation Folder Multi-Tenancy - File Locations

**Quick reference for all files created/modified during frontend implementation.**

---

## Files Created

### 1. Core Utilities

```
/Users/toc/Server/ONE/web/src/lib/utils/file-resolver.ts
```
- File resolution with hierarchical group support
- Security features (path traversal prevention, validation)
- Caching layer
- 151 lines

### 2. React Components

```
/Users/toc/Server/ONE/web/src/components/providers/InstallationProvider.tsx
/Users/toc/Server/ONE/web/src/components/features/InstallationFileBrowser.tsx
```
- Installation context provider (33 lines)
- File browser UI component (116 lines)

### 3. Pages

```
/Users/toc/Server/ONE/web/src/pages/docs/[...slug].astro
```
- Dynamic documentation routing (55 lines)
- Frontmatter parsing
- Markdown rendering

### 4. Tests

```
/Users/toc/Server/ONE/web/tests/utils/file-resolver.test.ts
/Users/toc/Server/ONE/web/tests/components/InstallationFileBrowser.test.tsx
```
- 11 unit tests for file resolver
- 3 component tests for file browser
- 14/14 passing ✅

### 5. Configuration

```
/Users/toc/Server/ONE/web/.env.example
```
- Added INSTALLATION_NAME variables
- Documentation for setup

### 6. Documentation

```
/Users/toc/Server/ONE/web/INSTALLATION_FOLDERS.md
/Users/toc/Server/ONE/web/INSTALLATION_FOLDERS_SUMMARY.md
/Users/toc/Server/ONE/web/INSTALLATION_FOLDERS_FILES.md
```
- Complete implementation guide
- Summary report
- File location reference (this file)

---

## Files Modified

### 1. Content Collections

```
/Users/toc/Server/ONE/web/src/content/config.ts
```
- Removed incorrect glob loader
- Added note about runtime file resolution

### 2. Astro Configuration

```
/Users/toc/Server/ONE/web/astro.config.mjs
```
- Added copy-installation-folder integration
- Copies installation folder to dist during build

### 3. Root Documentation (Auto-updated)

```
/Users/toc/Server/ONE/CLAUDE.md
/Users/toc/Server/ONE/web/AGENTS.md
```
- Added installation folder documentation sections
- File resolution patterns

---

## Dependencies Added

### Production Dependencies

```json
{
  "fs-extra": "^11.3.2"
}
```

### Dev Dependencies

```json
{
  "@types/fs-extra": "^11.0.4",
  "@testing-library/react": "^16.3.0",
  "@testing-library/dom": "^10.4.1"
}
```

---

## File Structure Overview

```
web/
├── src/
│   ├── lib/
│   │   └── utils/
│   │       └── file-resolver.ts                    ← NEW
│   ├── components/
│   │   ├── providers/
│   │   │   └── InstallationProvider.tsx            ← NEW
│   │   └── features/
│   │       └── InstallationFileBrowser.tsx         ← NEW
│   ├── pages/
│   │   └── docs/
│   │       └── [...slug].astro                     ← NEW
│   └── content/
│       └── config.ts                                ← MODIFIED
├── test/
│   ├── utils/
│   │   └── file-resolver.test.ts                   ← NEW
│   └── components/
│       └── InstallationFileBrowser.test.tsx        ← NEW
├── astro.config.mjs                                 ← MODIFIED
├── .env.example                                     ← MODIFIED
├── INSTALLATION_FOLDERS.md                          ← NEW
├── INSTALLATION_FOLDERS_SUMMARY.md                  ← NEW
└── INSTALLATION_FOLDERS_FILES.md                    ← NEW (this file)
```

---

## Absolute Paths

For copy-paste convenience:

### Created Files

```
/Users/toc/Server/ONE/web/src/lib/utils/file-resolver.ts
/Users/toc/Server/ONE/web/src/components/providers/InstallationProvider.tsx
/Users/toc/Server/ONE/web/src/components/features/InstallationFileBrowser.tsx
/Users/toc/Server/ONE/web/src/pages/docs/[...slug].astro
/Users/toc/Server/ONE/web/tests/utils/file-resolver.test.ts
/Users/toc/Server/ONE/web/tests/components/InstallationFileBrowser.test.tsx
/Users/toc/Server/ONE/web/.env.example
/Users/toc/Server/ONE/web/INSTALLATION_FOLDERS.md
/Users/toc/Server/ONE/web/INSTALLATION_FOLDERS_SUMMARY.md
/Users/toc/Server/ONE/web/INSTALLATION_FOLDERS_FILES.md
```

### Modified Files

```
/Users/toc/Server/ONE/web/src/content/config.ts
/Users/toc/Server/ONE/web/astro.config.mjs
/Users/toc/Server/ONE/CLAUDE.md
/Users/toc/Server/ONE/web/AGENTS.md
```

---

## Commands to Verify

### Type Check
```bash
cd /Users/toc/Server/ONE/web && bunx astro check
```

### Run Tests
```bash
cd /Users/toc/Server/ONE/web && bun test test/utils/file-resolver.test.ts test/components/InstallationFileBrowser.test.tsx
```

### Build
```bash
cd /Users/toc/Server/ONE/web && bun run build
```

### Development Server
```bash
cd /Users/toc/Server/ONE/web && bun run dev
```

---

**All files accounted for. Implementation complete. ✅**
