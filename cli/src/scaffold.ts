import { spawn } from "node:child_process";
import { mkdir, readdir, lstat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CliOptions } from "./args.js";
import {
  DEFAULT_PRIMARY_COLOR,
  applicationIdFor,
  compilerAgents,
  findKitRoot,
  isInsideKit,
  nextStepSentence,
  platformHostError,
} from "./project.js";

export async function runScaffold(options: CliOptions): Promise<void> {
  const kitRoot = findKitRoot(path.dirname(fileURLToPath(import.meta.url)));
  const hostError = platformHostError(options.platform, process.platform);
  if (hostError) throw new Error(hostError);

  const dest = path.resolve(options.directory);
  if (isInsideKit(dest, kitRoot)) {
    throw new Error(`Refusing to scaffold inside the kit checkout: ${dest}`);
  }
  await ensureDestination(dest);

  const appName = path.basename(dest);
  const nextStep = nextStepSentence(options.agent);
  const syncScript = path.join(kitRoot, "scripts", "sync-project.mjs");
  await runChecked(process.execPath, [
    syncScript,
    "--dest",
    dest,
    "--platform",
    options.platform,
    "--agents",
    compilerAgents(options.agent).join(","),
    "--app-name",
    appName,
    "--application-id",
    applicationIdFor(appName),
    "--primary-color",
    DEFAULT_PRIMARY_COLOR,
    "--next-step",
    nextStep,
  ], kitRoot);

  await runChecked("git", ["init", "-b", "main"], dest);
  await runChecked("git", ["add", "-A"], dest);
  const commit = await runCaptured("git", ["commit", "-m", "Initial commit from createshipyard"], dest);
  if (commit.code !== 0) {
    console.error("git commit skipped. The repository is initialized; set user.name and user.email, then commit.");
  }

  const packageJson = path.join(dest, "package.json");
  let installed = false;
  try {
    await lstat(packageJson);
    installed = true;
  } catch {
    installed = false;
  }

  if (options.install && installed) {
    await installDependencies(options.packageManager, dest);
  }

  const relative = path.relative(process.cwd(), dest);
  const shown = relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative) ? relative : dest;
  console.log(`Created ${shown}`);
  console.log("");
  if (!options.install) {
    console.log("Dependencies were not installed (--no-install).");
    console.log("");
  } else if (!installed) {
    console.log("This platform template has no package.json, so no dependencies were installed.");
    console.log("");
  }
  console.log("Next steps:");
  console.log(`  cd ${shown}`);
  console.log(`  ${nextStep}`);
}

async function ensureDestination(dest: string): Promise<void> {
  try {
    const stat = await lstat(dest);
    if (!stat.isDirectory()) throw new Error(`${dest} is not a directory`);
    const entries = await readdir(dest);
    if (entries.length > 0) throw new Error(`${dest} is not empty`);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") throw error;
    await mkdir(dest, { recursive: true });
  }
}

async function installDependencies(packageManager: CliOptions["packageManager"], cwd: string): Promise<void> {
  const args = packageManager === "npm" ? ["install", "--no-fund", "--no-audit"] : ["install"];
  if (process.platform === "win32") {
    // spawn of npm.cmd without a shell fails. One command string avoids Node's shell-args warning.
    await runChecked([packageManager, ...args].join(" "), [], cwd, true);
    return;
  }
  await runChecked(packageManager, args, cwd, false);
}

function runChecked(command: string, args: string[], cwd: string, shell = false): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      windowsHide: true,
      shell,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    child.on("error", (error) => {
      reject(new Error(`Could not run ${command}: ${error.message}`));
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code ?? "null"}`));
    });
  });
}

function runCaptured(command: string, args: string[], cwd: string): Promise<{ code: number | null }> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      cwd,
      stdio: "ignore",
      windowsHide: true,
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    });
    child.on("error", () => resolve({ code: 1 }));
    child.on("close", (code) => resolve({ code }));
  });
}
