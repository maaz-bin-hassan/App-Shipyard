import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const api = process.argv[2];
if (!/^[0-9]+$/.test(api ?? "")) {
  console.error("Usage: node scripts/android-sdk-platform.mjs <api-level>");
  process.exit(2);
}

const home = os.homedir();
const roots = [
  process.env.ANDROID_HOME,
  process.env.ANDROID_SDK_ROOT,
  path.join(home, "Library", "Android", "sdk"),
  path.join(home, "Android", "Sdk"),
];
if (process.env.LOCALAPPDATA) {
  roots.push(path.join(process.env.LOCALAPPDATA, "Android", "Sdk"));
}

const found = roots
  .filter(Boolean)
  .find((root) => existsSync(path.join(root, "platforms", `android-${api}`)));

if (!found) {
  console.log("missing");
  process.exit(1);
}

console.log(`android-sdk-${api}`);
