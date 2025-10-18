/// <reference types="astro/client" />
/// <reference types="../.astro/types" />

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_SITE_URL: string;
  readonly PUBLIC_BACKEND_PROVIDER?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    user: {
      id: string;
      email: string;
      name?: string;
    } | null;
    session: {
      token: string;
    } | null;
    runtime?: {
      env: {
        GITHUB_CLIENT_ID?: string;
        GITHUB_CLIENT_SECRET?: string;
        GOOGLE_CLIENT_ID?: string;
        GOOGLE_CLIENT_SECRET?: string;
        BETTER_AUTH_SECRET?: string;
        BETTER_AUTH_URL?: string;
        PUBLIC_CONVEX_URL?: string;
        CONVEX_DEPLOYMENT?: string;
        [key: string]: string | undefined;
      };
    };
  }
}
