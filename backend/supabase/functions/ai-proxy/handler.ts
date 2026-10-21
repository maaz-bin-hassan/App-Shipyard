export const OPENROUTER_CHAT_COMPLETIONS_URL = "https://openrouter.ai/api/v1/chat/completions";

const MAX_MESSAGES = 32;
const MAX_CONTENT_LENGTH = 32_000;
const ALLOWED_ROLES = new Set(["system", "user", "assistant"]);

export type ChatMessage = {
  role: string;
  content: string;
};

export type AiProxyConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  openRouterApiKey: string;
  modelAllowlist: string;
  dailyRequestLimit: string;
};

export type UserAuthClient = {
  auth: {
    getUser: (jwt: string) => Promise<{
      data: { user: { id: string } | null };
      error: { message: string } | null;
    }>;
  };
};

export type UsageClient = {
  rpc: (
    fn: "increment_ai_usage",
    args: { p_user_id: string; p_limit: number },
  ) => Promise<{ data: number | null; error: { message: string } | null }>;
};

export type CreateClient = (
  url: string,
  key: string,
  options?: {
    global?: { headers?: Record<string, string> };
    auth?: { persistSession?: boolean; autoRefreshToken?: boolean };
  },
) => UserAuthClient & UsageClient;

export type AiProxyDeps = {
  createClient: CreateClient;
  fetch: typeof fetch;
};

type ErrorBody = {
  error: string;
  message: string;
  limit?: number;
  model?: string;
};

const baseHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Cache-Control": "no-store",
};

export function parseAllowlist(raw: string): Set<string> {
  return new Set(
    raw
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0),
  );
}

export function parseDailyLimit(raw: string): number | null {
  const trimmed = raw.trim();
  if (!/^[1-9]\d{0,6}$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  if (!Number.isInteger(value) || value < 1 || value > 1_000_000) {
    return null;
  }
  return value;
}

export function secondsUntilUtcMidnight(now = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

function jsonError(status: number, body: ErrorBody, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...baseHeaders,
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

function bearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }
  const match = header.match(/^Bearer\s+(\S+)\s*$/i);
  return match?.[1] ?? null;
}

function sanitizeMessages(value: unknown): { ok: true; messages: ChatMessage[] } | { ok: false; message: string } {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_MESSAGES) {
    return { ok: false, message: `messages must contain 1 to ${MAX_MESSAGES} objects.` };
  }

  const messages: ChatMessage[] = [];
  let hasUser = false;
  for (const entry of value) {
    if (entry === null || typeof entry !== "object") {
      return { ok: false, message: "Each message must be an object with role and content." };
    }
    const role = "role" in entry ? entry.role : undefined;
    const content = "content" in entry ? entry.content : undefined;
    if (typeof role !== "string" || !ALLOWED_ROLES.has(role)) {
      return { ok: false, message: "Message role must be system, user, or assistant." };
    }
    if (typeof content !== "string" || content.length < 1 || content.length > MAX_CONTENT_LENGTH) {
      return { ok: false, message: `Message content must be a string of 1 to ${MAX_CONTENT_LENGTH} characters.` };
    }
    if (role === "user") {
      hasUser = true;
    }
    messages.push({ role, content });
  }

  if (!hasUser) {
    return { ok: false, message: "messages must include a user message." };
  }
  return { ok: true, messages };
}

export async function handleAiProxy(request: Request, config: AiProxyConfig, deps: AiProxyDeps): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: baseHeaders });
  }

  if (request.method !== "POST") {
    return jsonError(405, { error: "method_not_allowed", message: "Use POST." });
  }

  const token = bearerToken(request.headers.get("Authorization"));
  if (!token) {
    return jsonError(401, {
      error: "unauthenticated",
      message: "A valid user session is required.",
    });
  }

  if (!config.supabaseUrl || !config.supabaseAnonKey) {
    return jsonError(500, {
      error: "misconfigured",
      message: "The auth project URL or anon key is not configured.",
    });
  }

  const userClient = deps.createClient(config.supabaseUrl, config.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const userResult = await userClient.auth.getUser(token);
  const userId = userResult.data.user?.id ?? null;
  if (userResult.error || !userId) {
    return jsonError(401, {
      error: "unauthenticated",
      message: "A valid user session is required.",
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, { error: "invalid_request", message: "Request body must be JSON." });
  }
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    return jsonError(400, { error: "invalid_request", message: "Request body must be a JSON object." });
  }
  const body = payload as Record<string, unknown>;

  const modelValue = body.model;
  if (typeof modelValue !== "string" || modelValue.trim().length === 0) {
    return jsonError(400, { error: "invalid_request", message: "model must be a non-empty string." });
  }
  const model = modelValue.trim();

  const allowlist = parseAllowlist(config.modelAllowlist);
  if (allowlist.size === 0) {
    return jsonError(500, {
      error: "misconfigured",
      message: "AI_MODEL_ALLOWLIST is empty.",
    });
  }
  if (!allowlist.has(model)) {
    return jsonError(400, {
      error: "disallowed_model",
      message: "That model is not on the allowlist.",
      model,
    });
  }

  const messagesValue = body.messages;
  const sanitized = sanitizeMessages(messagesValue);
  if (!sanitized.ok) {
    return jsonError(400, { error: "invalid_request", message: sanitized.message });
  }

  const limit = parseDailyLimit(config.dailyRequestLimit);
  if (limit === null) {
    return jsonError(500, {
      error: "misconfigured",
      message: "AI_DAILY_REQUEST_LIMIT must be a positive integer.",
    });
  }

  if (!config.supabaseServiceRoleKey) {
    return jsonError(500, {
      error: "misconfigured",
      message: "The service role key is not configured.",
    });
  }
  if (!config.openRouterApiKey) {
    return jsonError(500, {
      error: "misconfigured",
      message: "OPENROUTER_API_KEY is not configured.",
    });
  }

  const admin = deps.createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const usage = await admin.rpc("increment_ai_usage", {
    p_user_id: userId,
    p_limit: limit,
  });
  if (usage.error) {
    return jsonError(500, {
      error: "usage_check_failed",
      message: "The daily usage counter could not be updated.",
    });
  }
  if (usage.data === null) {
    return jsonError(
      429,
      {
        error: "rate_limited",
        message: "Daily AI request limit reached.",
        limit,
      },
      { "Retry-After": String(secondsUntilUtcMidnight()) },
    );
  }
  if (typeof usage.data !== "number" || usage.data < 1) {
    return jsonError(500, {
      error: "usage_check_failed",
      message: "The daily usage counter could not be updated.",
    });
  }

  const upstream = await deps.fetch(OPENROUTER_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.openRouterApiKey}`,
      "Content-Type": "application/json",
      "X-Title": "App Shipyard",
    },
    body: JSON.stringify({
      model,
      messages: sanitized.messages,
      stream: true,
    }),
  });

  if (!upstream.ok || !upstream.body) {
    return jsonError(502, {
      error: "upstream_error",
      message: "The AI provider returned an error.",
    });
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      ...baseHeaders,
      "Content-Type": upstream.headers.get("Content-Type") ?? "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
