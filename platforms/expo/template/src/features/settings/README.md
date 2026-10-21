# Settings

`AnalyticsConsentSetting` is the control that turns PostHog and Sentry on or off. Consent starts off. The label comes from `consentCopy` and the active locale.

The component calls `useAnalyticsConsent`. It does not read `.env` and it does not send an event by itself. Product events go through `src/lib/analytics.ts`, and only after consent is on.
