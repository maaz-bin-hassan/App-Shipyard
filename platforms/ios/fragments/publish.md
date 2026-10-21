## Preconditions

- `.shipkit/state.json` exists and `platform` is `ios`.
- `platforms/ios/platform.json` `storeTargets` is `appstore` only.
- `docs/play-console-checklist.md` is the Play walkthrough. This platform has no Play build.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If the state file is missing, create it with `platform` null, `storeTargets` [], `kitVersion` from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `platform` is not `ios`, set `commands.publish.status` to `blocked` and stop. If `commands.publish.status` is `done` and `kitVersion` matches `package.json` `version`, report that publish already finished and stop. Otherwise record step `1` as `done`.
2. Set `commands.publish` and step `2` to `in_progress` and write the current UTC timestamp. `storeTargets` does not include `play`. Set step `2` and `commands.publish.status` to `blocked` and stop. Do not create an App Store record, upload a build, or open Play Console from this command.

## Rollback

Set `commands.publish.status` to `blocked` and timestamp it. Do not delete `.shipkit/state.json`. Do not change iOS signing assets.
