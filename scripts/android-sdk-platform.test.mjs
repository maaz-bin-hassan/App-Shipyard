import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { chooseApiLevel, installedApiLevels } from "./android-sdk-platform.mjs";

describe("android sdk platform", () => {
  it("uses the requested platform when it is installed", () => {
    assert.equal(chooseApiLevel([36, 37, 38], 37), 37);
  });

  it("uses the newest installed platform above the minimum", () => {
    assert.equal(chooseApiLevel([36, 38, 40], 37), 40);
  });

  it("uses the newest installed platform when the requested level is absent", () => {
    assert.equal(chooseApiLevel([34, 36], 37), 36);
    assert.equal(chooseApiLevel([], 37), null);
  });

  it("reads android-N directories from every SDK root", () => {
    const root = mkdtempSync(path.join(os.tmpdir(), "android-sdk-"));
    const other = mkdtempSync(path.join(os.tmpdir(), "android-sdk-"));
    try {
      mkdirSync(path.join(root, "platforms", "android-36"), { recursive: true });
      mkdirSync(path.join(other, "platforms", "android-38"), { recursive: true });
      mkdirSync(path.join(other, "platforms", "not-a-platform"), { recursive: true });
      assert.deepEqual(installedApiLevels([root, other, path.join(root, "missing")]), [36, 38]);
    } finally {
      rmSync(root, { recursive: true, force: true });
      rmSync(other, { recursive: true, force: true });
    }
  });
});
