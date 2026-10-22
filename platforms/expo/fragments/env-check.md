## Preconditions

- `.shipkit/state.json` exists and `platform` is `expo`.
- The manifest is `platforms/expo/platform.json` in this repository. In an app created by `createshipyard`, it is `docs/kit/platform.json`. Use the first of those that exists.
- That manifest's `envChecks` name Node.js, JDK 17, Android SDK Platform-Tools, an installed Android SDK platform (the manifest names Platform 37), Xcode 26.4, and CocoaPods 1.17.0.
- Xcode and CocoaPods are macOS-only checks. Their Windows and Linux hints start with `macOS only:`.
- Run every command from the repository root.
- This command only updates `.shipkit/state.json`. Application source is left untouched.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If `commands.env-check.status` is `done` and `kitVersion` matches `package.json` `version`, report that the check already passed and stop. Otherwise record step `1` as `done`.
2. Set `commands.env-check` and step `2` to `in_progress` and write the current UTC timestamp.
3. Detect the OS as `windows`, `macos`, or `linux`. For each object in the manifest from Preconditions `envChecks`, in order, record step `3.1`, `3.2`, and so on. Apply the version rules in Verify. `node --version` uses the Node.js rule, not a single floor of 22.13.0. A `Minimum:` that does not start with a digit passes on `expected` alone, except `node scripts/android-sdk-platform.mjs`, which passes when it prints `android-sdk-` plus any installed API level. When the OS is not `macos` and both `install.windows` and `install.linux` start with `macOS only:`, record that check `skipped`. Otherwise run `command`, read stdout and stderr together, and record `done` or `blocked`. For a blocked check, print `fail`, the command, and the `install` hint for this OS. Do not run the hint in this step. Write each timestamp, then set step `3` to `done` or `blocked`.
4. Set the command status to `done` when step `3` is `done`, otherwise `blocked`, and write the timestamp. If any check is `blocked` and `answers.runInstallHints` is missing, ask once whether to run the install hints and record `yes` or `no`. Do not ask when that answer is already set. When it is `yes`, run each failed hint once, then repeat those checks and write the new statuses. When it is `no`, leave the command `blocked`. A hint that starts with `macOS only:` is not an installer.

## Rollback

Set `commands.env-check.status` to `blocked` and timestamp it. Do not uninstall tools. Leave application files untouched so the failed checks can be resumed.
