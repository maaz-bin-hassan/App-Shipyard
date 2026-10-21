---
description: Extract user-facing strings, translate them in the agent, and check Urdu and Arabic RTL.
argument-hint: "(none)"
---

## Goal

Put every user-facing string in locale JSON, show the app in the languages chosen in start, and write a native-speaker review file plus store listing text for each language.

The agent writes the translations. Do not call a translation API.

## Ask

When `answers.languages` is a non-empty array, ask nothing. Reuse that list.

When it is missing, ask this once, in the same form as start, and record it before Steps:

| Id | Question | Record |
| --- | --- | --- |
| `languages` | Which languages should the app include? | Array of language tags, such as `en`. Include `en`. |

Do not ask for a translation API key.

## Verify

`src/i18n/locales/en.json` holds the English strings. Every tag in `answers.languages` has a locale file with the same keys. `missingKeys` is empty for each of those files. `pnpm test:i18n` passes.

`docs/i18n/review-<language>.md` exists for each language and says a native speaker should review it. `docs/store/listing-<language>.md` exists for each language and only describes the app the developer already has.

Urdu (`ur`) and Arabic (`ar`) use `directionFor` and an RTL layout. A screen in either language fails verification when `layoutDirectionIssue` returns a message.

The command is `done` only after the device language has been switched for each chosen language and the developer has walked each screen. For `ar` and `ur`, that walk includes the RTL check. The transcript and state file contain no secrets.

## Never

Do not call an external translation API, a translation website, or a paid translation service. Do not describe an agent translation as a native-speaker review. Do not ship `ar` or `ur` with a left-to-right layout. Do not leave a user-facing literal in a screen when the catalog has a key for it. Do not invent store-listing claims that `answers` and the app do not support. Do not print `.env` or secret files. Do not submit a store listing. Do not mark the command `done` before the device-language walk.
