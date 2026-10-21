# Billing

RevenueCat paywall for the Expo template. Prices come from the current offering at runtime. This folder does not contain a hard-coded amount.

`billingConfig.ts` holds `entitlementId` and `premiumFeatures`. The paywall command rewrites that file from `.shipkit/state.json`. An empty entitlement id keeps every gate locked.

`PaywallScreen` renders loading, error, and empty-offerings states, and lists each package `priceString`. Restore purchases is the Restore control. It is not called on launch. `GatedFeature` shows the feature when the entitlement is active and `PaywallScreen` when it is not. `PremiumExample` is the wrapper for a feature that has no screen yet.

`selectRevenueCatApiKey` chooses the Test Store key, the Apple key, or the Google key from `EXPO_PUBLIC_REVENUECAT_*` values in `.env`. Do not put a RevenueCat secret API key in the app or in git.

`pnpm test:billing` in the kit repository runs `useEntitlement.test.ts` and `paywall.test.ts`. Live Play Console products stay untouched until `answers.allowLiveStoreProducts` is `yes`.
