import fs from "node:fs";
import path from "node:path";
import { blobUrl, repoRoot } from "./site";

export type ComparisonRow = {
  id: string;
  scratch: string;
  kit: string;
  evidencePath: string;
};

export const comparison: ComparisonRow[] = [
  {
    id: "lint",
    scratch: "A prompt can lose a section and nothing checks it.",
    kit: "npm run lint:commands fails when a section is missing, empty, or out of order.",
    evidencePath: "scripts/lint-commands.mjs",
  },
  {
    id: "compile",
    scratch: "Keep a separate copy of the prompt for each agent.",
    kit: "npx createshipyard merges one core file and one fragment, then writes the commands for Claude Code, Cursor, or OpenCode.",
    evidencePath: "scripts/lib/compile-project.mjs",
  },
  {
    id: "scaffold",
    scratch: "Copy a template and remember the platform yourself.",
    kit: "npx createshipyard copies the Flutter template by default, writes the slash commands, and records kit state.",
    evidencePath: "cli/src/scaffold.test.ts",
  },
  {
    id: "update",
    scratch: "Diff the changelog by hand.",
    kit: "The update planner compares semver, lists only the guides in between, and does not downgrade a newer recorded version.",
    evidencePath: "scripts/lib/update-plan.test.mjs",
  },
  {
    id: "publish",
    scratch: "An agent can upload a bundle as soon as a build exists.",
    kit: "publish records each Play Console action as its own answer and blocks the stage unless that answer is yes.",
    evidencePath: "commands/publish/COMMAND.md",
  },
  {
    id: "ai",
    scratch: "Call the model provider from the app.",
    kit: "The Expo AI client test refuses an OpenRouter URL and checks that the client source has no OPENROUTER_API_KEY.",
    evidencePath: "platforms/expo/template/src/features/ai/aiClient.test.ts",
  },
  {
    id: "analytics",
    scratch: "The SDK sends events as soon as the app starts.",
    kit: "The analytics test drops product events and crashes while consent is off.",
    evidencePath: "platforms/expo/template/src/lib/analytics.test.ts",
  },
];

export function evidenceHref(file: string): string {
  return blobUrl(file);
}

export function assertComparison(): void {
  if (comparison.length === 0) throw new Error("Comparison table has no rows");
  for (const row of comparison) {
    if (!row.scratch.trim() || !row.kit.trim() || !row.evidencePath.trim()) {
      throw new Error(`Comparison row ${row.id} is incomplete`);
    }
    const full = path.join(repoRoot, row.evidencePath);
    if (!fs.existsSync(full)) {
      throw new Error(`Comparison row ${row.id} points at missing evidence ${row.evidencePath}`);
    }
  }
}
