## Preconditions

- `.shipkit/state.json` exists and `platform` is `ios`.
- `storeTargets` is `appstore`.
- `docs/analytics-setup.md` exists.
- The iOS template is still a stub. It has no PostHog or Sentry module.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If the state file is missing, create it with `platform` null, `storeTargets` [], `kitVersion` from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `platform` is not `ios`, set `commands.analytics.status` to `blocked` and stop. If `commands.analytics.status` is `done` and `kitVersion` matches `package.json` `version`, report that analytics already finished and stop. Otherwise record step `1` as `done`.
2. Set `commands.analytics` and step `2` to `in_progress` and write the current UTC timestamp. Write `answers.posthogHost`, `answers.sentryOrganization`, and `answers.sentryProject`. Write `docs/events.md` from `renderEventsMarkdown()` in `platforms/expo/template/src/lib/events.ts`. Do not copy the Expo TypeScript module into a Swift app, and do not add an iOS package to the stub. The tested wrapper is `platforms/expo/template/src/lib/analytics.ts`. Record step `2` as `blocked`, set `commands.analytics.status` to `blocked`, and stop.

## Rollback

Set `commands.analytics.status` to `blocked` and timestamp it. Leave `docs/events.md` in place. Do not delete `.shipkit/state.json`.
