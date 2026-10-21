---
description: Bring a project up to the latest kit version by applying migration guides.
argument-hint: "(none)"
---

## Goal

Compare `.shipkit/state.json` `kitVersion` with the latest release notes, then apply each guide in `docs/migrations/<version>.md` between those versions. `<version>` is `major.minor.patch`.

In this repository the release notes are `CHANGELOG.md` and the latest version comes from `package.json` `version`, or a higher version heading in the changelog. In an app created by `createshipyard`, the release notes are `docs/kit/CHANGELOG.md` and the synced version is `docs/kit/version.json`. To move an app to a newer kit checkout, replace only those two files and `docs/migrations` from that checkout. Do not copy feature code while refreshing them.

`node scripts/plan-update.mjs` prints the plan as JSON. It does not edit files.

## Ask

Run `node scripts/plan-update.mjs` before asking. Do not edit files while asking. If the script fails because `.shipkit/state.json` is missing, stop and tell the developer to run `createshipyard` or `/ship-start` first.

When `migrations` is empty, or `ahead` is true, ask nothing.

When `migrations` lists one or more versions, ask once. Show the version list and each `docs/migrations/<version>.md` path before asking.

| Id | Question | Record |
| --- | --- | --- |
| `applyUpdates` | Apply these kit migrations, in order? | `yes` or `no`. |

On resume, reuse `answers.applyUpdates` and do not ask again.

## Verify

`node scripts/plan-update.mjs` exits 0. When `ahead` is true, or `answers.applyUpdates` is `no`, `commands.update.status` is `skipped` and `kitVersion` is unchanged. When there are no migrations, or the developer answered `yes` and every guide was applied, `kitVersion` equals `latest` and `commands.update.status` is `done`. A `yes` run leaves the `ship-update-checkpoint-*` branch from `.shipkit/update-checkpoint.json` pointing at the pre-update commit. Files a migration guide does not name are unchanged, including feature code the developer owns. The state file and the transcript contain no secrets.

## Never

Do not edit a file a migration guide does not name. Do not reformat or regenerate feature code the developer owns. Do not delete the checkpoint branch as part of a successful run. Do not bump `kitVersion` when a guide failed, `ahead` is true, or the developer answered `no`. Do not install, upgrade, or remove a toolchain. Do not create accounts, spend money, upload a binary, submit to a store, or publish a package. Do not print `.env` or secret files. Do not mark update `done` while a listed migration was not applied.
