import { existsSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function sdkRoots(env = process.env, home = os.homedir()) {
  const roots = [
    env.ANDROID_HOME,
    env.ANDROID_SDK_ROOT,
    path.join(home, "Library", "Android", "sdk"),
    path.join(home, "Android", "Sdk"),
  ];
  if (env.LOCALAPPDATA) {
    roots.push(path.join(env.LOCALAPPDATA, "Android", "Sdk"));
  }
  return roots.filter(Boolean);
}

export function installedApiLevels(roots) {
  const levels = new Set();
  for (const root of roots) {
    const dir = path.join(root, "platforms");
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      const match = /^android-(\d+)$/.exec(name);
      if (!match) continue;
      if (!existsSync(path.join(dir, name))) continue;
      levels.add(Number(match[1]));
    }
  }
  return [...levels].sort((left, right) => left - right);
}

// Prefer the requested platform, then the newest installed platform above it,
// then the newest installed platform. Onboarding uses the SDK that is present.
export function chooseApiLevel(installed, minimum) {
  if (installed.length === 0) return null;
  if (installed.includes(minimum)) return minimum;
  const newer = installed.filter((level) => level > minimum);
  if (newer.length > 0) return newer[newer.length - 1];
  return installed[installed.length - 1];
}

function main() {
  const api = process.argv[2];
  if (!/^[0-9]+$/.test(api ?? "")) {
    console.error("Usage: node scripts/android-sdk-platform.mjs <api-level>");
    process.exit(2);
  }

  const chosen = chooseApiLevel(installedApiLevels(sdkRoots()), Number(api));
  if (chosen == null) {
    console.log("missing");
    process.exit(1);
  }

  console.log(`android-sdk-${chosen}`);
}

const entry = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (entry && entry === path.resolve(fileURLToPath(import.meta.url))) {
  main();
}
