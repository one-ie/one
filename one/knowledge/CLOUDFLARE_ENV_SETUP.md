# Cloudflare Pages Environment Variables Setup

The following environment variables need to be set in your Cloudflare Pages dashboard:

## Required Variables:

```bash
PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
CONVEX_DEPLOYMENT=prod:shocking-falcon-870
```

## Auth Variables (for Better Auth):

```bash
BETTER_AUTH_URL=https://stack.one.ie
BETTER_AUTH_SECRET=your-secret-key-here-change-in-production
GOOGLE_CLIENT_ID=65341950270-joulo3555emfvl6h549dd7jgfguf53tf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GITHUB_CLIENT_ID=55c60b9b2850097d51b7
GITHUB_CLIENT_SECRET=063f61b8976b1cc26f1ca3fe7d9d6dcddbfb6a7b
```

## Optional (Email):

```bash
RESEND_API_KEY=re_TYRXuC47_2DHJk4KT71jFPu7Mup6WDCdX
RESEND_FROM_EMAIL=tony@one.ie
```

## How to Set in Cloudflare Pages:

1. Go to your Cloudflare dashboard
2. Navigate to Workers & Pages > frontend
3. Go to Settings > Environment Variables
4. Add each variable for Production environment
5. Redeploy your site for changes to take effect

## Alternative: Use Wrangler CLI

```bash
wrangler pages secret put PUBLIC_CONVEX_URL
# Enter the value when prompted
```

Or bulk upload:

```bash
wrangler pages deployment create --env production --var PUBLIC_CONVEX_URL=https://shocking-falcon-870.convex.cloud
```
