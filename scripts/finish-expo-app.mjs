import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseHex, solidLogoPng } from "./lib/solid-png.mjs";

const kitRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function finishExpoApp({ dest, appName, applicationId, primaryColor, kitVersion }) {
  const tokensPath = path.join(dest, "src", "theme", "tokens.ts");
  const tokens = await readFile(tokensPath, "utf8");
  const painted = tokens.replace('primary: "#111111"', `primary: "${primaryColor}"`);
  if (painted === tokens) throw new Error("Could not set color.primary in src/theme/tokens.ts");
  await writeFile(tokensPath, painted);

  await writeFile(
    path.join(dest, "src", "ui", "host.ts"),
    'export { Pressable, Text, View } from "react-native";\n',
  );

  await mkdir(path.join(dest, "assets"), { recursive: true });
  await writeFile(
    path.join(dest, "assets", "icon.png"),
    solidLogoPng(512, 512, parseHex(primaryColor), [255, 255, 255]),
  );

  await mkdir(path.join(dest, "docs"), { recursive: true });
  await writeFile(path.join(dest, "docs", "monetization.md"), monetization(appName), "utf8");

  const writer = path.join(kitRoot, "scripts", "write-expo-docs.mjs");
  const child = spawnSync(
    process.execPath,
    ["--experimental-strip-types", writer, dest, appName],
    { cwd: kitRoot, encoding: "utf8" },
  );
  if (child.status !== 0) {
    const detail = `${child.stderr ?? ""}${child.stdout ?? ""}`.trim();
    throw new Error(detail === "" ? "Could not write the legal and translation files" : detail);
  }

  const updatedAt = new Date().toISOString();
  const done = {
    status: "done",
    updatedAt,
    steps: { "1": { status: "done", updatedAt } },
  };
  await writeFile(
    path.join(dest, ".shipkit", "state.json"),
    `${JSON.stringify({
      platform: "expo",
      storeTargets: ["play", "appstore"],
      kitVersion,
      answers: {
        appName,
        applicationId,
        primaryColor,
        languages: ["en"],
        storeTargets: ["play", "appstore"],
        audience: "People who install the app",
        countryMix: ["United States"],
        appPurpose: `${appName} home, premium tools, and an AI proxy`,
        runCost: "hosting and AI",
        monetizationModel: "freemium",
        entitlementId: "premium",
        productIds: ["premium_monthly", "premium_annual"],
        premiumFeatures: ["Premium tools"],
        posthogHost: "https://us.i.posthog.com",
        modelAllowlist: "openai/gpt-4o-mini",
        dailyRequestLimit: 20,
        privacyContact: "",
        allowLiveStoreProducts: "no",
        aiSecretNamesSet: "no",
        sentryTokenNameSet: "no",
      },
      commands: {
        start: done,
        "plan-pricing": done,
        paywall: done,
        analytics: done,
        ai: done,
        design: done,
        translate: done,
        legal: done,
        publish: {
          status: "skipped",
          updatedAt,
          steps: {},
        },
      },
    }, null, 2)}\n`,
  );
}

function monetization(appName) {
  return `# Monetization

## Recommended model

Freemium. ${appName} has a home screen that stays free, and Premium tools that stay locked. Hosting and the AI proxy cost money after install, so the paid slice is a subscription. The free home is the useful core. The ongoing cost is why that slice is not a one-time product.

## Feature gating

| Feature | Free | Premium |
| --- | --- | --- |
| Home | Included | Included |
| Premium tools | Locked | Unlocked with the premium entitlement |

## Price points

These amounts are suggestions for the store console. The app reads each package's store price at runtime and does not hard-code them.

Primary market: United States. Monthly: $4.99. Annual: $39.99, which is less per month than the monthly plan.

## Regional pricing

Google Play can auto-fill other countries from a default price or take a price per country. Those console prices are not copied into the app. The App Store price is chosen from Apple's price points.

The country mix is the United States. That mix has no low-income or price-sensitive market, so there is no lower local price to suggest.

## Entitlement

\`premium\`

Store product ids: \`premium_monthly\` and \`premium_annual\`.
`;
}
