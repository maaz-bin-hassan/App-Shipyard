# {{appName}}

Expo app for App Shipyard. `createshipyard` copies this folder into a new project. Install dependencies, then run `npx tsc --noEmit` and `npx expo export --platform android`.

The paywall module is in `src/features/billing` ([README](src/features/billing/README.md)). Analytics and crashes are in `src/lib`. The consent control is in `src/features/settings` ([README](src/features/settings/README.md)). AI calls are in `src/features/ai`. Pre-permission screens are in `src/features/permissions`. Theme tokens and screen components are in `src/theme` and `src/ui`. Locale strings are in `src/i18n`. `app.config.ts` lists the permissions the legal draft reads.

- Application id: {{applicationId}}
- Primary colour: {{primaryColor}}

## What you add

Replace `assets/icon.png` with your logo. Copy `.env.example` to `.env` and fill the public keys. Secret keys stay out of the app: the OpenRouter key belongs in the Supabase project, and `SENTRY_AUTH_TOKEN` belongs in the build environment.

The paywall, the pricing note in `docs/monetization.md`, the Supabase backend, the home screen, the English catalog, and the legal drafts are already in this project. Store prices are loaded at runtime. The privacy draft in `docs/legal/privacy-policy.md` is not legal advice.
