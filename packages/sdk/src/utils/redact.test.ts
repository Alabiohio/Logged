import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { redactLogPayload } from "./redact";
import { Transport } from "../transport";

const REDACTED = "[REDACTED]";

describe("redactLogPayload", () => {
  it("removes nested sensitive values and keeps unrelated fields intact", () => {
    const payload = {
      level: "error",
      message: "Request failed with Authorization: Bearer sk_live_abc123 and token=secret-token",
      metadata: {
        password: "hunter2",
        accessToken: "abc123",
        nested: { apiKey: "my-key", okay: "safe" },
        list: ["still-safe", { refreshToken: "xyz" }],
      },
      url: "https://example.com/?apiKey=secret&ok=true",
      pathname: "/login",
    } as const;

    const redacted = redactLogPayload(payload as any);

    assert.equal(redacted.message, "Request failed with Authorization: [REDACTED] and token=[REDACTED]");
    assert.equal((redacted.metadata as Record<string, any>)?.password, REDACTED);
    assert.equal((redacted.metadata as Record<string, any>)?.accessToken, REDACTED);
    assert.equal((redacted.metadata as Record<string, any>)?.nested?.apiKey, REDACTED);
    assert.equal((redacted.metadata as Record<string, any>)?.list?.[0], "still-safe");
    assert.equal((redacted.metadata as Record<string, any>)?.list?.[1]?.refreshToken, REDACTED);
    assert.equal(redacted.url, "https://example.com/?apiKey=[REDACTED]&ok=true");
    assert.equal(redacted.pathname, "/login");
  });

  it("leaves the original payload object unchanged", () => {
    const payload = {
      level: "info" as const,
      message: "contains a token=abc123",
      metadata: { authorization: "Bearer secret" },
    };

    const original = JSON.parse(JSON.stringify(payload));
    const redacted = redactLogPayload(payload);

    assert.deepEqual(payload, original);
    assert.equal((redacted.metadata as Record<string, any>)?.authorization, REDACTED);
  });

  it("handles circular structures safely", () => {
    const payload: any = { level: "warn", message: "hello" };
    payload.metadata = { self: payload };

    const redacted = redactLogPayload(payload);
    assert.equal(redacted.message, "hello");
    assert.equal((redacted.metadata as Record<string, any>)?.self, "[Circular]");
  });

  it("sanitizes network payloads before fetch", async () => {
    const originalFetch = global.fetch;
    const calls: any[] = [];
    global.fetch = (async (...args: any[]) => {
      calls.push(args);
      return new Response(JSON.stringify({ ok: true }), { status: 202 });
    }) as typeof fetch;

    try {
      const transport = new Transport({ apiKey: "lg_test_123" });
      transport.send({
        level: "error",
        message: "Authorization: Bearer sk_live_123",
        metadata: { password: "topsecret", token: "abc123" },
      } as any);

      await new Promise((resolve) => setTimeout(resolve, 0));
      const body = JSON.parse(calls[0][1].body as string);
      assert.equal(body.logs[0].message, "Authorization: [REDACTED]");
      assert.equal(body.logs[0].metadata.password, REDACTED);
      assert.equal(body.logs[0].metadata.token, REDACTED);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
