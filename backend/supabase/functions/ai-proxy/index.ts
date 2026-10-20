import { createClient } from "npm:@supabase/supabase-js@2";
import { handleAiProxy, type AiProxyConfig, type CreateClient } from "./handler.ts";

function readConfig(): AiProxyConfig {
  return {
    supabaseUrl: Deno.env.get("SUPABASE_URL") ?? "",
    supabaseAnonKey: Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
    supabaseServiceRoleKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SECRET_KEY") ?? "",
    openRouterApiKey: Deno.env.get("OPENROUTER_API_KEY") ?? "",
    modelAllowlist: Deno.env.get("AI_MODEL_ALLOWLIST") ?? "",
    dailyRequestLimit: Deno.env.get("AI_DAILY_REQUEST_LIMIT") ?? "",
  };
}

const deps = {
  createClient: createClient as unknown as CreateClient,
  fetch,
};

Deno.serve((request: Request) => handleAiProxy(request, readConfig(), deps));
