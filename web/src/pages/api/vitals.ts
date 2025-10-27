import type { APIRoute } from 'astro';

/**
 * Web Vitals Collection Endpoint
 *
 * Collects Core Web Vitals from client-side:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * Usage: POST /api/vitals with metric data
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const metric = await request.json();

    // Validate metric structure
    if (!metric.name || !metric.value) {
      return new Response(
        JSON.stringify({ error: 'Invalid metric format' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Log metric (in production, send to analytics service)
    console.log('Web Vital:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating || 'unknown',
      id: metric.id,
      navigationType: metric.navigationType,
      timestamp: Date.now(),
    });

    // TODO: Send to analytics service (Cloudflare Analytics, Vercel Analytics, etc.)
    // Example:
    // await fetch('https://analytics.example.com/vitals', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(metric),
    // });

    return new Response(
      JSON.stringify({ received: true, metric: metric.name }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Failed to process web vital:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process metric' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
