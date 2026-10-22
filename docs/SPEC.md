# App Shipyard command specification

This document is the contract for slash-command sources, platform manifests, local state, and the compiler. It refines [ADR-003](DECISIONS.md) and [ADR-008](DECISIONS.md): manifests that the linter and compiler read live in `platforms/<id>/platform.json`, and every generated command name starts with `ship-`.

Agents must read this file before editing anything under `commands/` or `platforms/`.

Nothing in the command files installs software, spends money, or publishes an app. `env-check` is a real document so the linter and compiler have an input. It is not a working toolchain installer.

## Command file format

Source files and generated files are Markdown. Generated files keep YAML frontmatter as the first lines. A generated-file comment comes immediately after that frontmatter.

Core files use this frontmatter and no other keys:

```yaml
---
description: One sentence an agent can show in a command list.
argument-hint: "(none)"
---
```

| Key | Required | Rule |
| --- | --- | --- |
| `description` | yes | Non-empty single-line string. |
| `argument-hint` | yes | Non-empty single-line string. Use `(none)` when the command takes no arguments. |

Sections use a level-2 heading and appear in this order:

1. **Goal**
2. **Preconditions**
3. **Ask**
4. **Steps**
5. **Verify**
6. **Rollback**
7. **Never**

A section body is the Markdown between its heading and the next level-2 heading. The body must contain text. Level-3 headings may appear inside a section.

## Source split

| Piece | Path | Sections |
| --- | --- | --- |
| Core | `commands/<name>/COMMAND.md` | Frontmatter, Goal, Ask, Verify, Never |
| Fragment | `platforms/<id>/fragments/<name>.md` | Preconditions, Steps, Rollback |

`<name>` is lowercase kebab-case, such as `env-check`. `<id>` is `expo`, `flutter`, `android`, or `ios`.

The core states the platform-neutral intent: what the command is for, which questions are asked, how success is judged, and what the agent must refuse. The fragment states how that command behaves on one platform: what must already be true, which steps to run, and how to undo those steps.

A core file must not contain Preconditions, Steps, or Rollback. A fragment must not contain frontmatter, Goal, Ask, Verify, or Never.

The merged document restores the full order: Goal, Preconditions, Ask, Steps, Verify, Rollback, Never.

## Platform manifest

Each platform has `platforms/<id>/platform.json`. `id` matches the directory name. The linter rejects unknown keys.

| Field | Type | Rule |
| --- | --- | --- |
| `id` | string | Directory name. One of `expo`, `flutter`, `android`, `ios`. |
| `name` | string | Human-readable platform name. |
| `language` | string | Primary app language. |
| `storeTargets` | string array | One or both of `play` and `appstore`. No duplicates. |
| `templateDir` | string | Future template directory. The directory does not need to exist yet. |
| `commands` | string array | Command names this platform supports. A listed command must have a fragment. |
| `envChecks` | object array | Tool checks. See below. |
| `services` | object | `auth`, `billing`, `analytics`, and `crashes`. Each value is the SDK name. |
| `buildTool` | string | Tool that produces a build. |
| `releaseTool` | string | Tool that submits a store build. |
| `stringsFormat` | string | Format used for user-facing strings. |
| `permissionsFile` | string | Primary file that declares app permissions. One path. |

`commands` is required because the linter treats that array as the support list from ADR-003.

`envChecks` items:

| Field | Type | Rule |
| --- | --- | --- |
| `command` | string | Command line to run. |
| `expected` | string | Substring that must appear in the combined output. |
| `install` | object | Install hint per OS: `windows`, `macos`, and `linux`. Hints are short text or documentation URLs, not copied installer scripts. |

`services` names the planned SDK. The current values are `supabase`, `revenuecat`, `posthog`, and `sentry`, from ADR-004, ADR-005, and ADR-006. Naming a service here does not mean the SDK is installed.

Flutter has both an Android manifest and an iOS `Info.plist`. The schema stores one `permissionsFile`. The Flutter manifest records the Android manifest path until the schema grows a second field.

## Local state

`.shipkit/state.json` is local run state. `.shipkit/` is gitignored. Do not commit it, and do not store secrets in it.

```json
{
  "platform": "flutter",
  "storeTargets": ["play", "appstore"],
  "kitVersion": "1.1.0",
  "answers": {},
  "commands": {
    "env-check": {
      "status": "pending",
      "updatedAt": "2026-10-20T00:00:00.000Z",
      "steps": {
        "1": {
          "status": "pending",
          "updatedAt": "2026-10-20T00:00:00.000Z"
        }
      }
    }
  }
}
```

| Field | Rule |
| --- | --- |
| `platform` | Selected platform id, or `null` before selection. |
| `storeTargets` | Subset of the platform's `storeTargets`. |
| `kitVersion` | `version` from the kit `package.json` that last wrote the file. |
| `answers` | Map of question id to the answer given in Ask. No secrets. |
| `commands` | Map of command name to command status. |
| `commands.<name>.status` | `pending`, `in_progress`, `done`, `blocked`, or `skipped`. |
| `commands.<name>.updatedAt` | UTC timestamp in ISO-8601. |
| `commands.<name>.steps` | Map of step number, as a string, to `{ "status", "updatedAt" }`. Step numbers match the ordered Steps list. |

Reading and updating state:

1. Read `.shipkit/state.json`. If it is missing, create it with `platform` and `storeTargets` set to `null` and `[]`, `kitVersion` copied from `package.json`, `answers` set to `{}`, and `commands` set to `{}`.
2. Before running a step, skip it when its status is `done` and `kitVersion` still matches `package.json`.
3. When a step starts, set that step and the command to `in_progress` and set both timestamps.
4. When a step finishes, set its status to `done`, `blocked`, or `skipped`, and refresh `updatedAt`.
5. Set the command status from its steps: `done` only when every step is `done` or `skipped`; `blocked` when any step is `blocked`.
6. Write the file with two-space JSON. Change only the command and steps this run touched.

A new `kitVersion` invalidates old `done` steps. Run them again.

## Design rules

1. **Idempotent and resumable.** Running a command twice does not repeat finished steps and does not destroy completed work. Status in `.shipkit/state.json` is what makes a run resumable.
2. **Ask once in one batch.** The Ask section lists every question. The agent asks that whole list before Steps, records the answers, and does not ask again on resume.
3. **Verify each step.** Every step has an observable result. The Verify section says how the whole command is judged. A step that was not checked stays `pending` or moves to `blocked`.
4. **Secrets only in `.env`, and never printed.** Keys, tokens, and store credentials belong in `.env`. Command output, state, manifests, and commits must not contain them.
5. **Human gate before anything that spends money or publishes.** Stop and wait for an explicit yes before creating a paid resource, starting a subscription, uploading a binary, or submitting to a store.
6. **Minimal diffs.** Edit only the files the current step names. Do not reformat unrelated code or generate a second copy of a template that already exists.

## Compiler and linter

`scripts/lint-commands.mjs` exits non-zero when any of these are true:

- A core file or fragment is missing a required section, or a section body is empty.
- Sections are out of canonical order, or a file contains a section that belongs to the other half of the split.
- A core file is missing `description` or `argument-hint`.
- A platform manifest breaks the schema above.
- A platform lists a command in `commands` and `platforms/<id>/fragments/<name>.md` is missing.
- A listed command has no `commands/<name>/COMMAND.md`.

`scripts/compile-commands.mjs` accepts `--platform <id>` and optional `--agents <comma-separated ids>`. The default agent list is every id in the config object at the top of that script. For each command that has a fragment for the platform, it merges the core and the fragment into one flat Markdown file, prefixes the command with `ship-`, and writes it to that agent's project commands location. The first body line is an HTML comment that names the script, platform, and sources.

Generated files are build output for one platform. They are gitignored. Source files under `commands/` and `platforms/` stay the files to edit.

## Agent output paths

Checked against current vendor docs on 2026-10-20. The config object in `scripts/compile-commands.mjs` is the machine-readable copy of this table.

| Agent id | Output | Why |
| --- | --- | --- |
| `claude-code` | `.claude/commands/ship-<name>.md` | [Claude Code directory docs](https://code.claude.com/docs/en/claude-directory) list project `commands/*.md` as single-file prompts, and the [skills docs](https://code.claude.com/docs/en/skills) say `.claude/commands/deploy.md` still creates `/deploy`. Skills are preferred for new hand-written work, but the commands directory is the current flat project slash-command folder, which matches a generated `ship-<name>.md` file. |
| `cursor` | `.cursor/commands/ship-<name>.md` | [Cursor deeplinks](https://cursor.com/docs/reference/deeplinks) define project custom commands in `.cursor/commands`. [Cursor skills](https://cursor.com/docs/agent/chat/commands) are the newer `/` workflow at `.cursor/skills/<name>/SKILL.md`, and `/migrate-to-skills` can convert existing workspace commands. The commands directory is still the documented flat-file location. |
| `opencode` | `.opencode/commands/ship-<name>.md` | [OpenCode commands](https://opencode.ai/v2/docs/commands) load project commands from `.opencode/commands/*.md`. The filename becomes the slash command. The legacy `command/` directory is still discovered; new files belong in `commands/`. |
| `antigravity` | `.agents/skills/ship-<name>/SKILL.md` | [Antigravity's migration guide](https://antigravity.google/docs/migration/workflows-to-skills/) says workspace workflows in `.agents/workflows/<name>.md` stop being indexed after 2026-10-19. The current project slash command is a skill at `.agents/skills/<name>/SKILL.md`, invoked as `/<name>`. The directory carries the `ship-` prefix because the host requires the file itself to be named `SKILL.md`. |
| `codex` | Listed in `AGENTS.md` | [Codex custom prompts](https://developers.openai.com/codex/custom-prompts) are deprecated and lived in the user directory `~/.codex/prompts`, not in the project. Codex has no project-level custom slash-command folder. Project skills exist at `.agents/skills` and are invoked with `$name` or `/skills`, so the Antigravity skill file is also visible to Codex. The compiler still lists the merged command in `AGENTS.md`, which Codex loads as project instructions. |

## Scaffold

`createshipyard` lives in `cli/`. From this repository, `pnpm cli:build` then `node cli/dist/index.js my-app` copies `platforms/<id>/template` by running `scripts/sync-project.mjs`, writes a project `AGENTS.md` and `.shipkit/state.json`, initializes git, installs dependencies, and prints the next slash command. `npm run pack:npm` builds `release/createshipyard-1.1.0.tgz`. That tarball is the package to publish. It is not on the npm registry until someone publishes it.

Flags are `--agent` (`claude`, `cursor`, `opencode`, or `all`), `--platform` (`flutter` by default, or `expo`, `android`, `ios`), `--pm` (`npm`, `pnpm`, or `yarn`), and `--no-install`. The default platform is `flutter`. `ios` is refused when `process.platform` is not `darwin`.

`scripts/e2esmoke.sh` scaffolds into a temporary directory, then runs `tsc --noEmit` and `expo export --platform android`.

## Updates

`ship-update` compares `.shipkit/state.json` `kitVersion` with the latest release notes. In this repository the notes are `CHANGELOG.md` and the version is `package.json` `version`. In a generated app the notes are `docs/kit/CHANGELOG.md` and the version is `docs/kit/version.json`. Guides are `docs/migrations/<version>.md` where `<version>` is `major.minor.patch`.

`node scripts/plan-update.mjs` prints `kitVersion`, `latest`, `ahead`, and `migrations`. It does not edit files. Before applying a guide, the command creates branch `ship-update-checkpoint-<stamp>` and writes `.shipkit/update-checkpoint.json` with `branch`, `head`, and `stashed`. That file stays under `.shipkit/`, which is gitignored. A guide may name only the files it changes. Rollback is `git reset --hard` on the recorded `head`.

How to write the next version bump is in [docs/migrations/README.md](migrations/README.md). This repository is `1.1.0`. There is no `docs/migrations/1.0.0.md` because `1.0.0` was the first numbered release. `docs/migrations/1.1.0.md` is the guide from that release.
