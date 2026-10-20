Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement, useEffect, type ReactElement, type ReactNode } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { createExpoPermissionClient, mapExpoStatus } from "./expoPermissionClient.ts";
import { permissionCopy } from "./i18n.ts";
import { PermissionScreen } from "./PermissionScreen.ts";
import {
  BluetoothPermissionScreen,
  CalendarPermissionScreen,
  CameraPermissionScreen,
  ContactsPermissionScreen,
  LocationPermissionScreen,
  MicrophonePermissionScreen,
  NotificationsPermissionScreen,
  PhotosPermissionScreen,
} from "./screens.ts";
import type { PermissionClient, PermissionKind, PermissionStatus } from "./types.ts";
import { PERMISSION_KINDS } from "./types.ts";
import { usePermissionFlow, type PermissionFlow, type PermissionTracker } from "./usePermissionFlow.ts";
import { Pressable, Text } from "../../ui/host.ts";

function fakeClient(initial: PermissionStatus, requested: PermissionStatus = "granted") {
  let requests = 0;
  let settings = 0;
  const client: PermissionClient = {
    getStatus: async () => initial,
    request: async () => {
      requests += 1;
      return requested;
    },
    openSettings: async () => {
      settings += 1;
    },
  };
  return { client, requests: () => requests, settings: () => settings };
}

function tracker() {
  const events: Array<{ event: string; permission?: string }> = [];
  const analytics: PermissionTracker = {
    track: (event, properties) => {
      events.push({ event, permission: properties?.permission });
    },
  };
  return { analytics, events };
}

async function render(element: ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

async function settle(): Promise<void> {
  await act(async () => {
    await Promise.resolve();
  });
}

function labels(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root.findAllByType(Text).map((node) => String(node.props.children));
}

describe("usePermissionFlow", () => {
  it("shows the i18n explanation, then Allow requests and Not now does not", async () => {
    const setup = fakeClient("undetermined", "granted");
    const events = tracker();
    const api: { flow?: PermissionFlow } = {};

    function Probe(props: { client: PermissionClient }) {
      const flow = usePermissionFlow("camera", props.client, { locale: "en", analytics: events.analytics });
      useEffect(() => {
        api.flow = flow;
      });
      return createElement(Text, null, flow.phase);
    }

    const renderer = await render(createElement(Probe, { client: setup.client }));
    await settle();
    assert.equal(labels(renderer).join(""), "prompt");
    assert.equal(api.flow?.copy.body.includes("take a photo"), true);
    assert.equal(api.flow?.copy.allow, "Allow");
    assert.equal(api.flow?.copy.notNow, "Not now");

    await act(async () => {
      api.flow?.notNow();
    });
    assert.equal(setup.requests(), 0);
    assert.equal(labels(renderer).join(""), "deferred");
    assert.deepEqual(events.events, [{ event: "permission_not_now", permission: "camera" }]);

    const again = fakeClient("undetermined", "granted");
    const allowed = tracker();
    const second: { flow?: PermissionFlow } = {};
    function AllowProbe(props: { client: PermissionClient }) {
      const flow = usePermissionFlow("microphone", props.client, { analytics: allowed.analytics });
      useEffect(() => {
        second.flow = flow;
      });
      return createElement(Text, null, flow.phase);
    }
    const allowedRenderer = await render(createElement(AllowProbe, { client: again.client }));
    await settle();
    await act(async () => {
      await second.flow?.allow();
    });
    assert.equal(again.requests(), 1);
    assert.equal(labels(allowedRenderer).join(""), "granted");
    assert.deepEqual(allowed.events, [{ event: "permission_allowed", permission: "microphone" }]);
  });

  it("opens settings for a denied-forever permission and does not request again", async () => {
    const setup = fakeClient("denied-forever");
    const events = tracker();
    const api: { flow?: PermissionFlow } = {};

    function Probe(props: { client: PermissionClient }) {
      const flow = usePermissionFlow("location", props.client, { analytics: events.analytics });
      useEffect(() => {
        api.flow = flow;
      });
      return createElement(Text, null, `${flow.phase}:${flow.copy.openSettings}`);
    }

    const renderer = await render(createElement(Probe, { client: setup.client }));
    await settle();
    assert.equal(labels(renderer)[0]?.startsWith("settings:"), true);

    await act(async () => {
      await api.flow?.allow();
    });
    assert.equal(setup.requests(), 0);
    assert.equal(setup.settings(), 1);
    assert.deepEqual(events.events, [{ event: "permission_settings_opened", permission: "location" }]);
  });

  it("moves to settings when the request comes back denied forever", async () => {
    const setup = fakeClient("denied", "denied-forever");
    const api: { flow?: PermissionFlow } = {};

    function Probe(props: { client: PermissionClient }) {
      const flow = usePermissionFlow("notifications", props.client);
      useEffect(() => {
        api.flow = flow;
      });
      return createElement(Text, null, flow.phase);
    }

    const renderer = await render(createElement(Probe, { client: setup.client }));
    await settle();
    await act(async () => {
      await api.flow?.allow();
    });
    assert.equal(setup.requests(), 1);
    assert.equal(labels(renderer).join(""), "settings");
  });

  it("falls back to English copy for an unknown locale", () => {
    assert.equal(permissionCopy("calendar", "fr").title, permissionCopy("calendar", "en").title);
    assert.equal(permissionCopy("calendar", "en-US").body.includes("calendar"), true);
  });
});

describe("permission screens", () => {
  const screens: Record<PermissionKind, (props: { client: PermissionClient }) => ReactNode> = {
    camera: CameraPermissionScreen,
    photos: PhotosPermissionScreen,
    notifications: NotificationsPermissionScreen,
    location: LocationPermissionScreen,
    microphone: MicrophonePermissionScreen,
    contacts: ContactsPermissionScreen,
    calendar: CalendarPermissionScreen,
    bluetooth: BluetoothPermissionScreen,
  };

  it("renders Allow and Not now from i18n for every kind", async () => {
    for (const kind of PERMISSION_KINDS) {
      const setup = fakeClient("undetermined");
      const renderer = await render(createElement(screens[kind], { client: setup.client }));
      await settle();
      const copy = permissionCopy(kind, "en");
      const text = labels(renderer);
      assert.equal(text.includes(copy.title), true, kind);
      assert.equal(text.includes(copy.body), true, kind);
      assert.equal(text.includes("Allow"), true, kind);
      assert.equal(text.includes("Not now"), true, kind);
      assert.equal(text.includes(copy.body) && copy.body !== permissionCopy("camera", "en").body || kind === "camera", true);
    }
  });

  it("deep-links to settings from the denied-forever screen", async () => {
    const setup = fakeClient("denied-forever");
    const renderer = await render(createElement(PermissionScreen, { kind: "bluetooth", client: setup.client }));
    await settle();
    const text = labels(renderer);
    assert.equal(text.includes("Bluetooth is off"), true);
    assert.equal(text.includes("Open Settings"), true);

    const open = renderer.root.findAllByType(Pressable).find((node) => node.props.accessibilityLabel === "Open Settings");
    await act(async () => {
      open?.props.onPress();
      await Promise.resolve();
    });
    assert.equal(setup.requests(), 0);
    assert.equal(setup.settings(), 1);
  });
});

describe("mapExpoStatus", () => {
  it("maps granted, undetermined, denied, and denied forever", async () => {
    assert.equal(mapExpoStatus({ status: "granted", granted: true, canAskAgain: true }), "granted");
    assert.equal(mapExpoStatus({ status: "undetermined", canAskAgain: true }), "undetermined");
    assert.equal(mapExpoStatus({ status: "denied", canAskAgain: true }), "denied");
    assert.equal(mapExpoStatus({ status: "denied", granted: false, canAskAgain: false }), "denied-forever");

    let requested = false;
    const client = createExpoPermissionClient(
      {
        camera: { get: async () => ({ status: "denied", canAskAgain: false }), request: async () => ({ status: "granted" }) },
        photos: { get: async () => ({ status: "granted" }), request: async () => ({ status: "granted" }) },
        notifications: { get: async () => ({ status: "granted" }), request: async () => ({ status: "granted" }) },
        location: { get: async () => ({ status: "granted" }), request: async () => ({ status: "granted" }) },
        microphone: { get: async () => ({ status: "granted" }), request: async () => ({ status: "granted" }) },
        contacts: { get: async () => ({ status: "granted" }), request: async () => ({ status: "granted" }) },
        calendar: { get: async () => ({ status: "granted" }), request: async () => ({ status: "granted" }) },
        bluetooth: {
          get: async () => ({ status: "undetermined" }),
          request: async () => {
            requested = true;
            return { status: "granted", granted: true };
          },
        },
      },
      async () => undefined,
    );
    assert.equal(await client.getStatus("camera"), "denied-forever");
    assert.equal(await client.request("bluetooth"), "granted");
    assert.equal(requested, true);
  });
});
