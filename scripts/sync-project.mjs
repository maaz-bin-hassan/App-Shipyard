import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { finishExpoApp } from "./finish-expo-app.mjs";
import { compileProject } from "./lib/compile-project.mjs";
import { EXPO_DEV_DEPENDENCIES, EXPO_SDK_VERSIONS } from "./lib/expo-versions.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const { values } = parseArgs({
  options: {
    dest: { type: "string" },
    platform: { type: "string" },
    agents: { type: "string" },
    "app-name": { type: "string" },
    "application-id": { type: "string" },
    "primary-color": { type: "string" },
    "next-step": { type: "string" },
  },
});

if (!values.dest || !values.platform || !values.agents || !values["app-name"] || !values["application-id"] || !values["primary-color"] || !values["next-step"]) {
  console.error("Usage: node scripts/sync-project.mjs --dest <dir> --platform <id> --agents <ids> --app-name <name> --application-id <id> --primary-color <#hex> --next-step <sentence>");
  process.exit(1);
}

try {
  await syncProject({
    dest: path.resolve(values.dest),
    platform: values.platform,
    agents: values.agents.split(",").map((agent) => agent.trim()).filter(Boolean),
    appName: values["app-name"],
    applicationId: values["application-id"],
    primaryColor: values["primary-color"],
    nextStep: values["next-step"],
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

export async function syncProject({ dest, platform, agents, appName, applicationId, primaryColor, nextStep }) {
  const manifestPath = path.join(kitRoot, "platforms", platform, "platform.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const templateDir = path.resolve(kitRoot, manifest.templateDir);
  const copied = await copyTree(templateDir, dest);
  await replacePlaceholders(copied, { appName, applicationId, primaryColor });

  if (platform === "expo") {
    await pinExpoPackage(path.join(dest, "package.json"));
  }

  const kitPackage = JSON.parse(await readFile(path.join(kitRoot, "package.json"), "utf8"));
  await mkdir(path.join(dest, ".shipkit"), { recursive: true });
  await writeFile(
    path.join(dest, ".shipkit", "state.json"),
    `${JSON.stringify({
      platform,
      storeTargets: [],
      kitVersion: kitPackage.version,
      answers: {},
      commands: {},
    }, null, 2)}\n`,
    "utf8",
  );

  await writeFile(path.join(dest, "AGENTS.md"), projectAgents(platform, nextStep), "utf8");
  await writeFile(path.join(dest, ".gitignore"), projectGitignore(), "utf8");

  await mkdir(path.join(dest, "docs", "kit"), { recursive: true });
  await copyFile(path.join(kitRoot, "CHANGELOG.md"), path.join(dest, "docs", "kit", "CHANGELOG.md"));
  await writeFile(
    path.join(dest, "docs", "kit", "version.json"),
    `${JSON.stringify({ version: kitPackage.version }, null, 2)}\n`,
    "utf8",
  );

  await mkdir(path.join(dest, "docs", "migrations"), { recursive: true });
  await copyMigrations(path.join(kitRoot, "docs", "migrations"), path.join(dest, "docs", "migrations"));

  await mkdir(path.join(dest, "scripts", "lib"), { recursive: true });
  await copyFile(path.join(kitRoot, "scripts", "plan-update.mjs"), path.join(dest, "scripts", "plan-update.mjs"));
  await copyFile(path.join(kitRoot, "scripts", "lib", "update-plan.mjs"), path.join(dest, "scripts", "lib", "update-plan.mjs"));

  await copyFile(manifestPath, path.join(dest, "docs", "kit", "platform.json"));
  await copyFile(
    path.join(kitRoot, "scripts", "android-sdk-platform.mjs"),
    path.join(dest, "scripts", "android-sdk-platform.mjs"),
  );
  for (const name of ["billing-setup.md", "play-console-checklist.md", "analytics-setup.md", "backend.md", "events.md"]) {
    await copyFile(path.join(kitRoot, "docs", name), path.join(dest, "docs", name));
  }
  await copyTree(path.join(kitRoot, "backend"), path.join(dest, "backend"));

  await compileProject({
    sourceRoot: kitRoot,
    outRoot: dest,
    platformId: platform,
    agents,
  });

  if (platform === "expo") {
    await finishExpoApp({
      dest,
      appName,
      applicationId,
      primaryColor,
      kitVersion: kitPackage.version,
    });
  }
}

async function copyTree(source, dest) {
  const copied = [];
  await mkdir(dest, { recursive: true });
  const entries = await readdir(source, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".temp" || entry.name === ".branches") continue;
    if (entry.name === ".env" || (entry.name.startsWith(".env.") && entry.name !== ".env.example")) continue;
    const from = path.join(source, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copied.push(...await copyTree(from, to));
    } else if (entry.isFile()) {
      await copyFile(from, to);
      copied.push(to);
    }
  }
  return copied;
}

async function replacePlaceholders(files, values) {
  const pairs = [
    ["{{appName}}", values.appName],
    ["{{applicationId}}", values.applicationId],
    ["{{primaryColor}}", values.primaryColor],
  ];
  for (const file of files) {
    const buffer = await readFile(file);
    if (buffer.includes(0)) continue;
    let text = buffer.toString("utf8");
    let changed = false;
    for (const [token, value] of pairs) {
      if (text.includes(token)) {
        text = text.replaceAll(token, value);
        changed = true;
      }
    }
    if (changed) await writeFile(file, text, "utf8");
  }
}

async function pinExpoPackage(packagePath) {
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));
  delete pkg.type;
  pkg.main = "index.ts";
  pkg.scripts = {
    ...(pkg.scripts ?? {}),
    start: "expo start",
    typecheck: "tsc --noEmit",
    "export:android": "expo export --platform android",
  };
  pkg.dependencies = { ...(pkg.dependencies ?? {}) };
  for (const name of Object.keys(pkg.dependencies)) {
    const pinned = EXPO_SDK_VERSIONS[name];
    if (!pinned) {
      throw new Error(`No Expo SDK 58 pin for dependency ${name}`);
    }
    pkg.dependencies[name] = pinned;
  }
  pkg.devDependencies = {
    ...(pkg.devDependencies ?? {}),
    ...EXPO_DEV_DEPENDENCIES,
  };
  await writeFile(packagePath, `${JSON.stringify(pkg, null, 2)}\n`, "utf8");
}

async function copyMigrations(source, dest) {
  let entries = [];
  try {
    entries = await readdir(source, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    await copyFile(path.join(source, entry.name), path.join(dest, entry.name));
  }
}

function projectAgents(platform, nextStep) {
  return `# AGENTS.md

This app was created with App Shipyard (\`createshipyard\`). The selected platform is \`${platform}\`. Recorded state is \`.shipkit/state.json\`.

Kit release notes for this checkout are \`docs/kit/CHANGELOG.md\`. The synced kit version is \`docs/kit/version.json\`. Migration guides are \`docs/migrations/<version>.md\`.

## Next command

${nextStep}.

## Rules

1. Skip a step already marked \`done\` for the current \`kitVersion\`.
2. Ask every question in Ask once, then reuse \`.shipkit/state.json\` \`answers\`.
3. Do not mark a step \`done\` without checking its result.
4. Keep secrets in \`.env\` and do not print them.
5. Stop and wait for an explicit yes before spending money or publishing.
6. Edit only the files the current step names. A migration may edit only the paths its guide names.

<!-- fastappshipkit:agent-commands:start -->
<!-- fastappshipkit:agent-commands:end -->
`;
}

function projectGitignore() {
  return `node_modules/
.expo/
dist/
web-build/
.shipkit/
.env
.env.*
!.env.example
*.jks
*.keystore
*.p8
*.p12
*.key
*.pem
*.mobileprovision
`;
}
