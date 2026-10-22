import path from "node:path";
import { parseArgs } from "node:util";
import {
  AGENTS,
  PACKAGE_MANAGERS,
  PLATFORMS,
  type AgentFlag,
  type PackageManager,
  type PlatformId,
} from "./project.js";

export type CliOptions = {
  directory: string;
  agent: AgentFlag;
  install: boolean;
  packageManager: PackageManager;
  platform: PlatformId;
};

export type ParseResult =
  | { ok: true; help: true }
  | { ok: true; help: false; options: CliOptions }
  | { ok: false; error: string };

export const USAGE = "Usage: createshipyard <directory> [--agent claude|cursor|opencode|all] [--platform expo|flutter|android|ios] [--pm npm|pnpm|yarn] [--no-install]";

export function parseCli(argv: string[]): ParseResult {
  let values: {
    agent?: string;
    platform?: string;
    pm?: string;
    "no-install"?: boolean;
    help?: boolean;
  };
  let positionals: string[];
  try {
    const parsed = parseArgs({
      args: argv,
      options: {
        agent: { type: "string", default: "claude" },
        platform: { type: "string", default: "flutter" },
        pm: { type: "string", default: "npm" },
        "no-install": { type: "boolean", default: false },
        help: { type: "boolean", default: false },
      },
      allowPositionals: true,
      strict: true,
    });
    values = parsed.values;
    positionals = parsed.positionals;
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }

  if (values.help) return { ok: true, help: true };
  if (positionals.length !== 1) return { ok: false, error: USAGE };

  const agent = values.agent ?? "claude";
  const platform = values.platform ?? "flutter";
  const packageManager = values.pm ?? "npm";
  if (!isAgent(agent)) {
    return { ok: false, error: `Unknown agent: ${agent}. Use claude, cursor, opencode, or all.` };
  }
  if (!isPlatform(platform)) {
    return { ok: false, error: `Unknown platform: ${platform}. Use expo, flutter, android, or ios.` };
  }
  if (!isPackageManager(packageManager)) {
    return { ok: false, error: `Unknown package manager: ${packageManager}. Use npm, pnpm, or yarn.` };
  }

  const directory = positionals[0] ?? "";
  const base = path.basename(path.resolve(directory));
  if (!/^[a-z0-9][a-z0-9-]*$/.test(base)) {
    return { ok: false, error: `Directory name must be a lowercase npm name, such as my-app. Received: ${base}` };
  }

  return {
    ok: true,
    help: false,
    options: {
      directory,
      agent,
      platform,
      packageManager,
      install: values["no-install"] !== true,
    },
  };
}

function isAgent(value: string): value is AgentFlag {
  return (AGENTS as readonly string[]).includes(value);
}

function isPlatform(value: string): value is PlatformId {
  return (PLATFORMS as readonly string[]).includes(value);
}

function isPackageManager(value: string): value is PackageManager {
  return (PACKAGE_MANAGERS as readonly string[]).includes(value);
}
