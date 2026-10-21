---
description: Check that the selected platform toolchain is present. Does not install tools unless the developer asks.
argument-hint: "(none)"
---

## Goal

Report pass or fail for every toolchain check in the selected platform manifest, print the install hint for this operating system when a check fails, and record the result in `.shipkit/state.json`.

## Ask

No platform or store questions. Read `platform` and `storeTargets` from `.shipkit/state.json`.

The checks come first. If every check passes or is skipped, ask nothing and leave `answers.runInstallHints` unset. If any check fails and `answers.runInstallHints` is missing, ask once: may those install hints be run? Record `yes` or `no`. Wait for an explicit yes before running a hint. A refusal is `no` and leaves the command `blocked`. On resume, reuse `answers.runInstallHints` and do not ask again.

## Verify

The report lists every `envChecks` entry as pass, fail, or skipped. A pass means `expected` appears in the combined stdout and stderr and the reported version satisfies that entry's `Minimum:`. Windows and Linux hints that start with `macOS only:` are skipped when the OS is not macOS. The command is `done` only when every entry passed or was skipped. Each failure includes the install hint for the current OS. When any check failed, `answers.runInstallHints` is `yes` or `no`. When every check passed or was skipped, that key is absent. The transcript and state file contain no values from `.env` or other secrets.

Version rules:

- Node.js passes on `22` when the minor is at least `13`, on `24` when the minor is at least `3`, and on even majors `26` or newer. Odd majors fail.
- A single `Minimum:` version passes when each numeric part is greater, or earlier parts are equal and the first differing part is greater. A shorter version is padded with zeros.
- JDK passes when the major is at least the minimum. For a quoted version starting with `1.`, the major is the second component. Otherwise it is the first.
- `java -version` writes to stderr. Read stdout and stderr together.
- The Android SDK platform check passes when the command prints `android-sdk-` plus the API level in `expected`.

## Never

Do not install, upgrade, or remove a toolchain unless the developer explicitly says yes after the failed checks and their install hints are on screen. Do not create accounts, spend money, upload a binary, or submit to a store. Do not print `.env` or secret files. Do not edit application source. Do not mark a failed check as `done`. Do not treat a missing Xcode install on Windows or Linux as a pass.
