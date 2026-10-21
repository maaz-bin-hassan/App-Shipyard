# Google Play Data safety answers

These answers were generated from the code listed under Sources. They are not legal advice and they are not a Play Console submission. Review each answer before you enter it.

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

## Data collection and security

### Does your app collect or share any of the required user data types?

Answer: Yes

Evidence: the Yes rows in Data types below. Each one names the file that shows the collection.

### Is all of the user data collected by your app encrypted in transit?

Answer: Not shown. Do not select Yes.

Evidence: `backend/supabase/functions/ai-proxy/handler.ts` posts to `https://openrouter.ai/api/v1/chat/completions`. `platforms/expo/template/src/features/ai/aiClient.ts` does not require `EXPO_PUBLIC_SUPABASE_URL` to be https. The PostHog host is not checked in `platforms/expo/template/src/lib/analytics.ts`.

### Which methods of account creation does your app support?

Answer: Not shown. Do not select a method.

Evidence: the migrations reference `auth.users`. The Expo template has no sign-up screen.

### Do you provide a way for users to request that their data is deleted?

Answer: No

Evidence: `on delete cascade` removes `profiles` and `ai_usage` when an auth user is deleted, and `profiles_delete_own` can delete the profile row. The template has no deletion-request screen, so the form answer stays No.

## Data types

## Location

### Approximate location

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: Declared in `platforms/expo/template/app.config.ts`: `NSLocationWhenInUseUsageDescription`, `android.permission.ACCESS_COARSE_LOCATION`. The template does not read or store coordinates.

### Precise location

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: Declared in `platforms/expo/template/app.config.ts`: `NSLocationWhenInUseUsageDescription`, `android.permission.ACCESS_FINE_LOCATION`. The template does not read or store coordinates. `docs/events.md` has no location property.

## Personal info

### Name

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: `public.profiles.display_name` exists in `backend/supabase/migrations/001_profiles.sql`. The Expo template has no screen that writes it, so this draft does not treat the name as collected.

### Email address

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: The migrations do not define an email column. `auth.users` is referenced, and its columns are not created in these files.

### User IDs

Answer: Yes

Collected: Yes

Shared: Yes, with Supabase. RevenueCat also keeps its own app user id when `react-native-purchases` is installed.

Processed ephemerally: No. The id is the primary key of `profiles` and part of `ai_usage`.

Required: Required for a signed-in AI request. The template does not require a purchase to open.

Purposes: App functionality, Account management

Evidence: Columns: profiles (id, display_name, created_at, updated_at); ai_usage (user_id, day, request_count). `platforms/expo/template/src/features/ai/aiClient.ts` sends the session token to the AI proxy.

### Address

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No address column or form is in the schema or the template.

### Phone number

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No phone column or form is in the schema or the template.

### Race and ethnicity

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No such field is in the schema, events, or template.

### Political or religious beliefs

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No such field is in the schema, events, or template.

### Sexual orientation

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No such field is in the schema, events, or template.

### Other info

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No other personal-info field is shown beyond the rows above.

## Financial info

### User payment info

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: `platforms/expo/template/src/features/billing/revenueCatClient.ts` does not read a card, bank account, or billing address.

### Purchase history

Answer: Yes

Collected: Yes

Shared: Yes, with RevenueCat through `react-native-purchases`.

Processed ephemerally: No. The SDK keeps customer info.

Required: Optional. A purchase runs only when the person buys or restores.

Purposes: App functionality, Account management

Evidence: `platforms/expo/template/src/features/billing/revenueCatClient.ts` calls `getCustomerInfo`, `purchasePackage`, and `restorePurchases`.

### Credit score

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No credit field is in the schema or the template.

### Other financial info

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No other financial field is shown.

## Health and fitness

### Health info

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No health field or health SDK is shown.

### Fitness info

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No fitness field or fitness SDK is shown.

## Messages

### Emails

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: The template does not read or send email.

### SMS or MMS

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: The template does not read or send SMS or MMS.

### Other in-app messages

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: AI chat text is declared under App activity, Other user-generated content, so it is not omitted. It is not SMS, email, or a stored message column.

## Photos and videos

### Photos

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: Declared in `platforms/expo/template/app.config.ts`: `NSPhotoLibraryUsageDescription`, `android.permission.READ_MEDIA_IMAGES`. The template does not upload a photo. `docs/events.md` says not to send the contents of a photo. `NSCameraUsageDescription` is the camera prompt, not an upload.

### Videos

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No video permission or video upload is in the config or the template.

## Audio files

### Voice or sound recordings

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: Declared in `platforms/expo/template/app.config.ts`: `NSMicrophoneUsageDescription`, `android.permission.RECORD_AUDIO`. The template does not upload a recording.

### Music files

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No music library access is shown.

### Other audio files

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No other audio collection is shown.

## Files and docs

### Files and docs

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: `expo-file-system` is a PostHog install peer. The template does not show it uploading the person's files.

## Calendar

### Calendar events

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: Declared in `platforms/expo/template/app.config.ts`: `NSCalendarsUsageDescription`, `android.permission.READ_CALENDAR`, `android.permission.WRITE_CALENDAR`. The template does not upload a calendar event. `docs/events.md` says not to send calendar contents.

## Contacts

### Contacts

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: Declared in `platforms/expo/template/app.config.ts`: `NSContactsUsageDescription`, `android.permission.READ_CONTACTS`. The template does not upload a contact. `docs/events.md` says not to send contact contents.

## App activity

### App interactions

Answer: Yes

Collected: Yes, only while consent is on

Shared: Yes, with PostHog.

Processed ephemerally: No. PostHog stores events. Retention at PostHog is not in this repo.

Required: Optional. Consent starts off.

Purposes: Analytics

Evidence: Events: permission_allowed, permission_not_now, permission_settings_opened, ai_message_sent, ai_completion_requested. Properties stay coarse (`docs/events.md`). The wrapper is `platforms/expo/template/src/lib/analytics.ts`.

### In-app search history

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No search-history field or event is shown.

### Installed apps

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: The template does not read the list of installed apps.

### Other user-generated content

Answer: Yes

Collected: Yes, when a signed-in person sends an AI message

Shared: Yes, with OpenRouter through the Supabase `ai-proxy` function.

Processed ephemerally: Not shown. The SQL tables do not store the text. OpenRouter's retention is not in this repo, so do not mark this ephemeral.

Required: Required for the AI feature. The feature itself is not required to open the app.

Purposes: App functionality

Evidence: No message, content, or prompt column is in the schema. `backend/supabase/functions/ai-proxy/handler.ts` posts `model` and `messages` to `https://openrouter.ai/api/v1/chat/completions`. `docs/events.md` records the model id, not the prompt.

### Other actions

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No other action is shown beyond the events and the AI request count.

## Web browsing

### Web browsing history

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: The template does not read browsing history.

## App info and performance

### Crash logs

Answer: Yes

Collected: Yes, only while consent is on

Shared: Yes, with Sentry.

Processed ephemerally: No. Sentry stores the issue. Retention at Sentry is not in this repo.

Required: Optional. Consent starts off.

Purposes: Analytics

Evidence: `platforms/expo/template/src/lib/sentry.ts` and `platforms/expo/template/src/lib/analytics.ts`. Source map upload uses an EAS token that stays out of the app.

### Diagnostics

Answer: Yes

Collected: Yes, only while consent is on

Shared: Yes, with Sentry, as part of the crash report.

Processed ephemerally: No.

Required: Optional. Consent starts off.

Purposes: Analytics

Evidence: The same Sentry path as crash logs. The template does not show a separate diagnostics product.

### Other app performance data

Answer: No

Collected: No

Shared: No

Processed ephemerally: Not applicable

Required: Not applicable

Purposes: Not applicable

Evidence: No other performance SDK is shown.

## Device or other IDs

### Device or other IDs

Answer: Yes

Collected: Yes, only while consent is on

Shared: Yes, with PostHog.

Processed ephemerally: No.

Required: Optional. Consent starts off.

Purposes: Analytics

Evidence: The analytics wrapper can call `identify`. `expo-device`, `expo-application`, and `expo-localization` are PostHog install peers in `docs/analytics-setup.md`. The template does not show an advertising id.

## SDKs checked

Every app dependency is named in the privacy policy. This form uses the same list.

- `@sentry/react-native`
- `expo`
- `expo-application`
- `expo-audio`
- `expo-calendar`
- `expo-camera`
- `expo-contacts`
- `expo-device`
- `expo-file-system`
- `expo-image-picker`
- `expo-localization`
- `expo-location`
- `expo-notifications`
- `i18next`
- `posthog-react-native`
- `react`
- `react-native`
- `react-native-purchases`
