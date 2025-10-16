# Deployment Guide: Installation Folders

**Version:** 1.0.0
**Date:** 2025-10-16

## Overview

Deploying ONE Platform with installation folder customization.

## Prerequisites

- Installation folder created (`npx oneie init`)
- Environment variables configured
- Cloudflare account with Pages access
- Convex deployment key

## Deployment Steps

### 1. Validate

```bash
./scripts/validate-deployment.sh
```

### 2. Backup (Optional)

```bash
./scripts/backup-installation.sh acme
```

### 3. Deploy

```bash
./scripts/deploy-with-installation.sh acme
```

## Environment Variables

**Required:**
- `PUBLIC_CONVEX_URL` - Convex backend URL
- `CLOUDFLARE_API_TOKEN` - Cloudflare API token

**Optional:**
- `INSTALLATION_NAME` - Installation folder name
- `PUBLIC_INSTALLATION_NAME` - Exposed to frontend

## CI/CD

GitHub Actions automatically deploys on push to `main`:

1. Tests run (web + cli)
2. Type checking
3. Build with installation folder
4. Deploy to Cloudflare Pages
5. Deploy to Convex

## Manual Deployment

### Web Only

```bash
cd web
INSTALLATION_NAME=acme bun run build
wrangler pages deploy dist --project-name=web
```

### Backend Only

```bash
cd backend
npx convex deploy
```

## Rollback

### Web

```bash
# List deployments
wrangler pages deployment list --project-name=web

# Rollback to previous (via dashboard)
# Cloudflare doesn't support CLI rollback yet
```

### Installation Folder

```bash
# Restore from backup
tar -xzf backups/installations/acme-20251016-120000.tar.gz -C /
```

## Monitoring

### Check Deployment Status

```bash
# Web
curl -I https://web.one.ie

# Backend
npx convex run queries:health --prod
```

### View Logs

```bash
# Cloudflare Pages logs
wrangler pages deployment tail --project-name=web

# Convex logs
npx convex logs --history 100
```

## Troubleshooting

### Installation Folder Not Found

```bash
# Verify folder exists
ls -la /<installation-name>

# Recreate if needed
npx oneie init
```

### Build Failure

```bash
# Clear cache
rm -rf web/.astro web/dist

# Rebuild
cd web && bun run build
```

### Environment Variables Not Set

```bash
# Check .env.local
cat web/.env.local

# Set manually
export INSTALLATION_NAME=acme
export PUBLIC_INSTALLATION_NAME=acme
```

## Best Practices

1. **Always backup** installation folder before major deployments
2. **Validate** before deploying to production
3. **Test** in preview environment first
4. **Monitor** logs after deployment
5. **Document** changes in CHANGELOG.md

## References

- Installation folder guide: `/one/knowledge/installation-folders.md`
- Release process: `.claude/commands/release.md`
- CI/CD workflow: `.github/workflows/deploy.yml`
