import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { requireText } from "./frontmatter";
import { repoRoot } from "./site";

export type ChangelogRelease = {
  id: string;
  title: string;
  body: string;
};

export type Changelog = {
  intro: string;
  releases: ChangelogRelease[];
};

let cached: Changelog | null = null;

export function loadChangelog(): Changelog {
  if (cached) return cached;
  const file = path.join(repoRoot, "CHANGELOG.md");
  if (!fs.existsSync(file)) throw new Error("CHANGELOG.md is missing");
  const text = fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const parts = text.split(/\n(?=## )/);
  const intro = requireText(parts[0]?.replace(/^# .+\n+/, ""), "CHANGELOG.md introduction");
  const slugger = new GithubSlugger();
  const releases = parts.slice(1).map((part) => {
    const lines = part.split("\n");
    const title = lines[0]?.replace(/^## /, "").trim() ?? "";
    const body = lines.slice(1).join("\n").trim();
    if (title === "" || body === "") throw new Error("CHANGELOG.md has an empty release section");
    return { id: slugger.slug(title), title, body };
  });
  if (releases.length === 0) throw new Error("CHANGELOG.md has no release sections");
  cached = { intro, releases };
  return cached;
}
