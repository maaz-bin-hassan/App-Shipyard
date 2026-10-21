#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$root"

export CI=1
export EXPO_NO_TELEMETRY=1

if [[ ! -f node_modules/typescript/package.json ]]; then
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install --frozen-lockfile
  else
    npm install
  fi
fi

npm run cli:build

work="$(mktemp -d)"
cleanup() {
  rm -rf "$work"
}
trap cleanup EXIT

node cli/dist/index.js "$work/my-app" --agent claude --pm npm

cd "$work/my-app"
npx tsc --noEmit
npx expo export --platform android
