# fastAppshipKit

![Project status](https://img.shields.io/badge/status-in%20development-orange)

fastAppshipKit is a planned open-source starter kit for shipping mobile apps with AI coding agents. A developer will choose a platform, then use slash commands in Claude Code, Cursor, Codex, or a similar agent to scaffold the project and follow shared workflows. Platform-specific adapters, reusable workflows, and agent-readable instructions are the intended shape of the kit. None of that behavior is implemented yet.

> **Work in progress.** This repository is a foundation only. Commands, APIs, file layouts, and architecture may change before the first usable release. Do not treat the decisions in `docs/DECISIONS.md` as a stable public API.

## Supported platforms

The kit is planned to target one platform per generated app:

1. **React Native (Expo)**
2. **Flutter**
3. **Android native** — Kotlin and Jetpack Compose
4. **iOS native** — Swift and SwiftUI

The planned adapter order is Expo, then Flutter, then Android native, then iOS native. That order is a development sequence, not a statement that any adapter works today.

## Installation and usage

The kit cannot initialize an app yet. `/ship-init`, `/ship-platform`, and `/ship-doctor` are reserved names and are not implemented.

What is implemented is the command contract and the compiler:

- `npm run lint:commands` checks command files, platform fragments, and manifests. `pnpm run lint:commands` runs the same script.
- `npm run compile -- --platform flutter` merges `env-check` for Flutter into each agent's project command location.

`env-check` documents a toolchain check. It does not install tools. See [docs/SPEC.md](docs/SPEC.md).

`plan-pricing` writes `docs/monetization.md` and stores the recommended entitlement and product ids in `.shipkit/state.json`. `paywall` adds the Expo RevenueCat screen in `platforms/expo/template/src/features/billing`. Live Play Console products wait for an explicit yes. The doc citations are in [docs/billing-setup.md](docs/billing-setup.md). `pnpm test:billing` runs the entitlement tests.

`analytics` adds the PostHog and Sentry wrapper in `platforms/expo/template/src/lib` and writes [docs/events.md](docs/events.md). Consent starts off and disables both. `pnpm test:analytics` covers that flag. EAS source maps are documented in [docs/analytics-setup.md](docs/analytics-setup.md).

`ai` records the model allowlist and the daily limit. The Expo hooks in `platforms/expo/template/src/features/ai` call the Supabase proxy and do not call OpenRouter. `pnpm test:ai` covers the client. `pnpm test:backend` covers the session check and the daily limiter.

Pre-permission screens for camera, photos, notifications, location, microphone, contacts, calendar, and Bluetooth are in `platforms/expo/template/src/features/permissions`. `pnpm test:permissions` covers the hook. There is no slash command for them.

`design` rebuilds screens from screenshots, a Figma frame, or a Stitch export. Screens use `src/theme` tokens and the components in `src/ui`. Real data is wired only when the developer names it. Otherwise the screen reads a typed mock through `DataSource`. `pnpm test:design` covers that builder.

`translate` keeps user-facing copy in `src/i18n/locales`. The agent writes the other languages. It does not call a translation API. Urdu and Arabic use right-to-left layout. `pnpm test:i18n` covers the catalog, the language switch, and those two layouts.

`legal` writes `docs/legal/privacy-policy.md` and `docs/legal/data-safety-answers.md` from the Expo app config, the template dependencies, `docs/events.md`, and the Supabase schema. The policy says it was generated from code and is not legal advice. A rerun lists what changed. `pnpm test:legal` checks that every template dependency is named.

`publish` walks a working app to a Google Play internal test. Listing copy goes in `fastlane/metadata/android`. Every Play Console action waits for an explicit yes. Asset sizes and click paths are in [docs/play-console-checklist.md](docs/play-console-checklist.md). The command stops at internal testing.

## Shared backend

Every platform will call one Supabase backend. The schema, the daily AI limit, and the OpenRouter proxy are in `backend/supabase/`. [docs/backend.md](docs/backend.md) has the setup commands and the HTTP contract.

The OpenRouter key stays in Supabase secrets. It does not belong in a mobile app. The files in this repo do not create a hosted project or set that key.

## Contributing

Contributions are welcome once you have read [CONTRIBUTING.md](CONTRIBUTING.md). In particular, do not contribute copied material from paid or closed-source starter kits.

## License

[MIT](LICENSE) © 2026 Maaz Bin Hassan
