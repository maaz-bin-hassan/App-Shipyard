# Contributing to fastAppshipKit

Thanks for your interest in fastAppshipKit. The repository is in early development. APIs, commands, and architecture may change.

## Originality and intellectual property

Contributors must not paste, copy, or redistribute code, text, screenshots, branding, templates, or other proprietary material from paid or closed-source starter kits.

Contributions must be original or appropriately licensed. Contributors must respect third-party licenses and attribution requirements. If a change depends on another project, name that project and include the license terms its authors require.

Do not add API keys, credentials, tokens, or private environment files.

## Prerequisites

You need Git. Use the toolchain for the area you change:

- JavaScript and Expo work should use pnpm when a package manager is required. This repository does not install dependencies yet.
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

When code exists, add or update tests for the behavior you change and run the relevant checks locally. This foundation has no test runner yet.

Update the README, changelog, and architecture notes when a change affects setup, commands, or decisions. Documentation should distinguish planned work from working behavior.

## Reporting bugs and proposing features

Open an issue for a bug or a feature idea. Include what you expected, what happened, and the platform involved. Feature proposals should say which platform adapter they affect and whether they change a decision in `docs/DECISIONS.md`.
