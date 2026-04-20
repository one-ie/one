import { useCallback, useEffect, useState } from "react";
import type {
  DiscoverResponse,
  Health,
  HighwaysResponse,
  HypothesesResponse,
  ListAgentsResponse,
  RevenueResponse,
  Stats,
} from "../types.js";
import { useSubstrate } from "./context.js";

const _cache = new Map<string, Promise<unknown>>();

function cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (!_cache.has(key)) _cache.set(key, fn());
  return _cache.get(key) as Promise<T>;
}

export function useAgent(uid: string) {
  const { client } = useSubstrate();
  const [data, setData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    _cache.delete(`agent:${uid}`);
    setLoading(true);
    cached(`agent:${uid}`, () => client.reveal(uid))
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [uid, client]);

  useEffect(() => {
    cached(`agent:${uid}`, () => client.reveal(uid))
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [uid, client]);

  return { data, loading, error, refetch };
}

export function useDiscover(skill: string, limit = 10) {
  const { client } = useSubstrate();
  const [data, setData] = useState<DiscoverResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    cached(`discover:${skill}:${limit}`, () => client.discover(skill, limit))
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [skill, limit, client]);

  return { data, loading, error };
}

export function useHighways(limit = 10) {
  const { client } = useSubstrate();
  const [data, setData] = useState<HighwaysResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    _cache.delete(`highways:${limit}`);
    setLoading(true);
    cached(`highways:${limit}`, () => client.highways(limit))
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [limit, client]);

  useEffect(() => {
    cached(`highways:${limit}`, () => client.highways(limit))
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [limit, client]);

  return { data, loading, error, refetch };
}

export function useAgentList() {
  const { client } = useSubstrate();
  const [data, setData] = useState<ListAgentsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    _cache.delete("agentList");
    setLoading(true);
    cached("agentList", () => client.listAgents())
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [client]);

  useEffect(() => {
    cached("agentList", () => client.listAgents())
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [client]);

  return { data, loading, error, refetch };
}

export function useStats() {
  const { client } = useSubstrate();
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    _cache.delete("stats");
    setLoading(true);
    cached("stats", () => client.stats())
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [client]);

  useEffect(() => {
    cached("stats", () => client.stats())
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [client]);

  return { data, loading, error, refetch };
}

export function useHealth() {
  const { client } = useSubstrate();
  const [data, setData] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    _cache.delete("health");
    setLoading(true);
    cached("health", () => client.health())
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [client]);

  useEffect(() => {
    cached("health", () => client.health())
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [client]);

  return { data, loading, error, refetch };
}

export function useRevenue() {
  const { client } = useSubstrate();
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    _cache.delete("revenue");
    setLoading(true);
    cached("revenue", () => client.revenue())
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [client]);

  useEffect(() => {
    cached("revenue", () => client.revenue())
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [client]);

  return { data, loading, error, refetch };
}

export function useWallet(uid: string) {
  const { client } = useSubstrate();
  const [data, setData] = useState<{ uid: string; address: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    const key = `wallet:${uid}`;
    if (!_cache.has(key)) _cache.set(key, client.walletFor(uid));
    setLoading(true);
    try {
      const result = await (_cache.get(key) as Promise<{ uid: string; address: string }>);
      setData(result);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
  }, [uid, client]);

  const refetch = useCallback(() => {
    _cache.delete(`wallet:${uid}`);
    _cache.set(`wallet:${uid}`, client.walletFor(uid));
    void fetchData();
  }, [uid, client, fetchData]);

  useEffect(() => { void fetchData(); }, [fetchData]);
  return { data, loading, error, refetch };
}

export function useJoin() {
  const { client } = useSubstrate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<{ ok: boolean; uid: string; group: string; role: string } | null>(null);

  const join = useCallback(async (opts: { uid: string; group?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const r = await client.join(opts);
      setResult(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      throw e;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { join, loading, error, result };
}

export function useDeployOnBehalf() {
  const { client } = useSubstrate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<{ ok: boolean; uid: string; owner: string; inheritedPaths: Array<{ from: string; to: string; strength: number }> } | null>(null);

  const deployOnBehalf = useCallback(async (opts: { owner: string; spec: Record<string, unknown> }) => {
    setLoading(true);
    setError(null);
    try {
      const r = await client.deployOnBehalf(opts);
      setResult(r);
      return r;
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      throw e;
    } finally {
      setLoading(false);
    }
  }, [client]);

  return { deployOnBehalf, loading, error, result };
}

export function useRecall(status?: string) {
  const { client } = useSubstrate();
  const [data, setData] = useState<HypothesesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const cacheKey = `recall:${status ?? "all"}`;

  const refetch = useCallback(() => {
    _cache.delete(cacheKey);
    setLoading(true);
    cached(cacheKey, () => client.recall(status))
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [client, status, cacheKey]);

  useEffect(() => {
    cached(cacheKey, () => client.recall(status))
      .then(setData)
      .catch((e: unknown) => setError(e instanceof Error ? e : new Error(String(e))))
      .finally(() => setLoading(false));
  }, [client, status, cacheKey]);

  return { data, loading, error, refetch };
}
