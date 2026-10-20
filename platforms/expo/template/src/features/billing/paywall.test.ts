Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createElement, type ReactElement } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { selectRevenueCatApiKey } from "./apiKey.ts";
import { loadPaywall, usePaywall } from "./paywall.ts";
import type { BillingClient, PackageLike } from "./types.ts";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return { promise, resolve };
}

const monthly: PackageLike = {
  identifier: "$rc_monthly",
  product: { identifier: "pro_monthly", title: "Pro monthly", priceString: "₹149.00" },
};

function client(options: {
  offerings?: () => Promise<{ current: { availablePackages: PackageLike[] } | null }>;
}): BillingClient {
  return {
    getCustomerInfo: async () => ({ entitlements: { active: {} } }),
    restorePurchases: async () => ({ entitlements: { active: {} } }),
    getOfferings: options.offerings ?? (async () => ({ current: null })),
    purchasePackage: async () => ({ customerInfo: { entitlements: { active: {} } } }),
  };
}

async function render(element: ReactElement) {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(element);
  });
  return renderer;
}

describe("loadPaywall", () => {
  it("returns empty when the current offering is missing", async () => {
    const model = await loadPaywall(client({}));
    assert.deepEqual(model, { status: "empty" });
  });

  it("returns empty when the current offering has no packages", async () => {
    const model = await loadPaywall(
      client({
        offerings: async () => ({ current: { availablePackages: [] } }),
      }),
    );
    assert.deepEqual(model, { status: "empty" });
  });

  it("returns the store price string and no hard-coded amount", async () => {
    const model = await loadPaywall(
      client({
        offerings: async () => ({ current: { availablePackages: [monthly] } }),
      }),
    );
    assert.equal(model.status, "ready");
    if (model.status !== "ready") return;
    assert.deepEqual(
      model.packages.map(({ source: _source, ...row }) => row),
      [
        {
          identifier: "$rc_monthly",
          productId: "pro_monthly",
          title: "Pro monthly",
          priceString: "₹149.00",
        },
      ],
    );
    assert.equal("price" in model.packages[0], false);
  });

  it("returns an error when offerings fail", async () => {
    const model = await loadPaywall(
      client({
        offerings: async () => {
          throw new Error("network down");
        },
      }),
    );
    assert.deepEqual(model, { status: "error", message: "network down" });
  });
});

describe("usePaywall", () => {
  it("moves from loading to empty, then reloads to ready", async () => {
    const pending = deferred<{ current: { availablePackages: PackageLike[] } | null }>();
    let mode: "pending" | "ready" = "pending";
    const billing = client({
      offerings: () => (mode === "pending" ? pending.promise : Promise.resolve({ current: { availablePackages: [monthly] } })),
    });

    function Probe() {
      const paywall = usePaywall(billing);
      return createElement("span", {
        "data-status": paywall.model.status,
        "data-reload": paywall.reload,
      });
    }

    const renderer = await render(createElement(Probe));
    assert.equal(renderer.root.findByType("span").props["data-status"], "loading");

    await act(async () => {
      pending.resolve({ current: null });
      await pending.promise;
    });
    assert.equal(renderer.root.findByType("span").props["data-status"], "empty");

    mode = "ready";
    await act(async () => {
      await renderer.root.findByType("span").props["data-reload"]();
    });
    assert.equal(renderer.root.findByType("span").props["data-status"], "ready");
  });
});

describe("selectRevenueCatApiKey", () => {
  it("uses the Test Store key for a debug build", () => {
    assert.equal(
      selectRevenueCatApiKey({
        platform: "android",
        release: false,
        testKey: "test_example",
        googleKey: "goog_example",
      }),
      "test_example",
    );
  });

  it("uses the platform public key for a release build", () => {
    assert.equal(
      selectRevenueCatApiKey({
        platform: "ios",
        release: true,
        testKey: "test_example",
        appleKey: "appl_example",
      }),
      "appl_example",
    );
  });

  it("refuses a Test Store key on a release build", () => {
    assert.throws(
      () =>
        selectRevenueCatApiKey({
          platform: "android",
          release: true,
          googleKey: "test_example",
        }),
      /release build/,
    );
  });
});
