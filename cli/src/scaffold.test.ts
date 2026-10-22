import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { findKitRoot } from "./project.js";

const cli = fileURLToPath(new URL("./index.js", import.meta.url));
const kitRoot = findKitRoot(path.dirname(cli));

describe("createshipyard scaffold", () => {
  it("copies the expo template, syncs commands, and records kit state", async () => {
    const parent = await mkdtemp(path.join(tmpdir(), "createshipyard-"));
    const dest = path.join(parent, "my-app");
    const agentsBefore = await readFile(path.join(kitRoot, "AGENTS.md"), "utf8");
    try {
      const result = await run(process.execPath, [cli, dest, "--agent", "all", "--no-install", "--platform", "expo"]);
      assert.equal(result.code, 0, `${result.stderr}\n${result.stdout}`);
      assert.match(result.stdout, /Replace assets\/icon.png with your logo/);
      assert.match(result.stdout, /Dependencies were not installed \(--no-install\)/);

      const kitPackage = JSON.parse(await readFile(path.join(kitRoot, "package.json"), "utf8")) as { version: string };
      const state = JSON.parse(await readFile(path.join(dest, ".shipkit", "state.json"), "utf8"));
      assert.equal(state.platform, "expo");
      assert.equal(state.kitVersion, kitPackage.version);
      assert.equal(kitPackage.version, "1.2.0");
      assert.deepEqual(state.storeTargets, ["play", "appstore"]);
      assert.equal(state.answers.appName, "my-app");
      assert.equal(state.answers.applicationId, "com.example.myapp");
      assert.equal(state.answers.monetizationModel, "freemium");
      assert.equal(state.answers.entitlementId, "premium");
      assert.deepEqual(state.answers.productIds, ["premium_monthly", "premium_annual"]);
      assert.equal(state.commands.start.status, "done");
      assert.equal(state.commands["plan-pricing"].status, "done");
      assert.equal(state.commands.paywall.status, "done");
      assert.equal(state.commands.legal.status, "done");
      assert.equal(state.commands.publish.status, "skipped");

      const readme = await readFile(path.join(dest, "README.md"), "utf8");
      assert.equal(readme.includes("{{appName}}"), false);
      assert.match(readme, /my-app/);
      assert.match(readme, /com\.example\.myapp/);
      assert.match(readme, /#6750A4/);

      const pkg = JSON.parse(await readFile(path.join(dest, "package.json"), "utf8"));
      assert.equal(pkg.name, "my-app");
      assert.equal(pkg.main, "index.ts");
      assert.equal(pkg.dependencies.expo, "~58.0.16");
      assert.equal("type" in pkg, false);

      const agents = await readFile(path.join(dest, "AGENTS.md"), "utf8");
      assert.match(agents, /Replace assets\/icon.png/);
      const billing = await readFile(path.join(dest, "src", "features", "billing", "billingConfig.ts"), "utf8");
      assert.match(billing, /entitlementId = "premium"/);
      const host = await readFile(path.join(dest, "src", "ui", "host.ts"), "utf8");
      assert.match(host, /react-native/);
      const monetization = await readFile(path.join(dest, "docs", "monetization.md"), "utf8");
      assert.match(monetization, /## Recommended model/);
      assert.match(monetization, /## Entitlement/);
      const privacy = await readFile(path.join(dest, "docs", "legal", "privacy-policy.md"), "utf8");
      assert.match(privacy, /not legal advice/);
      await readFile(path.join(dest, "docs", "legal", "data-safety-answers.md"), "utf8");
      await readFile(path.join(dest, "docs", "store", "listing-en.md"), "utf8");
      await readFile(path.join(dest, "docs", "i18n", "review-en.md"), "utf8");
      await readFile(path.join(dest, "assets", "icon.png"));
      await readFile(path.join(dest, "backend", "supabase", "functions", "ai-proxy", "handler.ts"), "utf8");
      const identity = await readFile(path.join(dest, "src", "app", "identity.ts"), "utf8");
      assert.equal(identity.includes("{{appName}}"), false);
      assert.match(identity, /my-app/);
      const command = await readFile(path.join(dest, ".claude", "commands", "ship-start.md"), "utf8");
      assert.match(command, /platform: expo/);
      await readFile(path.join(dest, ".cursor", "commands", "ship-update.md"), "utf8");
      await readFile(path.join(dest, ".opencode", "commands", "ship-env-check.md"), "utf8");
      await readFile(path.join(dest, ".git", "HEAD"), "utf8");

      const version = JSON.parse(await readFile(path.join(dest, "docs", "kit", "version.json"), "utf8"));
      assert.equal(version.version, "1.2.0");
      const manifest = JSON.parse(await readFile(path.join(dest, "docs", "kit", "platform.json"), "utf8"));
      assert.equal(manifest.id, "expo");
      await readFile(path.join(dest, "scripts", "android-sdk-platform.mjs"), "utf8");
      await readFile(path.join(dest, "docs", "play-console-checklist.md"), "utf8");
      await readFile(path.join(dest, "backend", "supabase", "functions", "ai-proxy", "handler.ts"), "utf8");
      const plan = await run(process.execPath, [path.join(dest, "scripts", "plan-update.mjs")], dest);
      assert.equal(plan.code, 0, plan.stderr);
      const parsed = JSON.parse(plan.stdout);
      assert.equal(parsed.kitVersion, "1.2.0");
      assert.equal(parsed.latest, "1.2.0");
      assert.deepEqual(parsed.migrations, []);
      assert.equal(parsed.rootKind, "app");

      assert.equal(await readFile(path.join(kitRoot, "AGENTS.md"), "utf8"), agentsBefore);
    } finally {
      await rm(parent, { recursive: true, force: true });
    }
  });
});

function run(command: string, args: string[], cwd = kitRoot): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}
