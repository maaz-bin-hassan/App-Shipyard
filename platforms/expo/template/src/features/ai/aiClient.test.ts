import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { createAiClient, readAiEnv } from "./aiClient.ts";
import { consumeSseBuffer } from "./sse.ts";
import { AiClientError } from "./types.ts";

const FUNCTION_URL = "http://127.0.0.1:54321/functions/v1/ai-proxy";
const ANON_KEY = "test-anon-key";

function client(options: {
  token?: string | null;
  status?: number;
  body?: string;
  json?: unknown;
}) {
  const calls: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    calls.push({ url, init });
    if (options.json !== undefined) {
      return new Response(JSON.stringify(options.json), {
        status: options.status ?? 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(options.body ?? "", {
      status: options.status ?? 200,
      headers: { "Content-Type": "text/event-stream" },
    });
  };
  const ai = createAiClient({
    functionUrl: FUNCTION_URL,
    anonKey: ANON_KEY,
    getAccessToken: async () => (options.token === undefined ? "session-token" : options.token),
    fetch: fetchImpl,
  });
  return { ai, calls };
}

describe("ai client", () => {
  it("does not call the proxy without a session", async () => {
    const { ai, calls } = client({ token: null });
    await assert.rejects(() => ai.complete({ model: "openai/gpt-4o-mini", prompt: "Hello" }), (error: unknown) => {
      assert.equal(error instanceof AiClientError, true);
      assert.equal((error as AiClientError).code, "unauthenticated");
      return true;
    });
    assert.equal(calls.length, 0);
  });

  it("refuses an OpenRouter URL and never reads a provider key", async () => {
    assert.throws(
      () =>
        createAiClient({
          functionUrl: "https://openrouter.ai/api/v1/chat/completions",
          anonKey: ANON_KEY,
          getAccessToken: async () => "session-token",
        }),
      (error: unknown) => {
        assert.equal(error instanceof AiClientError, true);
        assert.match((error as AiClientError).message, /not OpenRouter/);
        return true;
      },
    );

    const source = await readFile(new URL("./aiClient.ts", import.meta.url), "utf8");
    assert.equal(source.includes("OPENROUTER_API_KEY"), false);
    const env = readAiEnv({
      EXPO_PUBLIC_SUPABASE_URL: "https://example.supabase.co/",
      EXPO_PUBLIC_SUPABASE_ANON_KEY: ANON_KEY,
    });
    assert.equal(env.functionUrl, "https://example.supabase.co/functions/v1/ai-proxy");
  });

  it("streams deltas to the proxy and surfaces the daily limit without retrying", async () => {
    const stream = client({
      body: "data: {\"choices\":[{\"delta\":{\"content\":\"Hi\"}}]}\n\ndata: [DONE]\n",
    });
    const deltas: string[] = [];
    await stream.ai.stream({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }],
      onDelta: (delta) => deltas.push(delta),
    });
    assert.deepEqual(deltas, ["Hi"]);
    assert.equal(stream.calls.length, 1);
    assert.equal(stream.calls[0]?.url, FUNCTION_URL);
    const headers = new Headers(stream.calls[0]?.init?.headers);
    assert.equal(headers.get("Authorization"), "Bearer session-token");
    assert.equal(headers.get("apikey"), ANON_KEY);
    const body = JSON.parse(String(stream.calls[0]?.init?.body)) as { model: string; messages: unknown[] };
    assert.deepEqual(Object.keys(body).sort(), ["messages", "model"]);
    assert.equal(JSON.stringify(body).includes("openrouter"), false);

    const limited = client({
      status: 429,
      json: { error: "rate_limited", message: "Daily AI request limit reached.", limit: 2 },
    });
    await assert.rejects(() => limited.ai.complete({ model: "openai/gpt-4o-mini", prompt: "Hello" }), (error: unknown) => {
      assert.equal(error instanceof AiClientError, true);
      assert.equal((error as AiClientError).code, "rate_limited");
      assert.equal((error as AiClientError).status, 429);
      assert.equal((error as AiClientError).limit, 2);
      return true;
    });
    assert.equal(limited.calls.length, 1);
  });

  it("joins a one-shot completion from the stream", async () => {
    const { ai } = client({
      body: "data: {\"choices\":[{\"delta\":{\"content\":\"One\"}}]}\n\ndata: {\"choices\":[{\"delta\":{\"content\":\" two\"}}]}\n\n",
    });
    const text = await ai.complete({ model: "openai/gpt-4o-mini", prompt: "Count" });
    assert.equal(text, "One two");
  });
});

describe("sse", () => {
  it("keeps a partial line for the next chunk and ignores comments", () => {
    const first = consumeSseBuffer(": keep-alive\ndata: {\"choices\":[{\"delta\":{\"content\":\"Hel");
    assert.deepEqual(first.deltas, []);
    assert.equal(first.done, false);
    const second = consumeSseBuffer(`${first.rest}lo\"}}]}\n\ndata: [DONE]\n`);
    assert.deepEqual(second.deltas, ["Hello"]);
    assert.equal(second.done, true);
  });
});
