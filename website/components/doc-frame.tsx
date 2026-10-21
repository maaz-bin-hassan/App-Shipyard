import Link from "next/link";
import type { ReactNode } from "react";
import type { SequenceItem, TocItem } from "@/lib/docs";

export function DocFrame({
  title,
  description,
  toc,
  prev,
  next,
  children,
}: {
  title: string;
  description: string;
  toc: TocItem[];
  prev?: SequenceItem;
  next?: SequenceItem;
  children: ReactNode;
}) {
  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,720px)_11rem] xl:items-start xl:gap-10">
      <article className="min-w-0">
        <h1 className="text-[32px] font-semibold tracking-tight">{title}</h1>
        <p className="mt-4 max-w-[68ch] text-[18px] text-muted">{description}</p>
        <div className="mt-8">{children}</div>
        <nav aria-label="Pagination" className="mt-14 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:justify-between">
          {prev ? (
            <Link className="btn btn-secondary" href={prev.href}>
              Previous: {prev.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link className="btn btn-primary" href={next.href}>
              Next: {next.title}
            </Link>
          ) : null}
        </nav>
      </article>
      {toc.length > 0 ? (
        <nav aria-label="On this page" className="sticky top-20 hidden self-start xl:block">
          <p className="mb-3 text-[14px] text-muted">On this page</p>
          <ul className="flex flex-col gap-2">
            {toc.map((item) => (
              <li key={item.id} className={item.depth === 3 ? "pl-3" : undefined}>
                <a href={`#${item.id}`}>{item.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  );
}
