#!/bin/bash
# Script to switch to Node 22.16.0 (Cloudflare Pages v3 default) and rebuild esbuild

set -e

echo "🔧 Switching to Node 22.16.0 (Cloudflare Pages v3 default)..."

# Source nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 22.16.0
nvm use 22.16.0

# Verify Node version
echo "✅ Node version: $(node --version)"

# Go to root and rebuild esbuild
cd ..
echo "🔨 Rebuilding esbuild..."
npm rebuild esbuild

# Go back to web
cd web

echo "✅ Done! Now you can run: bun run build"
