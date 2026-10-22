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
      assert.match(result.stdout, /Open this folder in Claude Code, Cursor, or OpenCode and run \/ship-start/);
      assert.match(result.stdout, /Dependencies were not installed \(--no-install\)/);

      const kitPackage = JSON.parse(await readFile(path.join(kitRoot, "package.json"), "utf8")) as { version: string };
      const state = JSON.parse(await readFile(path.join(dest, ".shipkit", "state.json"), "utf8"));
      assert.equal(state.platform, "expo");
      assert.equal(state.kitVersion, kitPackage.version);
      assert.equal(kitPackage.version, "1.1.0");
      assert.deepEqual(state.storeTargets, []);
      assert.deepEqual(state.answers, {});

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
      assert.match(agents, /\/ship-start/);
      const command = await readFile(path.join(dest, ".claude", "commands", "ship-start.md"), "utf8");
      assert.match(command, /platform: expo/);
      await readFile(path.join(dest, ".cursor", "commands", "ship-update.md"), "utf8");
      await readFile(path.join(dest, ".opencode", "commands", "ship-env-check.md"), "utf8");
      await readFile(path.join(dest, ".git", "HEAD"), "utf8");

      const version = JSON.parse(await readFile(path.join(dest, "docs", "kit", "version.json"), "utf8"));
      assert.equal(version.version, "1.1.0");
      const manifest = JSON.parse(await readFile(path.join(dest, "docs", "kit", "platform.json"), "utf8"));
      assert.equal(manifest.id, "expo");
      await readFile(path.join(dest, "scripts", "android-sdk-platform.mjs"), "utf8");
      await readFile(path.join(dest, "docs", "play-console-checklist.md"), "utf8");
      await readFile(path.join(dest, "backend", "supabase", "functions", "ai-proxy", "handler.ts"), "utf8");
      const plan = await run(process.execPath, [path.join(dest, "scripts", "plan-update.mjs")], dest);
      assert.equal(plan.code, 0, plan.stderr);
      const parsed = JSON.parse(plan.stdout);
      assert.equal(parsed.kitVersion, "1.1.0");
      assert.equal(parsed.latest, "1.1.0");
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
