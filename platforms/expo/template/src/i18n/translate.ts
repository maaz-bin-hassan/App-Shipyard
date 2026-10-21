import { en } from "./locales/en.ts";

export type Catalog = { [key: string]: string | Catalog };

export { en };

const catalogs = new Map<string, Catalog>([["en", en]]);

let language = "en";
let backend: ((key: string, language: string) => string) | null = null;
const listeners = new Set<() => void>();

export function languageCode(languageTag: string): string {
  const code = languageTag.trim().toLowerCase().split("-")[0] ?? "";
  return code === "" ? "en" : code;
}

export function getLanguage(): string {
  return language;
}

export function setLanguage(next: string): void {
  language = languageCode(next);
  for (const listener of listeners) listener();
}

export function subscribeLanguage(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function registerCatalog(code: string, catalog: Catalog): void {
  catalogs.set(languageCode(code), catalog);
}

export function bindTranslator(translator: ((key: string, language: string) => string) | null): void {
  backend = translator;
}

export function resetI18n(): void {
  backend = null;
  for (const code of [...catalogs.keys()]) {
    if (code !== "en") catalogs.delete(code);
  }
  setLanguage("en");
}

export function lookup(catalog: Catalog, key: string): string | null {
  let current: string | Catalog = catalog;
  for (const part of key.split(".")) {
    if (typeof current !== "object" || current === null || !(part in current)) return null;
    const next: string | Catalog | undefined = current[part];
    if (typeof next !== "string" && (next === undefined || typeof next !== "object")) return null;
    current = next;
  }
  return typeof current === "string" ? current : null;
}

export function flattenCatalog(catalog: Catalog, prefix = ""): Array<{ key: string; value: string }> {
  const rows: Array<{ key: string; value: string }> = [];
  for (const key of Object.keys(catalog).sort()) {
    const value = catalog[key];
    const full = prefix === "" ? key : `${prefix}.${key}`;
    if (typeof value === "string") rows.push({ key: full, value });
    else if (value && typeof value === "object") rows.push(...flattenCatalog(value, full));
  }
  return rows;
}

export function missingKeys(source: Catalog, target: Catalog): string[] {
  return flattenCatalog(source)
    .map((row) => row.key)
    .filter((key) => lookup(target, key) === null);
}

export function translate(key: string, languageTag = getLanguage()): string {
  if (backend) return backend(key, languageTag);
  const code = languageCode(languageTag);
  const local = lookup(catalogs.get(code) ?? en, key);
  if (local !== null) return local;
  return lookup(en, key) ?? key;
}
