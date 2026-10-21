# createshipyard

Scaffold a fastAppshipKit app from this repository. The package is `private` and is not published to npm.

```bash
pnpm cli:build
node cli/dist/index.js my-app
```

The same flags work after the build: `--agent claude|cursor|opencode|all`, `--platform expo|flutter|android|ios`, `--pm npm|pnpm|yarn`, and `--no-install`.

Default agent text:

```text
Open this folder in Claude Code and run /ship-start
```

Publishing later means packing the templates, `scripts/sync-project.mjs`, and the compiler with this package, removing `"private": true`, and enabling `.github/workflows/release.yml`. Do not publish from this tree as it stands. `cli/dist` is build output and does not contain the templates.
