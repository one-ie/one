// This plugin is served via x402 — source is not included in this repo.
// It loads at runtime from the ONE platform.
import type { OnePlugin } from "@oneie/frontend";

export const pluginadmin: () => OnePlugin = () => ({
  name: "admin",
  tier: "paid",
  serves: "https://one.ie/x/admin.js",
});
