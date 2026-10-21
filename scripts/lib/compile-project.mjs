import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  lintRepository,
  loadCommands,
  loadPlatforms,
  mergeSections,
  renderCommandFile,
} from "./command-docs.mjs";

// Checked against vendor docs on 2026-10-20. See docs/SPEC.md.
export const AGENT_TARGETS = {
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

export async function compileProject({ sourceRoot, outRoot, platformId, agents }) {
  const unknown = agents.filter((agent) => !AGENT_TARGETS[agent]);
  if (unknown.length > 0) {
    throw new Error(`Unknown agent: ${unknown.join(", ")}. Known agents: ${Object.keys(AGENT_TARGETS).join(", ")}`);
  }

  const errors = await lintRepository(sourceRoot);
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }

  const commands = await loadCommands(sourceRoot);
  const platforms = await loadPlatforms(sourceRoot);
  const platform = platforms.find((item) => item.id === platformId);
  if (!platform) {
    throw new Error(`Unknown platform: ${platformId}`);
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

  const keep = new Set(rendered.map((command) => command.commandName));

  for (const agentId of agents) {
    const target = AGENT_TARGETS[agentId];
    if (target.mode === "agents-md") continue;

    await pruneGenerated(outRoot, path.join(outRoot, target.dir), target.mode, keep);

    for (const command of rendered) {
      const output = outputPath(outRoot, target, command.commandName);
      await mkdir(path.dirname(output), { recursive: true });
      await writeFile(output, command.markdown, "utf8");
      console.log(`${agentId}: ${path.relative(outRoot, output)}`);
    }
  }

  if (agents.some((agentId) => AGENT_TARGETS[agentId].mode === "agents-md")) {
    const listingAgents = agents.filter((agentId) => AGENT_TARGETS[agentId].mode === "agents-md");
    await writeAgentListing(outRoot, platform.id, listingAgents, rendered);
    console.log("codex: AGENTS.md");
  }
}

async function pruneGenerated(outRoot, dir, mode, keepNames) {
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fileMatch = mode === "file" && entry.isFile() && /^ship-.+\.md$/.test(entry.name);
    const skillMatch = mode === "skill" && entry.isDirectory() && entry.name.startsWith("ship-");
    if (!fileMatch && !skillMatch) continue;

    const commandName = fileMatch
      ? entry.name.slice("ship-".length, -".md".length)
      : entry.name.slice("ship-".length);
    if (keepNames.has(commandName)) continue;

    const target = path.join(dir, entry.name);
    await rm(target, { recursive: true, force: true });
    console.log(`removed ${path.relative(outRoot, target)}`);
  }
}

function outputPath(outRoot, target, commandName) {
  if (target.mode === "skill") {
    return path.join(outRoot, target.dir, `ship-${commandName}`, "SKILL.md");
  }
  return path.join(outRoot, target.dir, `ship-${commandName}.md`);
}

async function writeAgentListing(outRoot, platformId, listingAgents, commandsToList) {
  const file = path.join(outRoot, "AGENTS.md");
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
