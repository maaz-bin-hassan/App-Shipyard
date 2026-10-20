---
description: Add PostHog analytics and Sentry crashes behind one consent flag, and write the event list.
argument-hint: "(none)"
---

## Goal

Add product analytics and crash reporting, and write `docs/events.md` so a later legal pass can see every event the app sends.

PostHog is called only through the wrapper in `src/lib/analytics.ts`: `track`, `identify`, `reset`, and `screen`. Sentry receives crashes through that same wrapper. A settings control turns both off. Consent starts off.

Source maps upload during EAS builds. `SENTRY_AUTH_TOKEN` stays an EAS environment variable.

## Ask

Ask these three questions in one batch before Steps. On resume, reuse `answers` and do not ask again.

| Id | Question | Record |
| --- | --- | --- |
| `posthogHost` | Which PostHog ingest host should the app use? | `https://us.i.posthog.com` or `https://eu.i.posthog.com`. |
| `sentryOrganization` | What is the Sentry organization slug? | Non-empty string. |
| `sentryProject` | What is the Sentry project slug? | Non-empty string. |

Do not ask for the PostHog project key, the Sentry DSN, or `SENTRY_AUTH_TOKEN`. Those belong in `.env` or in EAS. Do not record them in `answers`.

## Verify

`docs/events.md` equals `renderEventsMarkdown()` from `platforms/expo/template/src/lib/events.ts`. Every catalog name is a row, and the file has no other event names. `pnpm test:analytics` passes.

With consent off, `track`, `identify`, `screen`, and `captureException` do not call PostHog or Sentry. `reset` still clears the identified user. The settings control is the only place that turns consent on.

The command is `done` only when a consented build shows one catalog event in PostHog and a test crash in Sentry whose stack frames resolve through the uploaded source maps. `answers.posthogHost` is one of the two hosts. The transcript and state file contain no project keys, DSNs, or auth tokens.

## Never

Do not print `.env`, `SENTRY_AUTH_TOKEN`, or a PostHog personal API key. Do not commit those values or write them into `answers`, `app.json`, or `eas.json`. Do not send an event or a crash while consent is off. Do not call PostHog or Sentry except through `src/lib/analytics.ts`. Do not add an event in code without adding it to `EVENTS` and regenerating `docs/events.md`. Do not mark the command `done` before the PostHog event and the Sentry crash have both been seen. Do not create a paid PostHog or Sentry plan.
