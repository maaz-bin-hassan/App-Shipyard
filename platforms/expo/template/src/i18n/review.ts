import { flattenCatalog, lookup, type Catalog } from "./translate.ts";

export function renderNativeReview(language: string, source: Catalog, target: Catalog): string {
  const rows = flattenCatalog(source).map((row) => {
    const translated = lookup(target, row.key);
    const cell = translated === null ? "MISSING" : translated.replaceAll("|", "\\|");
    return `| \`${row.key}\` | ${row.value.replaceAll("|", "\\|")} | ${cell} |`;
  });
  return [
    `# Native speaker review (${language})`,
    "",
    `These strings were prepared for \`${language}\`. A native speaker should review them before release. An agent translation is not that review.`,
    "",
    "| Key | Source (en) | Translation |",
    "| --- | --- | --- |",
    ...rows,
    "",
  ].join("\n");
}
