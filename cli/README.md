# createshipyard

Scaffold an App Shipyard app. Version 1.0.0.

From a clone of the kit:

```bash
pnpm cli:build
node cli/dist/index.js my-app
```

The same flags work after the build: `--agent claude|cursor|opencode|all`, `--platform expo|flutter|android|ios` (default `flutter`), `--pm npm|pnpm|yarn`, and `--no-install`.

Default agent text:

```text
Open this folder in Claude Code and run /ship-start
```

This directory stays `"private": true` so `npm publish` here does not upload a package that lacks the templates. From the repository root, `npm run pack:npm` builds the CLI and writes `release/createshipyard-1.0.0.tgz`. Publish that tarball when you want the package on npm. Do not publish from this tree by itself.
