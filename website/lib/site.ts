import path from "node:path";
export { blobUrl, repositoryUrl } from "./links";

export const repoRoot = path.resolve(process.cwd(), "..");

/** Baked in at build time. Set NEXT_PUBLIC_SITE_URL before hosting. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const installCommand = ["pnpm install", "pnpm cli:build", "node cli/dist/index.js my-app"].join("\n");

export const siteDescription =
  "Build the CLI from this repository and scaffold a mobile app. The same slash commands compile for five coding agents. Not published to npm.";

export const pitch = "Slash commands for shipping a mobile app with an AI coding agent.";
