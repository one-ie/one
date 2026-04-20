import { getFrontendUrl } from "./urls.js";

export function validateEthAddress(address: string): void {
  if (!address || typeof address !== "string") {
    throw new Error("validateEthAddress: address required");
  }
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    throw new Error(`validateEthAddress: invalid address ${address}`);
  }
}

export function generateDeployLink(agentUid: string, baseUrl?: string): string {
  const root = baseUrl ?? getFrontendUrl();
  const safe = encodeURIComponent(agentUid);
  return `${root.replace(/\/$/, "")}/deploy/${safe}`;
}
