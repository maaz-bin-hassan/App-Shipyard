# Recording script

Three short demos. Record the terminal, keep the command and the process output, and do not trim lines out of a successful run. Git CRLF warnings on Windows can stay in the raw capture. When you feed a file to `website/content/transcript.json`, each entry needs `command`, `exitCode`, and `output`. `output` is the stdout and stderr the process wrote, in order. The file also needs `recordedAt` as an ISO-8601 UTC timestamp.

Do not type a secret, a keystore password, or a service-account JSON into the recording.

Replace the directory names if `demo-start` already exists. Run the kit commands from a clone whose `package.json` version is `1.2.0`.

## Demo 1: start

Shell, from the kit root:

```bash
pnpm install --frozen-lockfile
pnpm cli:build
node cli/dist/index.js ../demo-start --no-install --agent cursor --platform expo
```

Expected for the third command:

- Exit code 0.
- Eleven `cursor:` lines, one for each `ship-start`, `ship-env-check`, `ship-plan-pricing`, `ship-paywall`, `ship-analytics`, `ship-ai`, `ship-design`, `ship-translate`, `ship-legal`, `ship-publish`, and `ship-update`.
- `Initialized empty Git repository` unless git init fails because `user.name` is unset. If commit is skipped, the process still continues and the last lines are the next step. A missing git identity is a note, not a crash.
- These lines, with your path in place of `../demo-start`:

```text
Created ../demo-start

Dependencies were not installed (--no-install).

Next steps:
  cd ../demo-start
  Open this folder in Cursor and run /ship-start
```

Then, in Cursor, in `demo-start`, run `/ship-start`. The platform is already `expo`. Answer only:

```text
appName: Demo Start
applicationId: com.example.demostart
primaryColor: #6750A4
languages: en
storeTargets: play
```

Expected agent result when the Expo app was created by createshipyard: it reports that the template is already written and that the remaining inputs are the logo and `.env`.

Expected agent result when a toolchain check fails: it reports `commands.env-check.status` and `commands.start.status` as `blocked`, prints the install hint for this OS, and does not run an installer. Record that outcome as the demo if that is what the machine did. Do not cut the fail lines.

Confirm with:

```bash
node -e "const s=require('../demo-start/.shipkit/state.json'); console.log(s.platform, s.kitVersion, s.commands.start.status)"
```

Expected stdout is one line: `expo 1.2.0 done` or `expo 1.2.0 blocked`.

## Demo 2: paywall

From the kit root, record the unit test. This does not contact RevenueCat.

```bash
pnpm test:billing
```

Expected: exit code 0. The Node reporter prints a line `fail 0`.

In an app where `/ship-plan-pricing` has already been run and `answers.monetizationModel` is not `free`, run `/ship-paywall`.

When asked whether this run may create products in a live store console, answer:

```text
no
```

Expected:

- The agent does not open Play Console or App Store Connect.
- `answers.allowLiveStoreProducts` is `no`.
- The agent says a development build is required and that Expo Go does not complete the purchase.
- `commands.paywall.status` is `blocked` unless you actually complete a Test Store purchase and a restore on a development build.

If you do complete that purchase on camera, the expected words in the agent's report are that the gated feature rendered after the purchase and again after Restore purchases. Do not show an API key.

## Demo 3: publish

Use a scaffolded Expo app whose `storeTargets` includes `play`. Run `/ship-publish`.

Answer every gate with `no`:

```text
allowBuild: no
allowEasCredentials: no
allowCreatePlayApp: no
allowPlaySetup: no
allowInternalUpload: no
allowInternalPublish: no
allowServiceAccount: no
allowLaterSubmit: no
allowSupplySync: no
```

You can use placeholders for the other listing fields. Set `privacyPolicyReviewed` to `no`.

Expected:

- The agent does not run `eas build`, `eas submit`, or `fastlane supply`.
- The agent does not set a Play track to `production`, `beta`, or `alpha`.
- `commands.publish.status` is `blocked`.
- The transcript has no keystore password and no service-account JSON.

Say on camera that internal testing is as far as the command goes, and that a rollout needs those gates changed to `yes` plus your click in Play Console. Do not perform the click in this demo unless the recording is specifically of a real internal release you already intend to ship.

## transcript.json shape

```json
{
  "recordedAt": "2026-10-21T00:00:00.000Z",
  "entries": [
    {
      "command": "pnpm test:billing",
      "exitCode": 0,
      "output": "fail 0\n"
    }
  ]
}
```

Paste the real `output` from the process, including the lines above `fail 0`. Do not invent a line the command did not print. The site player shows `$` plus `command`, then `output`. The JSON above shows the keys, not a recording.
