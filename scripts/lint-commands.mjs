import path from "node:path";
import { fileURLToPath } from "node:url";
import { lintRepository } from "./lib/command-docs.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = await lintRepository(root);

if (errors.length > 0) {
  for (const error of errors) console.error(error);
  process.exit(1);
}

console.log("lint:commands ok");
