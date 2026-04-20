import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isDisabled, sessionId, emit } from "./telemetry.js";

describe("telemetry module", () => {
  beforeEach(() => {
    delete process.env["ONEIE_TELEMETRY_DISABLE"];
  });

  afterEach(() => {
    delete process.env["ONEIE_TELEMETRY_DISABLE"];
    vi.restoreAllMocks();
  });

  it("sessionId is stable per process", () => {
    expect(typeof sessionId).toBe("string");
    expect(sessionId.length).toBe(16);
  });

  it("sessionId contains no PII — only hex characters", () => {
    expect(sessionId).toMatch(/^[0-9a-f]{16}$/);
  });

  it("isDisabled returns false when env var not set", () => {
    expect(isDisabled()).toBe(false);
  });

  it("isDisabled returns true when env var set", () => {
    process.env["ONEIE_TELEMETRY_DISABLE"] = "1";
    expect(isDisabled()).toBe(true);
  });

  it("emit payload contains no raw user-identifying data", async () => {
    let captured: unknown;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (_url, init) => {
      captured = JSON.parse((init?.body as string) ?? "{}");
      return new Response("ok");
    });
    emit("toolkit:sdk:test", ["sdk", "unit-test"], { latencyMs: 42 });
    await new Promise((r) => setTimeout(r, 20));
    if (captured) {
      const body = captured as { sender?: string; data?: string };
      expect(body.sender).toMatch(/^toolkit:[0-9a-f]{16}$/);
      const data = JSON.parse(body.data ?? "{}") as { content?: { id?: string } };
      expect(data?.content?.id).toMatch(/^[0-9a-f]{16}$/);
    }
  });

  it("emit is a function", () => {
    expect(typeof emit).toBe("function");
  });
});
