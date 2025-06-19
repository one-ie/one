#!/bin/bash

# Script to set Obsidian as default editor for all development files
# Requires: duti (install with: brew install duti)

echo "🔄 Setting Obsidian as default editor for all file types..."

# Check if duti is installed
if ! command -v duti &> /dev/null; then
    echo "❌ duti is not installed. Installing via Homebrew..."
    brew install duti
fi

# Obsidian bundle ID
OBSIDIAN_ID="md.obsidian"

# Set defaults for programming languages
echo "📝 Setting defaults for source code files..."
duti -s $OBSIDIAN_ID .ts all
duti -s $OBSIDIAN_ID .tsx all
duti -s $OBSIDIAN_ID .js all
duti -s $OBSIDIAN_ID .jsx all
duti -s $OBSIDIAN_ID .mjs all
duti -s $OBSIDIAN_ID .cjs all
duti -s $OBSIDIAN_ID .vue all
duti -s $OBSIDIAN_ID .svelte all

# Configuration files
echo "⚙️  Setting defaults for config files..."
duti -s $OBSIDIAN_ID .json all
duti -s $OBSIDIAN_ID .yaml all
duti -s $OBSIDIAN_ID .yml all
duti -s $OBSIDIAN_ID .toml all
duti -s $OBSIDIAN_ID .ini all
duti -s $OBSIDIAN_ID .env all
duti -s $OBSIDIAN_ID .xml all

# Web files
echo "🌐 Setting defaults for web files..."
duti -s $OBSIDIAN_ID .html all
duti -s $OBSIDIAN_ID .css all
duti -s $OBSIDIAN_ID .scss all
duti -s $OBSIDIAN_ID .sass all
duti -s $OBSIDIAN_ID .less all

# Shell and scripts
echo "🐚 Setting defaults for scripts..."
duti -s $OBSIDIAN_ID .sh all
duti -s $OBSIDIAN_ID .bash all
duti -s $OBSIDIAN_ID .zsh all
duti -s $OBSIDIAN_ID .fish all

# Development tool configs
echo "🛠️  Setting defaults for dev tool configs..."
duti -s $OBSIDIAN_ID .gitignore all
duti -s $OBSIDIAN_ID .dockerignore all
duti -s $OBSIDIAN_ID .eslintrc all
duti -s $OBSIDIAN_ID .prettierrc all
duti -s $OBSIDIAN_ID .editorconfig all

# Markdown files (ensure they use Obsidian)
echo "📄 Setting defaults for documentation..."
duti -s $OBSIDIAN_ID .md all
duti -s $OBSIDIAN_ID .mdx all
duti -s $OBSIDIAN_ID .markdown all

# Generic text files
echo "📃 Setting defaults for text files..."
duti -s $OBSIDIAN_ID .txt all
duti -s $OBSIDIAN_ID .log all

# No extension files
echo "📋 Setting defaults for no-extension files..."
duti -s $OBSIDIAN_ID Dockerfile all
duti -s $OBSIDIAN_ID Makefile all
duti -s $OBSIDIAN_ID Vagrantfile all
duti -s $OBSIDIAN_ID Gemfile all
duti -s $OBSIDIAN_ID Rakefile all
duti -s $OBSIDIAN_ID LICENSE all
duti -s $OBSIDIAN_ID README all

echo "✅ Done! All specified file types will now open in Obsidian."
echo ""
echo "💡 Tips:"
echo "- You may need to restart Finder for changes to take effect"
echo "- Add 'alias code=\"open -a Obsidian\"' to your shell config"
echo "- Drag folders onto Obsidian icon to open as vaults"