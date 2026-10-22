# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- `createshipyard --platform expo` writes a publishable app in that one command. The paywall, pricing note, Supabase backend, design shell, English catalog, and legal drafts are files in the new project. The remaining inputs are the logo and `.env`. The default platform stays Flutter.

## [1.1.0] - 2026-10-22

### Changed

- Android SDK env-check uses an installed platform instead of failing when the named API level is missing. `createshipyard` defaults to Flutter. Pass `--platform expo` for the Expo template.
- CocoaPods env-check accepts a newer major. `pod --version` no longer has to contain `1.`.

## [1.0.0] - 2026-10-21

### Added

- `createshipyard` CLI in `cli/`. It copies one platform template, syncs slash commands, writes a project `AGENTS.md`, initializes git, and installs dependencies. `ship-update` applies `docs/migrations/<version>.md` after a git checkpoint. CI covers lint, types, unit tests, the command contract, and `scripts/e2esmoke.sh`. The release workflow is present and disabled.
- `publish` command and Play Console notes in `docs/play-console-checklist.md`. Internal testing waits for an explicit yes at each console step. Listing text, icons, and screenshots are checked against the current Play asset rules.
- `design`, `translate`, and `legal` commands. Expo theme tokens and screen components, locale JSON with Urdu and Arabic RTL checks, and a privacy draft plus Play Data safety answers generated from the template's dependencies, permissions, events, and Supabase schema.
- `analytics` and `ai` commands. Expo template wrappers for PostHog and Sentry, a consent flag, the event list in `docs/events.md`, streaming and one-shot AI hooks, and eight pre-permission screens.
- `plan-pricing` and `paywall` commands, Play Console billing notes in `docs/billing-setup.md`, and an Expo RevenueCat paywall module with entitlement tests.
- Repository foundation: project overview, MIT license, ignore rules, contribution guidelines, and this changelog.
- Architecture decisions for platform selection, adapter order, the adapter manifest contract, shared backend, billing, analytics, AI model routing, and slash-command names.
- Adapter directory with the planned manifest contract and implementation order.
- Command specification, platform manifests, `env-check` source files, command linter, and per-agent compiler.
- Shared Supabase backend: profile and AI usage migrations, an OpenRouter edge proxy, and tests for row level security and the daily request limit.
