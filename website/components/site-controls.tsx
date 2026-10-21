"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { repositoryUrl } from "@/lib/links";

const links = [
  { href: "/docs/", label: "Docs" },
  { href: "/changelog/", label: "Changelog" },
  { href: "/blog/", label: "Blog" },
];

function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function isCurrent(pathname: string, href: string): boolean {
  const current = normalize(pathname);
  const target = normalize(href);
  if (target === "/docs") return current === "/docs" || current.startsWith("/docs/");
  if (target === "/blog") return current === "/blog" || current.startsWith("/blog/");
  return current === target;
}

export function SiteControls() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(next);
    document.documentElement.style.colorScheme = next;
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  const themeLabel = theme === null ? "Theme" : theme === "dark" ? "Light" : "Dark";

  return (
    <>
      <nav className="hidden items-center gap-6 md:flex" aria-label="Primary">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
            className={isCurrent(pathname, link.href) ? "font-semibold text-accent underline" : "text-text no-underline"}
          >
            {link.label}
          </Link>
        ))}
        <a className="text-text no-underline" href={repositoryUrl} rel="noreferrer">
          GitHub
        </a>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
          aria-label={theme === "dark" ? "Switch to light theme" : theme === "light" ? "Switch to dark theme" : "Toggle color theme"}
        >
          {themeLabel}
        </button>
      </nav>
      <div className="flex items-center gap-2 md:hidden">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={toggleTheme}
          aria-pressed={theme === "dark"}
          aria-label={theme === "dark" ? "Switch to light theme" : theme === "light" ? "Switch to dark theme" : "Toggle color theme"}
        >
          {themeLabel}
        </button>
        <button
          type="button"
          className="btn btn-secondary min-w-11"
          aria-expanded={open}
          aria-controls="site-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} strokeWidth={1.75} aria-hidden="true" /> : <Menu size={20} strokeWidth={1.75} aria-hidden="true" />}
        </button>
      </div>
      {open ? (
        <nav id="site-menu" aria-label="Primary" className="absolute inset-x-0 top-14 border-b border-border bg-bg px-4 py-4 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
                  className={`flex min-h-11 items-center ${isCurrent(pathname, link.href) ? "font-semibold text-accent underline" : "text-text no-underline"}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <a className="flex min-h-11 items-center text-text no-underline" href={repositoryUrl} rel="noreferrer">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      ) : null}
    </>
  );
}
