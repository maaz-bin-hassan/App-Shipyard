# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project has no release yet. Future releases are intended to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `plan-pricing` and `paywall` commands, Play Console billing notes in `docs/billing-setup.md`, and an Expo RevenueCat paywall module with entitlement tests.
- Repository foundation: project overview, MIT license, ignore rules, contribution guidelines, and this changelog.
- Architecture decisions for platform selection, adapter order, the adapter manifest contract, shared backend, billing, analytics, AI model routing, and slash-command names.
- Adapter directory with the planned manifest contract and implementation order.
- Command specification, platform manifests, `env-check` source files, command linter, and per-agent compiler.
- Shared Supabase backend: profile and AI usage migrations, an OpenRouter edge proxy, and tests for row level security and the daily request limit.
