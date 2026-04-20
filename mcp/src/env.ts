export interface McpEnv {
  apiKey: string | undefined;
  baseUrl: string;
}

export function readEnv(): McpEnv {
  return {
    apiKey: process.env.ONEIE_API_KEY ?? process.env.ONE_API_KEY,
    baseUrl: process.env.ONEIE_API_URL ?? "https://api.one.ie",
  };
}
