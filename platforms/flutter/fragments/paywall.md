## Preconditions

- `.shipkit/state.json` exists and `platform` is `flutter`.
- `commands.plan-pricing.status` is `done`, and `docs/monetization.md` exists.
- `docs/billing-setup.md` exists.
- The Flutter template is still a stub. It has no billing module.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If `commands.paywall.status` is `done` and `kitVersion` matches `package.json` `version`, report that the paywall already finished and stop. If `commands.plan-pricing.status` is not `done`, set `commands.paywall.status` to `blocked` and stop. If `answers.monetizationModel` is `free` or `answers.entitlementId` is blank, set `commands.paywall` to `skipped` with an empty `steps` object and stop. Otherwise record step `1` as `done`.
2. Set `commands.paywall` to `in_progress` and write the current UTC timestamp. Do not add `purchases_flutter` to the stub, and do not copy the Expo TypeScript module into a Flutter app. The tested paywall is `platforms/expo/template/src/features/billing`. Record step `2` as `blocked`, set `commands.paywall.status` to `blocked`, and stop after showing the manual steps when `storeTargets` includes `play`.

### Manual steps

Live Play products and the Play-to-RevenueCat service account need an app that already exists in Play Console. Show this block only when `storeTargets` includes `play`. The citations are in `docs/billing-setup.md`, checked on 2026-10-20.

- Play billing features, including configuring products, stay unavailable until a version of the app that includes the Play Billing Library is published to a track. Internal testing counts. [Getting ready](https://developer.android.com/google/play/billing/getting-ready) says to create the app and publish to any track, including the internal test track.
- An in-app product is created inside that app at Monetize with Play > Products > In-app products. Product IDs are permanent. [Create an in-app product](https://support.google.com/googleplay/android-developer/answer/1153481) is the Play Console Help page.
- RevenueCat's [Google Play Service Credentials](https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials) lists "Your app created in Google Play Console" as a prerequisite. The next step adds that existing app under the service account's App permissions. New credentials can take up to 36 hours to work.

If `answers.allowLiveStoreProducts` is not `yes`, do not create those products and do not link the service account.

## Rollback

Set `commands.paywall.status` to `blocked` and timestamp it. Leave `docs/monetization.md` in place. Do not delete `.shipkit/state.json`. Do not add a Flutter package as part of rolling back.
