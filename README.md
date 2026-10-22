# App Shipyard

App Shipyard is a starter kit for shipping one mobile app with an AI coding agent. You scaffold the app with `createshipyard`, then run the same `/ship-*` commands in Claude Code, Cursor, OpenCode, Google Antigravity, or Codex.

Version 1.1.0. The commands, the Expo template, and the CLI tests live in this repository.

## 60-second quick start

You need Git and Node.js. The Expo env-check accepts Node.js 22.13 or newer on the 22 line, 24.3 or newer on the 24 line, or an even major of 26 or newer. CI installs dependencies with pnpm 10.

```bash
git clone https://github.com/maaz-bin-hassan/FastAppShip-kit.git
cd FastAppShip-kit
pnpm install
pnpm cli:build
node cli/dist/index.js my-app
```

That copies the Flutter template, compiles the slash commands, writes `AGENTS.md` and `.shipkit/state.json`, initializes git, and installs the app dependencies. Then open `my-app` in the agent you selected and run `/ship-start`. Pass `--platform expo` for the Expo template.

Flags:

- `--agent claude|cursor|opencode|all` (default `claude`)
- `--platform expo|flutter|android|ios` (default `flutter`)
- `--pm npm|pnpm|yarn` (default `npm`)
- `--no-install`

`ios` is refused when `node -p process.platform` is not `darwin`.

`npm run pack:npm` writes `release/createshipyard-1.1.0.tgz`. That tarball is the npm package. It is not on the npm registry until it is published. After it is published, the scaffold command is `npx createshipyard my-app`.

The step-by-step check is [docs/TESTING.md](docs/TESTING.md).

## What is included

`createshipyard` copies the Flutter template by default. Pass `--platform expo` for the Expo path. These commands have core files and an Expo fragment:

| Command | What it does |
| --- | --- |
| `start` | Saves the platform, the app identity, and the store targets, then runs env-check. |
| `env-check` | Runs the toolchain commands in the platform manifest. It installs a tool only after an explicit yes. |
| `plan-pricing` | Writes `docs/monetization.md` and the entitlement ids. It does not create store products. |
| `paywall` | Gates premium features with the RevenueCat module in the Expo template. Live store products wait for an explicit yes. |
| `analytics` | Adds the PostHog and Sentry wrapper. Consent starts off. |
| `ai` | Records the model allowlist and the daily limit. The app calls the Supabase proxy, not OpenRouter. |
| `design` | Rebuilds screens from screenshots, a Figma frame, or a Stitch export using theme tokens. |
| `translate` | Puts user-facing strings in locale JSON. The agent writes the translations. Urdu and Arabic use RTL. |
| `legal` | Drafts a privacy policy and Play Data safety answers from the code. The draft says it is not legal advice. |
| `publish` | Walks a working app to a Google Play internal test. Each console action waits for an explicit yes. It stops at internal testing. |
| `update` | Applies `docs/migrations/<version>.md` after a git checkpoint. |

`pnpm test` runs the CLI scaffold test, the Supabase row-level-security and daily-limit tests, and the Expo template tests for billing, analytics, AI, permissions, design, i18n, and the legal draft. `scripts/e2esmoke.sh` scaffolds an Expo app, then runs `tsc --noEmit` and `expo export --platform android`.

The shared Supabase schema and the OpenRouter proxy are in `backend/supabase/`. The OpenRouter key is a Supabase secret. It is not in the mobile app.

## Supported agents

| Agent | Project file | How you invoke it |
| --- | --- | --- |
| Claude Code | `.claude/commands/ship-<name>.md` | `/ship-<name>` |
| Cursor | `.cursor/commands/ship-<name>.md` | `/ship-<name>` |
| OpenCode | `.opencode/commands/ship-<name>.md` | `/ship-<name>` |
| Google Antigravity | `.agents/skills/ship-<name>/SKILL.md` | `/ship-<name>` |
| Codex | The merged command in `AGENTS.md` | Ask for `ship-<name>` |

`createshipyard --agent all` writes Claude Code, Cursor, and OpenCode. Antigravity and Codex are written by:

```bash
node scripts/compile-commands.mjs --platform expo --agents antigravity,codex
```

## Roadmap

iOS native commands and the env-check are in `platforms/ios`. The template is the README in `platforms/ios/template`. There is no tested SwiftUI app in this repository. Building that path needs macOS and Xcode.

The Flutter commands are in `platforms/flutter`. The template is the README in `platforms/flutter/template`. There is no tested Flutter project in this repository.

The Android native commands are in `platforms/android`. The template is the README in `platforms/android/template`. There is no tested Kotlin project in this repository. The Play internal-test steps are written for a working app and have not been executed against a Play Console account from this repo.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Do not contribute copied material from paid or closed-source starter kits.

## License

[MIT](LICENSE) © 2026 Maaz Bin Hassan
