## Preconditions

- `.shipkit/state.json` exists and `platform` is `ios`.
- `storeTargets` is `appstore`.
- `commands.plan-pricing.status` is `done`, and `docs/monetization.md` exists.
- `docs/billing-setup.md` exists.
- The iOS template is still a stub. It has no billing module.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If `commands.paywall.status` is `done` and `kitVersion` matches `package.json` `version`, report that the paywall already finished and stop. If `commands.plan-pricing.status` is not `done`, set `commands.paywall.status` to `blocked` and stop. If `answers.monetizationModel` is `free` or `answers.entitlementId` is blank, set `commands.paywall` to `skipped` with an empty `steps` object and stop. Otherwise record step `1` as `done`.
2. Set `commands.paywall` to `in_progress` and write the current UTC timestamp. Do not add the RevenueCat iOS SDK to the stub, and do not copy the Expo TypeScript module into a Swift app. The tested paywall is `platforms/expo/template/src/features/billing`. Play Console steps do not apply to this platform. If `answers.allowLiveStoreProducts` is not `yes`, do not create App Store products. Record step `2` as `blocked`, set `commands.paywall.status` to `blocked`, and stop.

### Manual steps

This platform ships to the App Store. Creating a product there is a live-console action and waits for `answers.allowLiveStoreProducts` to be `yes`. Google Play product setup and the Play service-account link are documented in `docs/billing-setup.md` for platforms whose `storeTargets` include `play`. They are not steps on this platform.

## Rollback

Set `commands.paywall.status` to `blocked` and timestamp it. Leave `docs/monetization.md` in place. Do not delete `.shipkit/state.json`.
