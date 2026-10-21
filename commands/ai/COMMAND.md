---
description: Route AI calls through the Supabase proxy with an allowlist and a per-user daily limit.
argument-hint: "(none)"
---

## Goal

The app calls the Supabase `ai-proxy` edge function. It never calls OpenRouter. The function holds `OPENROUTER_API_KEY` as a secret, requires a valid user session, applies the per-user UTC daily limit in Postgres, and accepts a model only when it is on the allowlist.

The Expo template provides `useChat` for a streaming chat and `useCompletion` for a one-shot completion. Both read the proxy stream. The command records the allowlist and the daily limit. It does not record the provider key.

## Ask

Ask these two questions in one batch before Steps. On resume, reuse `answers` and do not ask again.

| Id | Question | Record |
| --- | --- | --- |
| `modelAllowlist` | Which OpenRouter model ids may the app call? Comma-separated exact ids. | Non-empty string. Example shape: `openai/gpt-4o-mini`. |
| `dailyRequestLimit` | How many AI requests may one signed-in user make per UTC day? | Integer from 1 to 1000000. |
| `aiSecretNamesSet` | Will you set `AI_MODEL_ALLOWLIST`, `AI_DAILY_REQUEST_LIMIT`, and `OPENROUTER_API_KEY` as Supabase secrets, without pasting the key here? | `yes` or `no`. |

Do not ask for `OPENROUTER_API_KEY`. Do not write it into `answers`. On resume, reuse `answers.aiSecretNamesSet` and do not ask again.

## Verify

`answers.modelAllowlist` is a non-empty comma-separated list and `answers.dailyRequestLimit` is an integer from 1 to 1000000. No client file contains `OPENROUTER_API_KEY` or a request to `openrouter.ai`. `pnpm test:ai` passes. `pnpm test:backend` passes, including the daily limiter and the proxy's rejection of a missing session.

The command is `done` only when a signed-in session receives a stream from `ai-proxy` and a call without a session returns `401` without reaching OpenRouter. `answers.aiSecretNamesSet` is `yes` or `no`, and the provider key is absent. The transcript and state file contain no provider key and no service-role key.

## Never

Do not put the OpenRouter key in the app, in `EXPO_PUBLIC_` variables, in committed config, or in `answers`. Do not call `openrouter.ai` from client code. Do not raise the daily limit to skip a `429`. Do not print `.env` or `backend/supabase/.env`. Do not deploy the function or set the secret unless the developer is following the manual steps in `docs/backend.md` and has confirmed. Do not mark the command `done` when an anonymous call reaches the provider.
