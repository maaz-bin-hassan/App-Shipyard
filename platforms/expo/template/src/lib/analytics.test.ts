Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";
import { createElement, useEffect, type ReactElement } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { createAnalytics, type AnalyticsProvider, type CrashProvider } from "./analytics.ts";
import { createMemoryConsentStore, useAnalyticsConsent } from "./consent.ts";
import { EVENTS, isEventName, renderEventsMarkdown } from "./events.ts";
import { bindPostHog } from "./posthog.ts";
import { bindSentry } from "./sentry.ts";
import { AnalyticsConsentSetting } from "../features/settings/AnalyticsConsentSetting.ts";
import { Pressable, Text } from "../ui/host.ts";

function recordingProvider(): AnalyticsProvider & {
  calls: Array<{ method: string; args: unknown[] }>;
} {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const push = (method: string) => (...args: unknown[]) => {
    calls.push({ method, args });
  };
  return {
    calls,
    capture: push("capture"),
    identify: push("identify"),
    reset: push("reset"),
    screen: push("screen"),
    optIn: push("optIn"),
    optOut: push("optOut"),
  };
}

function recordingCrashes(): CrashProvider & { calls: Array<{ method: string; args: unknown[] }> } {
  const calls: Array<{ method: string; args: unknown[] }> = [];
  const push = (method: string) => (...args: unknown[]) => {
    calls.push({ method, args });
  };
  return {
    calls,
    captureException: push("captureException"),
    setUser: push("setUser"),
    setEnabled: push("setEnabled"),
  };
}

async function render(element: ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

function textOf(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root.findAllByType(Text).map((node) => String(node.props.children));
}

describe("createAnalytics", () => {
  it("drops product events and crashes while consent is off, and still resets identity", () => {
    const provider = recordingProvider();
    const crashes = recordingCrashes();
    const analytics = createAnalytics({ provider, crashes, consent: false });

    analytics.track("permission_allowed", { permission: "camera" });
    analytics.identify("user-1", { plan: "free" });
    analytics.screen("Home");
    analytics.captureException(new Error("boom"));
    analytics.reset();

    assert.deepEqual(
      provider.calls.map((call) => call.method),
      ["optOut", "reset"],
    );
    assert.deepEqual(
      crashes.calls.map((call) => call.method),
      ["setEnabled", "setUser"],
    );
    assert.equal(crashes.calls[0]?.args[0], false);
    assert.equal(crashes.calls[1]?.args[0], null);
  });

  it("forwards catalog events when consent is on and rejects an unknown name", () => {
    const provider = recordingProvider();
    const crashes = recordingCrashes();
    const analytics = createAnalytics({ provider, crashes, consent: true });

    analytics.track("ai_message_sent", { model: "openai/gpt-4o-mini" });
    analytics.identify("user-1");
    analytics.screen("Chat", { source: "tab" });
    analytics.captureException(new Error("boom"));

    assert.equal(provider.calls.some((call) => call.method === "optIn"), true);
    assert.deepEqual(provider.calls.find((call) => call.method === "capture")?.args, [
      "ai_message_sent",
      { model: "openai/gpt-4o-mini" },
    ]);
    assert.equal(crashes.calls.some((call) => call.method === "captureException"), true);

    const track = analytics.track as (event: string) => void;
    assert.throws(() => track("not-a-catalog-event"), /Unknown analytics event/);
  });

  it("turns both providers off and on with the consent flag", () => {
    const provider = recordingProvider();
    const crashes = recordingCrashes();
    const analytics = createAnalytics({ provider, crashes, consent: true });
    analytics.setConsent(false);
    analytics.track("permission_not_now", { permission: "photos" });
    analytics.captureException(new Error("hidden"));
    analytics.setConsent(true);

    assert.deepEqual(provider.calls.map((call) => call.method), ["optIn", "optOut", "optIn"]);
    assert.deepEqual(
      crashes.calls.map((call) => call.args[0]),
      [true, false, true],
    );
    assert.equal(provider.calls.some((call) => call.method === "capture"), false);
  });
});

describe("providers", () => {
  it("binds PostHog capture and Sentry exceptions", () => {
    const posthog = recordingProvider();
    const enabled: boolean[] = [];
    const sentry = {
      captureException(error: unknown) {
        assert.equal(error instanceof Error, true);
      },
      setUser(user: { id: string } | null) {
        assert.equal(user, null);
      },
    };
    let captured = false;
    const crashes = bindSentry(
      {
        ...sentry,
        captureException() {
          captured = true;
        },
      },
      (next) => enabled.push(next),
    );
    const analytics = createAnalytics({
      provider: bindPostHog(posthog),
      crashes,
      consent: true,
    });
    analytics.screen("Settings");
    analytics.captureException(new Error("test crash"));
    analytics.reset();
    assert.equal(posthog.calls.some((call) => call.method === "screen"), true);
    assert.equal(captured, true);
    assert.deepEqual(enabled, [true]);
  });
});

describe("useAnalyticsConsent", () => {
  it("loads the stored flag and the settings control toggles both providers", async () => {
    const provider = recordingProvider();
    const crashes = recordingCrashes();
    const analytics = createAnalytics({ provider, crashes, consent: true });
    const store = createMemoryConsentStore(false);
    const seen: boolean[] = [];

    function Probe() {
      const consent = useAnalyticsConsent(store, analytics);
      useEffect(() => {
        if (consent.ready) seen.push(consent.enabled);
      }, [consent.ready, consent.enabled]);
      return createElement("span", null, consent.enabled ? "on" : "off");
    }

    await render(createElement(Probe));
    await act(async () => {
      await Promise.resolve();
    });
    assert.equal(analytics.getConsent(), false);
    assert.deepEqual(seen, [false]);

    const renderer = await render(
      createElement(AnalyticsConsentSetting, { store, analytics }),
    );
    await act(async () => {
      await Promise.resolve();
    });
    assert.equal(textOf(renderer).includes("Off"), true);

    await act(async () => {
      renderer.root.findAllByType(Pressable)[0]?.props.onPress();
      await Promise.resolve();
    });
    assert.equal(analytics.getConsent(), true);
    assert.equal(textOf(renderer).includes("On"), true);
    assert.equal(provider.calls.some((call) => call.method === "optIn"), true);
    assert.equal(crashes.calls.some((call) => call.method === "setEnabled" && call.args[0] === true), true);
  });
});

describe("events catalog", () => {
  it("matches docs/events.md and only names known events", async () => {
    const markdown = renderEventsMarkdown();
    const file = await readFile(new URL("../../../../../docs/events.md", import.meta.url), "utf8");
    assert.equal(file.replace(/\r\n/g, "\n"), markdown);
    for (const event of EVENTS) {
      assert.equal(isEventName(event.name), true);
      assert.equal(markdown.includes(`| ${event.name} |`), true);
    }
    assert.equal(markdown.includes("not-a-catalog-event"), false);
  });
});
