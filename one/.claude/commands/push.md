# /push - Smart Multi-Repository Push

**Purpose:** Intelligently commit and push changes to all ONE Platform repositories with contextual commit messages.

## How It Works

This command analyzes changes across the monorepo and pushes to the appropriate repositories:
- `/web` → `github.com/one-ie/web`
- `/cli` → `github.com/one-ie/cli`
- `/one` → `github.com/one-ie/one-ontology`
- `/apps/one` → `github.com/one-ie/one` (assembly repository)

## Your Task

When the user runs `/push`, you MUST:

### Step 1: Analyze Changes

Run git status in each directory to understand what changed:

```bash
# Check web changes
cd web && git status --short

# Check cli changes
cd cli && git status --short

# Check ontology changes
cd one && git status --short

# Check one assembly changes
cd apps/one && git status --short
```

### Step 2: Generate Contextual Commit Messages

Based on the changes detected, create commit messages following this structure:

**Format:**
```
<type>: <short description>

<detailed explanation>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - New features or capabilities
- `fix:` - Bug fixes
- `docs:` - Documentation updates
- `style:` - UI/styling changes
- `refactor:` - Code refactoring without functional changes
- `test:` - Test additions or updates
- `chore:` - Maintenance tasks (dependency updates, config changes)
- `perf:` - Performance improvements
- `ci:` - CI/CD pipeline changes

### Step 3: Push to Each Repository

For each repository with changes:

**Web Repository:**
```bash
cd web
git add .
git commit -m "$(cat <<'EOF'
<type>: <description>

<detailed explanation of web-specific changes>

Changes:
- Updated component X with Y
- Fixed Z issue in page A
- Added new feature B

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push origin main
```

**CLI Repository:**
```bash
cd cli
git add .
git commit -m "$(cat <<'EOF'
<type>: <description>

<detailed explanation of CLI-specific changes>

Changes:
- Enhanced command X
- Fixed Y issue in Z
- Updated documentation

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push origin main
```

**ONE Ontology Repository:**
```bash
cd one
git add .
git commit -m "$(cat <<'EOF'
<type>: <description>

<detailed explanation of ontology documentation changes>

Changes:
- Updated dimension X documentation
- Added new ontology specification Y
- Enhanced knowledge base Z

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push origin main
```

**One Assembly Repository:**
```bash
cd apps/one
git add .
git commit -m "$(cat <<'EOF'
<type>: <description>

<detailed explanation of assembly changes>

Synced:
- Ontology documentation updates
- Web subtree changes
- CLI synchronization

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push origin main
```

### Step 4: Smart Message Generation

Analyze the actual file changes to craft meaningful messages:

**Example Analysis:**
```bash
# For web changes
git diff --stat web/

# Look for patterns:
# - src/pages/*.astro → "page updates"
# - src/components/*.tsx → "component changes"
# - src/styles/*.css → "styling updates"
# - package.json → "dependency updates"
```

**Example Smart Messages:**

```
feat: add hierarchical group navigation to ontology page

Enhanced the ontology page with multi-level group visualization:
- Added parent-child group relationship display
- Implemented breadcrumb navigation for nested groups
- Created GroupHierarchy component with collapse/expand
- Updated styles for visual depth indicators

Technical Details:
- Uses recursive rendering for unlimited nesting
- Optimized for performance with React.memo
- Added accessibility support (ARIA labels)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
fix: resolve TypeScript errors in CLI init command

Fixed type errors preventing successful CLI builds:
- Added missing type annotations in init.ts:45
- Corrected InstallationConfig interface
- Fixed async/await usage in file creation
- Updated test mocks with proper types

Errors Resolved:
- TS2345: Argument type mismatch (3 instances)
- TS2322: Type assignment error (1 instance)
- TS7006: Implicit any parameter (2 instances)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

```
docs: update installation folder documentation

Comprehensive documentation updates for installation folders:
- Added architecture diagrams to CLAUDE.md
- Documented file resolution priority
- Created examples in README.md
- Updated CLI command reference

Files Updated:
- CLAUDE.md: Added "Installation Folders" section
- README.md: Added quick start guide
- cli/README.md: Documented init command
- one/knowledge/installation-folders.md: Full specification

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Step 5: Report Summary

After pushing, provide a clear summary:

```
✅ Multi-Repository Push Complete!

📦 Repositories Updated:
- web: feat: add hierarchical group navigation
  → https://github.com/one-ie/web/commit/<hash>

- cli: fix: resolve TypeScript errors in init command
  → https://github.com/one-ie/cli/commit/<hash>

- one: docs: update 6-dimension ontology specification
  → https://github.com/one-ie/one-ontology/commit/<hash>

- apps/one: chore: sync assembly repository
  → https://github.com/one-ie/one/commit/<hash>

🔗 Total commits: 4
⏱️ Time: ~30 seconds

Next Steps:
- Monitor CI/CD pipelines
- Review commit history on GitHub
- Check for any failed workflows
```

## Advanced Features

### Selective Push

If only one repository has changes, only push that one:

```bash
# User: /push web
# → Only push web repository

# User: /push cli one
# → Push both cli and one repositories
```

### Dry Run Mode

```bash
# User: /push --dry-run
# → Show what would be committed/pushed without actually doing it
```

### Interactive Mode

```bash
# User: /push --interactive
# → Review each commit message before pushing
```

## Important Guidelines

**DO:**
- ✅ Analyze actual file changes before writing messages
- ✅ Use conventional commit format
- ✅ Include specific details (file names, functions, issues)
- ✅ Group related changes logically
- ✅ Check git status before committing
- ✅ Verify push succeeded

**DON'T:**
- ❌ Use generic messages like "update files"
- ❌ Commit without reviewing changes first
- ❌ Push without verifying branch is correct
- ❌ Skip the signature footer
- ❌ Ignore git status warnings

## Error Handling

### If repository has no changes:
```
ℹ️ web: No changes to commit (working tree clean)
```

### If push fails:
```
❌ cli: Push failed
Reason: rejected (non-fast-forward)

Suggested action:
- Pull latest changes: cd cli && git pull
- Resolve conflicts if any
- Retry push
```

### If uncommitted changes exist:
```
⚠️ one: Uncommitted changes detected

Modified files:
- one/knowledge/ontology.md
- CLAUDE.md

Action: Will commit these changes before pushing
```

## Pre-Commit Hooks

If pre-commit hooks are configured, respect them:

```bash
# If hook fails
⚠️ Pre-commit hook failed in web/

Issues found:
- Linting errors in src/pages/ontology.astro
- Type errors in src/components/GroupHierarchy.tsx

Fix these issues before pushing? [y/N]
```

## Examples

**Example 1: Push all repositories**
```
User: /push

Analyzing changes...
✓ web: 5 files modified
✓ cli: 2 files modified
✓ one: 3 files modified
✓ apps/one: 12 files modified

Generating commit messages...
Pushing to GitHub...

✅ Complete! 4 repositories updated.
```

**Example 2: Push specific repository**
```
User: /push cli

Analyzing changes...
✓ cli: 2 files modified

Commit message:
feat: add --verbose flag to init command

Allows users to see detailed output during initialization...

Push to one-ie/cli? [Y/n] y

✅ Pushed to github.com/one-ie/cli
```

**Example 3: Dry run**
```
User: /push --dry-run

Would commit and push:

📦 web (5 files):
  - src/pages/ontology.astro
  - src/components/GroupHierarchy.tsx
  - src/styles/groups.css
  Message: "feat: add hierarchical group navigation"

📦 cli (2 files):
  - src/commands/init.ts
  - test/commands/init.test.ts
  Message: "fix: resolve TypeScript errors in init command"

📦 one (3 files):
  - connections/ontology.md
  - knowledge/architecture.md
  - things/specifications/groups.md
  Message: "docs: update 6-dimension ontology specification"

📦 apps/one (12 files):
  - Synced from root repositories
  Message: "chore: sync assembly repository with latest changes"

🔍 Dry run mode - nothing was actually pushed
```

## Security Considerations

- **Never commit secrets** (API keys, tokens, passwords)
- **Check .env files** are gitignored
- **Verify branch** before pushing (should be main or feature branch)
- **Review sensitive data** in commit diffs

## Integration with /release

The `/push` command is complementary to `/release`:
- Use `/push` for regular development commits
- Use `/release` for versioned releases with deployment

```
Development workflow:
/push → /push → /push → /release patch → /push
```

---

**Smart commits across all repositories with one command! 🚀**
