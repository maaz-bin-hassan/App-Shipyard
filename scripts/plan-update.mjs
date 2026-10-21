import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseSemver, planUpdate } from "./lib/update-plan.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  const plan = await buildPlan(root);
  console.log(`${JSON.stringify(plan, null, 2)}\n`);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

export async function buildPlan(projectRoot) {
  const pkg = await readJson(projectRoot, "package.json");
  const kit = pkg.name === "fastappshipkit";
  const state = await readJson(projectRoot, path.join(".shipkit", "state.json"));
  const kitVersion = state.kitVersion;
  if (!parseSemver(kitVersion)) {
    throw new Error("kitVersion in .shipkit/state.json must be major.minor.patch");
  }

  const packageVersion = kit
    ? pkg.version
    : (await readJson(projectRoot, path.join("docs", "kit", "version.json"))).version;
  const changelogRelative = kit ? "CHANGELOG.md" : "docs/kit/CHANGELOG.md";
  const changelog = await readText(projectRoot, changelogRelative);
  let migrationFilenames = [];
  try {
    migrationFilenames = await readdir(path.join(projectRoot, "docs", "migrations"));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }

  return {
    ...planUpdate({ kitVersion, packageVersion, changelog, migrationFilenames }),
    changelog: changelogRelative,
    rootKind: kit ? "kit" : "app",
  };
}

async function readText(projectRoot, relativePath) {
  try {
    return await readFile(path.join(projectRoot, relativePath), "utf8");
  } catch (error) {
    if (error.code === "ENOENT") throw new Error(`Missing ${relativePath.replaceAll("\\", "/")}`);
    throw new Error(`Cannot read ${relativePath.replaceAll("\\", "/")}`);
  }
}

async function readJson(projectRoot, relativePath) {
  const text = await readText(projectRoot, relativePath);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid JSON in ${relativePath.replaceAll("\\", "/")}`);
  }
}
