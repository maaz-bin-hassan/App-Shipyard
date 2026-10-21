import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import { AGENT_TARGETS, compileProject } from "./lib/compile-project.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { values } = parseArgs({
  options: {
    platform: { type: "string" },
    agents: { type: "string" },
  },
});

if (!values.platform) {
  console.error("Usage: npm run compile -- --platform <id> [--agents claude-code,cursor,opencode,antigravity,codex]");
  process.exit(1);
}

const agents = values.agents
  ? values.agents.split(",").map((agent) => agent.trim()).filter(Boolean)
  : Object.keys(AGENT_TARGETS);

try {
  await compileProject({
    sourceRoot: root,
    outRoot: root,
    platformId: values.platform,
    agents,
  });
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
