## Preconditions

- `.shipkit/state.json` exists and `platform` is `expo`.
- `commands.plan-pricing.status` is `done`, and `docs/monetization.md` exists.
- `platforms/expo/template/src/features/billing` contains the RevenueCat module.
- `docs/billing-setup.md` exists.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If `commands.paywall.status` is `done` and `kitVersion` matches `package.json` `version`, report that the paywall already finished and stop. If `commands.plan-pricing.status` is not `done`, set `commands.paywall.status` to `blocked` and stop. If `answers.monetizationModel` is `free` or `answers.entitlementId` is blank, set `commands.paywall` to `skipped` with an empty `steps` object and stop. Otherwise record step `1` as `done`.
2. Set `commands.paywall` and step `2` to `in_progress` and write the current UTC timestamp. Copy each file under `platforms/expo/template/src/features/billing` to the same path under `src/features/billing` when that destination is missing. Leave an existing file as it is, except `billingConfig.ts`. Rewrite `src/features/billing/billingConfig.ts` from `answers.entitlementId` and `answers.premiumFeatures`. Copy `platforms/expo/template/.env.example` to `.env.example` when `.env.example` is missing. Record step `2` as `done`.
3. If the checkout has no `app.json` and no `app.config.js` or `app.config.ts`, this is still the kit repo. Leave the module in `platforms/expo/template/src/features/billing`, record step `3` as `skipped`, and continue. When an Expo app config exists and `package.json` does not depend on `react-native-purchases`, run `npx expo install expo-dev-client react-native-purchases`. Read the installed version and record step `3` as `blocked` when it is below `9.5.4`, the Test Store minimum in `docs/billing-setup.md`. Ensure `.env` contains `EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY`, `EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY`, and `EXPO_PUBLIC_REVENUECAT_TEST_API_KEY` without printing their values. Tell the developer that Expo Go's Preview API Mode does not complete a purchase and that a development build is required. Record step `3` as `done` when the package meets the minimum and the keys exist.
4. Gate each name in `answers.premiumFeatures` with `GatedFeature`, `billingConfig.entitlementId`, and `PaywallScreen` as the locked state. `PremiumExample` is the wrapper for a feature that has no screen yet. Call `configureRevenueCat` once from the app entry when an entry file exists. Prices on `PaywallScreen` come from `loadPaywall` and the package `priceString`. Restore stays on the Restore purchases control. Record step `4` as `done` when that wiring is present, and `blocked` when a premium feature is left ungated.
5. If `answers.allowLiveStoreProducts` is not `yes`, skip every live-console action, record step `5` as `skipped`, and use the RevenueCat Test Store in the next step. If it is `yes`, show the manual steps below and wait. Record step `5` as `done` only after the developer reports that the live products exist. Record it as `blocked` when they stop before that. Do not drive Play Console or App Store Connect.

### Manual steps

Live Play products and the Play-to-RevenueCat service account need an app that already exists in Play Console. The citations are in `docs/billing-setup.md`, checked on 2026-10-20.

- Play billing features, including configuring products, stay unavailable until a version of the app that includes the Play Billing Library is published to a track. Internal testing counts. [Getting ready](https://developer.android.com/google/play/billing/getting-ready) says to create the app and publish to any track, including the internal test track.
- An in-app product is created inside that app at Monetize with Play > Products > In-app products. Product IDs are permanent. [Create an in-app product](https://support.google.com/googleplay/android-developer/answer/1153481) is the Play Console Help page.
- RevenueCat's [Google Play Service Credentials](https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials) lists "Your app created in Google Play Console" as a prerequisite. The next step adds that existing app under the service account's App permissions. New credentials can take up to 36 hours to work.

6. Run `pnpm test:billing`. A passing run shows a Test Store customer-info update unlocking the gated feature and restore unlocking it again. Record step `6` as `blocked` when that command fails. Then, on a development build, complete a RevenueCat Test Store purchase when step `5` was `skipped`, or a store sandbox purchase when step `5` is `done`. The gated feature must render after that purchase, and Restore purchases must render it again. Record step `6` as `done` when both the tests and that purchase succeed, and `blocked` when the purchase or restore fails or when no development build is available. Set `commands.paywall.status` to `done` only when step `6` is `done`. Write UTC timestamps.

## Rollback

Set `commands.paywall.status` to `blocked` and timestamp it. Leave the billing module, `.env`, and installed packages in place. Do not print `.env`. Do not delete `.shipkit/state.json`.
