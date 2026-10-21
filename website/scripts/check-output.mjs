import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const outDir = path.join(process.cwd(), "out");
const failures = [];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function appliedEffects(css) {
  const hits = [];
  const declarations = css.replace(/\/\*[\s\S]*?\*\//g, "");
  if (/linear-gradient|radial-gradient|conic-gradient|repeating-linear-gradient/i.test(declarations)) hits.push("gradient");
  for (const match of declarations.matchAll(/(?:^|[{;])\s*box-shadow\s*:\s*([^;}{]+)/gi)) {
    if (match[1].trim().toLowerCase() !== "none") hits.push("box-shadow");
  }
  if (/(?:^|[{;])\s*-webkit-backdrop-filter\s*:|(?:^|[{;])\s*backdrop-filter\s*:/i.test(declarations)) {
    hits.push("backdrop-filter");
  }
  if (/drop-shadow\s*\(/i.test(declarations)) hits.push("drop-shadow(");
  if (/(?:^|[^\w-])blur\s*\(/i.test(declarations)) hits.push("blur(");
  return hits;
}

const files = await walk(outDir);
const cssAndHtml = files.filter((file) => file.endsWith(".css") || file.endsWith(".html"));

for (const file of cssAndHtml) {
  const text = await readFile(file, "utf8");
  const relative = path.relative(outDir, file);
  if (file.endsWith(".css")) {
    for (const hit of appliedEffects(text)) failures.push(`${relative} applies ${hit}`);
  }
  if (/url\(\s*['"]?https?:/i.test(text)) failures.push(`${relative} has an external CSS url()`);
  if (/fonts\.googleapis|fonts\.gstatic|googletagmanager|google-analytics|cdn\.jsdelivr|unpkg\.com/i.test(text)) {
    failures.push(`${relative} references an external host`);
  }
  if (/<script[^>]+src=["']https?:/i.test(text)) failures.push(`${relative} loads an external script`);
  if (/<link[^>]+rel=["'](?:stylesheet|preconnect|dns-prefetch)["'][^>]+href=["']https?:/i.test(text)) {
    failures.push(`${relative} has an external stylesheet or preconnect`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`checked ${cssAndHtml.length} css/html files in out/`);
