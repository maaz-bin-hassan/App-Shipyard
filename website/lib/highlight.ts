import { codeToHtml, type ThemeRegistration } from "shiki";

const light: ThemeRegistration = {
  name: "shipyard-light",
  type: "light",
  colors: {
    "editor.background": "#F2F2EE",
    "editor.foreground": "#1A1A18",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#6B6B64" } },
    {
      scope: ["keyword", "storage", "storage.type", "keyword.control", "string", "constant.numeric", "constant.language"],
      settings: { foreground: "#BF4605" },
    },
  ],
};

const dark: ThemeRegistration = {
  name: "shipyard-dark",
  type: "dark",
  colors: {
    "editor.background": "#161614",
    "editor.foreground": "#ECECE8",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#9A9A92" } },
    {
      scope: ["keyword", "storage", "storage.type", "keyword.control", "string", "constant.numeric", "constant.language"],
      settings: { foreground: "#FF7A2E" },
    },
  ],
};

const cache = new Map<string, string>();

const LANGUAGE_ALIAS: Record<string, string> = {
  sh: "bash",
  shell: "bash",
  console: "bash",
  md: "markdown",
  text: "text",
  txt: "text",
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function plain(code: string): string {
  return `<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`;
}

export async function highlight(code: string, language: string): Promise<string> {
  const requested = LANGUAGE_ALIAS[language] ?? language ?? "text";
  const key = `${requested}\0${code}`;
  const hit = cache.get(key);
  if (hit) return hit;
  try {
    const html = await codeToHtml(code, {
      lang: requested === "text" ? "text" : requested,
      themes: { light, dark },
      defaultColor: false,
    });
    cache.set(key, html);
    return html;
  } catch {
    const html = plain(code);
    cache.set(key, html);
    return html;
  }
}
