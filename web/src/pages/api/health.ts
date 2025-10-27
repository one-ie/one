import type { APIRoute } from 'astro';

export const GET: APIRoute = async () => {
  const startTime = Date.now();

  // Basic health check
  const health = {
    status: 'ok',
    timestamp: Date.now(),
    version: '3.6.7',
    environment: import.meta.env.MODE || 'production',
    checks: {
      server: {
        status: 'healthy',
        uptime: process.uptime?.() || 0,
        memory: process.memoryUsage?.() || {},
      },
      backend: {
        provider: 'convex',
        url: import.meta.env.PUBLIC_CONVEX_URL || 'not configured',
        status: 'unknown', // Will check connection
      },
      auth: {
        provider: 'better-auth',
        status: 'configured',
      },
      email: {
        provider: 'resend',
        status: 'configured',
      },
    },
    responseTime: Date.now() - startTime,
  };

  // Check if Convex is accessible (optional - timeout after 5s)
  try {
    const convexUrl = import.meta.env.PUBLIC_CONVEX_URL;
    if (convexUrl) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const convexHealth = await fetch(`${convexUrl}/_system/metadata`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      health.checks.backend.status = convexHealth.ok ? 'healthy' : 'degraded';
    }
  } catch (error) {
    health.checks.backend.status = 'unavailable';
  }

  const statusCode = health.checks.backend.status === 'healthy' ? 200 : 503;

  return new Response(JSON.stringify(health, null, 2), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Health-Check': 'true',
    },
  });
};
