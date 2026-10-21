import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { loadLegalInputs, parseAppConfig, parseEvents, parseSchema, unclassifiedDependencies } from "./evidence.ts";
import { diffDraft, DISCLAIMER, renderChanges, renderDataSafety, renderPrivacyPolicy, SAFETY_NOTE } from "./render.ts";
import { translate } from "../i18n/translate.ts";

const root = fileURLToPath(new URL("../../../../../", import.meta.url));

const usageToKey: Record<string, string> = {
  NSCameraUsageDescription: "permissions.camera.body",
  NSPhotoLibraryUsageDescription: "permissions.photos.body",
  NSLocationWhenInUseUsageDescription: "permissions.location.body",
  NSMicrophoneUsageDescription: "permissions.microphone.body",
  NSContactsUsageDescription: "permissions.contacts.body",
  NSCalendarsUsageDescription: "permissions.calendar.body",
  NSBluetoothAlwaysUsageDescription: "permissions.bluetooth.body",
};

describe("legal draft", () => {
  it("lists every SDK, event, table, and permission from the template", async () => {
    const evidence = loadLegalInputs(root);
    const policy = renderPrivacyPolicy(evidence, { privacyContact: "" });
    const safety = renderDataSafety(evidence);
    assert.equal(evidence.unclassified.length, 0);
    assert.ok(policy.startsWith("# Privacy policy\n\n" + DISCLAIMER));
    assert.ok(policy.indexOf(DISCLAIMER) < policy.indexOf("## SDKs"));
    assert.ok(safety.startsWith("# Google Play Data safety answers\n\n" + SAFETY_NOTE));
    for (const name of evidence.dependencies) {
      assert.ok(policy.includes(`\`${name}\``), name);
      assert.ok(safety.includes(`\`${name}\``), name);
    }
    for (const event of evidence.events) assert.ok(policy.includes(event.name), event.name);
    for (const table of evidence.tables) {
      assert.ok(policy.includes(`public.${table.name}`), table.name);
      for (const column of table.columns) assert.ok(policy.includes(column), column);
    }
    for (const item of evidence.usageDescriptions) {
      assert.ok(policy.includes(item.key), item.key);
      const key = usageToKey[item.key];
      if (key) assert.equal(item.text, translate(key));
    }
    assert.ok(policy.includes("not legal advice"));
    assert.ok(policy.includes("openrouter.ai"));
    assert.equal(policy.includes("Mixpanel"), false);
    assert.ok(safety.includes("### Does your app collect or share any of the required user data types?"));
    assert.ok(safety.includes("### Is all of the user data collected by your app encrypted in transit?"));
    assert.ok(safety.includes("Answer: Not shown. Do not select Yes."));
    assert.ok(safety.includes("### Precise location"));
    assert.ok(safety.includes("### Purchase history"));
    assert.ok(safety.includes("### Crash logs"));
    assert.ok(safety.includes("### Other user-generated content"));
    assert.equal(evidence.storesMessageText, false);
    assert.equal(evidence.forwardsMessagesToOpenRouter, true);

    const onDiskPolicy = await readFile(new URL("../../../../../docs/legal/privacy-policy.md", import.meta.url), "utf8");
    const onDiskSafety = await readFile(new URL("../../../../../docs/legal/data-safety-answers.md", import.meta.url), "utf8");
    const onDiskChanges = await readFile(new URL("../../../../../docs/legal/changes.md", import.meta.url), "utf8");
    assert.equal(onDiskPolicy, policy);
    assert.equal(onDiskSafety, safety);
    assert.equal(onDiskChanges, renderChanges(null));
  });

  it("diffs a rerun against the previous draft", () => {
    const evidence = loadLegalInputs(root);
    const policy = renderPrivacyPolicy(evidence);
    const safety = renderDataSafety(evidence);
    const changed = policy.replace("Consent starts off", "Consent starts on");
    const diff = diffDraft(policy, changed);
    assert.ok(diff.added.some((line) => line.includes("Consent starts on")));
    assert.ok(diff.removed.some((line) => line.includes("Consent starts off")));
    const report = renderChanges({ privacy: policy, safety }, { privacy: changed, safety });
    assert.match(report, /Consent starts on/);
    assert.match(report, /Consent starts off/);
    assert.equal(renderChanges({ privacy: policy, safety }, { privacy: policy, safety }).includes("No changes"), true);
  });

  it("blocks an unclassified dependency", () => {
    assert.deepEqual(unclassifiedDependencies(["expo", "some-new-sdk"]), ["some-new-sdk"]);
    const config = parseAppConfig(`
      name: "Demo",
      ios: { bundleIdentifier: "com.example.demo", infoPlist: { NSCameraUsageDescription: "Camera" } },
      android: { package: "com.example.demo", permissions: ["android.permission.CAMERA"] },
      plugins: ["expo-camera"],
    `);
    assert.equal(config.usageDescriptions[0]?.key, "NSCameraUsageDescription");
    assert.deepEqual(config.androidPermissions, ["android.permission.CAMERA"]);
    assert.deepEqual(parseEvents("| permission_allowed | When allowed. | permission |"), [
      { name: "permission_allowed", when: "When allowed.", properties: "permission" },
    ]);
    const tables = parseSchema("create table public.profiles (\n  id uuid primary key,\n  display_name text\n);\n");
    assert.deepEqual(tables, [{ name: "profiles", columns: ["id", "display_name"] }]);
  });
});
