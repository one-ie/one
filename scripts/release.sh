#!/bin/bash

# ============================================================
# ONE Platform Release Script
# ============================================================
# Automates the 13-step release process for ONE Platform
# Syncs ontology, web, backend, CLI, and master assembly
# Usage: ./scripts/release.sh [version_bump]
#   version_bump: major, minor, patch (optional, default: none)
#
# See: release.md for complete documentation
# ============================================================

set -e  # Exit on error

# ============================================================
# CONFIGURATION
# ============================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Workspace
WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION_BUMP="${1:-none}"

# ============================================================
# HELPER FUNCTIONS
# ============================================================

# Print banner
banner() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Print section header
section() {
    echo ""
    echo -e "${CYAN}━━━ $1 ━━━${NC}"
    echo ""
}

# Print success message
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Print error message
error() {
    echo -e "${RED}✗${NC} $1"
}

# Print warning message
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Print info message
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Print step message
step() {
    echo -e "${MAGENTA}► Step $1${NC}"
}

# Confirm action
confirm() {
    read -p "$(echo -e ${YELLOW}$1${NC}) (y/N) " -n 1 -r
    echo
    [[ $REPLY =~ ^[Yy]$ ]]
}

# ============================================================
# MAIN SCRIPT
# ============================================================

banner "   ONE Platform Release Script"

echo "Workspace: $WORKSPACE_ROOT"
echo "Version bump: $VERSION_BUMP"
echo ""

# Change to workspace root
cd "$WORKSPACE_ROOT"

# ============================================================
# STEP 0: VALIDATION
# ============================================================

section "Step 0: Pre-Flight Validation"

# Check git
if ! command -v git &> /dev/null; then
    error "git is not installed"
    exit 1
fi
success "git is installed"

# Check if workspace (root can be non-git, sub-repos will be checked individually)
if [ -d .git ]; then
    success "Root is a git repository"

    # Check working directory
    if [ -n "$(git status --porcelain)" ]; then
        warning "Root has uncommitted changes"
        echo ""
        git status --short
        echo ""
        if ! confirm "Continue with uncommitted changes in root?"; then
            error "Aborted by user"
            exit 1
        fi
    else
        success "Root working directory is clean"
    fi
else
    info "Root is a workspace (not a git repo - this is OK)"
    success "Multiple independent repositories will be managed"
fi

# Check required directories
REQUIRED_DIRS=("one" "cli" "apps/one")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        error "Required directory '$dir' does not exist"
        exit 1
    fi
    success "Directory '$dir' exists"
done

# Check optional directories
OPTIONAL_DIRS=("web" "backend" ".claude")
for dir in "${OPTIONAL_DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        warning "Optional directory '$dir' does not exist (will be skipped)"
    else
        success "Directory '$dir' exists"
    fi
done

# Check required files
REQUIRED_FILES=("AGENTS.md" "CLAUDE.md" "README.md" "LICENSE.md")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        warning "Required file '$file' does not exist"
    else
        success "File '$file' exists"
    fi
done

echo ""
success "Pre-flight validation complete"

# ============================================================
# STEPS 1-3: PUSH CORE REPOSITORIES
# ============================================================

section "Steps 1-3: Push Core Repositories to GitHub"

step "1-3"

# Step 1: Push /one to one-ie/ontology
if [ -d "one/.git" ]; then
    info "Repository: one/ → one-ie/ontology"
    cd one

    if [ -n "$(git status --porcelain)" ]; then
        git status --short
        echo ""
        if confirm "Commit and push ontology changes?"; then
            git add .
            git commit -m "chore: update ontology documentation"
            git push origin main
            success "Pushed ontology to one-ie/ontology"
        else
            warning "Skipped ontology push"
        fi
    else
        info "No changes in one/"
    fi

    cd "$WORKSPACE_ROOT"
else
    warning "one/ is not a git repository (skipping push to one-ie/ontology)"
fi

# Step 2: Push /web to one-ie/web
if [ -d "web/.git" ]; then
    info "Repository: web/ → one-ie/web"
    cd web

    if [ -n "$(git status --porcelain)" ]; then
        git status --short
        echo ""
        if confirm "Commit and push web changes?"; then
            git add .
            git commit -m "feat: update web frontend"
            git push origin main
            success "Pushed web to one-ie/web"
        else
            warning "Skipped web push"
        fi
    else
        info "No changes in web/"
    fi

    cd "$WORKSPACE_ROOT"
else
    warning "web/ is not a git repository (skipping push to one-ie/web)"
fi

# Step 3: Push /backend to one-ie/backend
if [ -d "backend/.git" ]; then
    info "Repository: backend/ → one-ie/backend"
    cd backend

    if [ -n "$(git status --porcelain)" ]; then
        git status --short
        echo ""
        if confirm "Commit and push backend changes?"; then
            git add .
            git commit -m "feat: update backend services"
            git push origin main
            success "Pushed backend to one-ie/backend"
        else
            warning "Skipped backend push"
        fi
    else
        info "No changes in backend/"
    fi

    cd "$WORKSPACE_ROOT"
else
    warning "backend/ is not a git repository (skipping push to one-ie/backend)"
fi

echo ""
success "Core repositories processed"

# ============================================================
# STEP 4: SYNC VIA FOLDERS.YAML
# ============================================================

section "Step 4: Sync Documentation via folders.yaml"

step "4"

# Create target directories
info "Creating target directories..."
mkdir -p cli/one
mkdir -p cli/.claude
mkdir -p apps/one/one
mkdir -p apps/one/.claude
success "Target directories ready"

# Sync /one to cli/one and apps/one/one
info "Syncing: one/ → cli/one/"
rsync -av --delete \
    --exclude='.DS_Store' \
    --exclude='*.swp' \
    --exclude='*.tmp' \
    --exclude='.git' \
    one/ cli/one/
success "Synced to cli/one/"

info "Syncing: one/ → apps/one/one/"
rsync -av --delete \
    --exclude='.DS_Store' \
    --exclude='*.swp' \
    --exclude='*.tmp' \
    --exclude='.git' \
    one/ apps/one/one/
success "Synced to apps/one/one/"

# Sync .claude
if [ -d ".claude" ]; then
    info "Syncing: .claude/ → cli/.claude/"
    rsync -av --delete \
        --exclude='.DS_Store' \
        --exclude='*.swp' \
        --exclude='*.tmp' \
        .claude/ cli/.claude/
    success "Synced to cli/.claude/"

    info "Syncing: .claude/ → apps/one/.claude/"
    rsync -av --delete \
        --exclude='.DS_Store' \
        --exclude='*.swp' \
        --exclude='*.tmp' \
        .claude/ apps/one/.claude/
    success "Synced to apps/one/.claude/"
else
    warning "Skipping .claude sync (directory not found)"
fi

# Sync core documentation files
info "Syncing core documentation files..."
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" cli/
        cp "$file" apps/one/
        success "Synced $file"
    else
        warning "Skipping $file (not found)"
    fi
done

echo ""
success "Documentation sync complete"

# ============================================================
# STEP 5: UPDATE CLI README
# ============================================================

section "Step 5: Update CLI README"

step "5"

if [ -f "cli/package.json" ]; then
    CLI_VERSION=$(node -p "require('./cli/package.json').version")
    info "Current CLI version: $CLI_VERSION"

    # Note: README is already copied from root
    # Additional CLI-specific updates can be added here
    success "CLI README updated"
else
    warning "cli/package.json not found, skipping version check"
fi

echo ""

# ============================================================
# STEP 6: VERSION BUMP
# ============================================================

section "Step 6: Version Management"

step "6"

if [ "$VERSION_BUMP" != "none" ]; then
    # Bump cli/package.json
    if [ -f "cli/package.json" ]; then
        cd cli
        info "Bumping version in cli/package.json ($VERSION_BUMP)"
        # Note: npm version sometimes throws harmless errors after successfully updating
        npm version "$VERSION_BUMP" --no-git-tag-version 2>&1 || true
        NEW_VERSION=$(node -p "require('./package.json').version")
        success "CLI version: $NEW_VERSION"
        cd "$WORKSPACE_ROOT"
    else
        warning "cli/package.json not found, skipping version bump"
    fi

    # Bump apps/one/package.json (if exists)
    if [ -f "apps/one/package.json" ]; then
        cd apps/one
        info "Bumping version in apps/one/package.json ($VERSION_BUMP)"
        npm version "$VERSION_BUMP" --no-git-tag-version 2>&1 || true
        APP_VERSION=$(node -p "require('./package.json').version")
        success "Apps version: $APP_VERSION"
        cd "$WORKSPACE_ROOT"
    else
        info "apps/one/package.json not found (will create if needed)"
    fi

    # Update cli/folders.yaml version
    if [ -f "cli/folders.yaml" ] && [ -n "$NEW_VERSION" ]; then
        info "Updating version in cli/folders.yaml"
        sed -i.bak "s/version: .*/version: $NEW_VERSION/" cli/folders.yaml
        rm cli/folders.yaml.bak
        success "folders.yaml version: $NEW_VERSION"
    fi
else
    info "No version bump requested"
    info "Use: ./scripts/release.sh [major|minor|patch]"
fi

echo ""

# ============================================================
# STEP 7: UPDATE SUBMODULES
# ============================================================

section "Step 7: Update Git Submodules in apps/one"

step "7"

cd apps/one

if [ -f .gitmodules ]; then
    info "Updating submodules to latest..."
    git submodule update --remote --merge
    success "Submodules updated"
else
    warning "No .gitmodules found in apps/one/"
    echo ""
    info "To add submodules manually, run:"
    echo "  cd apps/one"
    echo "  git submodule add https://github.com/one-ie/web.git web"
    echo "  git submodule add https://github.com/one-ie/docs.git docs"
fi

cd "$WORKSPACE_ROOT"

echo ""

# ============================================================
# STEP 8: UPDATE APPS/ONE README
# ============================================================

section "Step 8: Update apps/one/README.md"

step "8"

# Generate master assembly README
cat > apps/one/README.md << 'EOF'
# ONE Platform

**Make Your Ideas Real**

ONE is an AI-native platform built on a 6-dimension ontology that models reality through: Groups, People, Things, Connections, Events, and Knowledge.

## Quick Start

```bash
# Create a new ONE project
npx oneie@latest init my-project
cd my-project

# Start development
cd web
bun install
bun run dev  # → http://localhost:4321
```

## Architecture

```
ONE/
├── one/           # 6-dimension ontology documentation
├── web/           # Astro 5 + React 19 frontend
├── docs/          # Documentation site
├── .claude/       # AI agent configuration
├── CLAUDE.md      # AI development instructions
├── AGENTS.md      # Convex patterns quick reference
└── README.md      # This file
```

## Technology Stack

- **Frontend**: Astro 5.14+ with React 19, Tailwind CSS v4
- **Backend**: Convex real-time database + Hono API
- **Auth**: Better Auth with 6 authentication methods
- **AI**: Effect.ts services with typed business logic
- **Deployment**: Cloudflare Pages + Convex Cloud

## Repositories

- **Main**: https://github.com/one-ie/one (this repo)
- **Ontology**: https://github.com/one-ie/ontology
- **Web**: https://github.com/one-ie/web
- **Backend**: https://github.com/one-ie/backend
- **CLI**: https://github.com/one-ie/cli
- **Docs**: https://github.com/one-ie/docs

## Documentation

- **Complete Docs**: https://docs.one.ie
- **Quick Reference**: See `AGENTS.md` for Convex patterns
- **AI Development**: See `CLAUDE.md` for AI agent instructions
- **Ontology**: See `one/` directory for 6-dimension specification

## Installation

```bash
# Global install
npm install -g oneie

# Or use with npx
npx oneie@latest --version
```

## Commands

```bash
oneie init <project>     # Create new ONE project
oneie --version          # Show version
oneie --help            # Show help
```

## License

Copyright © 2025 ONE Platform
Licensed under FREE License with Commercial Attribution

See LICENSE.md for details.

---

**Built with clarity, simplicity, and infinite scale in mind.**

https://one.ie • npx oneie
EOF

if [ -n "$NEW_VERSION" ]; then
    # Add version to README if bumped
    sed -i.bak "1s/^/# ONE Platform v$NEW_VERSION\n\n/" apps/one/README.md
    rm apps/one/README.md.bak
fi

success "Generated apps/one/README.md"

echo ""

# ============================================================
# STEP 9: GIT STATUS SUMMARY
# ============================================================

section "Step 9: Changes Summary"

step "9"

# Show changes in cli/
echo ""
info "Changes in cli/:"
if [ -d "cli/.git" ]; then
    cd cli
    if [ -n "$(git status --porcelain)" ]; then
        git status --short | head -20
    else
        success "No changes"
    fi
    cd "$WORKSPACE_ROOT"
else
    warning "cli/ is not a git repository"
fi

# Show changes in apps/one/
echo ""
info "Changes in apps/one/:"
if [ -d "apps/one/.git" ]; then
    cd apps/one
    if [ -n "$(git status --porcelain)" ]; then
        git status --short | head -20
    else
        success "No changes"
    fi
    cd "$WORKSPACE_ROOT"
else
    warning "apps/one/ is not a git repository"
fi

echo ""

# ============================================================
# STEP 10: COMMIT AND PUSH CLI
# ============================================================

section "Step 10: Commit & Push CLI to one-ie/cli"

step "10"

if [ -d "cli/.git" ]; then
    cd cli

    if [ -n "$(git status --porcelain)" ]; then
        echo ""
        git status --short
        echo ""

        if confirm "Commit and push CLI changes?"; then
            COMMIT_MSG="chore: sync documentation and configuration"

            if [ "$VERSION_BUMP" != "none" ] && [ -n "$NEW_VERSION" ]; then
                COMMIT_MSG="chore: release v$NEW_VERSION"
            fi

            git add -A
            git commit -m "$COMMIT_MSG"
            success "Committed to cli/"

            if confirm "Push to one-ie/cli?"; then
                git push origin main
                success "Pushed to one-ie/cli"

                # Create and push tag if version was bumped
                if [ "$VERSION_BUMP" != "none" ] && [ -n "$NEW_VERSION" ]; then
                    if confirm "Create and push tag v$NEW_VERSION?"; then
                        git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
                        git push origin "v$NEW_VERSION"
                        success "Created and pushed tag v$NEW_VERSION"
                    fi
                fi
            else
                warning "Skipped push to remote"
            fi
        else
            warning "Skipped commit"
        fi
    else
        info "No changes to commit in cli/"
    fi

    cd "$WORKSPACE_ROOT"
else
    error "cli/ is not a git repository"
    echo ""
    info "To initialize:"
    echo "  cd cli"
    echo "  git init"
    echo "  git remote add origin https://github.com/one-ie/cli.git"
    echo "  git add ."
    echo "  git commit -m 'chore: initialize cli repository'"
    echo "  git push -u origin main"
fi

echo ""

# ============================================================
# STEP 11: COMMIT AND PUSH APPS/ONE
# ============================================================

section "Step 11: Commit & Push apps/one to one-ie/one"

step "11"

if [ -d "apps/one/.git" ]; then
    cd apps/one

    if [ -n "$(git status --porcelain)" ]; then
        echo ""
        git status --short
        echo ""

        if confirm "Commit and push apps/one changes?"; then
            COMMIT_MSG="chore: sync documentation and configuration"

            if [ "$VERSION_BUMP" != "none" ] && [ -n "$NEW_VERSION" ]; then
                COMMIT_MSG="chore: release v$NEW_VERSION"
            fi

            git add -A
            git commit -m "$COMMIT_MSG"
            success "Committed to apps/one/"

            if confirm "Push to one-ie/one (with submodules)?"; then
                git push --recurse-submodules=on-demand origin main
                success "Pushed to one-ie/one"

                # Create and push tag if version was bumped
                if [ "$VERSION_BUMP" != "none" ] && [ -n "$NEW_VERSION" ]; then
                    if confirm "Create and push tag v$NEW_VERSION?"; then
                        git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"
                        git push origin "v$NEW_VERSION"
                        success "Created and pushed tag v$NEW_VERSION"
                    fi
                fi
            else
                warning "Skipped push to remote"
            fi
        else
            warning "Skipped commit"
        fi
    else
        info "No changes to commit in apps/one/"
    fi

    cd "$WORKSPACE_ROOT"
else
    error "apps/one/ is not a git repository"
    echo ""
    info "To initialize:"
    echo "  cd apps/one"
    echo "  git init"
    echo "  git remote add origin https://github.com/one-ie/one.git"
    echo "  git add ."
    echo "  git commit -m 'chore: initialize ONE assembly'"
    echo "  git push -u origin main"
fi

echo ""

# ============================================================
# STEP 12: NPM PUBLISH INSTRUCTIONS
# ============================================================

section "Step 12: Publish to npm (Manual Step)"

step "12"

if [ -f "cli/package.json" ]; then
    CLI_VERSION=$(node -p "require('./cli/package.json').version")

    echo ""
    warning "Manual step required: npm publish"
    echo ""
    info "To publish to npm, run:"
    echo ""
    echo "  cd cli"
    echo "  npm login  # If not already logged in"
    echo "  npm publish --access public"
    echo ""
    info "Then verify:"
    echo ""
    echo "  npx oneie@latest --version  # Should show v$CLI_VERSION"
    echo "  npx oneie@latest init test-project"
    echo ""
else
    warning "cli/package.json not found, cannot publish to npm"
fi

echo ""

# ============================================================
# FINAL SUMMARY
# ============================================================

banner "   ✓ Release Process Complete!"

if [ "$VERSION_BUMP" != "none" ] && [ -n "$NEW_VERSION" ]; then
    echo -e "${GREEN}Released version: v$NEW_VERSION${NC}"
    echo ""
fi

echo -e "${CYAN}Summary of Actions:${NC}"
echo ""
echo "  ✓ Validated prerequisites"
echo "  ✓ Pushed core repositories (one, web, backend)"
echo "  ✓ Synced documentation via folders.yaml"
echo "  ✓ Updated CLI and apps/one READMEs"
if [ "$VERSION_BUMP" != "none" ]; then
    echo "  ✓ Bumped version to $NEW_VERSION"
fi
echo "  ✓ Updated git submodules"
echo "  ✓ Committed and pushed cli/ and apps/one/"
echo ""

echo -e "${CYAN}Next Steps:${NC}"
echo ""
echo "  1. Publish to npm:"
echo "     cd cli && npm publish --access public"
echo ""
echo "  2. Test installation:"
echo "     npx oneie@latest --version"
echo "     npx oneie@latest init test-project"
echo ""
echo "  3. Create GitHub releases for tagged versions:"
echo "     https://github.com/one-ie/cli/releases"
echo "     https://github.com/one-ie/one/releases"
echo ""
echo "  4. Deploy web to Cloudflare Pages:"
echo "     cd web && bun run build && wrangler pages deploy dist"
echo ""
echo "  5. Update documentation site:"
echo "     cd docs && npm run build && wrangler pages deploy dist"
echo ""

info "For complete release documentation, see: release.md"

echo ""
