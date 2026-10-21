import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = "image/png";

function fontFile(): Buffer {
  const file = path.join(
    process.cwd(),
    "node_modules/@fontsource/geist-sans/files/geist-sans-latin-600-normal.woff",
  );
  if (!fs.existsSync(file)) throw new Error(`OG font is missing: ${file}`);
  return fs.readFileSync(file);
}

export function ogImage(title: string) {
  const trimmed = title.trim();
  if (trimmed === "") throw new Error("Refusing to render an Open Graph image with an empty title");
  const fontSize = trimmed.length > 70 ? 48 : 60;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#FAFAF8",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", fontFamily: "Geist", fontSize: 28, color: "#6B6B64" }}>App Shipyard</div>
        <div
          style={{
            display: "flex",
            fontFamily: "Geist",
            fontSize,
            fontWeight: 600,
            color: "#1A1A18",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
          }}
        >
          {trimmed}
        </div>
        <div style={{ display: "flex", width: 72, height: 6, background: "#BF4605" }} />
      </div>
    ),
    {
      ...ogSize,
      fonts: [{ name: "Geist", data: fontFile(), weight: 600, style: "normal" }],
    },
  );
}
