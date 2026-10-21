"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; title: string; group: string };

function normalize(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

function NavList({ items, pathname }: { items: Item[]; pathname: string }) {
  const groups = ["Start", "Commands", "Reference"];
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const rows = items.filter((item) => item.group === group);
        if (rows.length === 0) return null;
        return (
          <div key={group}>
            <p className="mb-2 text-[14px] text-muted">{group}</p>
            <ul className="flex flex-col">
              {rows.map((item) => {
                const current = normalize(pathname) === normalize(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={`flex min-h-11 items-center md:min-h-8 ${current ? "font-semibold text-accent underline" : "text-text no-underline"}`}
                    >
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function DocsSidebar({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <>
      <details className="docs-drawer md:hidden">
        <summary>Docs</summary>
        <nav aria-label="Documentation">
          <NavList items={items} pathname={pathname} />
        </nav>
      </details>
      <nav aria-label="Documentation" className="sticky top-20 hidden self-start md:block">
        <NavList items={items} pathname={pathname} />
      </nav>
    </>
  );
}
