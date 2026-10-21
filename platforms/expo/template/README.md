# {{appName}}

Expo app for fastAppshipKit. `createshipyard` copies this folder into a new project. Install dependencies, then run `npx tsc --noEmit` and `npx expo export --platform android`.

The paywall module is in `src/features/billing` ([README](src/features/billing/README.md)). Analytics and crashes are in `src/lib`. The consent control is in `src/features/settings` ([README](src/features/settings/README.md)). AI calls are in `src/features/ai`. Pre-permission screens are in `src/features/permissions`. Theme tokens and screen components are in `src/theme` and `src/ui`. Locale strings are in `src/i18n`. `app.config.ts` lists the permissions the legal draft reads.

- Application id: {{applicationId}}
- Primary colour: {{primaryColor}}
