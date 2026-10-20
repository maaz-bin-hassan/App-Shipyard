---
description: Add a RevenueCat paywall that gates premium features and restores purchases. Live store setup waits for approval.
argument-hint: "(none)"
---

## Goal

Install RevenueCat, gate the premium features from plan-pricing, and show a paywall whose prices come from offerings fetched at runtime. Restore purchases runs only from a Restore control. Loading, error, and no-offerings states stay on screen without a crash.

A development build is required for a real purchase. Expo Go's Preview API Mode does not complete one. The notes and citations are in `docs/billing-setup.md`.

## Ask

No platform or store questions. Read `platform`, `storeTargets`, and `answers` from `.shipkit/state.json`.

If `answers.monetizationModel` is `free`, or `answers.entitlementId` is missing or blank, ask nothing.

Otherwise ask once, before Steps: may this run create products in a live store console, or link a Play service account that can create them? Record `answers.allowLiveStoreProducts` as `yes` or `no`. Wait for an explicit yes. Anything else is `no`. On resume, reuse the answer and do not ask again.

## Verify

The paywall reads the current offering's packages and displays each package's store price string. It does not contain a hard-coded amount. Loading, error, and empty offerings each render their own state. Restore purchases is wired to a Restore control and is not called on launch.

A RevenueCat Test Store purchase or a store sandbox purchase sets the entitlement from `answers.entitlementId`, and the gated feature renders. Restore brings that entitlement back and the feature renders again. `pnpm test:billing` passes. The command is `done` only when that purchase and that restore both succeed.

`answers.allowLiveStoreProducts` is `yes` only after an explicit yes. Live console products stay untouched when that answer is `no`. The transcript and state file contain no values from `.env` and no API keys.

## Never

Do not create or activate a product in Play Console, App Store Connect, or a live RevenueCat store app unless `answers.allowLiveStoreProducts` is `yes` and the developer is following the manual console steps. Do not upload a service-account JSON, print it, or commit it. Do not print `.env` or put a RevenueCat secret API key in the app. Do not ship a Test Store key in a release build. Do not call restore on launch. Do not hard-code a price. Do not mark a failed purchase or a failed restore as `done`.
