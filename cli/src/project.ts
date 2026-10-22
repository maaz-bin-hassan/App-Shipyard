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

export function nextStepSentence(platform: PlatformId): string {
  if (platform === "expo") {
    return "Replace assets/icon.png with your logo, copy .env.example to .env, and fill in the public keys. The paywall, pricing, backend, design, and English translations are already in this project";
  }
  return "This platform template is still a stub. Create the publishable app with --platform expo";
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
    const manifest = path.join(dir, "platforms", "expo", "platform.json");
    if (existsSync(pkgPath) && existsSync(manifest)) {
      try {
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { name?: string };
        if (pkg.name === "fastappshipkit" || pkg.name === "createshipyard") return dir;
      } catch {
        // Keep walking when a package.json is unreadable.
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("Could not find the App Shipyard files. Run createshipyard from a kit checkout, or from the installed createshipyard package.");
    }
    dir = parent;
  }
}
