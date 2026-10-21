import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareSemver, migrationsToApply, planUpdate, resolveLatest } from "./update-plan.mjs";

describe("update plan", () => {
  it("compares numeric semver rather than text", () => {
    assert.equal(compareSemver("0.0.9", "0.0.10"), -1);
    assert.equal(compareSemver("0.10.0", "0.9.0"), 1);
    assert.equal(compareSemver("1.2.3", "1.2.3"), 0);
  });

  it("ignores Unreleased and takes the highest changelog version", () => {
    const changelog = "## [Unreleased]\n\n### Added\n\n- notes\n\n## [0.1.0] - 2026-10-21\n\n## [0.0.1] - 2026-01-01\n";
    assert.equal(resolveLatest("0.0.0", changelog), "0.1.0");
    assert.equal(resolveLatest("0.2.0", changelog), "0.2.0");
  });

  it("lists only migration guides between the recorded version and the latest", () => {
    const names = ["README.md", "0.1.0.md", "0.2.0.md", "notes.md", "1.0.md"];
    assert.deepEqual(migrationsToApply("0.0.0", "0.1.0", names), ["0.1.0"]);
    assert.deepEqual(migrationsToApply("0.1.0", "0.1.0", names), []);
    assert.deepEqual(migrationsToApply("0.0.0", "0.2.0", names), ["0.1.0", "0.2.0"]);
  });

  it("does not downgrade a recorded version that is already newer", () => {
    const plan = planUpdate({
      kitVersion: "0.3.0",
      packageVersion: "0.1.0",
      changelog: "## [Unreleased]\n",
      migrationFilenames: ["0.1.0.md"],
    });
    assert.equal(plan.ahead, true);
    assert.deepEqual(plan.migrations, []);
    assert.equal(plan.latest, "0.1.0");
  });
});
