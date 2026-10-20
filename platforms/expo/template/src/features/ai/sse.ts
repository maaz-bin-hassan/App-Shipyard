export type SseParse = {
  deltas: string[];
  done: boolean;
  rest: string;
};

type StreamPayload = {
  choices?: Array<{ delta?: { content?: unknown } }>;
};

/** Pull complete SSE lines out of a buffer. An unfinished line stays in `rest`. */
export function consumeSseBuffer(buffer: string): SseParse {
  const lines = buffer.split(/\r?\n/);
  const rest = lines.pop() ?? "";
  const deltas: string[] = [];
  let done = false;

  for (const line of lines) {
    if (line === "" || line.startsWith(":")) continue;
    if (!line.startsWith("data:")) continue;
    const data = line.slice("data:".length).trim();
    if (data === "[DONE]") {
      done = true;
      continue;
    }
    let payload: StreamPayload;
    try {
      payload = JSON.parse(data) as StreamPayload;
    } catch {
      continue;
    }
    const content = payload.choices?.[0]?.delta?.content;
    if (typeof content === "string" && content.length > 0) deltas.push(content);
  }

  return { deltas, done, rest };
}
