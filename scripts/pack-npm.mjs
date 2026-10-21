import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stage = path.join(root, "release", "createshipyard");
const tarballDir = path.join(root, "release");

const kit = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
const cli = JSON.parse(await readFile(path.join(root, "cli", "package.json"), "utf8"));
if (kit.version !== cli.version) {
  console.error(`Version mismatch: package.json is ${kit.version} and cli/package.json is ${cli.version}.`);
  process.exit(1);
}

const tsc = path.join(root, "node_modules", "typescript", "bin", "tsc");
await run(process.execPath, [tsc, "-p", "cli/tsconfig.json"], root, false);

await rm(stage, { recursive: true, force: true });
await mkdir(stage, { recursive: true });

const copies = [
  ["cli/dist", "dist"],
  ["platforms", "platforms"],
  ["commands", "commands"],
  ["scripts", "scripts"],
  ["backend", "backend"],
  ["docs", "docs"],
  ["CHANGELOG.md", "CHANGELOG.md"],
  ["LICENSE", "LICENSE"],
  ["README.md", "README.md"],
];

for (const [from, to] of copies) {
  await cp(path.join(root, from), path.join(stage, to), {
    recursive: true,
    filter(source) {
      const base = path.basename(source);
      if (base === "node_modules" || base === ".git" || base === ".temp" || base === ".branches") return false;
      if (base === ".env" || (base.startsWith(".env.") && base !== ".env.example")) return false;
      return true;
    },
  });
}

const packed = {
  name: "createshipyard",
  version: cli.version,
  description: "Scaffold an App Shipyard mobile app and compile its slash commands.",
  license: "MIT",
  type: "module",
  author: "Maaz Bin Hassan",
  bin: { createshipyard: "./dist/index.js" },
  files: ["dist", "platforms", "commands", "scripts", "backend", "docs", "CHANGELOG.md", "LICENSE", "README.md"],
  engines: { node: ">=20" },
  repository: {
    type: "git",
    url: "git+https://github.com/maaz-bin-hassan/FastAppShip-kit.git",
  },
  bugs: { url: "https://github.com/maaz-bin-hassan/FastAppShip-kit/issues" },
  homepage: "https://github.com/maaz-bin-hassan/FastAppShip-kit#readme",
  keywords: ["expo", "react-native", "mobile", "scaffold", "fastappshipkit"],
};

await writeFile(path.join(stage, "package.json"), `${JSON.stringify(packed, null, 2)}\n`, "utf8");
const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";
await run(npmBin, ["pack", "--pack-destination", tarballDir], stage, process.platform === "win32");
console.log(`release/createshipyard-${cli.version}.tgz`);

function quoteArg(value) {
  if (!/[\s"]/.test(value)) return value;
  return `"${value.replaceAll('"', "")}"`;
}

function run(command, args, cwd, useShell) {
  return new Promise((resolve, reject) => {
    const child = useShell
      ? spawn([command, ...args.map(quoteArg)].join(" "), { cwd, stdio: "inherit", windowsHide: true, shell: true })
      : spawn(command, args, { cwd, stdio: "inherit", windowsHide: true });
    child.on("error", (error) => reject(error));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code ?? "null"}`));
    });
  });
}
