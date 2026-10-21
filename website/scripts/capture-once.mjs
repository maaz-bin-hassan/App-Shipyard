import { spawn } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(websiteRoot, "..");
const outFile = path.join(websiteRoot, "content", "transcript.json");

function run(command, args, cwd) {
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
    child.on("close", (code) => {
      resolve({
        command: [command, ...args].join(" "),
        cwd,
        exitCode: code,
        stdout,
        stderr,
      });
    });
  });
}

const parent = "C:\\shipyard-transcript";
await mkdir(parent, { recursive: true });
const destName = "demo-app";
const dest = path.join(parent, destName);
await rm(dest, { recursive: true, force: true });

const entries = [];
entries.push(await run(process.execPath, ["scripts/lint-commands.mjs"], repoRoot));
entries.push(await run(process.execPath, ["cli/dist/index.js", "--help"], repoRoot));
entries.push(
  await run(
    process.execPath,
    ["cli/dist/index.js", dest, "--no-install", "--agent", "cursor", "--platform", "expo"],
    repoRoot,
  ),
);

for (const entry of entries) {
  if (entry.exitCode !== 0) {
    console.error(JSON.stringify(entry, null, 2));
    process.exit(1);
  }
}

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(
  outFile,
  `${JSON.stringify(
    {
      recordedAt: new Date().toISOString(),
      node: process.version,
      note: "stdout and stderr are the process streams, unmodified. Commands ran in this order from the repository root.",
      entries: entries.map((entry) => ({
        command: entry.command,
        exitCode: entry.exitCode,
        stdout: entry.stdout,
        stderr: entry.stderr,
      })),
    },
    null,
    2,
  )}\n`,
  "utf8",
);

await rm(parent, { recursive: true, force: true });
console.log(`wrote ${outFile}`);
