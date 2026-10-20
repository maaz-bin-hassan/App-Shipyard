# Analytics and crash reporting

PostHog records product events. Sentry records crashes. Both stay off until the person turns on the consent flag in settings. The wrapper is `platforms/expo/template/src/lib/analytics.ts`. Checked against vendor docs on 2026-10-20.

## PostHog

Install in an Expo app with:

```powershell
npx expo install posthog-react-native expo-file-system expo-application expo-device expo-localization
```

`EXPO_PUBLIC_POSTHOG_API_KEY` and `EXPO_PUBLIC_POSTHOG_HOST` are public project values. The host is `https://us.i.posthog.com` or `https://eu.i.posthog.com`. Do not put a PostHog personal API key in the app.

Construct the client with `defaultOptIn: false`. Pass it through `bindPostHog`, then `createAnalytics`. The wrapper calls `optOut` while consent is off and `optIn` when consent is on. `track` maps to PostHog `capture`. `reset` still runs on logout so the next person on the device does not keep the previous id.

[React Native](https://posthog.com/docs/libraries/react-native) documents `capture`, `identify`, `screen`, `reset`, `optIn`, and `optOut`.

## Sentry

Use `@sentry/react-native`. The older `sentry-expo` package is deprecated. [Sentry for Expo](https://docs.sentry.io/platforms/react-native/guides/expo/) requires Expo SDK 50 or newer.

`EXPO_PUBLIC_SENTRY_DSN` may live in the app. `SENTRY_AUTH_TOKEN` may not. It is an EAS environment variable for the build that uploads source maps. Do not write it into `app.json`, `eas.json`, `.env` committed examples, or `.shipkit/state.json`.

Add the config plugin so EAS Build uploads source maps. [Uploading Source Maps with Expo](https://docs.sentry.io/platforms/react-native/guides/expo/sourcemaps/uploading/expo/) shows this block. `organization` and `project` are the slugs from `answers`. There is no auth token in the block.

```json
{
  "plugins": [
    [
      "@sentry/react-native/expo",
      {
        "url": "https://sentry.io/",
        "organization": "<sentry-organization-slug>",
        "project": "<sentry-project-slug>"
      }
    ]
  ]
}
```

Point Metro at the Sentry config so bundles get Debug IDs:

```javascript
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

module.exports = config;
```

Source maps upload on EAS Build and on a local release prebuild when `SENTRY_AUTH_TOKEN` is present. Debug builds do not upload, because the dev server already symbolicates. For EAS Update, the same doc says to run `npx @sentry/expo-upload-sourcemaps dist` after `eas update`, with the token in the environment for that one command. Do not echo the token.

Initialize Sentry with `enabled: false` until consent is on. `bindSentry` is the crash side of the wrapper. `captureException` does nothing while consent is off.

A test crash is `analytics.captureException(new Error("fastAppshipKit test crash"))` after consent is on, in a build that uploaded source maps. The issue in Sentry should show frames from the original source.
