import { resolveApiKey, resolveBaseUrl } from "./urls.js";
import { OneSdkError } from "./types.js";

export interface StorageEntry {
  key: string;
  value: string;
}

async function req<T>(path: string, init: RequestInit, apiKey?: string, baseUrl?: string): Promise<T> {
  const key = resolveApiKey(apiKey);
  const url = `${resolveBaseUrl(baseUrl)}${path}`;
  const headers = new Headers(init.headers);
  if (key) headers.set("Authorization", `Bearer ${key}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  const res = await fetch(url, { ...init, headers });
  if (!res.ok) throw new OneSdkError(`storage ${res.status}`, res.status);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function listStorage(uid: string, apiKey?: string): Promise<StorageEntry[]> {
  const data = await req<{ items: StorageEntry[] }>(`/api/storage/${encodeURIComponent(uid)}`, { method: "GET" }, apiKey);
  return data.items ?? [];
}

export async function getStorage(uid: string, key: string, apiKey?: string): Promise<string | null> {
  try {
    const data = await req<{ value: string }>(`/api/storage/${encodeURIComponent(uid)}/${encodeURIComponent(key)}`, { method: "GET" }, apiKey);
    return data.value;
  } catch (err) {
    if (err instanceof OneSdkError && err.status === 404) return null;
    throw err;
  }
}

export async function putStorage(uid: string, key: string, value: string, apiKey?: string): Promise<void> {
  await req(`/api/storage/${encodeURIComponent(uid)}/${encodeURIComponent(key)}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  }, apiKey);
}

export async function deleteStorage(uid: string, key: string, apiKey?: string): Promise<void> {
  await req(`/api/storage/${encodeURIComponent(uid)}/${encodeURIComponent(key)}`, { method: "DELETE" }, apiKey);
}
