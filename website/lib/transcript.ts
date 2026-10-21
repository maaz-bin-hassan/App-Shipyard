import fs from "node:fs";
import path from "node:path";

export type TranscriptEntry = {
  command: string;
  exitCode: number;
  output: string;
};

export type Transcript = {
  recordedAt: string;
  entries: TranscriptEntry[];
};

let cached: Transcript | null = null;

export function loadTranscript(): Transcript {
  if (cached) return cached;
  const file = path.join(process.cwd(), "content", "transcript.json");
  if (!fs.existsSync(file)) throw new Error("website/content/transcript.json is missing");
  const data = JSON.parse(fs.readFileSync(file, "utf8")) as {
    recordedAt?: unknown;
    entries?: unknown;
  };
  if (typeof data.recordedAt !== "string" || data.recordedAt.trim() === "") {
    throw new Error("transcript.json is missing recordedAt");
  }
  if (!Array.isArray(data.entries) || data.entries.length === 0) {
    throw new Error("transcript.json has no entries");
  }
  const entries = data.entries.map((entry, index) => {
    const row = entry as { command?: unknown; exitCode?: unknown; output?: unknown };
    if (typeof row.command !== "string" || row.command.trim() === "") {
      throw new Error(`transcript.json entry ${index} is missing a command`);
    }
    if (typeof row.output !== "string" || row.output.length === 0) {
      throw new Error(`transcript.json entry ${index} is missing output`);
    }
    if (typeof row.exitCode !== "number") {
      throw new Error(`transcript.json entry ${index} is missing exitCode`);
    }
    return { command: row.command, exitCode: row.exitCode, output: row.output };
  });
  cached = { recordedAt: data.recordedAt, entries };
  return cached;
}

export function transcriptPlain(entries: TranscriptEntry[]): string {
  return entries
    .map((entry) => `$ ${entry.command}\n${entry.output.replace(/\s+$/, "")}`)
    .join("\n\n");
}
