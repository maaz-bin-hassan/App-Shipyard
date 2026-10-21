## Preconditions

- `.shipkit/state.json` exists and `platform` is `ios`.
- `platforms/ios/platform.json` `stringsFormat` is `xcstrings`.
- The iOS template is still a stub. It has no string catalog.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If the state file is missing, create it with `platform` null, `storeTargets` [], `kitVersion` from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `platform` is not `ios`, set `commands.translate.status` to `blocked` and stop. If `commands.translate.status` is `done` and `kitVersion` matches `package.json` `version`, report that translate already finished and stop. Otherwise record step `1` as `done`.
2. Set `commands.translate` and step `2` to `in_progress` and write the current UTC timestamp. Do not invent an `.xcstrings` catalog in the stub, and do not copy the Expo JSON catalogs into a Swift app. The tested catalogs are `platforms/expo/template/src/i18n`. Record step `2` as `blocked`, set `commands.translate.status` to `blocked`, and stop.

## Rollback

Set `commands.translate.status` to `blocked` and timestamp it. Do not delete `.shipkit/state.json`.
