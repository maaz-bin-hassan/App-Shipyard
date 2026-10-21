## Preconditions

- Ask has selected a platform, or `.shipkit/state.json` already has one.
- This fragment runs when that platform is `flutter`.
- `platforms/flutter/platform.json` exists. Store targets are `play`, `appstore`, or both.
- `platforms/flutter/template/README.md` is the stub template.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json`. If it is missing, create it with `platform` null, `storeTargets` [], `kitVersion` copied from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `commands.start.status` is `done` and `kitVersion` matches `package.json` `version`, report that start already finished and stop. If step `1` is already `done` for that `kitVersion`, leave it and continue. Otherwise record step `1` as `done`.
2. Skip when step `2` is `done` or `skipped` and `kitVersion` matches. Let `<id>` be the platform from Ask, or the saved `platform` when that question was skipped. If `<id>` is not `flutter`, do not write `flutter`. Run `npm run compile -- --platform <id>` and follow `platforms/<id>/fragments/start.md` from step 2 with the answers already collected. Stop this fragment. If `<id>` is `flutter`, record step `2` as `skipped`.
3. Skip when step `3` is `done` and `kitVersion` matches. Write `platform` `flutter`, `storeTargets` from the answers, and `answers` for `appName`, `applicationId`, `primaryColor`, `languages`, and `storeTargets`. Set `kitVersion` from `package.json`. Set `commands.start.status` to `in_progress`, record step `3` as `done`, and write UTC timestamps. Keep `storeTargets` inside `play` and `appstore`.
4. Skip when step `4` is `done` or `skipped` and `kitVersion` matches. If `platforms/flutter/platform.json` exists, run `npm run compile -- --platform flutter`. Confirm the generated `ship-*` files and `ship-*` skill directories are `ship-start`, `ship-env-check`, `ship-plan-pricing`, `ship-paywall`, `ship-analytics`, `ship-ai`, `ship-design`, `ship-translate`, `ship-legal`, `ship-publish`, and `ship-update`, and nothing else. Record step `4` as `done` when those names are the only generated commands. If the compiler fails or an extra `ship-*` command remains, record step `4` as `blocked` and stop. If `platforms/flutter/platform.json` is missing and `docs/kit/platform.json` exists, `createshipyard` already compiled those commands. Confirm the same names are present, record step `4` as `skipped`, and continue. If neither manifest exists, record step `4` as `blocked` and stop.
5. Skip when step `5` is `done` or `skipped` and `kitVersion` matches. If `platforms/flutter/template` exists, copy each file under it to the same relative path at the project root when that destination is missing. Leave an existing file as it is. In each file this step copied, replace `{{appName}}`, `{{applicationId}}`, and `{{primaryColor}}`. Copy `backend/` to the project root only when `backend/` is missing. If `platforms/flutter/template` is missing, leave the files `createshipyard` already wrote. Search the files this step copied, or `README.md` when it copied none. Record step `5` as `blocked` when `{{appName}}`, `{{applicationId}}`, or `{{primaryColor}}` remains. Otherwise record step `5` as `done`.
6. Skip when step `6` is `done` and `kitVersion` matches. Run env-check for flutter and write its state before continuing. Record step `6` as `done` when `commands.env-check.status` is `done`, and `blocked` when env-check is `blocked`.
7. Skip when step `7` is `done` and `kitVersion` matches. When step `6` is `done`, set `commands.auth` to `pending` with an empty `steps` object and the current UTC timestamp, set `commands.start.status` to `done`, and say that auth is next and has no command yet. When step `6` is `blocked`, set `commands.start.status` to `blocked` and leave `commands.auth` unset.

## Rollback

Set `commands.start.status` to `blocked` and timestamp it. Leave copied template files and `backend/` in place. Do not uninstall tools. Do not delete `.shipkit/state.json`.
