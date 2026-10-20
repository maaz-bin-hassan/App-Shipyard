import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";
import {
  lintRepository,
  loadCommands,
  loadPlatforms,
  mergeSections,
  renderCommandFile,
} from "./lib/command-docs.mjs";

// Checked against vendor docs on 2026-10-20. See docs/SPEC.md.
const AGENT_TARGETS = {
  "claude-code": {
    mode: "file",
    dir: ".claude/commands",
  },
  cursor: {
    mode: "file",
    dir: ".cursor/commands",
  },
  opencode: {
    mode: "file",
    dir: ".opencode/commands",
  },
  antigravity: {
    mode: "skill",
    dir: ".agents/skills",
  },
  codex: {
    mode: "agents-md",
    file: "AGENTS.md",
  },
};

const START_MARK = "<!-- fastappshipkit:agent-commands:start -->";
const END_MARK = "<!-- fastappshipkit:agent-commands:end -->";

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

const unknown = agents.filter((agent) => !AGENT_TARGETS[agent]);
if (unknown.length > 0) {
  console.error(`Unknown agent: ${unknown.join(", ")}`);
  console.error(`Known agents: ${Object.keys(AGENT_TARGETS).join(", ")}`);
  process.exit(1);
}

const errors = await lintRepository(root);
if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

const commands = await loadCommands(root);
const platforms = await loadPlatforms(root);
const platform = platforms.find((item) => item.id === values.platform);

if (!platform) {
  console.error(`Unknown platform: ${values.platform}`);
  process.exit(1);
}

const rendered = [];
for (const commandName of platform.manifest.commands) {
  const core = commands.get(commandName);
  const fragment = platform.fragments.get(commandName);
  const sections = mergeSections(core, fragment);
  const sources = `commands/${commandName}/COMMAND.md + platforms/${platform.id}/fragments/${commandName}.md`;
  const markdown = renderCommandFile({
    commandName,
    description: core.frontmatter.description,
    argumentHint: core.frontmatter["argument-hint"],
    sections,
    platformId: platform.id,
    sources,
  });
  rendered.push({ commandName, markdown });
}

for (const agentId of agents) {
  const target = AGENT_TARGETS[agentId];
  if (target.mode === "agents-md") continue;

  for (const command of rendered) {
    const output = outputPath(root, target, command.commandName);
    await mkdir(path.dirname(output), { recursive: true });
    await writeFile(output, command.markdown, "utf8");
    console.log(`${agentId}: ${path.relative(root, output)}`);
  }
}

if (agents.some((agentId) => AGENT_TARGETS[agentId].mode === "agents-md")) {
  const listingAgents = agents.filter((agentId) => AGENT_TARGETS[agentId].mode === "agents-md");
  await writeAgentListing(root, platform.id, listingAgents, rendered);
  console.log(`codex: AGENTS.md`);
}

function outputPath(repoRoot, target, commandName) {
  if (target.mode === "skill") {
    return path.join(repoRoot, target.dir, `ship-${commandName}`, "SKILL.md");
  }
  return path.join(repoRoot, target.dir, `ship-${commandName}.md`);
}

async function writeAgentListing(repoRoot, platformId, listingAgents, commandsToList) {
  const file = path.join(repoRoot, "AGENTS.md");
  const current = await readFile(file, "utf8");
  const blocks = commandsToList.map((command) => `### ship-${command.commandName}\n\n${command.markdown.trim()}`).join("\n\n");
  const replacement = [
    START_MARK,
    "",
    `Compiled for platform \`${platformId}\`. Agents: ${listingAgents.join(", ")}.`,
    "These agents have no project-level custom slash-command directory. Follow the merged command below when the user asks for it. Do not edit this section by hand; run the compiler again.",
    "",
    blocks,
    "",
    END_MARK,
  ].join("\n");

  let next;
  if (current.includes(START_MARK) && current.includes(END_MARK)) {
    const pattern = new RegExp(`${escapeRegExp(START_MARK)}[\\s\\S]*?${escapeRegExp(END_MARK)}`);
    next = current.replace(pattern, replacement);
  } else {
    next = `${current.trimEnd()}\n\n${replacement}\n`;
  }

  await writeFile(file, next.endsWith("\n") ? next : `${next}\n`, "utf8");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
