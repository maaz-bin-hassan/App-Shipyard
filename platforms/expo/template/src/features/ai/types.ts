export type ChatRole = "system" | "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type AiClientErrorCode =
  | "unauthenticated"
  | "invalid_request"
  | "disallowed_model"
  | "rate_limited"
  | "upstream_error"
  | "misconfigured"
  | "request_failed";

export class AiClientError extends Error {
  readonly code: AiClientErrorCode;
  readonly status: number;
  readonly limit?: number;

  constructor(code: AiClientErrorCode, message: string, status: number, limit?: number) {
    super(message);
    this.name = "AiClientError";
    this.code = code;
    this.status = status;
    this.limit = limit;
  }
}

export type AiClient = {
  stream: (input: {
    model: string;
    messages: ChatMessage[];
    onDelta: (delta: string) => void;
  }) => Promise<void>;
  complete: (input: { model: string; prompt: string }) => Promise<string>;
};
