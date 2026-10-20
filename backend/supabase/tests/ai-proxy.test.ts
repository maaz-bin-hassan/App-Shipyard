import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  handleAiProxy,
  OPENROUTER_CHAT_COMPLETIONS_URL,
  type AiProxyConfig,
  type AiProxyDeps,
  type CreateClient,
} from "../functions/ai-proxy/handler.ts";

const OPENROUTER_KEY = "test-openrouter-key";
const SERVICE_KEY = "test-service-role-key";
const ANON_KEY = "test-anon-key";

const config: AiProxyConfig = {
  supabaseUrl: "http://127.0.0.1:54321",
  supabaseAnonKey: ANON_KEY,
  supabaseServiceRoleKey: SERVICE_KEY,
  openRouterApiKey: OPENROUTER_KEY,
  modelAllowlist: "openai/gpt-4o-mini, anthropic/claude-3.5-sonnet",
  dailyRequestLimit: "2",
};

type UsageResult = { data: number | null; error: { message: string } | null };

function harness(options: {
  user?: { id: string } | null;
  userError?: boolean;
  usage?: UsageResult;
  upstreamStatus?: number;
  upstreamBody?: string;
}): { deps: AiProxyDeps; calls: { rpc: unknown[]; fetch: Array<{ url: string; init?: RequestInit }> } } {
  const calls = {
    rpc: [] as unknown[],
    fetch: [] as Array<{ url: string; init?: RequestInit }>,
  };

  const createClient: CreateClient = (_url, key) => {
    if (key === SERVICE_KEY) {
      return {
        auth: {
          getUser: async () => {
            throw new Error("service client must not validate the user session");
          },
        },
        rpc: async (_fn, args) => {
          calls.rpc.push(args);
          return options.usage ?? { data: 1, error: null };
        },
      };
    }

    return {
      auth: {
        getUser: async () => {
          if (options.userError) {
            return { data: { user: null }, error: { message: "invalid session" } };
          }
          return { data: { user: options.user === undefined ? { id: "user-a" } : options.user }, error: null };
        },
      },
      rpc: async () => {
        throw new Error("user client must not increment usage");
      },
    };
  };

  const fetchImpl: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
    calls.fetch.push({ url, init });
    const status = options.upstreamStatus ?? 200;
    const body = options.upstreamBody ?? "data: {\"choices\":[{\"delta\":{\"content\":\"Hi\"}}]}\n\n";
    return new Response(status === 200 ? body : "{\"error\":{\"message\":\"provider failed\"}}", {
      status,
      headers: {
        "Content-Type": status === 200 ? "text/event-stream; charset=utf-8" : "application/json",
      },
    });
  };

  return { deps: { createClient, fetch: fetchImpl }, calls };
}

function post(body: unknown, token?: string): Request {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token !== undefined) {
    headers.set("Authorization", token);
  }
  return new Request("http://127.0.0.1/functions/v1/ai-proxy", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const allowedBody = {
  model: "openai/gpt-4o-mini",
  messages: [{ role: "user", content: "Hello", extra: "drop me" }],
};

async function readJson(response: Response): Promise<Record<string, unknown>> {
  return await response.json() as Record<string, unknown>;
}

function assertNoSecrets(text: string): void {
  assert.equal(text.includes(OPENROUTER_KEY), false);
  assert.equal(text.includes(SERVICE_KEY), false);
}

describe("ai-proxy", () => {
  it("rejects a missing session before it checks the model or the limit", async () => {
    const { deps, calls } = harness({});
    const response = await handleAiProxy(
      post({ model: "not-a-real-model", messages: [{ role: "user", content: "Hello" }] }),
      config,
      deps,
    );
    const body = await readJson(response);
    assert.equal(response.status, 401);
    assert.deepEqual(body, {
      error: "unauthenticated",
      message: "A valid user session is required.",
    });
    assert.equal(calls.rpc.length, 0);
    assert.equal(calls.fetch.length, 0);
    assertNoSecrets(JSON.stringify(body));
  });

  it("rejects an invalid session", async () => {
    const { deps, calls } = harness({ userError: true });
    const response = await handleAiProxy(post(allowedBody, "Bearer not-a-session"), config, deps);
    const body = await readJson(response);
    assert.equal(response.status, 401);
    assert.equal(body.error, "unauthenticated");
    assert.equal(calls.rpc.length, 0);
    assert.equal(calls.fetch.length, 0);
    assertNoSecrets(JSON.stringify(body));
  });

  it("rejects a model that is not on the allowlist without counting the request", async () => {
    const { deps, calls } = harness({});
    const response = await handleAiProxy(
      post({ model: "openai/gpt-4o", messages: [{ role: "user", content: "Hello" }] }, "Bearer session-token"),
      config,
      deps,
    );
    const body = await readJson(response);
    assert.equal(response.status, 400);
    assert.deepEqual(body, {
      error: "disallowed_model",
      message: "That model is not on the allowlist.",
      model: "openai/gpt-4o",
    });
    assert.equal(calls.rpc.length, 0);
    assert.equal(calls.fetch.length, 0);
    assertNoSecrets(JSON.stringify(body));
  });

  it("rejects an over-limit user without calling OpenRouter", async () => {
    const { deps, calls } = harness({ usage: { data: null, error: null } });
    const response = await handleAiProxy(post(allowedBody, "Bearer session-token"), config, deps);
    const body = await readJson(response);
    assert.equal(response.status, 429);
    assert.deepEqual(body, {
      error: "rate_limited",
      message: "Daily AI request limit reached.",
      limit: 2,
    });
    assert.match(response.headers.get("Retry-After") ?? "", /^[1-9]\d*$/);
    assert.deepEqual(calls.rpc, [{ p_user_id: "user-a", p_limit: 2 }]);
    assert.equal(calls.fetch.length, 0);
    assertNoSecrets(JSON.stringify(body));
  });

  it("streams an allowed request and sends the provider key only upstream", async () => {
    const { deps, calls } = harness({ usage: { data: 1, error: null } });
    const response = await handleAiProxy(post(allowedBody, "Bearer session-token"), config, deps);
    const text = await response.text();
    assert.equal(response.status, 200);
    assert.match(response.headers.get("Content-Type") ?? "", /^text\/event-stream/);
    assert.equal(text.includes("Hi"), true);
    assert.equal(calls.fetch.length, 1);
    assert.equal(calls.fetch[0]?.url, OPENROUTER_CHAT_COMPLETIONS_URL);
    const headers = new Headers(calls.fetch[0]?.init?.headers);
    assert.equal(headers.get("Authorization"), `Bearer ${OPENROUTER_KEY}`);
    const upstream = JSON.parse(String(calls.fetch[0]?.init?.body));
    assert.deepEqual(upstream, {
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }],
      stream: true,
    });
    assert.equal(text.includes(OPENROUTER_KEY), false);
    assert.equal(text.includes(SERVICE_KEY), false);
  });

  it("returns a provider failure without the provider body or the key", async () => {
    const { deps, calls } = harness({
      usage: { data: 2, error: null },
      upstreamStatus: 401,
    });
    const response = await handleAiProxy(post(allowedBody, "Bearer session-token"), config, deps);
    const text = await response.text();
    assert.equal(response.status, 502);
    assert.equal(JSON.parse(text).error, "upstream_error");
    assert.equal(text.includes("provider failed"), false);
    assert.equal(calls.fetch.length, 1);
    assertNoSecrets(text);
  });
});
