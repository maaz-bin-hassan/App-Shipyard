import { useCallback, useRef, useState } from "react";
import type { EventName } from "../../lib/events.ts";
import { AiClientError, type AiClient, type ChatMessage } from "./types.ts";

export type AiTracker = {
  track: (event: EventName, properties?: { model: string }) => void;
};

export function useChat(client: AiClient, model: string, analytics?: AiTracker): {
  messages: ChatMessage[];
  status: "idle" | "streaming" | "error";
  error: AiClientError | null;
  send: (content: string) => Promise<void>;
} {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<"idle" | "streaming" | "error">("idle");
  const [error, setError] = useState<AiClientError | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  messagesRef.current = messages;

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (trimmed === "") return;
      const next: ChatMessage[] = [...messagesRef.current, { role: "user", content: trimmed }];
      messagesRef.current = next;
      setMessages(next);
      setStatus("streaming");
      setError(null);
      let assistant = "";
      try {
        await client.stream({
          model,
          messages: next,
          onDelta: (delta) => {
            assistant += delta;
            const withAssistant: ChatMessage[] = [...next, { role: "assistant", content: assistant }];
            messagesRef.current = withAssistant;
            setMessages(withAssistant);
          },
        });
        analytics?.track("ai_message_sent", { model });
        setStatus("idle");
      } catch (caught) {
        setStatus("error");
        setError(asAiError(caught));
      }
    },
    [analytics, client, model],
  );

  return { messages, status, error, send };
}

export function useCompletion(client: AiClient, model: string, analytics?: AiTracker): {
  text: string;
  status: "idle" | "loading" | "error";
  error: AiClientError | null;
  complete: (prompt: string) => Promise<string>;
} {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState<AiClientError | null>(null);

  const complete = useCallback(
    async (prompt: string) => {
      setStatus("loading");
      setError(null);
      try {
        const result = await client.complete({ model, prompt });
        setText(result);
        analytics?.track("ai_completion_requested", { model });
        setStatus("idle");
        return result;
      } catch (caught) {
        const aiError = asAiError(caught);
        setStatus("error");
        setError(aiError);
        throw aiError;
      }
    },
    [analytics, client, model],
  );

  return { text, status, error, complete };
}

function asAiError(error: unknown): AiClientError {
  if (error instanceof AiClientError) return error;
  return new AiClientError("request_failed", "The AI request failed.", 0);
}
