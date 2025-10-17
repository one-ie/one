---
allowed-tools: Bash(cd web && bun run build:*), Bash(cd web && wrangler pages deploy:*), Bash(echo:*), Bash(cat .env:*), Bash(grep CLOUDFLARE .env:*)
description: Deploy your website to Cloudflare Pages with automated setup
---

# /deploy - Deploy to Cloudflare Pages

**Purpose:** Deploy your website to Cloudflare Pages with one command. This handles everything from checking credentials to building and deploying.

## How It Works

This command will:
1. Check if you have Cloudflare credentials configured
2. If not, provide step-by-step instructions to get them
3. Build your website
4. Deploy to Cloudflare Pages
5. Give you the live URL

## Your Task

Follow these steps in order:

### Step 1: Check for Cloudflare Credentials

Run this command to check if credentials are configured:

```bash
grep -E "CLOUDFLARE_GLOBAL_API_KEY|CLOUDFLARE_ACCOUNT_ID|CLOUDFLARE_EMAIL" .env 2>/dev/null || echo "No Cloudflare credentials found"
```

### Step 2: If Credentials Are Missing

If the user doesn't have credentials, provide these instructions:

**"To deploy to Cloudflare, you need to add three environment variables to your `.env` file. Here's how to get them:**

**1. Get Your Cloudflare Global API Key:**
   - Go to https://dash.cloudflare.com/profile/api-tokens
   - Scroll to "API Keys" section
   - Click "View" next to "Global API Key"
   - Copy the key (you'll need to enter your Cloudflare password)

**2. Get Your Account ID:**
   - Go to https://dash.cloudflare.com/
   - Select any website
   - On the right side, you'll see "Account ID" - copy it

**3. Get Your Email:**
   - This is the email you use to log into Cloudflare

**4. Add to Your `.env` File:**

Open or create a `.env` file in your project root and add:

```bash
CLOUDFLARE_GLOBAL_API_KEY=your-global-api-key-here
CLOUDFLARE_ACCOUNT_ID=your-account-id-here
CLOUDFLARE_EMAIL=your-cloudflare-email@example.com
```

**IMPORTANT SECURITY NOTES:**
- The Global API Key provides **FULL CONTROL** over your Cloudflare account
- Never commit your `.env` file to git (it should already be in `.gitignore`)
- Never share these credentials with anyone
- This gives complete access to create, modify, and delete resources

Once you've added these to `.env`, run `/deploy` again to deploy your site!"

### Step 3: If Credentials Exist, Deploy

If credentials are found, proceed with deployment:

```bash
# 1. Build the website
cd web
echo "Building your website..."
bun run build

# 2. Deploy to Cloudflare Pages
echo ""
echo "Deploying to Cloudflare Pages..."
wrangler pages deploy dist --project-name=web --commit-dirty=true

# 3. The output will show the deployment URL
```

### Step 4: Report Success

After deployment completes, tell the user:

**"✅ Deployment Complete!**

Your website is now live at:
- **Production**: https://web.one.ie (if custom domain configured)
- **Preview**: [URL from wrangler output]

**What Just Happened:**
1. Built your website (optimized for production)
2. Uploaded to Cloudflare Pages
3. Deployed to edge servers worldwide (330+ locations)

**Next Steps:**
- Test your live site
- Set up a custom domain (if desired)
- Configure CI/CD for automatic deployments

**Deployment Dashboard:**
https://dash.cloudflare.com → Pages → web

**To redeploy after changes:**
Just run `/deploy` again anytime!"

## Error Handling

### If Build Fails

Tell the user:
"❌ Build failed. Please fix the errors above and try again.

Common issues:
- TypeScript errors: Run `bunx astro check`
- Missing dependencies: Run `bun install`
- Configuration issues: Check `astro.config.mjs`"

### If Wrangler Not Authenticated

If you see an error about wrangler authentication, tell the user:

"You need to authenticate wrangler CLI:

```bash
npx wrangler login
```

This will open a browser to log into Cloudflare. Once logged in, run `/deploy` again."

### If Project Doesn't Exist

If the project doesn't exist on Cloudflare Pages:

"The 'web' project doesn't exist yet. Let's create it:

1. Go to https://dash.cloudflare.com → Pages
2. Click "Create a project"
3. Name it 'web'
4. Skip the git connection for now
5. Run `/deploy` again

Or change the project name in the deploy command to match an existing project."

## Important Notes

**Security:**
- The `.env` file is excluded from git by default
- Your Global API Key gives full control - keep it secure
- Never log or display the actual key values

**Deployment:**
- First deployment may take 2-3 minutes
- Subsequent deployments are faster (~30 seconds)
- Changes are live on the edge network within seconds

**Custom Domains:**
- Add custom domains in Cloudflare Pages dashboard
- HTTPS is automatic and free
- DNS can be managed in Cloudflare

## Example Session

**User runs `/deploy` without credentials:**

```
❌ No Cloudflare credentials found in .env

To deploy, you need three values from Cloudflare:
[...instructions above...]
```

**User adds credentials and runs `/deploy` again:**

```
✅ Cloudflare credentials found
🔨 Building website...
✓ Build complete (2.3s)
🚀 Deploying to Cloudflare Pages...
✨ Upload complete
🌍 Deploying globally...
✅ Deployment complete!

Your site is live at: https://abc123.pages.dev
```

---

**Simple, secure, and powerful deployment in one command! 🚀**
