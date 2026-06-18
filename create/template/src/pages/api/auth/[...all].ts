/**
 * Better Auth catch-all handler (T1 — auth foundation)
 *
 * Mounts every Better Auth route (sign-in, sign-up, callbacks, plugin
 * endpoints) under /api/auth/*. Coexists with the legacy /api/auth.ts
 * single-file route — Astro routes exactly /api/auth to the legacy file
 * and /api/auth/<anything> to this catch-all. T18 deletes the legacy.
 *
 * Side effect: whenever Better Auth sets a session cookie (sign-in,
 * sign-up, callback, passkey verify), this handler clears the `signed_out`
 * marker so the middleware re-enables the normal auth path.
 */

import type { APIRoute } from "astro";
import { auth } from "@/lib/auth";

const SESSION_COOKIE_RE = /^(?:__Secure-)?better-auth\.session_token=/;

export const ALL: APIRoute = async ({ request }) => {
	const res = await auth.handler(request);
	const setCookies = res.headers.getSetCookie?.() ?? [];
	if (setCookies.some((c) => SESSION_COOKIE_RE.test(c))) {
		res.headers.append(
			"Set-Cookie",
			"signed_out=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax",
		);
	}
	return res;
};

export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const PATCH = ALL;
export const DELETE = ALL;
export const OPTIONS = ALL;
