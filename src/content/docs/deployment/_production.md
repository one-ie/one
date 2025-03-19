---
title: Production Deployment
description: Learn how to deploy ONE applications to production environments
date: 2024-02-02
section: Deployment
order: 1
---

# Deploying to Production

This guide covers everything you need to know about deploying ONE applications to production environments, including setup, optimization, and monitoring.

## Deployment Options

### 1. Vercel 

The simplest way to deploy your ONE application:

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel deploy
```

#### Environment Setup
```env
# .env.production
OPENAI_API_KEY=your_production_key
EDGE_CONFIG=your_edge_config
```

#### Configuration
```typescript
// vercel.json
{
  "regions": ["all"],
  "env": {
    "EDGE_RUNTIME": "1"
  },
  "buildCommand": "pnpm build",
  "outputDirectory": "dist"
}
```

### 2. Cloudflare Pages

Note: This is under development 

```bash
# Install Wrangler
pnpm add -g wrangler

# Deploy
wrangler deploy
```

#### Configuration
```toml
# wrangler.toml
name = "your-one-app"
type = "webpack"
account_id = "your_account_id"
workers_dev = true
route = "your-domain.com/*"
zone_id = "your_zone_id"

[env.production]
vars = { ENVIRONMENT = "production" }
```

### 3. Asset Optimization

```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  build: {
    inlineStylesheets: 'auto',
    minify: true,
    splitting: true,
  },
  image: {
    service: 'astro/assets/services/sharp',
  },
});
```

## Security Measures

### 1. Environment Variables

```typescript
// src/env.ts
import { z } from 'zod';

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

### 3. Content Security Policy

```typescript
// src/middleware/security.ts
export const securityHeaders = {
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim(),
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

## Monitoring

### 1. Error Tracking

```typescript
// src/lib/errorTracking.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

export const trackError = (error: Error, context?: any) => {
  Sentry.captureException(error, {
    extra: context
  });
};
```

### 2. Performance Monitoring

```typescript
// src/lib/metrics.ts
import { Metrics } from '@opentelemetry/api';

export const metrics = {
  chatLatency: new Metrics.Counter('chat_latency', {
    description: 'Chat response latency in milliseconds'
  }),
  requestCount: new Metrics.Counter('request_count', {
    description: 'Total number of requests'
  })
};

// Usage
metrics.chatLatency.add(responseTime);
metrics.requestCount.add(1);
```

## Health Checks

```typescript
// src/pages/api/health.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    openai: await checkOpenAI()
  };

  const isHealthy = Object.values(checks).every(status => status === 'healthy');

  return new Response(JSON.stringify({
    status: isHealthy ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  }), {
    status: isHealthy ? 200 : 503,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
```

## Scaling Considerations

1. **Database Connections**
   - Use connection pooling
   - Implement retry logic
   - Monitor connection limits

2. **Memory Management**
   - Implement proper garbage collection
   - Monitor memory usage
   - Use streaming for large responses

3. **Load Balancing**
   - Distribute traffic evenly
   - Handle failover scenarios
   - Monitor server health

## Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and dependencies
   pnpm clean
   rm -rf node_modules
   pnpm install
   ```

2. **API Issues**
   - Verify environment variables
   - Check API key permissions
   - Monitor rate limits

3. **Performance Problems**
   - Enable edge functions
   - Implement caching
   - Optimize assets
   - Monitor response times

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Build process verified
- [ ] Security headers implemented
- [ ] Rate limiting enabled
- [ ] Error tracking setup
- [ ] Performance monitoring active
- [ ] Health checks configured
- [ ] Backup strategy in place
- [ ] SSL certificates installed
- [ ] DNS records updated
