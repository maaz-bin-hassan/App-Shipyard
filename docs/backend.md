# Shared Supabase backend

Every platform adapter will call this one backend. The schema and the edge function are in `backend/supabase/`. Adapters do not call it yet. Nothing in this repository creates a hosted Supabase project, deploys a function, or sets a secret. The commands that do those things are listed at the end for you to run.

## Why the AI key stays on the server

A mobile app can be unpacked. Any key shipped inside the app, a generated client, or a committed config file can be copied and used to spend the OpenRouter account. The OpenRouter key is stored only as a Supabase secret. The app sends the user's session token. `ai-proxy` checks that session, checks the model against an allowlist, counts the request against that user's daily limit, and only then calls OpenRouter.

The Supabase anon key (or the newer publishable key) is a different kind of key. It is meant to live in the client. Row level security is what limits it. It is not an AI provider key, and it is not a substitute for one.

## What is in the backend

| Path | Purpose |
| --- | --- |
| `migrations/001_profiles.sql` | `profiles` row per auth user, row level security, signup trigger |
| `migrations/002_ai_usage.sql` | `ai_usage` daily counts, row level security, `increment_ai_usage` |
| `functions/ai-proxy/` | Session check, allowlist, daily limit, streaming OpenRouter call |
| `tests/` | Row level security script, rate-limit script, and Node tests |

`profiles.id` references `auth.users.id`. A user can select, insert, update, and delete only the row whose id is `auth.uid()`. Signing up inserts the auth user, and `handle_new_user` creates the matching profile.

`ai_usage` stores `user_id`, a UTC `day`, and `request_count`. A signed-in user can read their own rows. There is no client insert or update policy, so a user cannot reset their own counter. `increment_ai_usage(user_id, limit)` is the only writer. It locks the day's row in one statement, adds one when the stored count is below the limit, and returns the new count. When the count is already at the limit it changes nothing and returns null. Only `service_role` can execute it. The edge function calls it with the service role after it has verified the session, and it passes that session's user id.

The daily window is the UTC date. A failed OpenRouter call still counts: the counter moves before the provider request so two parallel calls cannot both slip past the limit.

## Local tests

Docker is required for the Supabase stack. These tests do not need it. They apply both migrations on an embedded Postgres, then run the SQL scripts and the proxy checks. The test files are TypeScript, so this command needs Node.js 22.18 or newer:

```powershell
npx pnpm install
npx pnpm test:backend
```

`pnpm test:backend` covers three things: the migrations apply, a user cannot read or write another user's profile or usage, and the proxy returns JSON errors for a missing session, a rejected model, and a daily limit that is already reached.

## Local Supabase stack

Install Docker and the [Supabase CLI](https://supabase.com/docs/guides/cli), then from the repository root:

```powershell
npx supabase start --workdir backend
npx supabase db reset --local --workdir backend --yes
```

`--local` resets only the database on this machine. Do not add `--linked` here. That flag resets the hosted database.

After the stack is up, the same SQL files can be run against it. Prepend the helper in the same session so the script can insert auth users:

```powershell
$rls = Join-Path $env:TEMP "fastappshipkit-rls.sql"
$limit = Join-Path $env:TEMP "fastappshipkit-rate-limit.sql"
[System.IO.File]::WriteAllText($rls, ((Get-Content backend/supabase/tests/helpers.sql -Raw) + "`n" + (Get-Content backend/supabase/tests/rls.sql -Raw)))
[System.IO.File]::WriteAllText($limit, ((Get-Content backend/supabase/tests/helpers.sql -Raw) + "`n" + (Get-Content backend/supabase/tests/rate_limit.sql -Raw)))
npx supabase db query --local --workdir backend --file $rls
npx supabase db query --local --workdir backend --file $limit
```

To serve the function locally, copy the example env file and set the three values in the copy:

```powershell
copy backend\supabase\.env.example backend\supabase\.env
npx supabase functions serve ai-proxy --workdir backend --env-file backend/supabase/.env
```

Leave `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` out of that file. `functions serve` injects the local stack's values. The file you copied is gitignored.

## Hosted project

Do these steps when you want a real project. They are not run by the kit.

1. Create a project in the [Supabase dashboard](https://supabase.com/dashboard). Pick the organization and region there. The free tier is enough for a first project; a paid plan is a separate decision.
2. Copy the project ref from the dashboard URL or from Project Settings. It is the 20-character id, not the database password.
3. From the repository root, log in and link this checkout. The CLI prompts for the database password. Keep that password out of the repo and out of shell history if you can pass it with a prompt rather than a flag.

```powershell
npx supabase login
npx supabase link --workdir backend --project-ref <project-ref>
npx supabase db push --linked --workdir backend --yes --skip-vault
```

4. Fill in `backend/supabase/.env` from the example. `OPENROUTER_API_KEY` is the provider key. `AI_MODEL_ALLOWLIST` is a comma-separated list of exact OpenRouter model ids, such as `openai/gpt-4o-mini`. `AI_DAILY_REQUEST_LIMIT` is a positive integer. Then store those values as function secrets:

```powershell
npx supabase secrets set --workdir backend --env-file backend/supabase/.env
npx supabase functions deploy ai-proxy --workdir backend
```

`backend/supabase/config.toml` sets `verify_jwt = false` for `ai-proxy`. The function checks the bearer session itself so a missing or invalid session gets the JSON body below. Deploy uses that config. Do not turn the platform check back on if clients need this error body.

An empty allowlist, a missing provider key, or a limit that is not a positive integer makes the function return `500` with `"error": "misconfigured"`. It does not call OpenRouter in that state.

## Calling the function

```http
POST https://<project-ref>.supabase.co/functions/v1/ai-proxy
Authorization: Bearer <user access token>
apikey: <supabase anon or publishable key>
Content-Type: application/json
```

```json
{
  "model": "openai/gpt-4o-mini",
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

`Authorization` is the signed-in user's access token from Supabase Auth. `apikey` is the public Supabase key. `model` must match one entry in `AI_MODEL_ALLOWLIST` exactly. `messages` is 1 to 32 objects. Each `role` is `system`, `user`, or `assistant`. Each `content` is a string of 1 to 32000 characters, and one message must use the `user` role. Any other field, including `stream`, is ignored. The proxy always asks OpenRouter for a stream.

A success response is `200` with `Content-Type: text/event-stream`. The body is the OpenRouter event stream. Read `choices[0].delta.content` from each `data:` line, ignore lines that start with `:`, and stop at `data: [DONE]`.

```text
data: {"choices":[{"delta":{"content":"Hi"}}]}

data: [DONE]
```

Use `fetch` against the function URL when the client needs the stream. `functions.invoke` in `supabase-js` buffers the body, so it is a poor fit for this response.

### Errors

Failures before the stream are JSON. `error` is the code to branch on.

| Status | `error` | When |
| --- | --- | --- |
| 401 | `unauthenticated` | Missing bearer token, or the token is not a current user session |
| 400 | `disallowed_model` | `model` is not on the allowlist. The body includes `model`. |
| 429 | `rate_limited` | Today's UTC count is already at `AI_DAILY_REQUEST_LIMIT`. The body includes `limit`, and `Retry-After` is set. |
| 400 | `invalid_request` | Body, model, or messages are not in the shape above |
| 500 | `misconfigured` | Allowlist, daily limit, or a required server key is missing |
| 502 | `upstream_error` | OpenRouter did not return a stream. The provider body is not forwarded. |

```json
{ "error": "unauthenticated", "message": "A valid user session is required." }
```

```json
{ "error": "disallowed_model", "message": "That model is not on the allowlist.", "model": "openai/gpt-4o" }
```

```json
{ "error": "rate_limited", "message": "Daily AI request limit reached.", "limit": 50 }
```

The response never includes the OpenRouter key, the service role key, or the provider error body.
