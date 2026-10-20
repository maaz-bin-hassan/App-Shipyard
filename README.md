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

Installation and usage instructions are not available yet.

When the kit can initialize a project, this section will document how to install it and how to run the planned commands, including `/ship-init`, `/ship-platform`, and `/ship-doctor`. Those commands are names reserved by the project decisions. They are not implemented in this repository.

## Contributing

Contributions are welcome once you have read [CONTRIBUTING.md](CONTRIBUTING.md). In particular, do not contribute copied material from paid or closed-source starter kits.

## License

[MIT](LICENSE) © 2026 Maaz Bin Hassan
