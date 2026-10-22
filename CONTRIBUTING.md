# Contributing to App Shipyard

Thanks for your interest in App Shipyard. The repository version is 1.1.0. Commands and architecture can still change. Read [docs/SPEC.md](docs/SPEC.md) before editing `commands/` or `platforms/`.

## Originality and intellectual property

Contributors must not paste, copy, or redistribute code, text, screenshots, branding, templates, or other proprietary material from paid or closed-source starter kits.

Contributions must be original or appropriately licensed. Contributors must respect third-party licenses and attribution requirements. If a change depends on another project, name that project and include the license terms its authors require.

Do not add API keys, credentials, tokens, or private environment files.

## Prerequisites

You need Git. Use the toolchain for the area you change:

- JavaScript and Expo work should use pnpm 10. `pnpm install --frozen-lockfile` matches CI.
- Flutter work needs the Flutter SDK.
- Android work needs Android Studio, a JDK, and the Android SDK.
- iOS work needs Xcode on macOS.

Read [docs/DECISIONS.md](docs/DECISIONS.md) before changing architecture. Do not describe planned behavior as implemented.

## Branches, commits, and pull requests

- Branch from `main`. Use a short branch name such as `docs/adapter-contract` or `feat/expo-manifest`.
- Keep commits focused. Write messages that explain why the change exists. The foundation commit uses a `chore:` prefix; match that style when it fits.
- Open a pull request against `main` with a summary, a test plan, and links to related issues.
- Do not force-push shared branches, and do not commit generated dependency folders or secrets.

## Testing and documentation

When code exists, add or update tests for the behavior you change. Run `pnpm test:backend`, `pnpm test:billing`, `pnpm test:analytics`, `pnpm test:ai`, `pnpm test:permissions`, `pnpm test:design`, `pnpm test:i18n`, `pnpm test:legal`, or `pnpm test:cli` for the area you change. `pnpm tsc`, `pnpm lint`, and `pnpm lint:commands` check types, the Expo template, and the command contract. `pnpm smoke` scaffolds an Expo app and runs `tsc --noEmit` plus `expo export --platform android`.

Update the README, changelog, and architecture notes when a change affects setup, commands, or decisions. Documentation should distinguish planned work from working behavior.

## Reporting bugs and proposing features

Open an issue for a bug or a feature idea. Include what you expected, what happened, and the platform involved. Feature proposals should say which platform adapter they affect and whether they change a decision in `docs/DECISIONS.md`.
