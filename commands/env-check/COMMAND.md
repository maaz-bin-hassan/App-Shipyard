---
description: Check that the selected platform toolchain is present. Does not install tools or change the app.
argument-hint: "(none)"
---

## Goal

Report whether the toolchain named by the selected platform manifest is available, and record that result in `.shipkit/state.json`.

## Ask

No questions. The platform and store targets are read from `.shipkit/state.json`. Do not ask the developer to choose them again.

## Verify

Every `envChecks` entry has a step status. The command is `done` only when every check found its `expected` substring. The transcript and state file contain no values from `.env` or other secrets.

## Never

Do not install, upgrade, or remove toolchains. Do not create accounts, spend money, upload a binary, or submit to a store. Do not print `.env` or secret files. Do not edit application source. Do not mark a failed check as `done`.
