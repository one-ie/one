import { accept as payAccept, request as payRequest, status as payStatus } from "./pay.js";
import type { PayAcceptOpts, PayAcceptResult, PayRequestOpts, PayRequestResult, PayStatusResult } from "./pay.js";
import type {
  AgentActionResponse,
  AgentStatusResponse,
  AuthAgentOpts,
  AuthAgentResponse,
  BountyItem,
  BountyRequest,
  BountyResponse,
  CapabilityItem,
  ClawOpts,
  ClawResponse,
  DecayResponse,
  DiscoverResponse,
  ExportResource,
  Health,
  HireEscrowResponse,
  HireResponse,
  HighwaysResponse,
  HypothesesResponse,
  MarkDimsResponse,
  Outcome,
  PayResponse,
  PublishCapabilityRequest,
  PublishCapabilityResponse,
  RegisterOpts,
  RegisterResponse,
  RetryConfig,
  RevenueResponse,
  SdkConfig,
  SignalResponse,
  Stats,
  SyncAgentResponse,
  SyncAgentWorldInput,
  ListAgentsResponse,
  CloseLoopResponse,
  CloseLoopOpts,
  StageOutcome,
  SignalEntry,
  SignalsOpts,
  WorldState,
  ListMarketOpts,
  MarketListResponse,
  ChatMessage,
  ChatOpts,
  StreamEvent,
  StreamEventType,
  UsageResponse,
  GroupResponse,
  ListGroupsResponse,
  GroupMembersResponse,
  BridgeResponse,
  InboxResponse,
} from "./types.js";
import { AuthError, RateLimitError, SubstrateError, TimeoutError, ValidationError } from "./errors.js";
import { resolveApiKey, resolveBaseUrl } from "./urls.js";
import { emit } from "./telemetry.js";

function throwForStatus(status: number, method: string, path: string): never {
  const msg = `${method} ${path} → ${status}`;
  if (status === 401 || status === 403) throw new AuthError(msg, status);
  if (status === 400 || status === 422) throw new ValidationError(msg, status);
  if (status === 429) throw new RateLimitError(msg);
  if (status === 408 || status === 504) throw new TimeoutError(msg, status);
  throw new SubstrateError(msg, status);
}

function isRetryable(status?: number): boolean {
  if (status === undefined) return true;
  return [429, 502, 503, 504].includes(status);
}

async function withRetry<T>(fn: () => Promise<T>, config?: RetryConfig): Promise<T> {
  const maxAttempts = config?.maxAttempts ?? 1;
  const backoff = config?.backoff ?? "exp";
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const status = err instanceof SubstrateError ? err.status : undefined;
      if (attempt >= maxAttempts || !isRetryable(status)) throw err;
      const delayMs =
        backoff === "exp" ? Math.min(300 * 2 ** attempt, 30_000) :
        backoff === "linear" ? 300 * attempt :
        300;
      await new Promise<void>(r => setTimeout(r, delayMs));
    }
  }
}

async function req<T>(
  baseUrl: string,
  path: string,
  init: RequestInit = {},
  apiKey?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  const res = await fetch(`${baseUrl}${path}`, { ...init, headers });
  if (!res.ok) throwForStatus(res.status, init.method ?? "GET", path);
  return res.json() as Promise<T>;
}

export class SubstrateClient {
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly retryConfig: RetryConfig | undefined;
  readonly validateMode: "strict" | "warn" | "off";

  /** Pay module — accept, request, status. Bound to this client's baseUrl + apiKey. */
  readonly pay: {
    accept: (opts: PayAcceptOpts) => Promise<PayAcceptResult>;
    request: (opts: PayRequestOpts) => Promise<PayRequestResult>;
    status: (ref: string) => Promise<PayStatusResult>;
  };

  constructor(cfg: SdkConfig = {}) {
    this.baseUrl = resolveBaseUrl(cfg.baseUrl);
    this.apiKey = resolveApiKey(cfg.apiKey);
    this.retryConfig = cfg.retry;
    this.validateMode = cfg.validate ?? "warn";
    // Bind pay module methods to this client's config
    this.pay = {
      accept: (opts: PayAcceptOpts) => payAccept(opts, cfg),
      request: (opts: PayRequestOpts) => payRequest(opts, cfg),
      status: (ref: string) => payStatus(ref, cfg),
    };
  }

  static fromApiKey(key: string, baseUrl?: string): SubstrateClient {
    return new SubstrateClient({ apiKey: key, baseUrl });
  }

  private r<T>(path: string, init: RequestInit = {}): Promise<T> {
    return withRetry(() => req<T>(this.baseUrl, path, init, this.apiKey), this.retryConfig);
  }

  async signal(sender: string, receiver: string, data?: unknown): Promise<SignalResponse> {
    const result = await this.r<SignalResponse>(
      "/api/signal",
      { method: "POST", body: JSON.stringify({ sender, receiver, data }) },
    );
    emit("toolkit:sdk:signal", ["sdk", "method-signal", result.success ? "200" : "error"]);
    return result;
  }

  async ask(receiver: string, data?: unknown, timeout?: number, from?: string): Promise<Outcome<unknown>> {
    const t = Date.now();
    const raw = await this.r<Record<string, unknown>>(
      "/api/ask",
      { method: "POST", body: JSON.stringify({ receiver, data, timeout, from }) },
    );
    const kind =
      "result" in raw ? "result" as const
      : "timeout" in raw ? "timeout" as const
      : "dissolved" in raw ? "dissolved" as const
      : "failure" as const;
    const result = { ...raw, kind } as Outcome<unknown>;
    emit("toolkit:sdk:ask", ["sdk", "method-ask", `outcome-${kind}`], { latencyMs: Date.now() - t });
    return result;
  }

  async mark(
    edge: string,
    scores?: Partial<{ fit: number; form: number; truth: number; taste: number }>,
  ): Promise<MarkDimsResponse> {
    const result = await this.r<MarkDimsResponse>(
      "/api/loop/mark-dims",
      { method: "POST", body: JSON.stringify({ edge, ...(scores ?? { fit: 1, form: 1, truth: 1, taste: 1 }) }) },
    );
    emit("toolkit:sdk:mark", ["sdk", "method-mark"]);
    return result;
  }

  async warn(
    edge: string,
    scores?: Partial<{ fit: number; form: number; truth: number; taste: number }>,
  ): Promise<MarkDimsResponse> {
    const result = await this.r<MarkDimsResponse>(
      "/api/loop/mark-dims",
      { method: "POST", body: JSON.stringify({ edge, ...(scores ?? { fit: 0, form: 0, truth: 0, taste: 0 }) }) },
    );
    emit("toolkit:sdk:warn", ["sdk", "method-warn"]);
    return result;
  }

  async fade(trailRate?: number, resistanceRate?: number): Promise<DecayResponse> {
    const result = await this.r<DecayResponse>(
      "/api/decay-cycle",
      { method: "POST", body: JSON.stringify({ trailRate, resistanceRate }) },
    );
    emit("toolkit:sdk:fade", ["sdk", "method-fade"]);
    return result;
  }

  async highways(limit = 10): Promise<HighwaysResponse> {
    const result = await this.r<HighwaysResponse>(`/api/loop/highways?limit=${limit}`);
    emit("toolkit:sdk:highways", ["sdk", "method-highways"]);
    return result;
  }

  async recall(status?: string): Promise<HypothesesResponse> {
    const qs = status ? `?status=${encodeURIComponent(status)}` : "";
    const result = await this.r<HypothesesResponse>(`/api/hypotheses${qs}`);
    emit("toolkit:sdk:recall", ["sdk", "method-recall"]);
    return result;
  }

  async reveal(uid: string): Promise<unknown> {
    const result = await this.r<unknown>(`/api/memory/reveal/${encodeURIComponent(uid)}`);
    emit("toolkit:sdk:reveal", ["sdk", "method-reveal"]);
    return result;
  }

  async forget(uid: string): Promise<unknown> {
    const result = await this.r<unknown>(
      `/api/memory/forget/${encodeURIComponent(uid)}`,
      { method: "DELETE" },
    );
    emit("toolkit:sdk:forget", ["sdk", "method-forget"]);
    return result;
  }

  async frontier(uid: string): Promise<unknown> {
    const result = await this.r<unknown>(`/api/memory/frontier/${encodeURIComponent(uid)}`);
    emit("toolkit:sdk:frontier", ["sdk", "method-frontier"]);
    return result;
  }

  async know(): Promise<unknown> {
    const result = await this.r<unknown>("/api/tick");
    emit("toolkit:sdk:know", ["sdk", "method-know", "stage:advocate"]);
    return result;
  }

  async walletFor(uid: string): Promise<{ uid: string; address: string }> {
    const result = await this.r<{ uid: string; address: string; derivedAt: string }>(
      `/api/identity/${encodeURIComponent(uid)}/address`,
    );
    emit("toolkit:sdk:walletFor", ["sdk", "method-walletFor", "stage:wallet"]);
    return { uid: result.uid, address: result.address };
  }

  async signIn(opts: { email: string; password: string }): Promise<{ sessionId: string; userId: string }> {
    const result = await this.r<{ sessionId: string; userId: string }>(
      "/api/auth/sign-in/email",
      { method: "POST", body: JSON.stringify(opts) },
    );
    emit("toolkit:sdk:signIn", ["sdk", "method-signIn", "stage:sign-in:human"]);
    return result;
  }

  async signOut(): Promise<void> {
    await this.r<unknown>("/api/auth/sign-out", { method: "POST", body: JSON.stringify({}) });
    emit("toolkit:sdk:signOut", ["sdk", "method-signOut", "stage:sign-in:human"]);
  }

  async join(opts: { uid: string; group?: string }): Promise<{ ok: boolean; uid: string; group: string; role: string }> {
    const result = await this.r<{ ok: boolean; uid: string; group: string; role: string }>(
      "/api/board/join",
      { method: "POST", body: JSON.stringify(opts) },
    );
    emit("toolkit:sdk:join", ["sdk", "method-join", "stage:join-board"]);
    return result;
  }

  async createGroup(opts: {
    gid: string
    name: string
    groupType?: string
    visibility?: string
    plan?: string
  }): Promise<GroupResponse> {
    const result = await this.r<GroupResponse>(
      "/api/groups",
      { method: "POST", body: JSON.stringify(opts) },
    )
    emit("toolkit:sdk:createGroup", ["sdk", "method-createGroup", "stage:groups"])
    return result
  }

  async listGroups(): Promise<ListGroupsResponse> {
    const result = await this.r<ListGroupsResponse>("/api/groups")
    emit("toolkit:sdk:listGroups", ["sdk", "method-listGroups", "stage:groups"])
    return result
  }

  async joinGroup(gid: string): Promise<{ ok: boolean; gid: string; role: string }> {
    const result = await this.r<{ ok: boolean; gid: string; role: string }>(
      "/api/groups/join",
      { method: "POST", body: JSON.stringify({ gid }) },
    )
    emit("toolkit:sdk:joinGroup", ["sdk", "method-joinGroup", "stage:groups"])
    return result
  }

  async leaveGroup(gid: string): Promise<{ ok: boolean }> {
    const result = await this.r<{ ok: boolean }>(
      "/api/groups/leave",
      { method: "POST", body: JSON.stringify({ gid }) },
    )
    emit("toolkit:sdk:leaveGroup", ["sdk", "method-leaveGroup", "stage:groups"])
    return result
  }

  async groupMembers(gid: string): Promise<GroupMembersResponse> {
    const result = await this.r<GroupMembersResponse>(
      `/api/groups/${encodeURIComponent(gid)}/members`,
    )
    emit("toolkit:sdk:groupMembers", ["sdk", "method-groupMembers", "stage:groups"])
    return result
  }

  async inviteMember(gid: string, uid: string, role = "member"): Promise<{ ok: boolean }> {
    const result = await this.r<{ ok: boolean }>(
      `/api/groups/${encodeURIComponent(gid)}/invite`,
      { method: "POST", body: JSON.stringify({ uid, role }) },
    )
    emit("toolkit:sdk:inviteMember", ["sdk", "method-inviteMember", "stage:groups"])
    return result
  }

  async bridge(from: string, to: string): Promise<BridgeResponse> {
    const result = await this.r<BridgeResponse>(
      "/api/paths/bridge",
      { method: "POST", body: JSON.stringify({ from, to }) },
    )
    emit("toolkit:sdk:bridge", ["sdk", "method-bridge", "stage:groups"])
    return result
  }

  async inbox(uid: string, opts?: { limit?: number; before?: string }): Promise<InboxResponse> {
    const params = new URLSearchParams()
    if (opts?.limit !== undefined) params.set("limit", String(opts.limit))
    if (opts?.before !== undefined) params.set("before", opts.before)
    const qs = params.size ? `?${params}` : ""
    const result = await this.r<InboxResponse>(`/api/inbox/${encodeURIComponent(uid)}${qs}`)
    emit("toolkit:sdk:inbox", ["sdk", "method-inbox", "stage:groups"])
    return result
  }

  async deployOnBehalf(opts: { owner: string; spec: Record<string, unknown> }): Promise<{ ok: boolean; uid: string; owner: string; inheritedPaths: Array<{ from: string; to: string; strength: number }> }> {
    const result = await this.r<{ ok: boolean; uid: string; owner: string; inheritedPaths: Array<{ from: string; to: string; strength: number }> }>(
      "/api/agents/deploy-on-behalf",
      { method: "POST", body: JSON.stringify(opts) },
    );
    emit("toolkit:sdk:deployOnBehalf", ["sdk", "method-deployOnBehalf", "stage:team-deploy:on-behalf"]);
    return result;
  }

  async subscribe(opts: { receiver: string; tags: string[]; scope?: 'private' | 'public' }): Promise<{ ok: boolean; uid?: string; receiver?: string; subscriptions?: Array<{ tag: string; scope: string }> }> {
    const result = await this.r<{ ok: boolean; uid?: string; receiver?: string; subscriptions?: Array<{ tag: string; scope: string }> }>(
      "/api/subscribe",
      { method: "POST", body: JSON.stringify({ uid: opts.receiver, tags: opts.tags, scope: opts.scope }) },
    );
    emit("toolkit:sdk:subscribe", ["sdk", "method-subscribe", "stage:subscribe"]);
    return result;
  }

  async select(): Promise<unknown> {
    const result = await this.r<unknown>(
      "/api/loop/stage",
      { method: "POST", body: JSON.stringify({}) },
    );
    emit("toolkit:sdk:select", ["sdk", "method-select"]);
    return result;
  }

  async authAgent(opts: AuthAgentOpts = {}): Promise<AuthAgentResponse> {
    const result = await this.r<AuthAgentResponse>(
      "/api/auth/agent",
      { method: "POST", body: JSON.stringify(opts) },
    );
    emit("toolkit:sdk:authAgent", ["sdk", "method-authAgent", result.returning ? "returning" : "new", "stage:sign-in:agent"]);
    return result;
  }

  async syncAgent(input: string | SyncAgentWorldInput): Promise<SyncAgentResponse> {
    const body = typeof input === "string" ? { markdown: input } : input;
    const result = await this.r<SyncAgentResponse>(
      "/api/agents/sync",
      { method: "POST", body: JSON.stringify(body) },
    );
    emit("toolkit:sdk:syncAgent", ["sdk", "method-syncAgent", "stage:team-deploy"]);
    return result;
  }

  async discover(skill: string, limit = 10): Promise<DiscoverResponse> {
    const result = await this.r<DiscoverResponse>(
      `/api/agents/discover?skill=${encodeURIComponent(skill)}&limit=${limit}`,
    );
    emit("toolkit:sdk:discover", ["sdk", "method-discover", "stage:discover"]);
    return result;
  }

  async register(uid: string, opts: RegisterOpts = {}): Promise<RegisterResponse> {
    const result = await this.r<RegisterResponse>(
      "/api/agents/register",
      { method: "POST", body: JSON.stringify({ uid, ...opts }) },
    );
    emit("toolkit:sdk:register", ["sdk", "method-register", "stage:sell"]);
    return result;
  }

  async payWeight(from: string, to: string, task: string, amount: number): Promise<PayResponse> {
    const result = await this.r<PayResponse>(
      "/api/pay",
      { method: "POST", body: JSON.stringify({ from, to, task, amount }) },
    );
    emit("toolkit:sdk:payWeight", ["sdk", "method-payWeight", "stage:buy"]);
    return result;
  }

  async claw(name: string, opts: ClawOpts = {}): Promise<ClawResponse> {
    const result = await this.r<ClawResponse>(
      "/api/claw",
      { method: "POST", body: JSON.stringify({ name, ...opts }) },
    );
    emit("toolkit:sdk:claw", ["sdk", "method-claw"]);
    return result;
  }

  async commend(uid: string): Promise<AgentActionResponse> {
    const result = await this.r<AgentActionResponse>(
      `/api/agents/${encodeURIComponent(uid)}/commend`,
      { method: "POST", body: JSON.stringify({}) },
    );
    emit("toolkit:sdk:commend", ["sdk", "method-commend"]);
    return result;
  }

  async flag(uid: string): Promise<AgentActionResponse> {
    const result = await this.r<AgentActionResponse>(
      `/api/agents/${encodeURIComponent(uid)}/flag`,
      { method: "POST", body: JSON.stringify({}) },
    );
    emit("toolkit:sdk:flag", ["sdk", "method-flag"]);
    return result;
  }

  async status(uid: string, active: boolean): Promise<AgentStatusResponse> {
    const result = await this.r<AgentStatusResponse>(
      `/api/agents/${encodeURIComponent(uid)}/status`,
      { method: "POST", body: JSON.stringify({ status: active ? "active" : "inactive" }) },
    );
    emit("toolkit:sdk:status", ["sdk", "method-status"]);
    return result;
  }

  async capabilities(uid: string): Promise<CapabilityItem[]> {
    const result = await this.r<CapabilityItem[]>(
      `/api/agents/${encodeURIComponent(uid)}/capabilities`,
    );
    emit("toolkit:sdk:capabilities", ["sdk", "method-capabilities"]);
    return result;
  }

  async stats(): Promise<Stats> {
    const result = await this.r<Stats>("/api/stats");
    emit("toolkit:sdk:stats", ["sdk", "method-stats"]);
    return result;
  }

  async health(): Promise<Health> {
    const result = await this.r<Health>("/api/health");
    emit("toolkit:sdk:health", ["sdk", "method-health"]);
    return result;
  }

  async usage(): Promise<UsageResponse> {
    const result = await this.r<UsageResponse>("/api/dashboard/usage");
    emit("toolkit:sdk:usage", ["sdk", "method-usage"]);
    return result;
  }

  async hire(
    providerUid: string,
    skillId: string,
    opts?: { initialMessage?: string },
  ): Promise<HireResponse | HireEscrowResponse> {
    const result = await this.r<HireResponse | HireEscrowResponse>("/api/buy/hire", {
      method: "POST",
      body: JSON.stringify({ providerUid, skillId, ...opts }),
    });
    emit("toolkit:sdk:hire", ["sdk", "method-hire"]);
    return result;
  }

  async bounty(opts: BountyRequest): Promise<BountyResponse> {
    const result = await this.r<BountyResponse>("/api/market/bounty", {
      method: "POST",
      body: JSON.stringify(opts),
    });
    emit("toolkit:sdk:bounty", ["sdk", "method-bounty"]);
    return result;
  }

  async bounties(query?: { seller?: string; poster?: string }): Promise<BountyItem[]> {
    const params = new URLSearchParams();
    if (query?.seller) params.set("seller", query.seller);
    if (query?.poster) params.set("poster", query.poster);
    const qs = params.size ? `?${params}` : "";
    const result = await this.r<BountyItem[]>(`/api/market/bounty${qs}`);
    emit("toolkit:sdk:bounties", ["sdk", "method-bounties"]);
    return result;
  }

  async publish(opts: PublishCapabilityRequest): Promise<PublishCapabilityResponse> {
    const result = await this.r<PublishCapabilityResponse>("/api/capabilities/publish", {
      method: "POST",
      body: JSON.stringify(opts),
    });
    emit("toolkit:sdk:publish", ["sdk", "method-publish"]);
    return result;
  }

  async revenue(): Promise<RevenueResponse> {
    const result = await this.r<RevenueResponse>("/api/revenue");
    emit("toolkit:sdk:revenue", ["sdk", "method-revenue"]);
    return result;
  }

  async exportData(resource: ExportResource): Promise<unknown[]> {
    const result = await this.r<unknown[]>(`/api/export/${resource}`);
    emit("toolkit:sdk:export", ["sdk", "method-export"]);
    return result;
  }

  async listAgents(): Promise<ListAgentsResponse> {
    const result = await this.r<ListAgentsResponse>("/api/agents/list");
    emit("toolkit:sdk:listAgents", ["sdk", "method-listAgents"]);
    return result;
  }

  async closeLoop(
    session: string,
    outcome: StageOutcome,
    opts?: CloseLoopOpts,
  ): Promise<CloseLoopResponse> {
    const result = await this.r<CloseLoopResponse>("/api/loop/close", {
      method: "POST",
      body: JSON.stringify({ session, outcome, ...opts }),
    });
    emit("toolkit:sdk:closeLoop", ["sdk", "method-closeLoop"]);
    return result;
  }

  async signals(opts?: SignalsOpts): Promise<SignalEntry[]> {
    const params = new URLSearchParams();
    if (opts?.limit !== undefined) params.set("limit", String(opts.limit));
    if (opts?.since !== undefined) params.set("since", String(opts.since));
    if (opts?.from !== undefined) params.set("from", String(opts.from));
    if (opts?.to !== undefined) params.set("to", String(opts.to));
    const qs = params.size ? `?${params}` : "";
    const result = await this.r<SignalEntry[]>(`/api/signals${qs}`);
    emit("toolkit:sdk:signals", ["sdk", "method-signals"]);
    return result;
  }

  async state(): Promise<WorldState> {
    const result = await this.r<WorldState>("/api/state");
    emit("toolkit:sdk:state", ["sdk", "method-state"]);
    return result;
  }

  async listMarket(opts?: ListMarketOpts): Promise<MarketListResponse> {
    const params = new URLSearchParams();
    if (opts?.tag) params.set("tag", opts.tag);
    if (opts?.maxPrice !== undefined) params.set("maxPrice", String(opts.maxPrice));
    const qs = params.size ? `?${params}` : "";
    const result = await this.r<MarketListResponse>(`/api/market/list${qs}`);
    emit("toolkit:sdk:listMarket", ["sdk", "method-listMarket"]);
    return result;
  }

  async chat(messages: ChatMessage[], opts?: ChatOpts): Promise<ReadableStream<Uint8Array>> {
    const url = `${this.baseUrl}/api/chat`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ messages, ...opts }),
    });
    if (!res.ok || !res.body) throw new SubstrateError(`chat failed: ${res.status}`, res.status);
    emit("toolkit:sdk:chat", ["sdk", "method-chat"]);
    return res.body;
  }

  async *streamState(): AsyncIterable<StreamEvent> {
    const url = `${this.baseUrl}/api/stream`;
    const headers: Record<string, string> = {};
    if (this.apiKey) headers["Authorization"] = `Bearer ${this.apiKey}`;
    const res = await fetch(url, { headers });
    if (!res.ok || !res.body) throw new SubstrateError(`stream failed: ${res.status}`, res.status);
    emit("toolkit:sdk:streamState", ["sdk", "method-streamState"]);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let currentEvent: StreamEventType = "connected";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("event:")) currentEvent = line.slice(6).trim() as StreamEventType;
          else if (line.startsWith("data:")) {
            try { yield { event: currentEvent, data: JSON.parse(line.slice(5).trim()) }; }
            catch { yield { event: currentEvent, data: line.slice(5).trim() }; }
            currentEvent = "connected";
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}
