## Preconditions

- `.shipkit/state.json` exists and `platform` is `android`.
- `storeTargets` is `play`.
- `backend/supabase/functions/ai-proxy` and `docs/backend.md` exist.
- The Android template is still a stub. It has no AI client.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If the state file is missing, create it with `platform` null, `storeTargets` [], `kitVersion` from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `platform` is not `android`, set `commands.ai.status` to `blocked` and stop. If `commands.ai.status` is `done` and `kitVersion` matches `package.json` `version`, report that the AI command already finished and stop. Otherwise record step `1` as `done`.
2. Set `commands.ai` and step `2` to `in_progress` and write the current UTC timestamp. Write `answers.modelAllowlist` and `answers.dailyRequestLimit`. Do not copy the Expo TypeScript client into a Kotlin app, and do not put `OPENROUTER_API_KEY` in the app. The tested client is `platforms/expo/template/src/features/ai`. The proxy stays in `backend/supabase/functions/ai-proxy`. Record step `2` as `blocked`, set `commands.ai.status` to `blocked`, and stop.

## Rollback

Set `commands.ai.status` to `blocked` and timestamp it. Leave the Supabase function in place. Do not print secrets. Do not delete `.shipkit/state.json`.
