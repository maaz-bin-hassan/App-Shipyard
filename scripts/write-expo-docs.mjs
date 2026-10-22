import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.resolve(process.argv[2] ?? "");
const appName = process.argv[3] ?? "";

if (dest === "" || appName.trim() === "") {
  console.error("Usage: node --experimental-strip-types scripts/write-expo-docs.mjs <dest> <appName>");
  process.exit(1);
}

const template = path.join(kitRoot, "platforms", "expo", "template", "src");
const { loadLegalInputs } = await import(pathToFileURL(path.join(template, "legal", "evidence.ts")).href);
const { renderChanges, renderDataSafety, renderPrivacyPolicy } = await import(
  pathToFileURL(path.join(template, "legal", "render.ts")).href,
);
const { en } = await import(pathToFileURL(path.join(template, "i18n", "translate.ts")).href);
const { renderNativeReview } = await import(pathToFileURL(path.join(template, "i18n", "review.ts")).href);
const { renderStoreListing } = await import(pathToFileURL(path.join(template, "i18n", "storeListing.ts")).href);

const evidence = loadLegalInputs(dest);
if (evidence.unclassified.length > 0) {
  throw new Error(`Unclassified dependencies: ${evidence.unclassified.join(", ")}`);
}

const privacy = renderPrivacyPolicy(evidence, { privacyContact: "" });
const safety = renderDataSafety(evidence);
const changes = renderChanges(null);
await mkdir(path.join(dest, "docs", "legal"), { recursive: true });
await writeFile(path.join(dest, "docs", "legal", "privacy-policy.md"), ensureTrailingNewline(privacy));
await writeFile(path.join(dest, "docs", "legal", "data-safety-answers.md"), ensureTrailingNewline(safety));
await writeFile(path.join(dest, "docs", "legal", "changes.md"), ensureTrailingNewline(changes));

await mkdir(path.join(dest, "docs", "i18n"), { recursive: true });
await writeFile(
  path.join(dest, "docs", "i18n", "review-en.md"),
  ensureTrailingNewline(renderNativeReview("en", en, en)),
);

const shortDescription = `${appName} has a free home screen and an optional premium plan.`;
const fullDescription = [
  `${appName} is ready to run once you add a logo and the public keys in .env.`,
  "The home screen uses the theme tokens.",
  "Premium tools stay locked until a store purchase unlocks them.",
  "Plan prices are read from the store at runtime.",
  "AI calls go through the Supabase proxy in backend/.",
  "Analytics and crash reports stay off until the settings switch is on.",
  "English strings live in the locale catalog.",
].join(" ");

await mkdir(path.join(dest, "docs", "store"), { recursive: true });
await writeFile(
  path.join(dest, "docs", "store", "listing-en.md"),
  ensureTrailingNewline(
    renderStoreListing({
      language: "en",
      appName,
      shortDescription,
      fullDescription,
      subtitle: appName.slice(0, 30),
      storeTargets: ["play", "appstore"],
    }),
  ),
);

function ensureTrailingNewline(text) {
  return text.endsWith("\n") ? text : `${text}\n`;
}
