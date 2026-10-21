#!/usr/bin/env node
import { USAGE, parseCli } from "./args.js";
import { runScaffold } from "./scaffold.js";

const parsed = parseCli(process.argv.slice(2));
if (!parsed.ok) {
  console.error(parsed.error);
  console.error(USAGE);
  process.exit(1);
}
if (parsed.help) {
  console.log(USAGE);
  process.exit(0);
}

try {
  await runScaffold(parsed.options);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
