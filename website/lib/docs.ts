import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import type { CommandDoc } from "./commands";
import { requireText, splitFrontmatter } from "./frontmatter";

export type TocItem = { id: string; title: string; depth: number };

export type DocPage = {
  slug: string;
  href: string;
  group: "Start" | "Reference";
  title: string;
  description: string;
  body: string;
  toc: TocItem[];
};

const DOC_FILES = [
  { slug: "quick-start", href: "/docs/", group: "Start" as const, file: "quick-start.mdx" },
  { slug: "template-architecture", href: "/docs/template-architecture/", group: "Reference" as const, file: "template-architecture.mdx" },
  { slug: "state-file", href: "/docs/state-file/", group: "Reference" as const, file: "state-file.mdx" },
  { slug: "writing-a-command", href: "/docs/writing-a-command/", group: "Reference" as const, file: "writing-a-command.mdx" },
  { slug: "troubleshooting", href: "/docs/troubleshooting/", group: "Reference" as const, file: "troubleshooting.mdx" },
];

export type BlogPost = {
  slug: string;
  href: string;
  title: string;
  description: string;
  date: string;
  body: string;
  toc: TocItem[];
};

export function tocFromMarkdown(source: string): TocItem[] {
  const slugger = new GithubSlugger();
  const withoutFences = source.replace(/```[\s\S]*?```/g, "");
  const items: TocItem[] = [];
  for (const line of withoutFences.split(/\r?\n/)) {
    const match = /^(#{2,3})\s+(.+)$/.exec(line);
    if (!match) continue;
    const title = match[2].replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/`/g, "").trim();
    if (title === "") throw new Error("A markdown heading is empty");
    items.push({ id: slugger.slug(title), title, depth: match[1].length });
  }
  return items;
}

function readMdx(file: string): { title: string; description: string; date?: string; body: string; toc: TocItem[] } {
  if (!fs.existsSync(file)) throw new Error(`Missing content file ${path.basename(file)}`);
  const raw = fs.readFileSync(file, "utf8");
  const parsed = splitFrontmatter(raw, path.basename(file));
  const title = requireText(parsed.data.title, `${path.basename(file)} title`);
  const description = requireText(parsed.data.description, `${path.basename(file)} description`);
  const body = requireText(parsed.body, `${path.basename(file)} body`);
  const toc = tocFromMarkdown(body);
  if (toc.length === 0) throw new Error(`${path.basename(file)} has no headings for the on-this-page list`);
  return { title, description, date: parsed.data.date, body, toc };
}

let docs: DocPage[] | null = null;

export function loadDocs(): DocPage[] {
  if (docs) return docs;
  const dir = path.join(process.cwd(), "content", "docs");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => name.endsWith(".mdx")) : [];
  const expected = new Set(DOC_FILES.map((item) => item.file));
  for (const name of files) {
    if (!expected.has(name)) throw new Error(`content/docs/${name} is not in the docs nav`);
  }
  for (const item of DOC_FILES) {
    if (!files.includes(item.file)) throw new Error(`content/docs/${item.file} is missing`);
  }
  docs = DOC_FILES.map((item) => {
    const page = readMdx(path.join(dir, item.file));
    return { ...item, title: page.title, description: page.description, body: page.body, toc: page.toc };
  });
  return docs;
}

export function getDoc(slug: string): DocPage {
  const page = loadDocs().find((item) => item.slug === slug);
  if (!page) throw new Error(`No docs page for ${slug}`);
  return page;
}

export type SequenceItem = { href: string; title: string };

export function docsSequence(commands: CommandDoc[]): SequenceItem[] {
  const pages = loadDocs();
  const quick = pages.find((page) => page.slug === "quick-start");
  if (!quick) throw new Error("Quick start page is missing");
  const rest = pages.filter((page) => page.slug !== "quick-start");
  return [
    { href: quick.href, title: quick.title },
    ...commands.map((command) => ({ href: `/docs/commands/${command.name}/`, title: command.name })),
    ...rest.map((page) => ({ href: page.href, title: page.title })),
  ];
}

export type NavItem = { href: string; title: string; group: "Start" | "Commands" | "Reference" };

export function docNavItems(commands: CommandDoc[]): NavItem[] {
  const pages = loadDocs();
  const quick = pages.find((page) => page.slug === "quick-start");
  if (!quick) throw new Error("Quick start is missing from the docs nav");
  const rest = pages.filter((page) => page.slug !== "quick-start");
  return [
    { href: quick.href, title: quick.title, group: "Start" },
    ...commands.map((command) => ({
      href: `/docs/commands/${command.name}/`,
      title: command.name,
      group: "Commands" as const,
    })),
    ...rest.map((page) => ({ href: page.href, title: page.title, group: "Reference" as const })),
  ];
}

export function neighbors(href: string, commands: CommandDoc[]): { prev?: SequenceItem; next?: SequenceItem } {
  const sequence = docsSequence(commands);
  const index = sequence.findIndex((item) => item.href === href);
  if (index === -1) throw new Error(`No docs sequence entry for ${href}`);
  return { prev: sequence[index - 1], next: sequence[index + 1] };
}

let posts: BlogPost[] | null = null;

export function loadPosts(): BlogPost[] {
  if (posts) return posts;
  const dir = path.join(process.cwd(), "content", "blog");
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((name) => name.endsWith(".mdx")).sort() : [];
  if (files.length !== 1) {
    throw new Error(`Blog must contain exactly one MDX post. Found ${files.length}.`);
  }
  const file = files[0];
  const slug = file.replace(/\.mdx$/, "");
  const page = readMdx(path.join(dir, file));
  if (!page.date || !/^\d{4}-\d{2}-\d{2}$/.test(page.date)) {
    throw new Error(`${file} needs a date in YYYY-MM-DD form`);
  }
  posts = [{ slug, href: `/blog/${slug}/`, title: page.title, description: page.description, date: page.date, body: page.body, toc: page.toc }];
  return posts;
}

export function getPost(slug: string): BlogPost {
  const post = loadPosts().find((item) => item.slug === slug);
  if (!post) throw new Error(`No blog post named ${slug}`);
  return post;
}
