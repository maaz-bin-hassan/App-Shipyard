## Preconditions

- `.shipkit/state.json` exists and `platform` is `expo`.
- `backend/supabase/functions/ai-proxy/handler.ts` and `docs/backend.md` exist.
- `platforms/expo/template/src/features/ai` contains `useChat` and `useCompletion`.
- Run every command from the repository root.

## Steps

1. Read `.shipkit/state.json` and `package.json`. If the state file is missing, create it with `platform` null, `storeTargets` [], `kitVersion` from `package.json` `version`, `answers` {}, and `commands` {}. Write two-space JSON. If `platform` is not `expo`, set `commands.ai.status` to `blocked` and stop. If `commands.ai.status` is `done`, `kitVersion` matches `package.json` `version`, and `answers.modelAllowlist` and `answers.dailyRequestLimit` are still present, report that the AI command already finished and stop. Otherwise record step `1` as `done`.
2. Set `commands.ai` and step `2` to `in_progress` and write the current UTC timestamp. Write `answers.modelAllowlist` and `answers.dailyRequestLimit` from Ask. Copy each file under `platforms/expo/template/src/features/ai` to `src/features/ai` when that destination is missing. Leave an existing file as it is. If the checkout has no app source root, leave the module in the template. Record step `2` as `done`.
3. If the checkout has no `app.json` and no `app.config.js` or `app.config.ts`, this is still the kit repo. Record step `3` as `skipped`. When an Expo app config exists, ensure `.env` contains `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` without printing their values. Do not add `OPENROUTER_API_KEY` to that file. Build the client with `readAiEnv` and `createAiClient`. `getAccessToken` returns the current Supabase access token, or null when nobody is signed in. Record step `3` as `blocked` when a public Supabase value is missing, otherwise `done`.
4. If step `3` was `skipped`, record step `4` as `skipped`. Otherwise show the secret steps in `docs/backend.md`: `AI_MODEL_ALLOWLIST` from `answers.modelAllowlist`, `AI_DAILY_REQUEST_LIMIT` from `answers.dailyRequestLimit`, and `OPENROUTER_API_KEY` only inside `backend/supabase/.env`. Do not run `supabase secrets set`. Do not print that file. Do not ask for the key. When `answers.aiSecretNamesSet` is not `yes`, record step `4` as `blocked` and stop. When it is `yes`, record step `4` as `done`.
5. Run `pnpm test:ai` and `pnpm test:backend`. Record step `5` as `blocked` when either fails, otherwise `done`.
6. If step `3` was `skipped`, record step `6` as `blocked`, set `commands.ai.status` to `blocked`, and stop. The client and the proxy tests are in place. The live check waits for a Supabase project. When the function is deployed, call it with a signed-in access token and confirm a stream. Call it again with no session and confirm `401` and that OpenRouter was not called. Record step `6` as `done` only when both happen. Set `commands.ai.status` to `done` only when step `6` is `done`. Write UTC timestamps.

## Rollback

Set `commands.ai.status` to `blocked` and timestamp it. Leave the template, the edge function, and `.env` in place. Do not print secrets. Do not delete `.shipkit/state.json`.
