# Fresh-machine test

Follow this from a new clone. Each step has the command, the expected result, and what to do when the result is different. Stop at the first mismatch. Do not install a toolchain, create a store account, or publish a package unless that step says to.

A machine that already has this repository checked out can still run the script. Use a new directory so leftover `node_modules` and `.shipkit/` do not change the result.

## Before you start

| Need | How you know it is there |
| --- | --- |
| Git | `git --version` prints a version line and exits 0. |
| Node.js | `node --version` prints `v22` with minor 13 or newer, `v24` with minor 3 or newer, or an even major of 26 or newer. Odd majors fail the kit's Node rule. |
| pnpm 10 | `pnpm --version` prints `10` and something after it. CI uses pnpm 10. If the command is missing, run `corepack enable` and `corepack prepare pnpm@10 --activate`, or `npm install -g pnpm@10`. |
| Network | `pnpm install` and `expo export` download packages. |

JDK, Android SDK, Xcode, and CocoaPods are not required for the scaffold steps. They are required only for the env-check rows that name them. A missing tool there is a reported fail, not a failed test of this document, until you choose to install it.

## Checklist

| Step | Pass |
| --- | --- |
| 1. Clone | The directory contains `package.json` with `"version": "1.0.0"`. |
| 2. Install | `pnpm install --frozen-lockfile` exits 0. |
| 3. Command contract | The last line is `lint:commands ok`. |
| 4. Unit tests | The Node reporter prints `fail 0` and the process exits 0. |
| 5. Build the CLI | `cli/dist/index.js` exists. |
| 6. Scaffold | The process exits 0 and prints `Created` plus the `/ship-start` next step. |
| 7. Env-check | Every manifest check is pass, fail, or skipped. A fail names the install hint and does not run it. |
| 8. Start | `.shipkit/state.json` has `platform`, `storeTargets`, and the four identity answers, or the command is `blocked` because env-check is blocked. |
| 9. Plan pricing | `docs/monetization.md` has the five sections, or you have not run the agent yet and this row stays unchecked. |
| 10. Paywall | `pnpm test:billing` in the kit exits 0. A live purchase stays blocked without a development build and an explicit yes. |
| 11. Publish | The command stops before Play Console unless every gate you use is the exact string `yes`. Internal testing is the last stage. |

## 1. Clone

```bash
git clone https://github.com/maaz-bin-hassan/FastAppShip-kit.git
cd FastAppShip-kit
```

Expected: `package.json` contains `"name": "fastappshipkit"` and `"version": "1.0.0"`. `cli/package.json` and `website/package.json` also say `"version": "1.0.0"`.

If the clone fails, the GitHub URL is wrong or the network blocked it. This document cannot fix that.

## 2. Install

```bash
pnpm install --frozen-lockfile
```

Expected: exit code 0. `node_modules/typescript/package.json` exists.

If pnpm reports a lockfile mismatch, do not delete `pnpm-lock.yaml`. Stop and report the error.

## 3. Command contract

```bash
node scripts/lint-commands.mjs
```

Expected stdout:

```text
lint:commands ok
```

Expected exit code: 0. Any other line is a contract error. Do not continue.

## 4. Unit tests

```bash
pnpm test
```

Expected: exit code 0. Each Node reporter ends with `fail 0`. This runs the CLI scaffold test, the Supabase tests, and the Expo template tests named in the root `package.json` `test` script. On this machine the same scripts also run with `npm test` after dependencies are installed. CI installs with pnpm.

The scaffold test creates a temporary app and deletes it. It does not publish anything.

## 5. Build the CLI

```bash
pnpm cli:build
```

Expected: exit code 0. `cli/dist/index.js` exists and its first line is `#!/usr/bin/env node`.

Check the help text:

```bash
node cli/dist/index.js --help
```

Expected stdout:

```text
Usage: createshipyard <directory> [--agent claude|cursor|opencode|all] [--platform expo|flutter|android|ios] [--pm npm|pnpm|yarn] [--no-install]
```

Expected exit code: 0.

## 6. Scaffold

From the kit root, in a parent directory that is not inside the kit:

```bash
node cli/dist/index.js ../shipyard-fresh --no-install --agent cursor --platform expo
```

Use a directory name that does not already exist. `shipyard-fresh` is only an example.

Expected:

- Exit code 0.
- One `cursor: .cursor/commands/ship-<name>.md` line for each of `start`, `env-check`, `plan-pricing`, `paywall`, `analytics`, `ai`, `design`, `translate`, `legal`, `publish`, and `update`. On Windows the slashes may be backslashes.
- A line `Created` followed by the directory.
- `Dependencies were not installed (--no-install).`
- `Open this folder in Cursor and run /ship-start`.
- Git may print CRLF warnings on Windows. Those warnings do not fail the step.

Then confirm the app files:

```bash
node -e "const fs=require('fs'); const s=JSON.parse(fs.readFileSync('../shipyard-fresh/.shipkit/state.json','utf8')); if(s.platform!=='expo'||s.kitVersion!=='1.0.0') process.exit(1); JSON.parse(fs.readFileSync('../shipyard-fresh/docs/kit/platform.json','utf8'));"
```

Expected: exit code 0.

Also present:

- `../shipyard-fresh/docs/play-console-checklist.md`
- `../shipyard-fresh/docs/billing-setup.md`
- `../shipyard-fresh/scripts/android-sdk-platform.mjs`
- `../shipyard-fresh/backend/supabase/functions/ai-proxy/handler.ts`
- `../shipyard-fresh/README.md` contains the directory name and does not contain `{{appName}}`.

`../shipyard-fresh/package.json` has no `test:billing` script. Run billing tests in the kit, step 10.

## 7. Env-check

You can run the same commands the Expo manifest runs. From the kit root:

```bash
node --version
java -version
adb version
node scripts/android-sdk-platform.mjs 37
```

On macOS also run `xcodebuild -version` and `pod --version`. On Windows and Linux those two are skipped because their install hints start with `macOS only:`.

Expected for a pass: `node --version` matches the Node rule in [the env-check command](../commands/env-check/COMMAND.md), `java -version` reports a major of 17 or newer, `adb version` contains `Android Debug Bridge`, and the SDK script prints `android-sdk-37`.

Expected for a fail: the command exits non-zero or the expected text is missing. Write down the install hint from `platforms/expo/platform.json` for your OS. Do not run the hint unless you decide to. Saying no is a completed check: the command status is `blocked`, and `answers.runInstallHints` is `no`.

In the agent, open the scaffolded app and ask it to run `/ship-env-check`. Expected state in `.shipkit/state.json`:

- `commands.env-check.status` is `done` only when every check passed or was skipped.
- Otherwise it is `blocked`, and each failed check is named in the reply with that OS hint.
- The reply contains no `.env` values.

## 8. Start

In the scaffolded app, run `/ship-start`. `createshipyard` already set `platform` to `expo`, so the agent must not ask you to pick a platform again.

Answer this batch once:

| Id | Example |
| --- | --- |
| `appName` | `Shipyard Fresh` |
| `applicationId` | `com.example.shipyardfresh` |
| `primaryColor` | `#6750A4` |
| `languages` | `en` |
| `storeTargets` | `play` |

Expected when env-check is `done`:

- `commands.start.status` is `done`.
- `commands.auth.status` is `pending`.
- `storeTargets` is `["play"]`.
- The reply says auth is next and has no command yet.

Expected when env-check is `blocked`: `commands.start.status` is `blocked` and `commands.auth` is absent. That is the correct stop. Do not mark start done.

Running `/ship-start` a second time with the same `kitVersion` and a `done` status should report that start already finished and should not ask again.

## 9. Plan pricing

Run `/ship-plan-pricing` and answer once:

| Id | Example |
| --- | --- |
| `audience` | People tracking a single habit |
| `countryMix` | `United States` |
| `appPurpose` | Record one daily habit |
| `runCost` | `none` |

Expected:

- `docs/monetization.md` has level-2 headings Recommended model, Feature gating, Price points, Regional pricing, and Entitlement.
- Feature gating is a table with columns Feature, Free, and Premium, and at least one data row.
- `.shipkit/state.json` `answers` includes `monetizationModel`, `entitlementId`, `productIds`, and `premiumFeatures`.
- No Play Console page was opened.

## 10. Paywall

From the kit root, not the scaffolded app:

```bash
pnpm test:billing
```

Expected: exit code 0 and a reporter line `fail 0`.

In the app, run `/ship-paywall`. When asked if this run may create live store products, answer `no`.

Expected:

- `answers.allowLiveStoreProducts` is `no`.
- The command does not create a Play product or an App Store product.
- `commands.paywall.status` stays `blocked` when there is no development build to complete a Test Store purchase and a restore. That blocked status is the expected result on a fresh machine. Do not treat the kit's unit test as that purchase.

A `done` paywall also requires the purchase and the restore on a development build. Expo Go does not complete that purchase.

## 11. Publish to internal testing

Run `/ship-publish` in the scaffolded app only after `storeTargets` includes `play`. The agent asks the listing and gate questions once. For this test, answer every `allow*` gate with `no`, and leave `privacyPolicyUrl` as a URL you actually host or leave the policy review as `no`.

Expected without a Play Console account:

- The command does not run `eas build`, `eas submit`, or `fastlane supply`.
- It does not open a production track.
- `commands.publish.status` is `blocked` on the first stage whose gate is not `yes` or whose app is not a working release build.
- The reply contains no keystore, no service-account JSON, and no `.env` values.

Expected when you do have a Play Console account and you want the internal track:

1. Change only the gate you are about to use to the exact string `yes`, then run `/ship-publish` again.
2. You click in Play Console. The agent supplies the path and the values.
3. Stop at the internal testing track. Do not click Promote release and do not apply for production.
4. `commands.publish.status` is `done` only when the internal track shows the release rolled out and the pre-launch checks in `docs/play-console-checklist.md` passed.

The kit checkout itself is not a working Expo app. `/ship-publish` there stays `blocked` and must not call EAS. That is the expected result in the kit directory.

## npm package check

From the kit root:

```bash
npm run pack:npm
```

Expected: exit code 0 and a file `release/createshipyard-1.0.0.tgz`.

Install that tarball into an empty directory and run help:

```bash
mkdir ../shipyard-npm-check
cd ../shipyard-npm-check
npm install ../FastAppShip-kit/release/createshipyard-1.0.0.tgz
npx createshipyard --help
```

Expected: the same Usage line as step 5, and exit code 0.

This does not publish the package. `release/` is gitignored.

## Website build

The site is a separate npm install. From `website/`:

```bash
npm ci
npm run build
```

Expected: exit code 0. The postbuild script prints `checked` and a count of css/html files in `out/`. Set `NEXT_PUBLIC_SITE_URL` to the origin you will deploy before this build if the generated links should use that origin. Without it, metadata uses `http://localhost:3000` unless Vercel provides `VERCEL_PROJECT_PRODUCTION_URL` or `VERCEL_URL` at build time.

## What only you can do

These stay undone by this script:

- Publish `createshipyard` to npm, or remove the dry run from `.github/workflows/release.yml`.
- Create the Vercel project, set the Root Directory to `website`, set `NEXT_PUBLIC_SITE_URL`, and deploy.
- Tag a GitHub release.
- Post the drafts in [LAUNCH-POSTS.md](LAUNCH-POSTS.md).
- Record the three demos in [RECORDING.md](RECORDING.md) and replace `website/content/transcript.json` with the transcript you captured.
- Create a Play Console developer account, host the privacy policy at a public https URL, upload an Android App Bundle, and roll out an internal test.
- Create a Supabase project and set `OPENROUTER_API_KEY` if you want the live AI check.
- Create a RevenueCat project if you want a real Test Store purchase.
- Say yes to any step that spends money or sends a binary to a store.
