# AI calls

The app talks to `POST /functions/v1/ai-proxy` on the Supabase project. It never calls `openrouter.ai`.

## Why the key stays off the device

A mobile app can be unpacked. An OpenRouter key compiled into the client, written into a committed config file, or shipped in an `EXPO_PUBLIC_` variable can be copied and used to spend that account. The key is a Supabase secret named `OPENROUTER_API_KEY`. The edge function reads it. The phone sends only the signed-in user's session token and the public Supabase anon key.

The function then checks that session, rejects models that are not on `AI_MODEL_ALLOWLIST`, and counts the call against that user's UTC daily limit in Postgres. A missing session is `401` and does not reach OpenRouter. The proxy always streams. `useChat` shows each delta. `useCompletion` reads the same stream and returns the full text.

Do not add `OPENROUTER_API_KEY` to the app `.env`. Setup for the secret, the allowlist, and the limit is in [docs/backend.md](../../../../../../docs/backend.md).

## Usage

```ts
import { createAiClient, useChat, useCompletion } from "./index.ts";

const ai = createAiClient({
  functionUrl: `${supabaseUrl}/functions/v1/ai-proxy`,
  anonKey,
  getAccessToken: async () => session?.access_token ?? null,
});
```

`useChat(ai, model)` returns `send`. `useCompletion(ai, model)` returns `complete`. `model` must be one of the allowlisted ids. Pass an analytics client if consented events should include `ai_message_sent` or `ai_completion_requested`. Those events record the model id, not the prompt.
