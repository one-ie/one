import { SubstrateClient } from "../client.js";
import type {
  PayAcceptResult,
  PayRequestResult,
  PayStatusResult,
} from "../pay.js";
import type {
  AgentActionResponse,
  AgentStatusResponse,
  AuthAgentResponse,
  CapabilityItem,
  ClawResponse,
  DecayResponse,
  DiscoverResponse,
  Health,
  HighwaysResponse,
  HypothesesResponse,
  MarkDimsResponse,
  Outcome,
  PayResponse,
  RegisterResponse,
  SignalResponse,
  Stats,
  SyncAgentResponse,
} from "../types.js";

type Mock<T> = () => Promise<T>;
type PartialMocks = Partial<{
  [K in keyof SubstrateClient]: SubstrateClient[K];
}>;

const defaultSignal: SignalResponse = { ok: true, routed: null, latency: 0, success: true };
const defaultOutcome: Outcome<null> = { kind: "result", result: null, latency: 0 };
const defaultMark: MarkDimsResponse = { ok: true, edge: "", scores: { fit: 1, form: 1, truth: 1, taste: 1 }, marks: [] };
const defaultDecay: DecayResponse = { before: { edges: 0, avgStrength: 0, avgResistance: 0 }, after: { edges: 0, avgStrength: 0, avgResistance: 0 }, decayed: { trailRate: 0.05, resistanceRate: 0.025 }, timestamp: new Date().toISOString() };
const defaultHighways: HighwaysResponse = { highways: [] };
const defaultHypotheses: HypothesesResponse = { hypotheses: [] };
const defaultAuth: AuthAgentResponse = { uid: "mock:agent", name: "mock", kind: "agent", wallet: null, apiKey: "api_mock", keyId: "k1", returning: false };
const defaultSync: SyncAgentResponse = { ok: true, uid: "mock:agent", skills: [] };
const defaultDiscover: DiscoverResponse = { agents: [], skill: "", count: 0, limit: 10 };
const defaultRegister: RegisterResponse = { ok: true, uid: "mock:agent", status: "registered", kind: "agent", wallet: null, walletLinked: false, capabilities: 0 };
const defaultPay: PayResponse = { ok: true, from: "", to: "", task: "", amount: 0, sui: null };
const defaultPayAccept: PayAcceptResult = { linkUrl: "", qr: undefined, intent: undefined };
const defaultPayRequest: PayRequestResult = { linkUrl: "", qr: undefined, intent: undefined };
const defaultPayStatus: PayStatusResult = { status: "pending", ref: "" };
const defaultClaw: ClawResponse = { ok: true };
const defaultAction: AgentActionResponse = { ok: true, id: "", action: "commend" };
const defaultStatus: AgentStatusResponse = { ok: true, id: "", status: "active" };
const defaultCaps: CapabilityItem[] = [];
const defaultStats: Stats = { units: { total: 0, proven: 0, atRisk: 0 }, skills: { total: 0 }, highways: { count: 0, totalEdges: 0 }, revenue: { total: 0, gdp: 0 }, signals: { total: 0, recent: 0 }, timestamp: new Date().toISOString() };
const defaultHealth: Health = { status: "healthy", world: { units: 0, agents: 0, edges: 0, highways: 0, loadedAgoMs: 0, totalRevenue: "0", avgSuccessRate: "0", topGroup: null }, version: "mock", phase: "test", uptime: 0, timestamp: new Date().toISOString() };

function stub<T>(value: T): Mock<T> {
  return () => Promise.resolve(value);
}

export function createMockSubstrate(overrides: PartialMocks = {}): SubstrateClient {
  const mock = Object.create(SubstrateClient.prototype) as SubstrateClient;
  const defaults: PartialMocks = {
    signal: stub(defaultSignal),
    ask: stub(defaultOutcome),
    mark: stub(defaultMark),
    warn: stub(defaultMark),
    fade: stub(defaultDecay),
    highways: stub(defaultHighways),
    recall: stub(defaultHypotheses),
    reveal: stub(null),
    forget: stub(null),
    frontier: stub(null),
    know: stub(null),
    select: stub(null),
    authAgent: stub(defaultAuth),
    syncAgent: stub(defaultSync),
    discover: stub(defaultDiscover),
    register: stub(defaultRegister),
    payWeight: stub(defaultPay),
    pay: {
      accept: async () => defaultPayAccept,
      request: async () => defaultPayRequest,
      status: async () => defaultPayStatus,
    },
    claw: stub(defaultClaw),
    commend: stub(defaultAction),
    flag: stub({ ...defaultAction, action: "flag" }),
    status: stub(defaultStatus),
    capabilities: stub(defaultCaps),
    stats: stub(defaultStats),
    health: stub(defaultHealth),
  };
  return Object.assign(mock, defaults, overrides);
}
