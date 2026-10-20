import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const here = dirname(fileURLToPath(import.meta.url));
const supabaseDir = join(here, "..");

function read(path: string): string {
  return readFileSync(path, "utf8");
}

function withHelper(sql: string): string {
  const helper = read(join(here, "helpers.sql"));
  const opener = sql.match(/^(\s*(?:--[^\n]*\r?\n\s*)*)begin\s*;/i);
  if (!opener) {
    throw new Error("SQL test must open a transaction");
  }
  return sql.replace(opener[0], () => `${opener[1]}begin;\n${helper}\n`);
}

async function applyMigrations(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(read(join(here, "pglite-auth-prelude.sql")));
  await db.exec(read(join(supabaseDir, "migrations", "001_profiles.sql")));
  await db.exec(read(join(supabaseDir, "migrations", "002_ai_usage.sql")));
  return db;
}

async function runScript(db: PGlite, sql: string): Promise<void> {
  try {
    await db.exec(withHelper(sql));
  } catch (error) {
    try {
      await db.exec("rollback");
    } catch {
      // The failed script already aborted the transaction.
    }
    throw error;
  }
}

describe("supabase migrations", () => {
  it("creates profiles and ai_usage with row level security", async () => {
    const db = await applyMigrations();
    const tables = await db.query<{ relname: string }>(
      `select c.relname
       from pg_class c
       join pg_namespace n on n.oid = c.relnamespace
       where n.nspname = 'public'
         and c.relkind = 'r'
         and c.relrowsecurity
       order by c.relname`,
    );
    assert.deepEqual(tables.rows.map((row) => row.relname), ["ai_usage", "profiles"]);
    await db.close();
  });

  it("lets a user read and write only their own profile and usage", async () => {
    const db = await applyMigrations();
    await runScript(db, read(join(here, "rls.sql")));
    const profiles = await db.query<{ count: number }>("select count(*)::int as count from public.profiles");
    assert.equal(profiles.rows[0]?.count, 0);
    await db.close();
  });

  it("stops at the daily limit without incrementing past it", async () => {
    const db = await applyMigrations();
    await runScript(db, read(join(here, "rate_limit.sql")));
    const usage = await db.query<{ count: number }>("select count(*)::int as count from public.ai_usage");
    assert.equal(usage.rows[0]?.count, 0);
    await db.close();
  });
});
