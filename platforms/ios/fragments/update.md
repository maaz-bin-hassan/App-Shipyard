## Preconditions

- `.shipkit/state.json` exists and `platform` is `ios`.
- The current directory is the project root: this kit repository, or an app created by `createshipyard`.
- `node scripts/plan-update.mjs` runs from that root. In the kit it reads `CHANGELOG.md` and `package.json`. In a generated app it reads `docs/kit/CHANGELOG.md` and `docs/kit/version.json`. Guides are `docs/migrations/<version>.md`.
- The directory is a git checkout. `git rev-parse --is-inside-work-tree` prints `true`.

## Steps

1. Run `node scripts/plan-update.mjs`. If it exits non-zero, set `commands.update.status` to `blocked`, timestamp it, and stop. If `commands.update.status` is `done`, `ahead` is false, and `kitVersion` equals `latest`, report that the project is already on that kit version and stop. Otherwise record step `1` as `done` and keep the JSON for the later steps.
2. If `ahead` is true, set `commands.update.status` to `skipped`, leave `kitVersion` unchanged, tell the developer the recorded version is newer than the release notes, and stop. If `migrations` is empty, set `kitVersion` to `latest` when it differs, set `commands.update.status` to `done`, write the UTC timestamp, report that no migration guides apply, and stop. Otherwise record step `2` as `done`.
3. If `answers.applyUpdates` is not `yes`, set `commands.update.status` to `skipped`, leave `kitVersion` unchanged, and stop. Otherwise set `commands.update` and step `3` to `in_progress`, write the UTC timestamp, and record step `3` as `done`.
4. Take a git checkpoint before editing. Let `<stamp>` be the current UTC time in compact form, such as `20261021T120000Z`. Run `git rev-parse HEAD` and `git branch ship-update-checkpoint-<stamp> HEAD`. If `git status --porcelain` is not empty, run `git stash push --include-untracked -m ship-update-checkpoint-<stamp>` and remember that a stash was created. Write `.shipkit/update-checkpoint.json` as two-space JSON with `branch`, `head`, and `stashed` (`true` or `false`). Record step `4` as `done`. If the branch cannot be created, record step `4` as `blocked`, set `commands.update.status` to `blocked`, and stop.
5. Apply each version in `migrations` in order. Open `docs/migrations/<version>.md`. Edit only paths named in that guide. Do not edit Swift files that the guide does not name. Do not reformat an unnamed file. After each guide, check the result it describes. If a guide has no separate check, read the paths it names and confirm those edits are present. On a failure, record step `5` as `blocked`, set `commands.update.status` to `blocked`, and stop without bumping `kitVersion`. When every guide has been applied, record step `5` as `done`.
6. Set `kitVersion` to `latest`. Set `commands.update.status` to `done` and write the UTC timestamp. Leave the checkpoint branch in place.

## Rollback

Read `.shipkit/update-checkpoint.json`. If it is missing, set `commands.update.status` to `blocked`, timestamp it, and stop. Run `git reset --hard` on the recorded `head`. Delete untracked files that step 5 created and that `git status --porcelain` still shows. Do not delete files the developer had before the checkpoint, and do not `git clean` the whole tree. If `stashed` is `true`, run `git stash pop`. Set `commands.update.status` to `blocked` and timestamp it. Leave the checkpoint branch until the developer deletes it.
