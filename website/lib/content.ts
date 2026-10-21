import { assertComparison } from "./comparison";
import { loadChangelog } from "./changelog";
import { loadCommands } from "./commands";
import { loadDocs, loadPosts } from "./docs";
import { loadTranscript } from "./transcript";

let checked = false;

export function assertSite(): void {
  if (checked) return;
  const commands = loadCommands();
  loadDocs();
  loadPosts();
  loadChangelog();
  loadTranscript();
  assertComparison();
  if (commands.length === 0) throw new Error("Command list is empty");
  checked = true;
}
