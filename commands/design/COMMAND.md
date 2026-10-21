---
description: Rebuild screens from screenshots, a Figma frame, or a Stitch export using theme tokens.
argument-hint: "(none)"
---

## Goal

Turn the supplied screens into screens built from the template components and `src/theme` tokens. Use a typed mock behind `DataSource` when the developer has not named a real data source.

## Ask

Ask these in one batch before Steps. On resume, reuse `answers` and do not ask again.

| Id | Question | Record |
| --- | --- | --- |
| `sourceKind` | What should the screens be rebuilt from? | `screenshots`, `figma`, or `stitch`. |
| `sourcePaths` | Where are those files or frames? | Non-empty array of paths or URLs. |
| `confirmedData` | For each screen that already has real data or navigation, what did the developer say exists? | Object. Use `{}` when nothing real exists. A remote value is `{ "kind": "remote", "evidence": "<what they named>", "navigation": ["Route"] }`. A screen they explicitly want mocked is `{ "kind": "mock" }`. |

A blank `sourceKind` or an empty `sourcePaths` stays in this batch. `confirmedData` may be `{}`.

## Verify

Each supplied screen has a module under `src/screens` that calls `buildScreen` with a non-empty `layout`, tokens from `extendTokens`, and a `DataSource`. Colours, type, and spacing in those screens come from `src/theme`. `pnpm test:design` passes.

The command is `done` only after the app is running and the developer says each rebuilt screen matches its source. The transcript and state file contain no secrets.

## Never

Do not fabricate a data source, a URL, a sample record presented as real, or a navigation route. When real data does not exist, use `mockSource` from `src/data/source.ts`. Use `remoteSource` only with the evidence in `answers.confirmedData`. Do not hard-code a colour, type size, or space in a screen; extend `src/theme` tokens. Do not invent a Figma frame when the Figma MCP is unavailable. Do not ask a new source question during Steps. A blocked Figma source stays blocked until the developer changes `answers.sourceKind` and `answers.sourcePaths` and runs the command again. Do not install a toolchain, spend money, upload a binary, or submit to a store. Do not print `.env` or secret files. Do not mark the command `done` before the developer has compared the running screens with the source.
