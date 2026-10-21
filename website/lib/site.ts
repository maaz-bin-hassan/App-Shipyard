import path from "node:path";
export { blobUrl, repositoryUrl } from "./links";

export const repoRoot = path.resolve(process.cwd(), "..");

/** Baked in at build time. Set NEXT_PUBLIC_SITE_URL before hosting. */
export const siteUrl = resolveSiteUrl();

export const installCommand = ["pnpm install", "pnpm cli:build", "node cli/dist/index.js my-app"].join("\n");

export const siteDescription =
  "Build the CLI from this repository and scaffold a mobile app. The same slash commands compile for five coding agents. Version 1.0.0.";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${preview.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export const pitch = "Slash commands for shipping a mobile app with an AI coding agent.";
