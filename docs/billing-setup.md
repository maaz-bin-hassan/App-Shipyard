# Billing setup

Checked against the public docs on 2026-10-20. This file is the source for the paywall command's manual steps and for the regional price notes in plan-pricing. Prices in the app come from the store at runtime.

## Expo development build

RevenueCat's [Expo installation guide](https://www.revenuecat.com/docs/getting-started/installation/expo) says: "To use and test RevenueCat with Expo, you'll need to create an Expo development build."

The same page's Expo Go section says Expo Go does not support the native modules in-app purchases need. `react-native-purchases` includes a Preview API Mode that lets the app load inside Expo Go, and "real purchases will not function in this mode." A development build is required to test a purchase. Install `expo-dev-client` and `react-native-purchases` with `npx expo install`. The paywall in this kit uses `react-native-purchases` and its own screen. It does not install `react-native-purchases-ui`.

Configure the SDK with the public platform key, or with the Test Store key in a debug build. The Expo guide shows `Purchases.configure({ apiKey })` inside an effect, with a different key for iOS and Android. Public SDK keys stay in `.env`. A RevenueCat secret API key does not belong in the app.

## Offerings and prices

[Displaying products](https://www.revenuecat.com/docs/getting-started/displaying-products) says `getOfferings` fetches the offerings configured in the dashboard, and the current offering is `offerings.current`. The React Native sample reads `offerings.current.availablePackages` and, for one package, `offerings.current.monthly.product`.

[Offerings](https://www.revenuecat.com/docs/offerings/overview) says to build the paywall against the current offering so the dashboard can change it without an app update.

The [RevenueCat codelab on products and prices](https://revenuecat.github.io/codelabs/guides/get-products-and-prices.html) says each package wraps a product with a localized `priceString`, and to render that string directly. It says an empty `current` offering or an empty package list needs a guard. The paywall screen uses that string and has separate states for loading, a failed fetch, and no packages.

## Entitlements and restore

The Expo guide checks access with `customerInfo.entitlements.active[<my_entitlement_identifier>]`. One entitlement id covers the paid tier. The products from plan-pricing attach to that entitlement in the RevenueCat dashboard.

[Restoring purchases](https://www.revenuecat.com/docs/getting-started/restoring-purchases) shows `Purchases.restorePurchases()` for React Native. It says the method should be called from a user action such as a Restore button, because a programmatic call can surface an OS sign-in prompt. The paywall calls it only from Restore purchases.

## RevenueCat Test Store

The [Test Store](https://www.revenuecat.com/docs/test-and-launch/sandbox/test-store) guide describes a testing environment that works without platform setup. Test purchases update `CustomerInfo`, grant entitlements, and show up as sandbox data. React Native needs SDK `9.5.4` or newer. Older SDKs do not support Test Store products.

The same page says never to submit an app that is configured with a Test Store API key. Use the Test Store key for debug builds and the platform key for release builds. In release builds, the SDK crashes on purpose when it finds a Test Store API key. `selectRevenueCatApiKey` refuses a `test_` key when the build is a release.

A Test Store purchase is the verification path when Play Console or App Store Connect products do not exist yet. A store sandbox purchase is the path after those products exist.

## Play Console products need an existing app

[Getting ready](https://developer.android.com/google/play/billing/getting-ready) (page updated 2026-09-09) says a developer account is not enough to configure products:

> Once you've set up a developer account, you must publish a version of your app that includes the Google Play Billing Library. This step is required to enable billing-related features in the Google Play Console, such as configuring the products you want to sell.

The upload step on that page says to create the app and publish to any track, including the internal test track.

[Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152) starts with Home > Create app in Play Console. The app record exists before a product can be attached to it.

[Create an in-app product](https://support.google.com/googleplay/android-developer/answer/1153481) tells the developer to open Play Console and go to Monetize with Play > Products > In-app products, then Create product. That page is inside an app. The same page says product IDs are unique for the app and cannot be changed or reused. They must start with a number or lowercase letter and may contain numbers, lowercase letters, underscores, and periods. The product ID `android.test` is unavailable, as is any id that starts with `android.test`. The app's manifest must declare `com.android.vending.BILLING`.

Creating or activating those products is a live-console action. The paywall command stops until `answers.allowLiveStoreProducts` is an explicit yes.

## Play-to-RevenueCat service account needs that app

[Google Play Service Credentials](https://www.revenuecat.com/docs/service-credentials/creating-play-service-credentials) lists this prerequisite:

> Your app created in Google Play Console. If your app is brand new and its initial Play Console setup (store listing, first build upload) isn't finished, Google may not recognize your package name yet.

Step 2 of that guide is "Add the service account to your app in Google Play Console." It says the service account cannot see the app yet, and under App permissions the developer adds the app the account should access. That step cannot be done before the app exists. The guide also says new credentials can take up to 36 hours to work with the Google Play Developer API.

The service-account JSON is a secret. It stays out of the repo, out of `.shipkit/state.json`, and out of the transcript. Linking it, and granting permissions that can create Play products, waits for the same explicit yes.

## Regional prices

[Create an in-app product](https://support.google.com/googleplay/android-developer/answer/1153481) says the price can be entered in the local currency or taken from a pricing template. For a CSV import, setting auto-fill prices uses "current exchange rates and locally relevant pricing patterns" to set the other countries where the app is distributed. The same page also shows a manual per-country price list. Those are console settings.

plan-pricing may suggest a primary price and a lower local price for a low-income or price-sensitive country the developer named. Those suggestions are for the console. The paywall displays `priceString` from the current offering and does not copy the suggestion into source.

When the store target is the App Store, the price is chosen from Apple's price points in App Store Connect. The same rule applies: the suggestion stays in `docs/monetization.md`, and the screen shows the store string.

## What the Expo template implements

`platforms/expo/template/src/features/billing` has:

- `useEntitlement`, which reads `entitlements.active` and updates when customer info changes
- `GatedFeature`, which renders its children only while that entitlement is active
- `PaywallScreen`, which loads the current offering and handles loading, error, and no packages
- a Restore purchases control that calls `restorePurchases`
- `selectRevenueCatApiKey`, which keeps the Test Store key off release builds

`pnpm test:billing` covers the entitlement hook, the gate, restore, and the offering states with a stand-in client. A purchase on a development build is still required before the paywall command is `done`.
