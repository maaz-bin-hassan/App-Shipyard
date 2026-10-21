## Preconditions

- `.shipkit/state.json` exists and `platform` is `flutter`.
- The Flutter template is still a stub. It has no `src/theme` tokens and no screen components.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If the state file is missing, create it with `platform` null, `storeTargets` [], `kitVersion` from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `platform` is not `flutter`, set `commands.design.status` to `blocked` and stop. If `commands.design.status` is `done` and `kitVersion` matches `package.json` `version`, report that design already finished and stop. Otherwise record step `1` as `done`.
2. Set `commands.design` and step `2` to `in_progress` and write the current UTC timestamp. Write `answers.sourceKind`, `answers.sourcePaths`, and `answers.confirmedData`. Do not copy the Expo screen builder into a Flutter app. The tested builder is `platforms/expo/template/src/design/buildScreen.ts`. Record step `2` as `blocked`, set `commands.design.status` to `blocked`, and stop.

## Rollback

Set `commands.design.status` to `blocked` and timestamp it. Do not delete `.shipkit/state.json`. Do not add a Flutter package as part of rolling back.
