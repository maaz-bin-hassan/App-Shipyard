import path from "node:path";
export { blobUrl, npmPackageUrl, repositoryUrl } from "./links";

export const repoRoot = path.resolve(process.cwd(), "..");

/** Baked in at build time. Set NEXT_PUBLIC_SITE_URL before hosting. */
export const siteUrl = resolveSiteUrl();

export const installCommand = "npx createshipyard my-app";

export const siteDescription =
  "createshipyard scaffolds a Flutter app by default. Pass --platform expo for the publishable app: RevenueCat paywall, pricing, Supabase backend, design, and translations. Version 1.2.0.";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${preview.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export const pitch = "One command. A shippable app.";
