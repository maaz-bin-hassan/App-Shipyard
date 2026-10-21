# Privacy policy

This privacy policy was generated from the code listed under Sources. It is not legal advice and it must be reviewed before you publish it or submit it to a store.

## Sources

Platform evidence: expo template.

- `platforms/expo/template/app.config.ts`
- `platforms/expo/template/package.json`
- `docs/events.md`
- `backend/supabase/migrations/001_profiles.sql`
- `backend/supabase/migrations/002_ai_usage.sql`
- `backend/supabase/functions/ai-proxy/handler.ts`
- `platforms/expo/template/src/lib/analytics.ts`
- `platforms/expo/template/src/lib/consent.ts`
- `platforms/expo/template/src/features/ai/aiClient.ts`
- `platforms/expo/template/src/features/billing/revenueCatClient.ts`
- `platforms/expo/template/src/features/permissions`
- `docs/analytics-setup.md`

## App

Configured name: `{{appName}}`. iOS bundle id: `{{applicationId}}`. Android package: `{{applicationId}}`.

## Data the code shows

- Personal info / User IDs. Columns: profiles (id, display_name, created_at, updated_at); ai_usage (user_id, day, request_count). `platforms/expo/template/src/features/ai/aiClient.ts` sends the session token to the AI proxy.
- Financial info / Purchase history. `platforms/expo/template/src/features/billing/revenueCatClient.ts` calls `getCustomerInfo`, `purchasePackage`, and `restorePurchases`.
- App activity / App interactions. Events: permission_allowed, permission_not_now, permission_settings_opened, ai_message_sent, ai_completion_requested. Properties stay coarse (`docs/events.md`). The wrapper is `platforms/expo/template/src/lib/analytics.ts`.
- App activity / Other user-generated content. No message, content, or prompt column is in the schema. `backend/supabase/functions/ai-proxy/handler.ts` posts `model` and `messages` to `https://openrouter.ai/api/v1/chat/completions`. `docs/events.md` records the model id, not the prompt.
- App info and performance / Crash logs. `platforms/expo/template/src/lib/sentry.ts` and `platforms/expo/template/src/lib/analytics.ts`. Source map upload uses an EAS token that stays out of the app.
- App info and performance / Diagnostics. The same Sentry path as crash logs. The template does not show a separate diagnostics product.
- Device or other IDs / Device or other IDs. The analytics wrapper can call `identify`. `expo-device`, `expo-application`, and `expo-localization` are PostHog install peers in `docs/analytics-setup.md`. The template does not show an advertising id.

This draft does not claim a practice that those files do not show. It does not state a retention period for PostHog, Sentry, RevenueCat, or OpenRouter, because that period is not in this repo.

## SDKs

Every dependency in the app package is listed here.

### `@sentry/react-native`

Role: Crash reporting.

Crashes go through `platforms/expo/template/src/lib/sentry.ts` and the same analytics wrapper. Consent starts off in `platforms/expo/template/src/lib/consent.ts`. Nothing is sent until the person turns it on in `platforms/expo/template/src/features/settings/AnalyticsConsentSetting.ts`. `SENTRY_AUTH_TOKEN` is an EAS build secret and is not an app dependency value.

### `expo`

Role: App runtime.

This package is the Expo runtime. The template does not show it collecting personal data by itself. The Expo modules below are separate dependencies.

### `expo-application`

Role: PostHog install peer.

Installed with PostHog (`docs/analytics-setup.md`). Consent starts off in `platforms/expo/template/src/lib/consent.ts`. Nothing is sent until the person turns it on in `platforms/expo/template/src/features/settings/AnalyticsConsentSetting.ts`.

### `expo-audio`

Role: Microphone permission.

The pre-permission screen explains the microphone. The template does not upload a recording.

### `expo-calendar`

Role: Calendar permission.

The pre-permission screen explains calendar access. The template does not upload an event. `docs/events.md` says not to send the contents of a calendar event.

### `expo-camera`

Role: Camera permission.

The pre-permission screen explains camera use. The template does not upload a photo. See `platforms/expo/template/src/features/permissions`.

### `expo-contacts`

Role: Contacts permission.

The pre-permission screen explains contacts. The template does not upload a contact. `docs/events.md` says not to send the contents of a contact.

### `expo-device`

Role: PostHog install peer.

Installed with PostHog (`docs/analytics-setup.md`). Consent starts off in `platforms/expo/template/src/lib/consent.ts`. Nothing is sent until the person turns it on in `platforms/expo/template/src/features/settings/AnalyticsConsentSetting.ts`.

### `expo-file-system`

Role: PostHog install peer.

Installed with PostHog (`docs/analytics-setup.md`). Consent starts off in `platforms/expo/template/src/lib/consent.ts`. Nothing is sent until the person turns it on in `platforms/expo/template/src/features/settings/AnalyticsConsentSetting.ts`.

### `expo-image-picker`

Role: Photo library permission.

The pre-permission screen explains photo access. The template does not upload a picture. `docs/events.md` says not to send the contents of a photo.

### `expo-localization`

Role: Reads the device language.

Used to choose a locale and, with PostHog, as an install peer. The template does not show a separate upload of the locale. See `platforms/expo/template/src/i18n/setup.ts` and `docs/analytics-setup.md`.

### `expo-location`

Role: Location permission.

The pre-permission screen explains location. The template does not read or store coordinates.

### `expo-notifications`

Role: Notification permission.

The pre-permission screen explains notifications. The template does not show a push token being uploaded.

### `i18next`

Role: In-app translation.

Strings stay in locale JSON. The template does not show i18next sending those strings off the device.

### `posthog-react-native`

Role: Product analytics.

Events in `docs/events.md` are sent only through `platforms/expo/template/src/lib/analytics.ts`. Consent starts off in `platforms/expo/template/src/lib/consent.ts`. Nothing is sent until the person turns it on in `platforms/expo/template/src/features/settings/AnalyticsConsentSetting.ts`.

### `react`

Role: UI library.

No network collection is shown for this package.

### `react-native`

Role: UI runtime.

No network collection is shown for this package by itself.

### `react-native-purchases`

Role: Purchases through RevenueCat.

`platforms/expo/template/src/features/billing/revenueCatClient.ts` configures the SDK with a public key and calls purchase, restore, and customer info. It does not read a card number. Purchase history is handled by RevenueCat when those calls run.

No advertising SDK is in this dependency list.

## Server-side services

### Supabase

`public.profiles` stores the auth user id, an optional display name, and timestamps. `public.ai_usage` stores the user id, the UTC day, and a request count. Row level security limits a signed-in user to their own rows. The app calls `functions/v1/ai-proxy` with the user session token. Evidence: the migration files and `platforms/expo/template/src/features/ai/aiClient.ts`.

### OpenRouter

The edge function posts the model id and the message text to `https://openrouter.ai/api/v1/chat/completions`. The OpenRouter key stays a Supabase secret. It is not an app dependency. The response body from a failed provider call is not forwarded. Evidence: `backend/supabase/functions/ai-proxy/handler.ts`.

## Permissions

- `NSCameraUsageDescription`: The camera lets you take a photo in the app, for example a profile picture or a scan.
- `NSPhotoLibraryUsageDescription`: Photo access lets you choose a picture you already have and attach it.
- `NSLocationWhenInUseUsageDescription`: Location lets the app show nearby results and set your place on the map.
- `NSMicrophoneUsageDescription`: The microphone lets you record a voice message in the app.
- `NSContactsUsageDescription`: Contacts lets you pick a person to invite without typing their details.
- `NSCalendarsUsageDescription`: Calendar access lets the app add an event you create to your calendar.
- `NSBluetoothAlwaysUsageDescription`: Bluetooth lets the app connect to a nearby device it works with.
- `android.permission.CAMERA`
- `android.permission.READ_MEDIA_IMAGES`
- `android.permission.ACCESS_COARSE_LOCATION`
- `android.permission.ACCESS_FINE_LOCATION`
- `android.permission.RECORD_AUDIO`
- `android.permission.READ_CONTACTS`
- `android.permission.READ_CALENDAR`
- `android.permission.WRITE_CALENDAR`
- `android.permission.BLUETOOTH_CONNECT`
- `android.permission.POST_NOTIFICATIONS`

Config plugins: `expo-localization`, `expo-camera`, `expo-image-picker`, `expo-location`, `expo-audio`, `expo-contacts`, `expo-calendar`, `expo-notifications`.

Bluetooth is declared with `NSBluetoothAlwaysUsageDescription` and `android.permission.BLUETOOTH_CONNECT` when those strings are in the config. Expo has no first-party Bluetooth permission package in this template.

iOS notifications are requested through `expo-notifications`. This config has no separate notification usage string.

## Analytics events

These names come from `docs/events.md`. Screen names are not rows in that file.

- `permission_allowed`: The person taps Allow and the operating system grants that permission. Properties: permission.
- `permission_not_now`: The person taps Not now on a pre-permission screen. Properties: permission.
- `permission_settings_opened`: The person opens system settings after that permission was denied with no further prompt. Properties: permission.
- `ai_message_sent`: A signed-in person sends a chat message and the AI proxy accepts it. Properties: model.
- `ai_completion_requested`: A signed-in person requests a one-shot completion and the AI proxy accepts it. Properties: model.

## Database

- `public.profiles`: id, display_name, created_at, updated_at
- `public.ai_usage`: user_id, day, request_count

The schema does not store message text. AI message text is forwarded by the edge function and is not a column.

## Consent

Analytics and crash reporting stay off until the person enables them. Evidence: `platforms/expo/template/src/lib/consent.ts`.

## Deletion

Deleting an `auth.users` row cascades to `profiles` and `ai_usage` (`on delete cascade`).
`profiles_delete_own` lets a signed-in user delete their own profile row.
The Expo template has no screen that deletes the auth user or sends a deletion request. Do not answer the Play deletion question as Yes until that path exists.

## Account creation

The schema references `auth.users`. The template has no sign-up screen, so this draft does not name a creation method.

## Encryption in transit

The OpenRouter call in the edge function uses `https://openrouter.ai`. The Supabase URL is copied from `EXPO_PUBLIC_SUPABASE_URL` without an https check in `aiClient.ts`. The PostHog host is chosen by the developer and is not checked in the analytics wrapper. Do not answer the Play question as Yes until those hosts are https in the configuration you ship.

## Children

Nothing in the code states an age group or a children's policy.

## Contact

A contact address is not present in the code. Add one before you publish.
