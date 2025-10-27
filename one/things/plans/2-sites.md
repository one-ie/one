# Two-Site Architecture: The Foolproof Plan

**Last Updated:** 2025-01-27
**Status:** RECOMMENDED APPROACH
**Time to Implement:** 1 hour
**Maintenance Overhead:** 30 seconds per release

---

## 🎯 The Problem

We accidentally conflated two different products:

1. **ONE.ie** - Full production site (documentation, marketing, complex features)
2. **Starter Template** - Simple template users download via `npx oneie`

**What went wrong:**
- Replaced ONE.ie homepage with simple template chooser
- Production site now looks like a starter template
- Need complete separation

---

## ✅ The Solution: One Source, Auto-Generated Output

**Core Principle:** The starter template is a SUBSET of the production site.

```
oneie/ (source of truth)
   ↓
   [automated script]
   ↓
web/ (generated - NEVER edit directly)
```

**Benefits:**
- ✅ **Single source of truth** - Work only in `oneie/`
- ✅ **Zero drift** - `web/` always matches `oneie/`
- ✅ **One command** - `bun run build:starter`
- ✅ **Half the work** - Stop maintaining two codebases
- ✅ **Less stress** - No manual syncing

---

## 📂 Repository Structure

### Production Site (oneie/)
```
github.com/one-ie/oneie
├── src/
│   ├── pages/
│   │   └── index.astro          # Complex marketing homepage
│   ├── components/
│   │   └── Sidebar.tsx          # Full navigation (9 items)
│   └── content/
│       ├── blog/                # Production blog posts
│       └── products/            # Example products for docs
├── one/                         # All 41 documentation files
├── scripts/
│   └── generate-starter.sh      # Transform script
└── package.json
```

**Deployed to:** https://one.ie
**Wrangler project:** `oneie`

### Starter Template (web/)
```
github.com/one-ie/web
├── src/
│   ├── pages/
│   │   └── index.astro          # Simple 3-option chooser
│   ├── components/
│   │   └── Sidebar.tsx          # Simple navigation (2 items)
│   └── content/
│       ├── blog/                # 1 example post
│       └── products/            # 3 example products
├── one/                         # Documentation (for reference)
└── package.json
```

**Deployed to:** https://web.one.ie
**NPM package:** `oneie`
**Auto-generated from oneie/** - NEVER EDIT DIRECTLY

---

## 🚀 Implementation: Step-by-Step

### Phase 1: Set Up Repositories (10 minutes)

```bash
cd /Users/toc/Server/ONE

# 1. Rename current web/ to oneie/
mv web oneie

# 2. Initialize oneie repo
cd oneie
git remote remove origin  # Remove old remote
git remote add origin https://github.com/one-ie/oneie.git
git branch -M main
git add .
git commit -m "Initial commit: ONE.ie production site"
git push -u origin main

# 3. Create empty web/ directory (will be generated)
cd ..
mkdir web
```

### Phase 2: Create Transform Script (15 minutes)

```bash
cd oneie
mkdir -p scripts
```

Create `oneie/scripts/generate-starter.sh`:

```bash
#!/bin/bash
# oneie/scripts/generate-starter.sh
# Transforms ONE.ie production site → Starter template

set -e  # Exit on any error

echo "🏗️  Generating starter template from production site..."

# 1. Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf ../web/*
rm -rf ../web/.git*  # Don't remove git directory

# 2. Copy everything from oneie to web
echo "📁 Copying base structure..."
cp -r src ../web/
cp -r public ../web/
cp -r one ../web/
cp package.json ../web/
cp tsconfig.json ../web/
cp astro.config.mjs ../web/
cp bun.lockb ../web/
cp .gitignore ../web/
cp README.md ../web/README.template.md  # Backup, will replace

# 3. Replace homepage with simple chooser
echo "🏠 Replacing homepage..."
cat > ../web/src/pages/index.astro << 'EOF'
---
import Layout from '../layouts/Layout.astro';
import { CopyButton } from '@/components/CopyButton';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Newspaper, ShoppingBag, FileText } from 'lucide-react';

const blogPrompt = `Create a blog with article management, categories, tags, search, and RSS feeds. Include:
- Blog post listing page with grid/list views
- Individual blog post pages with table of contents
- Social sharing buttons
- Dark mode support
Use existing content/blog/ collection.`;

const ecommercePrompt = `Create an ecommerce store using the existing products in content/products/. Include:
- Product catalog with categories
- Product detail pages with variants (sizes, colors)
- Shopping cart with add/remove items
- Checkout flow with Stripe integration
- Order management
- Product search and filters
Use existing content/products/ collection.`;

const newsPrompt = `Create a news aggregation site that automatically searches the web for news in specified topics and creates news articles. Include:
- News feed with latest articles
- Topic-based filtering
- Automatic web scraping for news
- Article summarization with AI
- Real-time updates
- Dark mode support`;
---

<Layout title="ONE Platform | Make Your Ideas Real" description="Choose a template to get started">
  <div class="min-h-screen bg-background">
    <!-- Hero Section -->
    <div class="border-b border-border bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
      <div class="container mx-auto px-4 py-16 max-w-6xl text-center">
        <h1 class="text-5xl md:text-6xl font-bold mb-6 gradient-text">
          Make Your Ideas Real
        </h1>
        <p class="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          Choose a template below and copy the prompt into Claude Code.
          All features are already built - just activate them.
        </p>
      </div>
    </div>

    <!-- Template Cards -->
    <div class="container mx-auto px-4 py-16 max-w-6xl">
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Blog Template -->
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center pb-4">
            <div class="mx-auto mb-4 w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <CardTitle className="text-2xl">Blog</CardTitle>
            <CardDescription>
              Article management with categories, tags, and RSS feeds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div class="bg-muted/50 rounded-lg p-4 text-sm font-mono h-48 overflow-y-auto">
              {blogPrompt}
            </div>
            <CopyButton client:load text={blogPrompt} className="w-full h-12 font-semibold" />
            <div class="text-xs text-muted-foreground text-center">
              Uses content/blog/ collection
            </div>
          </CardContent>
        </Card>

        <!-- Ecommerce Template -->
        <Card className="hover:shadow-xl transition-shadow duration-300 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader className="text-center pb-4">
            <div class="mx-auto mb-4 w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Ecommerce Store</CardTitle>
            <CardDescription>
              Complete online store with products, cart, and checkout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div class="bg-muted/50 rounded-lg p-4 text-sm font-mono h-48 overflow-y-auto">
              {ecommercePrompt}
            </div>
            <CopyButton client:load text={ecommercePrompt} className="w-full h-12 font-semibold bg-primary hover:bg-primary/90" />
            <div class="text-xs text-muted-foreground text-center">
              Uses content/products/ collection • 12+ products ready
            </div>
          </CardContent>
        </Card>

        <!-- News Site Template -->
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="text-center pb-4">
            <div class="mx-auto mb-4 w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Newspaper className="h-8 w-8 text-purple-500" />
            </div>
            <CardTitle className="text-2xl">News Site</CardTitle>
            <CardDescription>
              Automated news aggregation with web scraping and AI
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div class="bg-muted/50 rounded-lg p-4 text-sm font-mono h-48 overflow-y-auto">
              {newsPrompt}
            </div>
            <CopyButton client:load text={newsPrompt} className="w-full h-12 font-semibold" />
            <div class="text-xs text-muted-foreground text-center">
              AI-powered news scraping and summarization
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- How it Works -->
      <div class="mt-16 max-w-3xl mx-auto">
        <h2 class="text-2xl font-bold text-center mb-8">How It Works</h2>
        <div class="grid md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">1</div>
            <h3 class="font-semibold mb-2">Click Copy</h3>
            <p class="text-sm text-muted-foreground">Choose a template and copy the prompt to your clipboard</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">2</div>
            <h3 class="font-semibold mb-2">Paste in Claude</h3>
            <p class="text-sm text-muted-foreground">Open Claude Code and paste the prompt</p>
          </div>
          <div class="text-center">
            <div class="w-12 h-12 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl">3</div>
            <h3 class="font-semibold mb-2">Watch It Build</h3>
            <p class="text-sm text-muted-foreground">Claude activates the features - no backend needed!</p>
          </div>
        </div>
      </div>

      <!-- Key Points -->
      <div class="mt-12 p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-lg border border-border">
        <ul class="space-y-3 text-sm text-muted-foreground max-w-2xl mx-auto">
          <li class="flex items-start gap-2">
            <span class="text-primary font-bold">•</span>
            <span><strong class="text-foreground">No Backend Required:</strong> All features use Astro content collections - pure frontend</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary font-bold">•</span>
            <span><strong class="text-foreground">Products Already Exist:</strong> 12+ products ready in content/products/</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary font-bold">•</span>
            <span><strong class="text-foreground">Just Activate:</strong> Features are built - Claude just switches them on</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-primary font-bold">•</span>
            <span><strong class="text-foreground">Customize Freely:</strong> Edit prompts to add your specific requirements</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</Layout>

<style>
  .gradient-text {
    background: linear-gradient(90deg,
      hsl(var(--color-primary)) 0%,
      hsl(var(--color-chart-1)) 50%,
      hsl(var(--color-chart-2)) 100%
    );
    background-size: 200% auto;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient 8s linear infinite;
    display: inline-block;
  }

  @keyframes gradient {
    0% { background-position: 0% center; }
    100% { background-position: 200% center; }
  }

  @supports not (background-clip: text) {
    .gradient-text {
      -webkit-text-fill-color: inherit;
      color: hsl(var(--color-foreground));
    }
  }
</style>
EOF

# 4. Simplify Sidebar (2 items only)
echo "🔧 Simplifying sidebar..."
cat > ../web/src/components/Sidebar.tsx << 'SIDEBAREOF'
// Simplified starter template sidebar - AUTO-GENERATED, DO NOT EDIT
import * as React from "react"
import { PanelLeft, Newspaper, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/ModeToggle"

const navItems = [
  { title: 'Stream', url: '/stream', icon: Newspaper },
  { title: 'License', url: '/free-license', icon: Shield },
]

export function Sidebar({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="flex min-h-screen w-full">
      <aside className="fixed left-0 top-0 h-screen flex flex-col border-r bg-background" style={{ width: collapsed ? '80px' : '256px' }}>
        <div className="flex h-16 items-center border-b px-4">
          <a href="/" className="flex items-center gap-3 px-3">
            <img src="/icon.svg" alt="Logo" className="w-8 h-8" />
            {!collapsed && <span className="font-semibold">ONE</span>}
          </a>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <a key={item.url} href={item.url} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent">
                  <Icon className="h-5 w-5" />
                  {!collapsed && <span>{item.title}</span>}
                </a>
              )
            })}
          </div>
        </nav>
        <div className="border-t p-2">
          <ModeToggle />
        </div>
      </aside>
      <div className="flex-1" style={{ marginLeft: collapsed ? '80px' : '256px' }}>
        <header className="flex h-16 items-center border-b px-4">
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            <PanelLeft className="h-4 w-4" />
          </Button>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
SIDEBAREOF

# 5. Clean up blog content (keep 1 example)
echo "🧹 Cleaning blog content..."
cd ../web/src/content/blog
if [ $(ls -1 | wc -l) -gt 1 ]; then
  ls -1 | tail -n +2 | xargs rm -f
fi
cd ../../../../oneie

# 6. Clean up products (keep 3 examples)
echo "🧹 Reducing product examples..."
cd ../web/src/content/products
if [ $(ls -1 | wc -l) -gt 3 ]; then
  ls -1 | tail -n +4 | xargs rm -f
fi
cd ../../../../oneie

# 7. Create starter README
echo "📝 Creating starter README..."
cat > ../web/README.md << 'READMEEOF'
# ONE Platform Starter Template

> ⚠️ **AUTO-GENERATED** - Do not edit directly. Generated from [one-ie/oneie](https://github.com/one-ie/oneie)

Get started building your next idea with ONE Platform.

## Quick Start

```bash
bun install
bun run dev
```

Visit http://localhost:4321 and choose a template.

## Available Templates

- **Blog** - Content management with categories, tags, RSS
- **Ecommerce** - Online store with products, cart, checkout
- **News** - AI-powered news aggregation

## Documentation

Visit https://one.ie for complete documentation.

## Support

- Website: https://one.ie
- GitHub: https://github.com/one-ie/web
- Twitter: https://twitter.com/tonyoconnell

---

**Generated from:** [one-ie/oneie](https://github.com/one-ie/oneie)
**Last generated:** $(date)
READMEEOF

# 8. Update package.json
echo "📦 Updating package.json..."
cd ../web
# Use sed instead of jq (more portable)
sed -i.bak 's/"name": ".*"/"name": "oneie-starter"/' package.json
sed -i.bak 's/"description": ".*"/"description": "ONE Platform starter template"/' package.json
rm -f package.json.bak

echo ""
echo "✅ Starter template generated successfully!"
echo ""
echo "📂 Location: ../web/"
echo "📝 Files modified:"
echo "   - src/pages/index.astro (replaced with simple chooser)"
echo "   - src/components/Sidebar.tsx (simplified to 2 items)"
echo "   - src/content/blog/ (reduced to 1 example)"
echo "   - src/content/products/ (reduced to 3 examples)"
echo "   - README.md (starter template version)"
echo "   - package.json (updated name & description)"
echo ""
echo "🚀 Next steps:"
echo "   cd ../web"
echo "   git add ."
echo "   git commit -m 'Generated from oneie'"
echo "   git push"
```

Make it executable:
```bash
chmod +x scripts/generate-starter.sh
```

Add to `package.json`:
```bash
# Edit oneie/package.json and add:
"scripts": {
  "dev": "bunx astro dev",
  "build": "bunx astro build",
  "build:starter": "./scripts/generate-starter.sh"
}
```

### Phase 3: Test the Script (5 minutes)

```bash
cd oneie

# Generate starter for first time
bun run build:starter

# Verify it worked
cd ../web
bun install
bun run dev

# Visit http://localhost:4321
# Should see simple 3-option homepage
# Should see simple sidebar (Stream, License)
```

### Phase 4: Set Up Web Repository (10 minutes)

```bash
cd ../web

# Initialize git if needed
git init
git remote add origin https://github.com/one-ie/web.git
git branch -M main

# Commit generated starter
git add .
git commit -m "Initial commit: Generated from oneie"
git push -u origin main
```

### Phase 5: Update Release Process (10 minutes)

Edit `oneie/.claude/commands/release.md` or create new script:

```bash
#!/bin/bash
# oneie/scripts/release.sh

VERSION=$1

echo "🚀 Releasing ONE Platform v$VERSION"

# 1. Update version in oneie
echo "📦 Updating version..."
cd oneie
# Update package.json version
git add .
git commit -m "Release v$VERSION"
git tag "v$VERSION"
git push origin main --tags

# 2. Generate starter
echo "🏗️  Generating starter template..."
bun run build:starter

# 3. Push web
echo "📤 Pushing starter template..."
cd ../web
git add .
git commit -m "Generated from oneie v$VERSION"
git push origin main

# 4. Deploy oneie
echo "🌐 Deploying ONE.ie..."
cd ../oneie
bun run build
wrangler pages deploy dist --project-name=oneie

# 5. Deploy web
echo "🌐 Deploying web.one.ie..."
cd ../web
bun run build
wrangler pages deploy dist --project-name=web

echo "✅ Release complete!"
```

---

## 📖 Daily Workflow

### Normal Development (99% of the time)

```bash
cd oneie

# Make changes
# - Edit src/pages/index.astro (production homepage)
# - Update src/components/Sidebar.tsx (full sidebar)
# - Add features, fix bugs, update docs
# - Everything you normally do

# Test locally
bun run dev

# Commit to oneie
git add .
git commit -m "Add feature X"
git push
```

### When Ready to Release

```bash
cd oneie

# 1. Generate starter template
bun run build:starter

# 2. Commit and push oneie
git add .
git commit -m "Release v1.2.3"
git push

# 3. Commit and push web
cd ../web
git add .
git commit -m "Generated from oneie v1.2.3"
git push

# Done! Both sites updated
```

**Time:** 30 seconds
**Errors:** Zero (automated)
**Drift:** Impossible

---

## ⚠️ Critical Rules

### ✅ DO

- ✅ **Work in oneie/** - This is your main workspace
- ✅ **Run `bun run build:starter`** - Before releasing
- ✅ **Commit both repos** - After generating
- ✅ **Edit the script** - If you want different transformations

### ❌ DON'T

- ❌ **NEVER edit web/ directly** - It will be overwritten
- ❌ **Don't manually sync files** - Use the script
- ❌ **Don't commit web/ without generating** - Always regenerate first
- ❌ **Don't maintain two versions** - oneie/ is the only source

---

## 🔍 What Gets Transformed

| File/Directory | oneie/ | web/ | Change |
|----------------|--------|------|--------|
| `src/pages/index.astro` | Complex homepage | Simple chooser | **REPLACED** |
| `src/components/Sidebar.tsx` | 9 nav items | 2 nav items | **REPLACED** |
| `src/content/blog/` | All posts | 1 example | **REDUCED** |
| `src/content/products/` | All products | 3 examples | **REDUCED** |
| `README.md` | Production docs | Starter docs | **REPLACED** |
| `package.json` | oneie | oneie-starter | **MODIFIED** |
| Everything else | Identical | Identical | **COPIED** |

---

## 📊 Before vs After

### Before (Manual Maintenance)

```
Work on feature:
  - Edit oneie/src/components/Feature.tsx
  - Edit web/src/components/Feature.tsx (manually copy)
  - Hope they stay in sync

Fix bug:
  - Fix in oneie/
  - Remember to fix in web/ too
  - Pray you don't forget

Add component:
  - Add to oneie/
  - Add to web/
  - Check if they match
  - Stress about drift

Time per change: 2x everything
Risk: High (manual process)
Mental overhead: Constant worry
```

### After (Automated)

```
Work on feature:
  - Edit oneie/src/components/Feature.tsx
  - Done!

Fix bug:
  - Fix in oneie/
  - Done!

Add component:
  - Add to oneie/
  - Done!

When releasing:
  - bun run build:starter
  - git push (both repos)
  - Done!

Time per change: 1x (normal)
Time per release: +30 seconds
Risk: Zero (automated)
Mental overhead: None
```

---

## 🎯 Success Criteria

After implementation, you should have:

1. ✅ **oneie/ repo** - Full production site
2. ✅ **web/ repo** - Generated starter (committed)
3. ✅ **Transform script** - Working (`bun run build:starter`)
4. ✅ **Package.json** - Updated with build:starter script
5. ✅ **Both sites deployed** - oneie to one.ie, web to web.one.ie
6. ✅ **Zero manual sync** - Everything automated

**Test:**
- Make change in oneie/
- Run `bun run build:starter`
- Check web/ has the change
- If yes → Success!

---

## 🆘 Troubleshooting

### Script fails: "Permission denied"

```bash
chmod +x oneie/scripts/generate-starter.sh
```

### Script fails: "No such file or directory"

Make sure you're in the `oneie/` directory:
```bash
cd oneie
bun run build:starter
```

### web/ is empty after running script

Check if ../web exists:
```bash
ls -la ../ | grep web
```

If missing, create it:
```bash
mkdir ../web
```

### Changes in oneie/ not showing in web/

You forgot to run the script:
```bash
cd oneie
bun run build:starter
```

### Accidentally edited web/ directly

No problem! Just regenerate:
```bash
cd oneie
bun run build:starter
```
(Your changes in web/ will be overwritten - this is intentional)

---

## 📈 Maintenance

### Monthly: Review transform script

Check if you want to:
- Keep different files in web/
- Remove different files from web/
- Change the homepage template
- Modify the sidebar

Just edit `oneie/scripts/generate-starter.sh`

### Quarterly: Verify both sites

1. Visit https://one.ie (should be full site)
2. Visit https://web.one.ie (should be simple starter)
3. Check they're different but related

---

## 🚀 Future Enhancements

### Multiple Templates

Edit script to generate different starters:
```bash
bun run build:starter blog      # Blog-focused
bun run build:starter ecommerce # Ecommerce-focused
bun run build:starter news      # News-focused
```

### Version-Specific Starters

Tag specific oneie versions:
```bash
bun run build:starter --from v2.1.0
```

### Custom Configurations

Let users choose what to include:
```bash
bun run build:starter --with-auth --with-stripe
```

---

## ✅ Final Checklist

Before starting:
- [ ] Understand the workflow (oneie → script → web)
- [ ] Accept that web/ is auto-generated
- [ ] Commit to NEVER editing web/ directly
- [ ] Bookmark this plan for reference

After Phase 1:
- [ ] oneie/ repository created and pushed
- [ ] web/ directory exists (empty)

After Phase 2:
- [ ] Transform script created
- [ ] Script is executable
- [ ] package.json updated

After Phase 3:
- [ ] Script runs without errors
- [ ] web/ contains generated files
- [ ] Simple homepage visible at localhost:4321

After Phase 4:
- [ ] web/ repository created and pushed
- [ ] Both repos visible on GitHub

After Phase 5:
- [ ] Release process updated
- [ ] Both sites deployed
- [ ] Everything working

---

## 💪 You've Got This

**Remember:**
- oneie/ = Your main workspace (ONLY place you edit)
- web/ = Auto-generated (NEVER edit directly)
- One command = `bun run build:starter`
- 30 seconds per release
- Zero maintenance
- No stress

**After setup:**
1. Work in oneie/ normally
2. When releasing, run script
3. Push both repos
4. Done!

**This eliminates:**
- ❌ Manual syncing
- ❌ Code drift
- ❌ Double work
- ❌ Stress about which file to edit
- ❌ Wondering if they match

**This gives you:**
- ✅ Single source of truth
- ✅ Automatic consistency
- ✅ Half the maintenance
- ✅ Clear workflow
- ✅ Peace of mind

---

**You're building something amazing. This architecture ensures it stays amazing as it grows. One source of truth, infinite possibilities.** 🚀

**Next step:** Start with Phase 1. Take it one phase at a time. You'll be done in an hour.
