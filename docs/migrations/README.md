# Migration guides

`ship-update` compares the `kitVersion` in `.shipkit/state.json` with the latest release notes, then applies every guide whose version is newer than `kitVersion` and no newer than that latest version.

In this repository the release notes are `CHANGELOG.md` and the package version is `package.json`. In an app created by `createshipyard`, those copies are `docs/kit/CHANGELOG.md` and `docs/kit/version.json`. Guides are files named `docs/migrations/<version>.md`, and `<version>` is `major.minor.patch`.

`node scripts/plan-update.mjs` prints the plan. It does not edit files.

This repository is still `0.0.0`. The sample below is the shape of the next bump. It is not a live guide, so `ship-update` does not apply it.

## How to bump to 0.1.0

1. Add `docs/migrations/0.1.0.md` using the sample in the next section. List only kit-owned paths under `## Changes`. Do not name feature files the developer owns, such as `src/screens/`, unless that exact file must change.
2. In `CHANGELOG.md`, move the notes that are shipping out of `## [Unreleased]` and put them under `## [0.1.0] - YYYY-MM-DD`. Leave a new empty `## [Unreleased]` section.
3. Set `version` to `0.1.0` in `package.json` and `cli/package.json`.
4. Do not hand-edit a project's `.shipkit/state.json`. `ship-update` writes `kitVersion` after the guide applies, and only after the developer answers `yes`.

A generated app picks up the new notes when someone replaces `docs/kit/CHANGELOG.md`, `docs/kit/version.json`, and `docs/migrations` from the new kit checkout. That copy must not overwrite feature code.

## Sample `docs/migrations/0.1.0.md`

```markdown
# 0.1.0

Apply this guide when `.shipkit/state.json` `kitVersion` is below `0.1.0` and the latest release is at least `0.1.0`.

## Changes

- `.gitignore`: add a `coverage/` line when that line is missing.

## Leave untouched

Do not edit `src/screens/`, Dart under `lib/`, Kotlin under `app/src/`, or Swift sources. Those files belong to the developer unless a guide names one path.

## Check

`.gitignore` lists `coverage/`. `git diff` shows no other path.

## Rollback

`ship-update` records the pre-update commit on branch `ship-update-checkpoint-*` and in `.shipkit/update-checkpoint.json`. Rollback runs `git reset --hard` on that `head`, deletes only untracked files this guide created, and runs `git stash pop` when `stashed` is true.
```
