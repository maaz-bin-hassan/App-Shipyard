# Launch drafts

Do not post these. Publish the npm tarball first if you want the `npx` line to work. Until that publish, point people at the clone commands in the README.

The facts below match this repository at version 1.0.0. Delete a sentence if you have not done the thing it describes.

## GitHub Discussions

Title: App Shipyard 1.0.0

Body:

App Shipyard 1.0.0 is the first version of this repository with a scaffold CLI, eleven slash commands, and an Expo template.

`createshipyard` copies that Expo template, compiles the same commands for Claude Code, Cursor, and OpenCode, and writes `.shipkit/state.json`. Antigravity and Codex are compiled by `scripts/compile-commands.mjs`. Flutter, Android native, and iOS native have command files and stub templates. Those three are not buildable projects yet.

The commands cover toolchain checks, a monetization note, a RevenueCat paywall, PostHog and Sentry with consent off by default, an AI proxy through Supabase, screen rebuilds, locale files, a privacy draft, and a Google Play internal-test walkthrough. Store uploads and paid setup stop until you answer yes.

Clone the repo and follow docs/TESTING.md. The npm package name is `createshipyard`. It is on npm only after the maintainer publishes `release/createshipyard-1.0.0.tgz`.

License: MIT.

## Short post (X or LinkedIn)

App Shipyard 1.0.0 is a starter kit for one mobile app and an AI coding agent.

The CLI scaffolds an Expo app and writes the same /ship-* commands for Claude Code, Cursor, and OpenCode. Antigravity and Codex read a compiled command file. Flutter, Android, and iOS templates are still stubs.

Play Console and paid products wait for an explicit yes. The test script is docs/TESTING.md.

https://github.com/maaz-bin-hassan/FastAppShip-kit

After `createshipyard` is on npm, you can add: `npx createshipyard my-app`

## Show HN

Title: Show HN: App Shipyard – slash commands that scaffold an Expo app for coding agents

App Shipyard is an MIT-licensed kit I built so the same shipping steps can run in more than one coding agent.

You clone the repo, build `createshipyard`, and point it at a new directory. It copies an Expo template, writes `.shipkit/state.json`, and compiles `/ship-*` commands for Claude Code, Cursor, and OpenCode. The command sources are split into a platform-neutral file and a per-platform fragment. A linter checks that split. Antigravity and Codex are output targets of the same compiler. I have not published the CLI to npm yet; `npm run pack:npm` builds the tarball.

What the Expo path includes: toolchain checks, a monetization markdown file, a RevenueCat paywall that reads store prices at runtime, PostHog and Sentry behind a consent flag that starts off, AI calls through a Supabase edge function so the provider key stays off the device, locale JSON with RTL for Urdu and Arabic, and a privacy draft generated from the app's dependencies. `publish` stops at Google Play internal testing and will not upload a build unless you answer yes.

Flutter, Android native, and iOS native are command stubs plus a README template. I have not shipped an app to Play from this repo. The fresh-machine steps are in docs/TESTING.md.

https://github.com/maaz-bin-hassan/FastAppShip-kit
