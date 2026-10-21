import path from "node:path";
export { blobUrl, npmPackageUrl, repositoryUrl } from "./links";

export const repoRoot = path.resolve(process.cwd(), "..");

/** Baked in at build time. Set NEXT_PUBLIC_SITE_URL before hosting. */
export const siteUrl = resolveSiteUrl();

export const installCommand = "npx createshipyard my-app";

export const siteDescription =
  "App Shipyard scaffolds an Expo app and hands slash commands to your coding agent. Supabase, RevenueCat, PostHog, and Sentry are already in the template. Version 1.0.0.";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${preview.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export const pitch = "Scaffold the app. Hand it to your agent.";
