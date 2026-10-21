## Preconditions

- `.shipkit/state.json` exists and `platform` is `ios`.
- `storeTargets` is `appstore`.
- `platforms/ios/platform.json` `permissionsFile` is `App/Info.plist`.
- The iOS template is still a stub. That property list is not in the template.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If the state file is missing, create it with `platform` null, `storeTargets` [], `kitVersion` from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `platform` is not `ios`, set `commands.legal.status` to `blocked` and stop. If `commands.legal.status` is `done` and `kitVersion` matches `package.json` `version`, report that the legal draft already finished and stop. Otherwise record step `1` as `done`.
2. Set `commands.legal` and step `2` to `in_progress` and write the current UTC timestamp. Write `answers.privacyContact`. Do not write `docs/legal` from the Expo template and present it as this app's policy. The stub has no `Info.plist` and no app package of SDK dependencies. Record step `2` as `blocked`, set `commands.legal.status` to `blocked`, and stop.

## Rollback

Set `commands.legal.status` to `blocked` and timestamp it. Do not delete `.shipkit/state.json`.
