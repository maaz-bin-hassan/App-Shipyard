## Preconditions

- Ask has selected a platform, or `.shipkit/state.json` already has one.
- This fragment runs when that platform is `expo`.
- `platforms/expo/platform.json` exists. Store targets are `play`, `appstore`, or both.
- `platforms/expo/template/README.md` is the stub template.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json`. If it is missing, create it with `platform` null, `storeTargets` [], `kitVersion` copied from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `commands.start.status` is `done` and `kitVersion` matches `package.json` `version`, report that start already finished and stop. Otherwise record step `1` as `done`.
2. Let `<id>` be the platform from Ask, or the saved `platform` when that question was skipped. If `<id>` is not `expo`, do not write `expo`. Run `npm run compile -- --platform <id>` and follow `platforms/<id>/fragments/start.md` from step 2 with the answers already collected. Stop this fragment. If `<id>` is `expo`, record step `2` as `skipped`.
3. Write `platform` `expo`, `storeTargets` from the answers, and `answers` for `appName`, `applicationId`, `primaryColor`, `languages`, and `storeTargets`. Set `kitVersion` from `package.json`. Set `commands.start.status` to `in_progress`, record step `3` as `done`, and write UTC timestamps. Keep `storeTargets` inside `play` and `appstore`.
4. Run `npm run compile -- --platform expo`. Confirm the generated `ship-*` files and `ship-*` skill directories are `ship-start`, `ship-env-check`, `ship-plan-pricing`, `ship-paywall`, `ship-analytics`, `ship-ai`, `ship-design`, `ship-translate`, `ship-legal`, and `ship-publish`, and nothing else. Record step `4` as `done`. If the compiler fails, record step `4` as `blocked` and stop.
5. Copy each file under `platforms/expo/template` to the same relative path at the repository root when that destination is missing. Leave an existing file as it is. In each file this step copied, replace `{{appName}}`, `{{applicationId}}`, and `{{primaryColor}}`. Copy `backend/` to the repository root only when `backend/` is missing. Record step `5` as `done`.
6. Run env-check for expo and write its state before continuing. Record step `6` as `done` when `commands.env-check.status` is `done`, and `blocked` when env-check is `blocked`.
7. When step `6` is `done`, set `commands.auth` to `pending` with an empty `steps` object and the current UTC timestamp, set `commands.start.status` to `done`, and say that auth is next and has no command yet. When step `6` is `blocked`, set `commands.start.status` to `blocked` and leave `commands.auth` unset.

## Rollback

Set `commands.start.status` to `blocked` and timestamp it. Leave copied template files and `backend/` in place. Do not uninstall tools. Do not delete `.shipkit/state.json`.
