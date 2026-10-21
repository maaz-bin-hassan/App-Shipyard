import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const PLATFORMS = ["expo", "flutter", "android", "ios"] as const;
export const AGENTS = ["claude", "cursor", "opencode", "all"] as const;
export const PACKAGE_MANAGERS = ["npm", "pnpm", "yarn"] as const;

export type PlatformId = (typeof PLATFORMS)[number];
export type AgentFlag = (typeof AGENTS)[number];
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export const DEFAULT_PRIMARY_COLOR = "#6750A4";

const COMPILER_AGENTS: Record<AgentFlag, string[]> = {
  claude: ["claude-code"],
  cursor: ["cursor"],
  opencode: ["opencode"],
  all: ["claude-code", "cursor", "opencode"],
};

export function compilerAgents(agent: AgentFlag): string[] {
  return COMPILER_AGENTS[agent];
}

export function applicationIdFor(directoryName: string): string {
  return `com.example.${directoryName.replace(/-/g, "")}`;
}

export function nextStepSentence(agent: AgentFlag): string {
  if (agent === "cursor") return "Open this folder in Cursor and run /ship-start";
  if (agent === "opencode") return "Open this folder in OpenCode and run /ship-start";
  if (agent === "all") return "Open this folder in Claude Code, Cursor, or OpenCode and run /ship-start";
  return "Open this folder in Claude Code and run /ship-start";
}

export function platformHostError(platform: PlatformId, host: NodeJS.Platform): string | null {
  if (platform === "ios" && host !== "darwin") {
    return "iOS native requires macOS and Xcode. Choose expo, flutter, or android on this machine.";
  }
  return null;
}

export function isInsideKit(dest: string, kitRoot: string): boolean {
  const relative = path.relative(kitRoot, dest);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function findKitRoot(startDir: string): string {
  let dir = path.resolve(startDir);
  for (;;) {
    const pkgPath = path.join(dir, "package.json");
    if (existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
        if (pkg.name === "fastappshipkit" && existsSync(path.join(dir, "platforms", "expo", "platform.json"))) {
          return dir;
        }
      } catch {
        // Keep walking when a package.json is unreadable.
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("Could not find the fastAppshipKit checkout. createshipyard runs from this repository and is not published to npm.");
    }
    dir = parent;
  }
}
