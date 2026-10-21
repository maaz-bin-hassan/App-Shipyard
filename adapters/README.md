# Platform adapters

App Shipyard will keep each platform adapter in its own directory under `adapters/`. No adapter is implemented yet, and this directory does not contain application templates.

## Planned order

1. **Expo** — React Native
2. **Flutter**
3. **Android native** — Kotlin and Jetpack Compose
4. **iOS native** — Swift and SwiftUI

This is the planned development sequence from [ADR-002](../docs/DECISIONS.md).

## Manifest contract

The manifest the linter and compiler read is `platforms/<id>/platform.json`, specified in [docs/SPEC.md](../docs/SPEC.md). This directory does not contain those manifests or application templates. Private keys, store credentials, and service tokens do not belong in a manifest or in git.
