import type { MetadataRoute } from "next";
import { loadCommands } from "@/lib/commands";

export const dynamic = "force-static";
import { loadDocs, loadPosts } from "@/lib/docs";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...loadDocs().map((page) => page.href),
    ...loadCommands().map((command) => `/docs/commands/${command.name}/`),
    "/changelog/",
    "/blog/",
    ...loadPosts().map((post) => post.href),
  ];
  return [...new Set(paths)].map((entry) => ({ url: new URL(entry, siteUrl).href }));
}
