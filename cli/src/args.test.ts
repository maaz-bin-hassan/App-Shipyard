import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCli } from "./args.js";
import { applicationIdFor, isInsideKit, nextStepSentence, platformHostError } from "./project.js";

describe("createshipyard args", () => {
  it("defaults to flutter, claude, and npm install", () => {
    const parsed = parseCli(["my-app"]);
    assert.equal(parsed.ok, true);
    if (!parsed.ok || parsed.help) return;
    assert.equal(parsed.options.directory, "my-app");
    assert.equal(parsed.options.agent, "claude");
    assert.equal(parsed.options.platform, "flutter");
    assert.equal(parsed.options.packageManager, "npm");
    assert.equal(parsed.options.install, true);
  });

  it("accepts the documented flags", () => {
    const parsed = parseCli(["apps/my-app", "--agent", "all", "--platform", "flutter", "--pm", "pnpm", "--no-install"]);
    assert.equal(parsed.ok, true);
    if (!parsed.ok || parsed.help) return;
    assert.equal(parsed.options.agent, "all");
    assert.equal(parsed.options.platform, "flutter");
    assert.equal(parsed.options.packageManager, "pnpm");
    assert.equal(parsed.options.install, false);
  });

  it("rejects an unknown agent, a missing directory, and an invalid name", () => {
    assert.equal(parseCli(["my-app", "--agent", "codex"]).ok, false);
    assert.equal(parseCli([]).ok, false);
    assert.equal(parseCli(["My App"]).ok, false);
  });

  it("builds the application id and the Claude Code next step", () => {
    assert.equal(applicationIdFor("my-app"), "com.example.myapp");
    assert.match(nextStepSentence("expo"), /assets\/icon.png/);
    assert.match(nextStepSentence("flutter"), /--platform expo/);
    assert.equal(platformHostError("ios", "win32"), "iOS native requires macOS and Xcode. Choose expo, flutter, or android on this machine.");
    assert.equal(platformHostError("expo", "win32"), null);
    assert.equal(isInsideKit("/tmp/kit/cli", "/tmp/kit"), true);
    assert.equal(isInsideKit("/tmp/other", "/tmp/kit"), false);
  });
});
