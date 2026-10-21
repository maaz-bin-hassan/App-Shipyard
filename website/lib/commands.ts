import fs from "node:fs";
import path from "node:path";
import { parseSections, requireText, splitFrontmatter } from "./frontmatter";
import { repoRoot } from "./site";

export type CommandDoc = {
  name: string;
  description: string;
  argumentHint: string;
  goal: string;
  ask: string;
  verify: string;
  never: string;
  steps: string;
  rollback: string;
  files: string[];
};

const FILE_EXTENSION = /\.[A-Za-z0-9]+$/;

function listPaths(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(/`([^`\n]+)`/g)) {
    const token = match[1];
    if (!token || token.length > 140 || /\s/.test(token)) continue;
    if (token.startsWith("http://") || token.startsWith("https://")) continue;
    const pathLike = token.includes("/") || token.startsWith(".") || FILE_EXTENSION.test(token);
    if (!pathLike) continue;
    found.add(token);
  }
  return [...found].sort((left, right) => left.localeCompare(right));
}

function readCommand(name: string): CommandDoc {
  const corePath = path.join(repoRoot, "commands", name, "COMMAND.md");
  const fragmentPath = path.join(repoRoot, "platforms", "expo", "fragments", `${name}.md`);
  if (!fs.existsSync(corePath)) throw new Error(`commands/${name}/COMMAND.md is missing`);
  if (!fs.existsSync(fragmentPath)) {
    throw new Error(`platforms/expo/fragments/${name}.md is missing, so the docs cannot list files for ${name}`);
  }

  const coreFile = `commands/${name}/COMMAND.md`;
  const core = splitFrontmatter(fs.readFileSync(corePath, "utf8"), coreFile);
  const description = requireText(core.data.description, `${coreFile} description`);
  const argumentHint = requireText(core.data["argument-hint"], `${coreFile} argument-hint`);
  const goal = requireText(parseSections(core.body).Goal, `${coreFile} Goal`);
  const ask = requireText(parseSections(core.body).Ask, `${coreFile} Ask`);
  const verify = requireText(parseSections(core.body).Verify, `${coreFile} Verify`);
  const never = requireText(parseSections(core.body).Never, `${coreFile} Never`);

  const fragmentFile = `platforms/expo/fragments/${name}.md`;
  const fragment = parseSections(fs.readFileSync(fragmentPath, "utf8"));
  const steps = requireText(fragment.Steps, `${fragmentFile} Steps`);
  const rollback = requireText(fragment.Rollback, `${fragmentFile} Rollback`);
  const files = listPaths([goal, steps, rollback, verify].join("\n"));
  if (files.length === 0) {
    throw new Error(`${fragmentFile}: no file paths found for the docs "files it changes" section`);
  }

  return { name, description, argumentHint, goal, ask, verify, never, steps, rollback, files };
}

let cached: CommandDoc[] | null = null;

export function loadCommands(): CommandDoc[] {
  if (cached) return cached;
  const commandsDir = path.join(repoRoot, "commands");
  if (!fs.existsSync(commandsDir)) throw new Error(`Kit commands directory is missing at ${commandsDir}`);

  const dirs = fs
    .readdirSync(commandsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const manifestPath = path.join(repoRoot, "platforms", "expo", "platform.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as { commands?: unknown };
  if (!Array.isArray(manifest.commands) || manifest.commands.length === 0) {
    throw new Error("platforms/expo/platform.json has no commands array");
  }
  const listed = manifest.commands.map((name) => {
    if (typeof name !== "string" || name.trim() === "") {
      throw new Error("platforms/expo/platform.json contains an empty command name");
    }
    return name;
  });

  for (const name of listed) {
    if (!dirs.includes(name)) {
      throw new Error(`platforms/expo/platform.json lists ${name} but commands/${name}/COMMAND.md is missing`);
    }
  }

  const extras = dirs.filter((name) => !listed.includes(name)).sort((left, right) => left.localeCompare(right));
  const order = [...listed, ...extras];
  const commands = order.map(readCommand);

  const route = path.join(process.cwd(), "app", "docs", "commands");
  const dynamicPage = path.join(route, "[name]", "page.tsx");
  if (!fs.existsSync(dynamicPage)) {
    throw new Error("app/docs/commands/[name]/page.tsx is missing, so a command would have no docs page");
  }
  if (fs.existsSync(route)) {
    for (const entry of fs.readdirSync(route, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name === "[name]") continue;
      if (!order.includes(entry.name)) {
        throw new Error(`Docs page app/docs/commands/${entry.name} has no commands/${entry.name}/COMMAND.md`);
      }
    }
  }

  if (commands.length === 0) throw new Error("No commands found under commands/");
  cached = commands;
  return commands;
}

export function getCommand(name: string): CommandDoc {
  const command = loadCommands().find((item) => item.name === name);
  if (!command) throw new Error(`No command named ${name}`);
  return command;
}
