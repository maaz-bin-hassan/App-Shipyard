import { consumeSseBuffer } from "./sse.ts";
import { AiClientError, type AiClient, type AiClientErrorCode, type ChatMessage } from "./types.ts";

const OPENROUTER_HOST = "openrouter.ai";

export function assertProxyUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new AiClientError("invalid_request", "AI function URL is invalid.", 0);
  }
  if (parsed.hostname === OPENROUTER_HOST || parsed.hostname.endsWith(`.${OPENROUTER_HOST}`)) {
    throw new AiClientError("invalid_request", "The app must call the Supabase AI proxy, not OpenRouter.", 0);
  }
}

export function readAiEnv(env: Record<string, string | undefined>): { functionUrl: string; anonKey: string } {
  const base = env.EXPO_PUBLIC_SUPABASE_URL?.replace(/\/$/, "") ?? "";
  return {
    functionUrl: base === "" ? "" : `${base}/functions/v1/ai-proxy`,
    anonKey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  };
}

export function createAiClient(options: {
  functionUrl: string;
  anonKey: string;
  getAccessToken: () => Promise<string | null>;
  fetch?: typeof fetch;
}): AiClient {
  if (options.functionUrl.trim() === "") {
    throw new AiClientError("misconfigured", "AI function URL is missing.", 0);
  }
  assertProxyUrl(options.functionUrl);
  const fetchImpl = options.fetch ?? fetch;

  async function stream(input: {
    model: string;
    messages: ChatMessage[];
    onDelta: (delta: string) => void;
  }): Promise<void> {
    const token = await options.getAccessToken();
    if (!token) {
      throw new AiClientError("unauthenticated", "A valid user session is required.", 401);
    }

    const response = await fetchImpl(options.functionUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: options.anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: input.model, messages: input.messages }),
    });

    if (!response.ok) {
      throw await errorFromResponse(response);
    }
    await readEventStream(response, input.onDelta);
  }

  return {
    stream,
    async complete(input) {
      const prompt = input.prompt.trim();
      if (prompt === "") {
        throw new AiClientError("invalid_request", "Prompt is empty.", 400);
      }
      let text = "";
      await stream({
        model: input.model,
        messages: [{ role: "user", content: prompt }],
        onDelta: (delta) => {
          text += delta;
        },
      });
      return text;
    },
  };
}

async function errorFromResponse(response: Response): Promise<AiClientError> {
  let code: AiClientErrorCode = "request_failed";
  let message = "The AI request failed.";
  let limit: number | undefined;
  try {
    const body = (await response.json()) as { error?: unknown; message?: unknown; limit?: unknown };
    if (typeof body.error === "string" && isErrorCode(body.error)) code = body.error;
    if (typeof body.message === "string" && body.message.trim() !== "") message = body.message;
    if (typeof body.limit === "number") limit = body.limit;
  } catch {
    // Keep the generic message. Do not forward a provider body.
  }
  return new AiClientError(code, message, response.status, limit);
}

function isErrorCode(value: string): value is AiClientErrorCode {
  return (
    value === "unauthenticated" ||
    value === "invalid_request" ||
    value === "disallowed_model" ||
    value === "rate_limited" ||
    value === "upstream_error" ||
    value === "misconfigured" ||
    value === "request_failed"
  );
}

async function readEventStream(response: Response, onDelta: (delta: string) => void): Promise<void> {
  if (!response.body) {
    const parsed = consumeSseBuffer(`${await response.text()}\n`);
    for (const delta of parsed.deltas) onDelta(delta);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let rest = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    rest += decoder.decode(value, { stream: true });
    const parsed = consumeSseBuffer(rest);
    rest = parsed.rest;
    for (const delta of parsed.deltas) onDelta(delta);
    if (parsed.done) return;
  }
  rest += decoder.decode();
  if (rest !== "") {
    const parsed = consumeSseBuffer(`${rest}\n`);
    for (const delta of parsed.deltas) onDelta(delta);
  }
}
