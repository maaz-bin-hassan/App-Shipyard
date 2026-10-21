## Preconditions

- Ask has selected a platform, or `.shipkit/state.json` already has one.
- This fragment runs when that platform is `ios` and `node -p process.platform` prints `darwin`.
- On Windows or Linux, Ask refuses `ios` and offers Flutter, React Native (Expo), and Android native. Do not begin these steps for `ios` on those systems.
- `platforms/ios/platform.json` exists. The only store target is `appstore`.
- `platforms/ios/template/README.md` is the stub template.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json`. If it is missing, create it with `platform` null, `storeTargets` [], `kitVersion` copied from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `commands.start.status` is `done` and `kitVersion` matches `package.json` `version`, report that start already finished and stop. Otherwise record step `1` as `done`.
2. Let `<id>` be the platform from Ask, or the saved `platform` when that question was skipped. If `<id>` is not `ios`, do not write `ios`. Run `npm run compile -- --platform <id>` and follow `platforms/<id>/fragments/start.md` from step 2 with the answers already collected. Stop this fragment. If `<id>` is `ios`, record step `2` as `skipped`.
3. Run `node -p process.platform`. If the output is not `darwin`, do not write `ios`. Set `commands.start.status` to `blocked`, tell the developer that iOS native requires macOS and Xcode, offer Flutter, React Native (Expo), and Android native, and stop. On macOS, write `platform` `ios`, `storeTargets` as [`appstore`], and `answers` for `appName`, `applicationId`, `primaryColor`, `languages`, and `storeTargets`. Set `kitVersion` from `package.json`. Set `commands.start.status` to `in_progress`, record step `3` as `done`, and write UTC timestamps.
4. Run `npm run compile -- --platform ios`. Confirm the generated `ship-*` files and `ship-*` skill directories are `ship-start`, `ship-env-check`, `ship-plan-pricing`, `ship-paywall`, `ship-analytics`, `ship-ai`, `ship-design`, `ship-translate`, `ship-legal`, and `ship-publish`, and `ship-update`, and nothing else. Record step `4` as `done`. If the compiler fails, record step `4` as `blocked` and stop.
5. Copy each file under `platforms/ios/template` to the same relative path at the repository root when that destination is missing. Leave an existing file as it is. In each file this step copied, replace `{{appName}}`, `{{applicationId}}`, and `{{primaryColor}}`. Copy `backend/` to the repository root only when `backend/` is missing. Record step `5` as `done`.
6. Run env-check for ios and write its state before continuing. Record step `6` as `done` when `commands.env-check.status` is `done`, and `blocked` when env-check is `blocked`.
7. When step `6` is `done`, set `commands.auth` to `pending` with an empty `steps` object and the current UTC timestamp, set `commands.start.status` to `done`, and say that auth is next and has no command yet. When step `6` is `blocked`, set `commands.start.status` to `blocked` and leave `commands.auth` unset.

## Rollback

Set `commands.start.status` to `blocked` and timestamp it. Leave copied template files and `backend/` in place. Do not uninstall tools. Do not delete `.shipkit/state.json`. Do not treat this machine as able to build iOS when `node -p process.platform` is not `darwin`.
