import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

export type UsageDescription = { key: string; text: string };

export type SchemaTable = { name: string; columns: string[] };

export type AnalyticsEventRow = { name: string; when: string; properties: string };

export type Evidence = {
  platform: "expo";
  appConfigPath: string;
  packageJsonPath: string;
  appName: string;
  bundleIdentifier: string;
  androidPackage: string;
  dependencies: string[];
  usageDescriptions: UsageDescription[];
  androidPermissions: string[];
  plugins: string[];
  events: AnalyticsEventRow[];
  eventsPath: string;
  tables: SchemaTable[];
  migrationPaths: string[];
  handlerPath: string;
  forwardsMessagesToOpenRouter: boolean;
  storesMessageText: boolean;
  cascadesOnAuthDelete: boolean;
  profileDeletePolicy: boolean;
  unclassified: string[];
};

const MESSAGE_COLUMNS = new Set(["message", "messages", "content", "prompt", "body"]);

export function parseDependencies(packageJson: string): string[] {
  const parsed = JSON.parse(packageJson) as { dependencies?: Record<string, string> };
  return Object.keys(parsed.dependencies ?? {}).sort();
}

export function parseAppConfig(source: string): {
  appName: string;
  bundleIdentifier: string;
  androidPackage: string;
  usageDescriptions: UsageDescription[];
  androidPermissions: string[];
  plugins: string[];
} {
  const usageDescriptions: UsageDescription[] = [];
  for (const match of source.matchAll(/(NS[A-Za-z0-9]+)\s*:\s*"([^"]*)"/g)) {
    usageDescriptions.push({ key: match[1] ?? "", text: match[2] ?? "" });
  }
  const permissionsBlock = source.match(/permissions\s*:\s*\[([\s\S]*?)\]/);
  const androidPermissions = permissionsBlock
    ? [...permissionsBlock[1].matchAll(/"(android\.permission\.[A-Z0-9_]+)"/g)].map((match) => match[1] ?? "")
    : [];
  const pluginsBlock = source.match(/plugins\s*:\s*\[([\s\S]*?)\]/);
  const plugins = pluginsBlock
    ? [...pluginsBlock[1].matchAll(/"([^"]+)"/g)].map((match) => match[1] ?? "").filter((name) => name !== "")
    : [];
  return {
    appName: source.match(/\bname\s*:\s*"([^"]*)"/)?.[1] ?? "",
    bundleIdentifier: source.match(/\bbundleIdentifier\s*:\s*"([^"]*)"/)?.[1] ?? "",
    androidPackage: source.match(/\bpackage\s*:\s*"([^"]*)"/)?.[1] ?? "",
    usageDescriptions,
    androidPermissions,
    plugins,
  };
}

export function parseEvents(markdown: string): AnalyticsEventRow[] {
  const rows: AnalyticsEventRow[] = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^\|\s*([a-z][a-z0-9_]*)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|$/);
    if (!match) continue;
    rows.push({ name: match[1] ?? "", when: match[2] ?? "", properties: match[3] ?? "" });
  }
  return rows;
}

export function parseSchema(sql: string): SchemaTable[] {
  const tables: SchemaTable[] = [];
  for (const match of sql.matchAll(/create table\s+(?:public\.)?([a-z_][a-z0-9_]*)\s*\(([\s\S]*?)\n\);/gi)) {
    const columns: string[] = [];
    for (const line of (match[2] ?? "").split("\n")) {
      const column = line.match(/^\s{2}([a-z_][a-z0-9_]*)\s+/i);
      if (!column) continue;
      const name = column[1] ?? "";
      if (name === "constraint" || name === "primary" || name === "unique" || name === "check") continue;
      columns.push(name);
    }
    tables.push({ name: match[1] ?? "", columns });
  }
  return tables;
}

export function handlerForwardsMessages(source: string): boolean {
  return source.includes("openrouter.ai") && source.includes("messages:");
}

const SDK_NOTES: Record<string, true> = {
  "@sentry/react-native": true,
  expo: true,
  "expo-application": true,
  "expo-audio": true,
  "expo-calendar": true,
  "expo-camera": true,
  "expo-contacts": true,
  "expo-device": true,
  "expo-file-system": true,
  "expo-image-picker": true,
  "expo-localization": true,
  "expo-location": true,
  "expo-notifications": true,
  i18next: true,
  "posthog-react-native": true,
  react: true,
  "react-native": true,
  "react-native-purchases": true,
};

export function unclassifiedDependencies(dependencies: readonly string[]): string[] {
  return dependencies.filter((name) => !SDK_NOTES[name]);
}

function read(file: string): string {
  return readFileSync(file, "utf8");
}

export function loadLegalInputs(root: string): Evidence {
  const rootPackage = JSON.parse(read(path.join(root, "package.json"))) as { name?: string; dependencies?: Record<string, string> };
  const templatePackagePath = path.join(root, "platforms/expo/template/package.json");
  const useTemplatePackage = rootPackage.name === "fastappshipkit" && existsSync(templatePackagePath);
  const packageJsonPath = useTemplatePackage ? templatePackagePath : path.join(root, "package.json");
  const packageJsonRel = useTemplatePackage ? "platforms/expo/template/package.json" : "package.json";

  const rootConfig = path.join(root, "app.config.ts");
  const templateConfig = path.join(root, "platforms/expo/template/app.config.ts");
  const useTemplateConfig = !existsSync(rootConfig);
  const appConfigPath = useTemplateConfig ? templateConfig : rootConfig;
  const appConfigRel = useTemplateConfig ? "platforms/expo/template/app.config.ts" : "app.config.ts";

  const eventsPath = path.join(root, "docs/events.md");
  const handlerPath = path.join(root, "backend/supabase/functions/ai-proxy/handler.ts");
  const migrationsDir = path.join(root, "backend/supabase/migrations");
  const migrationFiles = readdirSync(migrationsDir)
    .filter((name) => name.endsWith(".sql"))
    .sort();
  const migrationSql = migrationFiles.map((name) => read(path.join(migrationsDir, name))).join("\n");
  const config = parseAppConfig(read(appConfigPath));
  const dependencies = parseDependencies(read(packageJsonPath));
  const tables = parseSchema(migrationSql);
  const storesMessageText = tables.some((table) => table.columns.some((column) => MESSAGE_COLUMNS.has(column)));

  return {
    platform: "expo",
    appConfigPath: appConfigRel,
    packageJsonPath: packageJsonRel,
    appName: config.appName,
    bundleIdentifier: config.bundleIdentifier,
    androidPackage: config.androidPackage,
    dependencies,
    usageDescriptions: config.usageDescriptions,
    androidPermissions: config.androidPermissions,
    plugins: config.plugins,
    events: parseEvents(read(eventsPath)),
    eventsPath: "docs/events.md",
    tables,
    migrationPaths: migrationFiles.map((name) => `backend/supabase/migrations/${name}`),
    handlerPath: "backend/supabase/functions/ai-proxy/handler.ts",
    forwardsMessagesToOpenRouter: handlerForwardsMessages(read(handlerPath)),
    storesMessageText,
    cascadesOnAuthDelete: migrationSql.includes("on delete cascade"),
    profileDeletePolicy: migrationSql.includes("profiles_delete_own"),
    unclassified: unclassifiedDependencies(dependencies),
  };
}
