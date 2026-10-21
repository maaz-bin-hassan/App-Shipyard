Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { createElement } from "react";
import TestRenderer, { act } from "react-test-renderer";
import { PermissionScreen } from "../features/permissions/PermissionScreen.ts";
import { permissionCopy } from "../features/permissions/i18n.ts";
import type { PermissionClient } from "../features/permissions/types.ts";
import { applyLayoutDirection, directionFor, layoutDirectionIssue } from "./direction.ts";
import { renderNativeReview } from "./review.ts";
import { setupI18next } from "./setup.ts";
import { renderStoreListing } from "./storeListing.ts";
import { Text } from "../ui/host.ts";
import {
  en,
  flattenCatalog,
  missingKeys,
  registerCatalog,
  resetI18n,
  setLanguage,
  translate,
  type Catalog,
} from "./translate.ts";
import { useI18n } from "./useI18n.ts";

const client: PermissionClient = {
  getStatus: async () => "undetermined",
  request: async () => "granted",
  openSettings: async () => {},
};

function labels(renderer: TestRenderer.ReactTestRenderer): string[] {
  return renderer.root.findAllByType(Text).map((node) => String(node.props.children));
}

describe("catalog", () => {
  it("reads English permission copy from the locale file", () => {
    assert.equal(permissionCopy("camera", "en").title, "Camera");
    assert.equal(permissionCopy("camera", "en-US").body.includes("photo"), true);
    assert.equal(permissionCopy("calendar", "fr").title, permissionCopy("calendar", "en").title);
    assert.equal(translate("settings.consent.title"), "Analytics and crash reports");
    assert.equal(flattenCatalog(en).some((row) => row.key === "permissions.camera.title"), true);
    const json = JSON.parse(readFileSync(new URL("./locales/en.json", import.meta.url), "utf8")) as unknown;
    assert.deepEqual(json, en);
  });
});

describe("language switch", () => {
  it("switches the screen and lays Urdu and Arabic out right to left", async () => {
    const camera = { title: "الكاميرا", body: "الكاميرا", deniedTitle: "الكاميرا", deniedBody: "الكاميرا" };
    registerCatalog("ar", { permissions: { camera } } as Catalog);

    let renderer!: TestRenderer.ReactTestRenderer;
    try {
      await act(async () => {
        renderer = TestRenderer.create(createElement(PermissionScreen, { kind: "camera", client }));
      });
      await act(async () => {
        await Promise.resolve();
      });
      assert.equal(labels(renderer).includes("Camera"), true);

      await act(async () => {
        setLanguage("ar");
        await Promise.resolve();
      });
      assert.equal(labels(renderer).includes("الكاميرا"), true);
      assert.equal(directionFor("ar"), "rtl");
      assert.equal(directionFor("ur-PK"), "rtl");
      assert.equal(directionFor("en"), "ltr");
      assert.equal(layoutDirectionIssue("ar", "ltr"), "ar should use rtl layout");
      assert.equal(layoutDirectionIssue("ur", "rtl"), null);

      const calls: boolean[] = [];
      assert.equal(applyLayoutDirection("ur", { forceRTL: (rtl) => calls.push(rtl) }), "rtl");
      assert.deepEqual(calls, [true]);

      function Probe() {
        const i18n = useI18n();
        return createElement(Text, null, `${i18n.language}:${i18n.direction}:${i18n.t("permissions.camera.title")}`);
      }
      let probe!: TestRenderer.ReactTestRenderer;
      await act(async () => {
        probe = TestRenderer.create(createElement(Probe));
      });
      assert.equal(labels(probe).join(""), "ar:rtl:الكاميرا");
      probe.unmount();
    } finally {
      renderer?.unmount();
      resetI18n();
    }
  });
});

describe("i18next setup", () => {
  it("keeps Urdu right to left when the device reports left to right", async () => {
    const forced: boolean[] = [];
    const result = await setupI18next(
      {
        init: async () => undefined,
        t: (key) => key,
      },
      { getLocales: () => [{ languageCode: "ur", textDirection: "ltr" }] },
      { en, ur: en },
      { forceRTL: (rtl) => forced.push(rtl) },
    );
    assert.equal(result.direction, "rtl");
    assert.deepEqual(forced, [true]);
    resetI18n();
  });
});

describe("review and store listing", () => {
  it("lists every source string and flags a missing translation", () => {
    const review = renderNativeReview("ar", en, { permissions: { camera: { title: "الكاميرا" } } });
    assert.match(review, /native speaker/i);
    assert.match(review, /permissions\.camera\.title/);
    assert.match(review, /MISSING/);
    assert.equal(missingKeys(en, en).length, 0);
  });

  it("formats store text per language and reports a limit", () => {
    const listing = renderStoreListing({
      language: "ar",
      appName: "Example",
      shortDescription: "x".repeat(81),
      fullDescription: "A short description of the app.",
      subtitle: "Example",
      storeTargets: ["play", "appstore"],
    });
    assert.match(listing, /Google Play/);
    assert.match(listing, /App Store/);
    assert.match(listing, /Over the 80 character limit/);
    assert.match(listing, /Example/);
  });
});
