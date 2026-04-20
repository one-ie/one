export type { SubstrateError, AuthError, ValidationError, RateLimitError, TimeoutError, DissolvedError } from "./errors.js";

export interface RetryConfig {
  maxAttempts?: number;
  backoff?: "exp" | "linear" | "fixed";
}

export interface SdkConfig {
  apiKey?: string;
  baseUrl?: string;
  retry?: RetryConfig;
  validate?: "strict" | "warn" | "off";
}

import { SubstrateError } from "./errors.js";

export class OneSdkError extends SubstrateError {
  constructor(message: string, status?: number, code?: string) {
    super(message, status, code);
    this.name = "OneSdkError";
  }
}

export type Outcome<T> =
  | { kind: "result"; result: T; latency: number }
  | { kind: "timeout"; timeout: true; latency: number }
  | { kind: "dissolved"; dissolved: true; latency: number }
  | { kind: "failure"; failure: true; latency: number };

export interface SignalResponse {
  ok: boolean;
  routed: string | null;
  result?: unknown;
  latency: number;
  success: boolean;
  sui?: string | null;
}

export interface HighwaysResponse {
  highways: Array<{ path: string; strength: number; resistance: number; net: number }>;
}

export interface HypothesesResponse {
  hypotheses: Array<{
    hid: string;
    statement: string;
    status: string;
    observations: number;
    pValue: number;
    actionReady: boolean;
  }>;
}

export interface MarkDimsResponse {
  ok: boolean;
  edge: string;
  scores: { fit: number; form: number; truth: number; taste: number };
  marks: Array<{ edge: string; action: "mark" | "warn"; strength: number }>;
}

export interface DecayResponse {
  before: { edges: number; avgStrength: number; avgResistance: number };
  after: { edges: number; avgStrength: number; avgResistance: number };
  decayed: { trailRate: number; resistanceRate: number };
  timestamp: string;
}

export interface AuthAgentOpts {
  name?: string;
  uid?: string;
  kind?: string;
}

export interface AuthAgentResponse {
  uid: string;
  name: string;
  kind: string;
  wallet: string | null;
  apiKey: string;
  keyId: string;
  returning: boolean;
}

export interface SyncAgentWorldInput {
  agents: Array<{ name?: string; content: string }>;
  world?: string;
  description?: unknown;
}

export interface SyncAgentResponse {
  ok: boolean;
  agent?: string;
  uid?: string;
  wallet?: string | null;
  suiObjectId?: string | null;
  skills?: string[];
  world?: string;
  agents?: Array<{
    name: string;
    uid: string;
    wallet: string | null;
    suiObjectId: string | null;
    skills: string[];
  }>;
}

export interface DiscoverAgent {
  uid: string;
  name: string;
  unitKind: string;
  skillId: string;
  skillName: string;
  reputation: number;
  successRate: number;
  activityScore: number;
  price: number;
  currency: string;
  strength: number;
}

export interface DiscoverResponse {
  agents: DiscoverAgent[];
  skill: string;
  count: number;
  limit: number;
}

export interface AgentCapability {
  skill: string;
  price?: number;
}

export interface RegisterOpts {
  kind?: string;
  capabilities?: AgentCapability[];
  wallet?: string;
  chain?: string;
}

export interface RegisterResponse {
  ok: boolean;
  uid: string;
  status: string;
  kind: string;
  wallet: string | null;
  walletLinked: boolean;
  capabilities: number;
}

export interface PayResponse {
  ok: boolean;
  from: string;
  to: string;
  task: string;
  amount: number;
  sui: string | null;
}

export interface ClawOpts {
  persona?: string;
  telegramToken?: string;
  openrouterKey?: string;
  groupId?: string;
}

export interface ClawResponse {
  ok: boolean;
  workerUrl?: string;
  apiKey?: string;
  error?: string;
}

export interface AgentActionResponse {
  ok: boolean;
  id: string;
  action: string;
}

export interface AgentStatusResponse {
  ok: boolean;
  id: string;
  status: string;
}

export interface CapabilityItem {
  skillId: string;
  skillName: string;
  price: number;
  currency: string;
}

export interface Stats {
  units: { total: number; proven: number; atRisk: number };
  skills: { total: number };
  highways: { count: number; totalEdges: number };
  revenue: { total: number; gdp: number };
  signals: { total: number; recent: number };
  timestamp: string;
}

export interface WorldInfo {
  units: number;
  agents: number;
  edges: number;
  highways: number;
  loadedAgoMs: number;
  totalRevenue: string;
  avgSuccessRate: string;
  topGroup: { id: string; name: string; memberCount: number } | null;
}

export interface Health {
  status: "healthy" | "degraded";
  world: WorldInfo;
  version: string;
  phase: string;
  uptime: number;
  timestamp: string;
}

export interface AgentSkillSummary {
  name: string;
  price: number;
  tags: string[];
}

export interface AgentSummary {
  id: string;
  name: string;
  group: string;
  model: string;
  tags: string[];
  skills: AgentSkillSummary[];
  channels: string[];
  sensitivity: number;
  promptPreview: string;
}

export interface ListAgentsResponse {
  agents: AgentSummary[];
  groups: Record<string, AgentSummary[]>;
  tags: string[];
  count: number;
}

export type StageOutcome = "result" | "timeout" | "dissolved" | "failure";

export interface CloseLoopOpts {
  rubric?: number;
  reason?: string;
}

export interface CloseLoopResponse {
  ok: true;
  stages: unknown[];
  highways: Array<{ path: string; strength: number; resistance: number; net: number }>;
}

export interface SignalEntry {
  id: string;
  from: string;
  to: string;
  skill?: string;
  outcome: "success" | "failure" | "timeout";
  revenue: number;
  ts: number;
}

export interface SignalsOpts {
  limit?: number;
  since?: number;
  from?: number;
  to?: number;
}

export interface UnitState {
  id: string;
  name: string;
  kind: string;
  status: string;
  sr: number;
  g: number;
}

export interface EdgeState {
  from: string;
  to: string;
  strength: number;
  resistance: number;
  revenue: number;
  toxic: boolean;
}

export interface WorldStats {
  units: number;
  proven: number;
  highways: number;
  edges: number;
  tags: number;
  revenue: number;
}

export interface WorldState {
  units: UnitState[];
  edges: EdgeState[];
  highways: EdgeState[];
  tags: string[];
  tagMap: Record<string, unknown>;
  stats: WorldStats;
  loading?: boolean;
}

export interface CapabilityListing {
  skillId: string;
  name: string;
  price: number;
  pricingMode: string;
  sellerUid: string;
  sellerName: string;
  successRate: number;
  tags: string[];
  strength: number;
  resistance: number;
  weight: number;
}

export interface ListMarketOpts {
  tag?: string;
  maxPrice?: number;
}

export interface MarketListResponse {
  capabilities: CapabilityListing[];
}

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatOpts {
  model?: string;
  tags?: string[];
  system?: string;
  agentId?: string;
}

export type StreamEventType = "connected" | "state" | "error" | "close";

export interface StreamEvent {
  event: StreamEventType;
  data: unknown;
}

export interface HireResponse {
  ok: true;
  groupId: string;
  chatUrl: string;
}

export interface HireEscrowResponse {
  status: 402;
  code: string;
  escrow_template: Record<string, unknown>;
  expires_at: string;
}

export interface BountyRequest {
  skillId: string;
  sellerUid: string;
  posterUid: string;
  price: number;
  tags?: string[];
  content?: Record<string, unknown>;
  rubric?: { fit?: number; form?: number; truth?: number; taste?: number };
  deadline?: string;
  posterUnitObjectId?: string;
  workerUnitObjectId?: string;
  pathObjectId?: string;
}

export interface BountyResponse {
  id: string;
  escrowId?: string;
  data: Record<string, unknown>;
}

export interface BountyItem {
  id: string;
  skillId: string;
  sellerUid: string;
  posterUid: string;
  price: number;
  tags?: string[];
  deadline?: string;
  status: string;
}

export interface PublishCapabilityRequest {
  skillId: string;
  name: string;
  price: number;
  mode?: string;
  visibility?: string;
  scope?: string;
  tags?: string[];
  rubricThresholds?: { fit?: number; form?: number; truth?: number; taste?: number };
}

export interface PublishCapabilityResponse {
  ok: true;
  sid: string;
  scope: string;
}

export interface RevenueResponse {
  gdp: number;
  total_revenue: number;
  total_transactions: number;
  top_earners: Array<{ uid: string; revenue: number }>;
  edges: unknown[];
}

export type ExportResource = "units" | "groups" | "paths" | "highways" | "toxic" | "skills";
