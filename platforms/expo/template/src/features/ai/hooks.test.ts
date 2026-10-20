Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement, useEffect, type ReactElement } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { useChat, useCompletion, type AiTracker } from "./useChat.ts";
import { AiClientError, type AiClient, type ChatMessage } from "./types.ts";

function fakeClient(handlers: {
  stream?: (onDelta: (delta: string) => void) => Promise<void>;
  complete?: () => Promise<string>;
  fail?: AiClientError;
}): { client: AiClient; streams: number; completions: number } {
  let streams = 0;
  let completions = 0;
  const client: AiClient = {
    stream: async (input) => {
      streams += 1;
      if (handlers.fail) throw handlers.fail;
      await handlers.stream?.(input.onDelta);
    },
    complete: async () => {
      completions += 1;
      if (handlers.fail) throw handlers.fail;
      return handlers.complete?.() ?? "";
    },
  };
  return { client, get streams() { return streams; }, get completions() { return completions; } };
}

async function render(element: ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

describe("useChat", () => {
  it("streams assistant text and records the model, not the prompt", async () => {
    const setup = fakeClient({
      stream: async (onDelta) => {
        onDelta("Hel");
        onDelta("lo");
      },
    });
    const seen: Array<{ event: string; model?: string }> = [];
    const analytics: AiTracker = {
      track: (event, properties) => seen.push({ event, model: properties?.model }),
    };
    const api: { send?: (content: string) => Promise<void>; messages?: ChatMessage[] } = {};

    function Probe() {
      const chat = useChat(setup.client, "openai/gpt-4o-mini", analytics);
      useEffect(() => {
        api.send = chat.send;
        api.messages = chat.messages;
      });
      return createElement("span", null, chat.messages.map((message) => message.content).join("|"));
    }

    const renderer = await render(createElement(Probe));
    await act(async () => {
      await api.send?.("  Hello  ");
    });
    const text = renderer.root.findByType("span").children.join("");
    assert.equal(text, "Hello|Hello");
    assert.equal(setup.streams, 1);
    assert.deepEqual(seen, [{ event: "ai_message_sent", model: "openai/gpt-4o-mini" }]);

    await act(async () => {
      await api.send?.("   ");
    });
    assert.equal(setup.streams, 1);
  });

  it("surfaces a rate limit and does not record a sent event", async () => {
    const setup = fakeClient({
      fail: new AiClientError("rate_limited", "Daily AI request limit reached.", 429, 2),
    });
    const seen: string[] = [];
    const api: { send?: (content: string) => Promise<void>; error?: AiClientError | null } = {};

    function Probe() {
      const chat = useChat(setup.client, "openai/gpt-4o-mini", {
        track: (event) => seen.push(event),
      });
      useEffect(() => {
        api.send = chat.send;
        api.error = chat.error;
      });
      return createElement("span", null, chat.status);
    }

    const renderer = await render(createElement(Probe));
    await act(async () => {
      await api.send?.("Hello");
    });
    assert.equal(renderer.root.findByType("span").children.join(""), "error");
    assert.equal(api.error?.code, "rate_limited");
    assert.deepEqual(seen, []);
  });
});

describe("useCompletion", () => {
  it("returns the full text for a signed-in completion", async () => {
    const setup = fakeClient({ complete: async () => "Done" });
    const seen: string[] = [];
    const api: { complete?: (prompt: string) => Promise<string> } = {};

    function Probe() {
      const completion = useCompletion(setup.client, "openai/gpt-4o-mini", {
        track: (event) => seen.push(event),
      });
      useEffect(() => {
        api.complete = completion.complete;
      });
      return createElement("span", null, completion.text);
    }

    const renderer = await render(createElement(Probe));
    let result = "";
    await act(async () => {
      result = (await api.complete?.("Summarise")) ?? "";
    });
    assert.equal(result, "Done");
    assert.equal(renderer.root.findByType("span").children.join(""), "Done");
    assert.equal(setup.completions, 1);
    assert.deepEqual(seen, ["ai_completion_requested"]);
  });

  it("rejects when the client has no session", async () => {
    const setup = fakeClient({
      fail: new AiClientError("unauthenticated", "A valid user session is required.", 401),
    });
    const api: { complete?: (prompt: string) => Promise<string> } = {};

    function Probe() {
      const completion = useCompletion(setup.client, "openai/gpt-4o-mini");
      useEffect(() => {
        api.complete = completion.complete;
      });
      return createElement("span", null, completion.status);
    }

    await render(createElement(Probe));
    await act(async () => {
      await assert.rejects(() => api.complete?.("Hello") ?? Promise.resolve(""), (error: unknown) => {
        assert.equal(error instanceof AiClientError, true);
        assert.equal((error as AiClientError).code, "unauthenticated");
        return true;
      });
    });
  });
});
