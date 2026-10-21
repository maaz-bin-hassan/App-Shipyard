export function splitFrontmatter(text: string, file: string): { data: Record<string, string>; body: string } {
  if (!text.startsWith("---")) return { data: {}, body: text };
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error(`${file}: frontmatter is not closed`);
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (line.trim() === "") continue;
    const separated = line.match(/^([A-Za-z][A-Za-z0-9-]*):\s*(.*)$/);
    if (!separated) throw new Error(`${file}: frontmatter line is not key: value (${line})`);
    data[separated[1]] = unquote(separated[2].trim());
  }
  return { data, body: text.slice(match[0].length) };
}

export function parseSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  let current: string | null = null;
  const buffer: string[] = [];

  function flush() {
    if (!current) return;
    sections[current] = buffer.join("\n").trim();
    buffer.length = 0;
  }

  for (const line of body.split(/\r?\n/)) {
    const heading = line.match(/^## ([A-Za-z][A-Za-z0-9-]*)\s*$/);
    if (heading) {
      flush();
      current = heading[1];
      continue;
    }
    if (current) buffer.push(line);
  }
  flush();
  return sections;
}

export function requireText(value: string | undefined, label: string): string {
  if (!value || value.trim() === "") throw new Error(`${label} is empty`);
  return value.trim();
}

function unquote(value: string): string {
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}
