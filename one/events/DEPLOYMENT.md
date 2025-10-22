# Deployment Quick Reference

**ONE Platform - Installation Folder Multi-Tenancy**

## Quick Start

### Option 1: Automatic Deployment (Recommended)

Push to main branch - CI/CD handles everything:

```bash
git push origin main
```

GitHub Actions will:
1. Run tests
2. Build web application
3. Deploy to Cloudflare Pages
4. Deploy to Convex

### Option 2: Manual Deployment

```bash
# 1. Validate
./scripts/validate-deployment.sh

# 2. Backup (optional)
./scripts/backup-installation.sh [installation-name]

# 3. Deploy
./scripts/deploy-with-installation.sh [installation-name]
```

### Option 3: Using Package Scripts

```bash
cd web

# Validate before deployment
bun run validate

# Full deployment
bun run deploy

# Preview deployment
bun run deploy:preview
```

## Common Commands

### Deployment
```bash
# Deploy with default installation (one-group)
./scripts/deploy-with-installation.sh

# Deploy with specific installation
./scripts/deploy-with-installation.sh acme

# Deploy web only
cd web
wrangler pages deploy dist --project-name=web

# Deploy backend only
cd backend
npx convex deploy
```

### Backup & Restore
```bash
# Backup installation folder
./scripts/backup-installation.sh acme

# List backups
ls -lah backups/installations/

# Restore from backup
tar -xzf backups/installations/acme-20251016-120000.tar.gz -C /
```

### Validation
```bash
# Pre-deployment validation
./scripts/validate-deployment.sh

# Build validation only
cd web && bun run build

# Type checking only
cd web && bunx astro check
```

### Monitoring
```bash
# Cloudflare Pages logs
wrangler pages deployment tail --project-name=web

# Convex logs
cd backend
npx convex logs --history 100

# Check deployment status
curl -I https://web.one.ie
```

## Environment Variables

### Required (GitHub Secrets)
- `PUBLIC_CONVEX_URL` - Backend URL
- `CLOUDFLARE_API_TOKEN` - Cloudflare auth
- `CLOUDFLARE_ACCOUNT_ID` - Account ID
- `CONVEX_DEPLOY_KEY` - Convex deployment key

### Optional
- `INSTALLATION_NAME` - Installation folder name (default: one-group)

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf web/.astro web/dist
cd web && bun run build
```

### Installation Folder Not Found
```bash
# Verify folder exists
ls -la /[installation-name]

# Create if needed
npx oneie init
```

### Deployment Fails
```bash
# Check Cloudflare authentication
wrangler whoami

# Check Convex authentication
cd backend
npx convex dev
```

## Rollback

### Web
1. Go to Cloudflare Dashboard
2. Navigate to Pages → web → Deployments
3. Click "Rollback" on previous deployment

### Installation Folder
```bash
# Find backup
ls -lah backups/installations/

# Restore
tar -xzf backups/installations/[backup-file] -C /
```

## Documentation

- **Full Guide:** `/one/events/deployment-installation-folders.md`
- **Implementation Summary:** `/one/events/deployment-ops-summary.md`
- **Verification Checklist:** `/one/events/deployment-verification.md`
- **CI/CD Config:** `.github/workflows/deploy.yml`
- **Wrangler Config:** `web/wrangler.toml`

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review full deployment guide
3. Check GitHub Actions logs
4. Contact DevOps team

---

**Simple enough for daily use. Powerful enough for complex deployments.**
