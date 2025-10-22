# Node Version Upgrade Guide

## Current Status

- **Configured for**: Node 22.16.0 (Cloudflare Pages v3 default)
- **Currently running**: Node 20.11.0
- **esbuild**: Rebuilt successfully with Node 20.11.0

## Why Upgrade to Node 22.16.0?

1. **Cloudflare Pages Compatibility**: Node 22.16.0 is the default for Cloudflare Pages v3 build system
2. **Modern Dependencies**: Vite 7 and related tools work best with Node 22+
3. **Performance**: Better performance and newer JavaScript features

## How to Switch to Node 22.16.0

### Method 1: Using the provided script

```bash
cd /Users/toc/Server/ONE/web
./switch-node.sh
```

### Method 2: Manual (if script fails due to npm prefix issue)

The current blocker is an npm prefix configuration conflict with nvm. Here's how to fix it:

```bash
# Step 1: Check current npm config
npm config get prefix
# If it shows an empty string or non-standard path, continue

# Step 2: Edit .npmrc manually
nano ~/.npmrc
# Remove any lines with "prefix=" or add this line:
# prefix=/Users/toc/.nvm/versions/node/v22.16.0

# Step 3: Reload nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Step 4: Use Node 22.16.0
nvm use 22.16.0

# Step 5: Verify
node --version  # Should show v22.16.0

# Step 6: Rebuild esbuild
cd /Users/toc/Server/ONE
npm rebuild esbuild
```

### Method 3: Alternative - Use Node without nvm

If nvm continues to have issues, you can install Node directly:

```bash
# Download Node 22.16.0 from nodejs.org
# Or use Homebrew:
brew install node@22

# Then rebuild esbuild
cd /Users/toc/Server/ONE
npm rebuild esbuild
```

## Current Configuration Files Updated

All configuration files have been updated to require Node 22.16.0:

- ✅ `.nvmrc` (root and web): `22.16.0`
- ✅ `package.json` engines (all 4 packages): `"node": ">=22.16.0"`
- ✅ `wrangler.toml`: `NODE_VERSION = "22.16.0"`

## Development Server

The dev server now uses **dual adapter configuration**:

**Local Development** (Node 20.11.0 compatible):
- Uses `@astrojs/node` adapter (avoids miniflare EPIPE issues)
- No Cloudflare Workers simulation needed
- Full SSR support with Node.js runtime

**Production Builds** (NODE_ENV=production):
- Uses `@astrojs/cloudflare` adapter
- Builds for Cloudflare Workers runtime
- Cloudflare Pages will use Node 22.16.0 automatically

This approach gives you:
- ✅ Working local development on any Node version (20.11.0+)
- ✅ Optimal Cloudflare deployment (Node 22.16.0)
- ✅ No miniflare errors or version conflicts

## Start Development

```bash
cd /Users/toc/Server/ONE/web
bun run dev
```

## Deploy to Cloudflare

```bash
# Build
bun run build

# Deploy
wrangler pages deploy dist --project-name=web --branch=main
```

Cloudflare Pages will automatically use Node 22.16.0 for the build process.
