# Platform adapters

fastAppshipKit will keep each platform adapter in its own directory under `adapters/`. No adapter is implemented yet, and this directory does not contain application templates.

## Planned order

1. **Expo** — React Native
2. **Flutter**
3. **Android native** — Kotlin and Jetpack Compose
4. **iOS native** — Swift and SwiftUI

This is the planned development sequence from [ADR-002](../docs/DECISIONS.md).

## Manifest contract

Each adapter will add a manifest that agents can read before running commands. The minimum fields are defined in [ADR-003](../docs/DECISIONS.md):

- `id`
- `displayName`
- `status` (`planned`, `experimental`, or `supported`)
- `prerequisites`
- `commands`
- `configuration` (non-secret keys only)
- `capabilities`

A manifest with `status: planned` describes intent. It does not mean the adapter can scaffold an app. Private keys, store credentials, and service tokens do not belong in a manifest or in git.
