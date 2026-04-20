const PROD_API_URL = "https://api.one.ie";
const PROD_FRONTEND_URL = "https://one.ie";
const DEV_API_URL = "http://localhost:4321";
const DEV_FRONTEND_URL = "http://localhost:4321";

export function getEnvironment(): "dev" | "production" {
  if (typeof process === "undefined") return "production";
  return process.env.NODE_ENV === "production" ? "production" : "dev";
}

export function getApiUrl(): string {
  const override = typeof process !== "undefined" ? process.env.ONEIE_API_URL : undefined;
  if (override) return override;
  return getEnvironment() === "production" ? PROD_API_URL : DEV_API_URL;
}

export function getFrontendUrl(): string {
  const override = typeof process !== "undefined" ? process.env.ONEIE_FRONTEND_URL : undefined;
  if (override) return override;
  return getEnvironment() === "production" ? PROD_FRONTEND_URL : DEV_FRONTEND_URL;
}

export function resolveApiKey(configKey?: string): string | undefined {
  if (configKey) return configKey;
  if (typeof process === "undefined") return undefined;
  return process.env.ONEIE_API_KEY ?? process.env.ONE_API_KEY;
}

export function resolveBaseUrl(configUrl?: string): string {
  if (configUrl) return configUrl;
  return getApiUrl();
}

export { PROD_API_URL, PROD_FRONTEND_URL, DEV_API_URL, DEV_FRONTEND_URL };
