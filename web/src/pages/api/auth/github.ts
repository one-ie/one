import type { APIRoute} from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ redirect, url, locals }) => {
  // Use runtime environment variables (Cloudflare context)
  const runtime = locals.runtime as any;
  const clientId = runtime?.env?.GITHUB_CLIENT_ID || import.meta.env.GITHUB_CLIENT_ID;
  const redirectUri = `${url.origin}/api/auth/github/callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user user:email`;

  return redirect(githubAuthUrl);
};
