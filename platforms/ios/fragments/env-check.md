## Preconditions

- `.shipkit/state.json` exists and `platform` is `ios`.
- `platforms/ios/platform.json` `envChecks` name macOS (`darwin`), Xcode 26, Swift 6.2, and CocoaPods 1.17.0.
- The first check expects `darwin` from `node -p process.platform`. On Windows or Linux that check is `blocked`. Do not skip it and do not treat a missing Xcode install as a pass.
- Run every command from the repository root.
- This command only updates `.shipkit/state.json`. Application source is left untouched.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If `commands.env-check.status` is `done` and `kitVersion` matches `package.json` `version`, report that the check already passed and stop. Otherwise record step `1` as `done`.
2. Set `commands.env-check` and step `2` to `in_progress` and write the current UTC timestamp.
3. Detect the OS as `windows`, `macos`, or `linux`. For each object in `platforms/ios/platform.json` `envChecks`, in order, record step `3.1`, `3.2`, and so on. Apply the version rules in Verify. A `Minimum:` that does not start with a digit passes on `expected` alone. Do not skip the `darwin` check. Run `command`, read stdout and stderr together, and record `done` or `blocked`. For a blocked check, print `fail`, the command, and the `install` hint for this OS. Do not run the hint in this step. Write each timestamp, then set step `3` to `done` or `blocked`.
4. Set the command status to `done` when step `3` is `done`, otherwise `blocked`, and write the timestamp. If any check is `blocked`, ask whether to run the install hints. On Windows or Linux there is no local install that makes `darwin` pass. Run a hint only after an explicit yes, then repeat the failed checks once and write the new statuses.

## Rollback

Set `commands.env-check.status` to `blocked` and timestamp it. Do not uninstall tools. Leave application files untouched so the failed checks can be resumed. Do not record this command `done` on Windows or Linux.
