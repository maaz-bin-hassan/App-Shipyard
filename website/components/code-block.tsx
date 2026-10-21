import { highlight } from "@/lib/highlight";
import { CopyButton } from "./copy-button";

export async function CodeBlock({
  code,
  language,
  label,
  copyLabel = "Copy",
  copyVariant = "secondary",
}: {
  code: string;
  language: string;
  label?: string;
  copyLabel?: string;
  copyVariant?: "primary" | "secondary";
}) {
  if (code.trim() === "") throw new Error("Refusing to render an empty code block");
  const html = await highlight(code.replace(/\n$/, ""), language);
  return (
    <div className="code-block">
      <div className="code-block-bar">
        <span>{label ?? language}</span>
        <CopyButton value={code.replace(/\n$/, "")} label={copyLabel} variant={copyVariant} />
      </div>
      <div className="code-scroll" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
