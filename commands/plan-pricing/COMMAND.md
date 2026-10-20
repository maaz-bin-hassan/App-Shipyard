---
description: Interview once, then write a monetization recommendation, feature gates, prices, and an entitlement.
argument-hint: "(none)"
---

## Goal

Recommend one monetization model and record it so a later paywall can gate the premium features.

Ask the four questions in Ask in one batch, then write `docs/monetization.md` and the recommendation into `.shipkit/state.json` `answers`. The model is one of `free`, `freemium`, `trial`, `subscription`, or `one-time`.

Choose it from the answers:

- `free` when the app has no paid value and no ongoing cost to recover.
- `one-time` when the app is a finished tool and `runCost` is `none` or trivial.
- `subscription` when hosting, AI, content, or another cost continues after install.
- `freemium` when a useful core can stay free and a costly or advanced slice is paid. Use a subscription for that slice when the cost continues, or a one-time product when it does not.
- `trial` when the value shows up only after use. The trial is an introductory offer on the subscription, with the same entitlement.

Say which answers led to that model.

The document also has a feature-gating table, suggested prices, regional pricing notes for low-income markets in the country mix, and one entitlement name. Suggested prices are for the store console. The app reads the store's localized price at runtime.

## Ask

Ask these four questions in one batch before Steps. On resume, reuse `answers` and do not ask again. A blank required answer stays in this batch until it is filled.

| Id | Question | Record |
| --- | --- | --- |
| `audience` | Who is the app for? | Non-empty string. |
| `countryMix` | Which countries or regions will people use it in? | Non-empty array of names. |
| `appPurpose` | What does the app do? | Non-empty string. |
| `runCost` | What is costly to keep running? | String. Use `none` when nothing is. |

## Verify

`docs/monetization.md` has the sections Recommended model, Feature gating, Price points, Regional pricing, and Entitlement. The model is one of the five names in Goal, and the reasoning uses the four answers. Feature gating is a table with columns Feature, Free, and Premium, and at least one feature row. Price points are suggestions for the console. Regional pricing has a note for each low-income or price-sensitive market in `countryMix`, or an explicit note when the mix has none. The entitlement section names one identifier.

`.shipkit/state.json` `answers` includes `audience`, `countryMix`, `appPurpose`, `runCost`, `monetizationModel`, `entitlementId`, `productIds`, and `premiumFeatures`. `productIds` lists the store product ids for that model, or `[]` when the model is `free`. `premiumFeatures` lists the premium rows from the table. `commands.plan-pricing` is `done` only when the file and those keys exist. The state file and the transcript contain no secrets and no API keys.

## Never

Do not create products in Play Console, App Store Connect, or RevenueCat. Do not spend money, upload a binary, or submit to a store. Do not print `.env` or secret files. Do not write prices, product ids, or the entitlement into application source. Do not hard-code a price the paywall should display. Do not ask the four questions again on resume. Do not mark the command `done` while the document or the answer keys are missing.
