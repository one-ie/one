#!/bin/bash

# ============================================================
# ONE Platform Pre-Deployment Validation
# ============================================================
# Runs comprehensive checks before releasing to npm/GitHub
# Usage: ./scripts/pre-deployment-check.sh
# ============================================================

# Note: NOT using set -e so warnings don't stop execution

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ERRORS=0
WARNINGS=0

# Helper functions
success() { echo -e "${GREEN}✓${NC} $1"; }
error() { echo -e "${RED}✗${NC} $1"; ((ERRORS++)); }
warning() { echo -e "${YELLOW}⚠${NC} $1"; ((WARNINGS++)); }
info() { echo -e "${BLUE}ℹ${NC} $1"; }
section() { echo ""; echo -e "${CYAN}━━━ $1 ━━━${NC}"; echo ""; }

banner() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}   ONE Platform Pre-Deployment Validation${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

cd "$WORKSPACE_ROOT"

banner

# ============================================================
# 1. REPOSITORY STRUCTURE
# ============================================================

section "1. Repository Structure Validation"

REQUIRED_DIRS=("one" "web" "backend" "cli" "apps/one" ".claude")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        success "Directory exists: $dir"
    else
        error "Missing required directory: $dir"
    fi
done

REQUIRED_FILES=("CLAUDE.md" "README.md" "LICENSE.md" "release.md")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        success "File exists: $file"
    else
        warning "Missing file: $file"
    fi
done

# ============================================================
# 2. GIT REPOSITORY STATUS
# ============================================================

section "2. Git Repository Status"

check_git_repo() {
    local repo_path=$1
    local repo_name=$2

    if [ -d "$repo_path/.git" ]; then
        cd "$repo_path"

        # Check remote
        if git remote -v | grep -q "origin"; then
            local remote=$(git remote get-url origin)
            success "$repo_name: git repository ($remote)"
        else
            error "$repo_name: No remote configured"
        fi

        # Check branch
        local branch=$(git branch --show-current)
        if [ "$branch" == "main" ]; then
            success "$repo_name: On main branch"
        else
            warning "$repo_name: On branch '$branch' (not main)"
        fi

        # Check uncommitted changes
        if [ -n "$(git status --porcelain)" ]; then
            local changes=$(git status --porcelain | wc -l | tr -d ' ')
            warning "$repo_name: $changes uncommitted changes"
        else
            success "$repo_name: Working directory clean"
        fi

        cd "$WORKSPACE_ROOT"
    else
        error "$repo_name: Not a git repository"
    fi
}

check_git_repo "one" "one (ontology)"
check_git_repo "web" "web (frontend)"
check_git_repo "backend" "backend"
check_git_repo "cli" "cli"
check_git_repo "apps/one" "apps/one (assembly)"

# ============================================================
# 3. NPM PACKAGE VALIDATION
# ============================================================

section "3. npm Package Validation"

if [ -f "cli/package.json" ]; then
    cd cli

    # Check package name
    PKG_NAME=$(node -p "require('./package.json').name")
    if [ "$PKG_NAME" == "oneie" ]; then
        success "Package name: $PKG_NAME"
    else
        error "Package name incorrect: $PKG_NAME (should be 'oneie')"
    fi

    # Check version
    PKG_VERSION=$(node -p "require('./package.json').version")
    info "Current version: $PKG_VERSION"

    # Check npm login
    if npm whoami &>/dev/null; then
        NPM_USER=$(npm whoami)
        success "Logged in to npm as: $NPM_USER"
    else
        error "Not logged in to npm (run: npm login)"
    fi

    # Check bin (from package.json)
    BIN_PATH=$(node -p "require('./package.json').bin.oneie")
    if [ -f "$BIN_PATH" ]; then
        success "CLI binary exists: $BIN_PATH"
    else
        error "CLI binary missing: $BIN_PATH"
    fi

    # Check if version already published
    if npm view oneie@$PKG_VERSION version &>/dev/null; then
        warning "Version $PKG_VERSION already published to npm"
    else
        success "Version $PKG_VERSION not yet published (ready for release)"
    fi

    cd "$WORKSPACE_ROOT"
else
    error "cli/package.json not found"
fi

# ============================================================
# 4. BUILD VALIDATION
# ============================================================

section "4. Build Validation"

# Check web build
if [ -d "web" ]; then
    cd web

    if [ -f "package.json" ]; then
        success "Web package.json exists"

        # Check if node_modules exists
        if [ -d "node_modules" ]; then
            success "Web dependencies installed"
        else
            warning "Web dependencies not installed (run: bun install)"
        fi

        # Check TypeScript config
        if [ -f "tsconfig.json" ]; then
            success "Web TypeScript config exists"
        else
            warning "Web tsconfig.json missing"
        fi
    fi

    cd "$WORKSPACE_ROOT"
fi

# Check CLI build
if [ -d "cli/dist" ]; then
    success "CLI dist/ directory exists"

    FILE_COUNT=$(find cli/dist -type f -name "*.js" | wc -l | tr -d ' ')
    if [ "$FILE_COUNT" -gt 0 ]; then
        success "CLI compiled ($FILE_COUNT JS files in dist/)"
    else
        warning "CLI dist/ is empty (run: bun run build)"
    fi
else
    warning "CLI not built (run: bun run build in cli/)"
fi

# ============================================================
# 5. DOCUMENTATION VALIDATION
# ============================================================

section "5. Documentation Validation"

# Check ontology documentation
if [ -d "one" ]; then
    ONTOLOGY_FILES=$(find one -name "*.md" | wc -l | tr -d ' ')
    info "Ontology documentation: $ONTOLOGY_FILES markdown files"

    if [ $ONTOLOGY_FILES -gt 100 ]; then
        success "Ontology documentation comprehensive"
    else
        warning "Ontology documentation incomplete ($ONTOLOGY_FILES files)"
    fi
fi

# Check Claude configuration
if [ -d ".claude" ]; then
    AGENT_COUNT=$(find .claude/agents -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
    HOOK_COUNT=$(find .claude/hooks -type f 2>/dev/null | wc -l | tr -d ' ')
    COMMAND_COUNT=$(find .claude/commands -name "*.md" 2>/dev/null | wc -l | tr -d ' ')

    success "Claude agents: $AGENT_COUNT"
    success "Claude hooks: $HOOK_COUNT"
    success "Claude commands: $COMMAND_COUNT"
fi

# Check critical docs
if [ -f "release.md" ]; then
    RELEASE_LINES=$(wc -l < release.md | tr -d ' ')
    success "Release documentation: $RELEASE_LINES lines"
else
    error "release.md missing"
fi

# ============================================================
# 6. SYNC VALIDATION
# ============================================================

section "6. Sync Validation"

# Check if cli/one is synced
if [ -d "cli/one" ]; then
    CLI_ONTOLOGY_FILES=$(find cli/one -name "*.md" | wc -l | tr -d ' ')
    success "CLI ontology synced: $CLI_ONTOLOGY_FILES files"
else
    warning "CLI ontology not synced (run: ./scripts/release.sh)"
fi

# Check if apps/one/one is synced
if [ -d "apps/one/one" ]; then
    APPS_ONTOLOGY_FILES=$(find apps/one/one -name "*.md" | wc -l | tr -d ' ')
    success "Apps ontology synced: $APPS_ONTOLOGY_FILES files"
else
    warning "Apps ontology not synced (run: ./scripts/release.sh)"
fi

# ============================================================
# 7. VERSION VALIDATION
# ============================================================

section "7. Version Validation"

if [ -f "cli/package.json" ]; then
    CLI_VERSION=$(node -p "require('./cli/package.json').version")
    info "CLI version: $CLI_VERSION"

    # Check version format (semver)
    if [[ $CLI_VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        success "Version format valid (semver)"
    else
        error "Version format invalid: $CLI_VERSION"
    fi

    # Check if version matches in folders.yaml
    if [ -f "cli/folders.yaml" ]; then
        YAML_VERSION=$(grep "version:" cli/folders.yaml | awk '{print $2}')
        if [ "$YAML_VERSION" == "$CLI_VERSION" ]; then
            success "Version matches in folders.yaml"
        else
            warning "Version mismatch: package.json=$CLI_VERSION, folders.yaml=$YAML_VERSION"
        fi
    fi
fi

# ============================================================
# 8. LICENSE VALIDATION
# ============================================================

section "8. License Validation"

if [ -f "LICENSE.md" ]; then
    if grep -q "ONE FREE License" LICENSE.md; then
        success "License file correct (ONE FREE License)"
    else
        warning "License file may need review"
    fi
else
    error "LICENSE.md missing"
fi

# ============================================================
# 9. SECURITY VALIDATION
# ============================================================

section "9. Security Validation"

# Check for .env files in cli
if [ -f "cli/.env" ] || [ -f "cli/.env.local" ]; then
    error "Environment files found in cli/ (should not be published)"
else
    success "No environment files in cli/"
fi

# Check .npmignore
if [ -f "cli/.npmignore" ]; then
    success ".npmignore exists"

    if grep -q ".env" cli/.npmignore; then
        success ".npmignore excludes .env files"
    else
        warning ".npmignore may need to exclude .env files"
    fi
else
    warning "cli/.npmignore missing"
fi

# ============================================================
# 10. DEPLOYMENT READINESS
# ============================================================

section "10. Deployment Readiness"

# Check GitHub CLI
if command -v gh &>/dev/null; then
    success "GitHub CLI (gh) installed"

    if gh auth status &>/dev/null; then
        success "Authenticated with GitHub"
    else
        warning "Not authenticated with GitHub (run: gh auth login)"
    fi
else
    warning "GitHub CLI (gh) not installed (optional, for creating releases)"
fi

# Check if can publish
if [ -d "cli" ]; then
    cd cli

    # Dry run npm publish
    if npm publish --dry-run &>/dev/null; then
        success "npm publish dry-run passed"
    else
        error "npm publish dry-run failed"
    fi

    cd "$WORKSPACE_ROOT"
fi

# ============================================================
# FINAL SUMMARY
# ============================================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready for deployment.${NC}"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warnings found. Review before deployment.${NC}"
else
    echo -e "${RED}✗ $ERRORS errors found. Fix before deployment.${NC}"
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${CYAN}Next Steps:${NC}"
    echo ""
    echo "  1. Review warnings (if any)"
    echo "  2. Run release script:"
    echo "     ./scripts/release.sh patch"
    echo ""
    echo "  3. Publish to npm:"
    echo "     cd cli && npm publish --access public"
    echo ""
    echo "  4. Create GitHub releases"
    echo "  5. Test: npx oneie@latest --version"
    echo ""

    exit 0
else
    echo -e "${CYAN}Fix These Issues:${NC}"
    echo ""
    echo "  Run this script again after fixes"
    echo ""

    exit 1
fi
