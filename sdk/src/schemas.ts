import { z } from "zod";

export const SignalResponseSchema = z.object({
  ok: z.boolean(),
  routed: z.string().nullable(),
  result: z.unknown().optional(),
  latency: z.number(),
  success: z.boolean(),
  sui: z.string().nullable().optional(),
});

export const HighwaysResponseSchema = z.object({
  highways: z.array(z.object({
    path: z.string(),
    strength: z.number(),
    resistance: z.number(),
    net: z.number(),
  })),
});

export const AuthAgentResponseSchema = z.object({
  uid: z.string(),
  name: z.string(),
  kind: z.string(),
  wallet: z.string().nullable(),
  apiKey: z.string(),
  keyId: z.string(),
  returning: z.boolean(),
});

export const SyncAgentResponseSchema = z.object({
  ok: z.boolean(),
  agent: z.string().optional(),
  uid: z.string().optional(),
  wallet: z.string().nullable().optional(),
  suiObjectId: z.string().nullable().optional(),
  skills: z.array(z.string()).optional(),
  world: z.string().optional(),
  agents: z.array(z.object({
    name: z.string(),
    uid: z.string(),
    wallet: z.string().nullable(),
    suiObjectId: z.string().nullable(),
    skills: z.array(z.string()),
  })).optional(),
});

export const DiscoverAgentSchema = z.object({
  uid: z.string(),
  name: z.string(),
  unitKind: z.string(),
  skillId: z.string(),
  skillName: z.string(),
  reputation: z.number(),
  successRate: z.number(),
  activityScore: z.number(),
  price: z.number(),
  currency: z.string(),
  strength: z.number(),
});

export const DiscoverResponseSchema = z.object({
  agents: z.array(DiscoverAgentSchema),
  skill: z.string(),
  count: z.number(),
  limit: z.number(),
});

export const RegisterResponseSchema = z.object({
  ok: z.boolean(),
  uid: z.string(),
  status: z.string(),
  kind: z.string(),
  wallet: z.string().nullable(),
  walletLinked: z.boolean(),
  capabilities: z.number(),
});

export const PayResponseSchema = z.object({
  ok: z.boolean(),
  from: z.string(),
  to: z.string(),
  task: z.string(),
  amount: z.number(),
  sui: z.string().nullable(),
});

export const ClawResponseSchema = z.object({
  ok: z.boolean(),
  workerUrl: z.string().optional(),
  apiKey: z.string().optional(),
  error: z.string().optional(),
});

export const AgentActionResponseSchema = z.object({
  ok: z.boolean(),
  id: z.string(),
  action: z.string(),
});

export const AgentStatusResponseSchema = z.object({
  ok: z.boolean(),
  id: z.string(),
  status: z.string(),
});

export const CapabilityItemSchema = z.object({
  skillId: z.string(),
  skillName: z.string(),
  price: z.number(),
  currency: z.string(),
});

export const StatsSchema = z.object({
  units: z.object({ total: z.number(), proven: z.number(), atRisk: z.number() }),
  skills: z.object({ total: z.number() }),
  highways: z.object({ count: z.number(), totalEdges: z.number() }),
  revenue: z.object({ total: z.number(), gdp: z.number() }),
  signals: z.object({ total: z.number(), recent: z.number() }),
  timestamp: z.string(),
});

export const WorldInfoSchema = z.object({
  units: z.number(),
  agents: z.number(),
  edges: z.number(),
  highways: z.number(),
  loadedAgoMs: z.number(),
  totalRevenue: z.string(),
  avgSuccessRate: z.string(),
  topGroup: z.object({ id: z.string(), name: z.string(), memberCount: z.number() }).nullable(),
});

export const HealthSchema = z.object({
  status: z.enum(["healthy", "degraded"]),
  world: WorldInfoSchema,
  version: z.string(),
  phase: z.string(),
  uptime: z.number(),
  timestamp: z.string(),
});
