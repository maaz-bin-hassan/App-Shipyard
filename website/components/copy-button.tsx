"use client";

import { useRef, useState } from "react";

export function CopyButton({
  value,
  label = "Copy",
  variant = "secondary",
}: {
  value: string;
  label?: string;
  variant?: "primary" | "secondary";
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "absolute";
      area.style.left = "-9999px";
      document.body.append(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopied(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button type="button" className={variant === "primary" ? "btn btn-primary" : "btn btn-secondary"} onClick={copy}>
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
