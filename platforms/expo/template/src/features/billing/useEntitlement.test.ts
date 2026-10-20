Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement, useEffect, type ReactElement } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { GatedFeature } from "./GatedFeature.ts";
import type { BillingClient, CustomerInfoLike } from "./types.ts";
import { isEntitled, useEntitlement } from "./useEntitlement.ts";

const ENTITLEMENT = "pro";

function inactiveInfo(): CustomerInfoLike {
  return { entitlements: { active: {} } };
}

function activeInfo(): CustomerInfoLike {
  return { entitlements: { active: { [ENTITLEMENT]: { identifier: ENTITLEMENT } } } };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

type Harness = {
  client: BillingClient;
  purchase: (info?: CustomerInfoLike) => Promise<void>;
  restores: () => number;
};

function harness(options?: { initial?: CustomerInfoLike; failLoad?: Error }): Harness {
  const listeners = new Set<(info: CustomerInfoLike) => void>();
  let restores = 0;
  const pending = deferred<CustomerInfoLike>();
  const client: BillingClient = {
    getCustomerInfo: () => {
      if (options?.failLoad) return Promise.reject(options.failLoad);
      if (options?.initial) return Promise.resolve(options.initial);
      return pending.promise;
    },
    restorePurchases: async () => {
      restores += 1;
      const info = activeInfo();
      for (const listener of listeners) listener(info);
      return info;
    },
    getOfferings: async () => ({ current: null }),
    purchasePackage: async () => {
      const info = activeInfo();
      for (const listener of listeners) listener(info);
      return { customerInfo: info };
    },
    addCustomerInfoUpdateListener: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return {
    client,
    purchase: async (info = activeInfo()) => {
      for (const listener of listeners) listener(info);
    },
    restores: () => restores,
    resolveInitial: options?.initial || options?.failLoad ? null : pending.resolve,
  } as Harness & { resolveInitial: ((info: CustomerInfoLike) => void) | null };
}

async function render(element: ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

function text(renderer: TestRenderer.ReactTestRenderer): string {
  return renderer.root
    .findAllByType("span")
    .map((node) => node.children.join(""))
    .join("");
}

function gate(client: BillingClient) {
  return createElement(
    GatedFeature,
    {
      entitlementId: ENTITLEMENT,
      client,
      loading: createElement("span", null, "loading"),
      locked: createElement("span", null, "locked"),
      error: (message: string) => createElement("span", null, `error:${message}`),
    },
    createElement("span", null, "premium-feature"),
  );
}

describe("isEntitled", () => {
  it("is inactive until the named entitlement is present", () => {
    assert.equal(isEntitled(null, ENTITLEMENT), false);
    assert.equal(isEntitled(inactiveInfo(), ENTITLEMENT), false);
    assert.equal(isEntitled(activeInfo(), ENTITLEMENT), true);
    assert.equal(isEntitled(activeInfo(), ""), false);
    assert.equal(isEntitled(activeInfo(), "other"), false);
  });
});

describe("useEntitlement", () => {
  it("stays loading until customer info arrives, then stays locked", async () => {
    const setup = harness() as ReturnType<typeof harness> & {
      resolveInitial: (info: CustomerInfoLike) => void;
    };
    const renderer = await render(gate(setup.client));
    assert.equal(text(renderer), "loading");

    await act(async () => {
      setup.resolveInitial(inactiveInfo());
      await Promise.resolve();
    });
    assert.equal(text(renderer), "locked");
  });

  it("unlocks the gated feature when a sandbox purchase updates customer info", async () => {
    const setup = harness({ initial: inactiveInfo() });
    const renderer = await render(gate(setup.client));
    await act(async () => {
      await Promise.resolve();
    });
    assert.equal(text(renderer), "locked");

    await act(async () => {
      await setup.client.purchasePackage({
        identifier: "$rc_monthly",
        product: { identifier: "pro_monthly", title: "Pro", priceString: "₹149.00" },
      });
    });
    assert.equal(text(renderer), "premium-feature");
  });

  it("unlocks the gated feature when restore purchases returns the entitlement", async () => {
    const setup = harness({ initial: inactiveInfo() });
    const api: { restore?: () => Promise<void> } = {};
    function Probe(props: { client: BillingClient }) {
      const state = useEntitlement(ENTITLEMENT, props.client);
      useEffect(() => {
        api.restore = state.restore;
      });
      const label = state.status === "loading" ? "loading" : state.active ? "premium-feature" : "locked";
      return createElement("span", null, label);
    }

    const renderer = await render(createElement(Probe, { client: setup.client }));
    await act(async () => {
      await Promise.resolve();
    });
    assert.equal(text(renderer), "locked");

    await act(async () => {
      await api.restore?.();
    });
    assert.equal(text(renderer), "premium-feature");
    assert.equal(setup.restores(), 1);
  });

  it("shows an error and keeps the feature locked when customer info fails", async () => {
    const setup = harness({ failLoad: new Error("billing unavailable") });
    const renderer = await render(gate(setup.client));
    await act(async () => {
      await Promise.resolve();
    });
    assert.equal(text(renderer), "error:billing unavailable");
  });
});
