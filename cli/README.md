# createshipyard

Scaffold an App Shipyard app. Version 1.1.0.

From a clone of the kit:

```bash
pnpm cli:build
node cli/dist/index.js my-app
```

The same flags work after the build: `--agent claude|cursor|opencode|all`, `--platform expo|flutter|android|ios` (default `flutter`), `--pm npm|pnpm|yarn`, and `--no-install`.

`--platform expo` prints this next step:

```text
Replace assets/icon.png with your logo, copy .env.example to .env, and fill in the public keys. The paywall, pricing, backend, design, and English translations are already in this project.
```

This directory stays `"private": true` so `npm publish` here does not upload a package that lacks the templates. From the repository root, `npm run pack:npm` builds the CLI and writes `release/createshipyard-1.1.0.tgz`. Publish that tarball when you want the package on npm. Do not publish from this tree by itself.
