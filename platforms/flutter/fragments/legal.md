## Preconditions

- `.shipkit/state.json` exists and `platform` is `flutter`.
- `platforms/flutter/platform.json` `permissionsFile` is `android/app/src/main/AndroidManifest.xml`.
- The Flutter template is still a stub. That manifest is not in the template.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If the state file is missing, create it with `platform` null, `storeTargets` [], `kitVersion` from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `platform` is not `flutter`, set `commands.legal.status` to `blocked` and stop. If `commands.legal.status` is `done` and `kitVersion` matches `package.json` `version`, report that the legal draft already finished and stop. Otherwise record step `1` as `done`.
2. Set `commands.legal` and step `2` to `in_progress` and write the current UTC timestamp. Write `answers.privacyContact`. Do not write `docs/legal` from the Expo template and present it as the Flutter app's policy. The Expo draft reads `platforms/expo/template/app.config.ts` and `platforms/expo/template/package.json`. This stub has neither an Android manifest nor a package file. Record step `2` as `blocked`, set `commands.legal.status` to `blocked`, and stop.

## Rollback

Set `commands.legal.status` to `blocked` and timestamp it. Do not delete `.shipkit/state.json`. Do not add a Flutter package as part of rolling back.
