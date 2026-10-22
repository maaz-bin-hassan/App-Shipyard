---
description: Confirm the publishable app createshipyard wrote, or save the identity and copy the template when that app is not there yet.
argument-hint: "(none)"
---

## Goal

`createshipyard` writes the publishable Expo app before any slash command runs. That app already contains the RevenueCat paywall, the pricing note, the Supabase backend, the design shell, the English catalog, analytics with consent off, and the legal drafts. When `.shipkit/state.json` says start is `done`, report that the remaining inputs are the logo and `.env`, then stop. Do not ask for another slash command.

When start is not done, ask which platform this project ships, save the app identity and store targets, compile only that platform's commands, copy its template and the shared backend, then run env-check. Flutter, Android, and iOS templates are still stubs. The publishable files are the Expo app.

## Ask

Ask the platform question first, before any other question and before Steps. Ask it only when `.shipkit/state.json` is missing or `platform` is null. When `createshipyard` has already written `platform` as `expo`, `flutter`, `android`, or `ios`, skip this question and keep that value.

The platform choices are:

1. Flutter (`flutter`)
2. React Native (Expo) (`expo`)
3. Android native (Kotlin and Compose) (`android`)
4. iOS native (Swift and SwiftUI) (`ios`)

If the developer chooses `ios`, run `node -p process.platform`. When the output is not `darwin`, tell them iOS native requires macOS and Xcode, and ask again with only Flutter, React Native (Expo), and Android native. Do not save `ios` on that machine. If `platform` is already `ios` and the machine is not a Mac, stop, explain the same limit, and offer those three platforms before changing `platform`.

Then ask the rest in one batch. On resume, reuse `answers` and do not ask again.

| Id | Question | Record |
| --- | --- | --- |
| `appName` | App name | Non-empty string. |
| `applicationId` | Package or bundle id | Reverse-DNS string, such as `com.example.app`. |
| `primaryColor` | Primary colour | `#` plus six hex digits. |
| `languages` | Languages wanted | Array of language tags, such as `en`. |
| `storeTargets` | Store targets | Subset of the chosen platform's `storeTargets`. |

Offer only stores that platform lists. `expo` and `flutter` may be Google Play (`play`), the Apple App Store (`appstore`), or both. `android` offers only `play`. `ios` offers only `appstore`.

A blank required answer stays in this batch until it is filled. Do not start Steps with an empty name, id, colour, language list, or store list.

## Verify

When `createshipyard` already finished, `commands.start.status` is `done`, `docs/monetization.md` exists, the paywall names an entitlement, `backend/` exists, and the reply tells the developer to add a logo and `.env`. It does not ask for another slash command.

When this command is doing the copy itself, `.shipkit/state.json` has the chosen `platform`, a `storeTargets` list inside that platform's manifest, and `answers` for `appName`, `applicationId`, `primaryColor`, and `languages`. Generated `ship-*` commands match that platform's `commands` and no other platform's generated commands remain. Template files that were copied have the three placeholders replaced. `commands.env-check` has a status. The state file and the transcript contain no secrets.

## Never

Do not ask the platform question when `platform` is already set, except to leave an `ios` value that cannot be built on this machine. Do not save `ios` unless `node -p process.platform` prints `darwin`. Do not offer a store the manifest omits. Do not install, upgrade, or remove a toolchain unless the developer explicitly agrees after a failed env-check. Do not create accounts, spend money, upload a binary, or submit to a store. Do not print `.env` or secret files. Do not run auth. Do not mark start `done` while env-check is `blocked` or `pending`, unless `createshipyard` already wrote the publishable Expo app and set start to `done`. Do not ask the developer to run paywall, plan-pricing, analytics, design, translate, legal, or publish when those files are already in the project.
