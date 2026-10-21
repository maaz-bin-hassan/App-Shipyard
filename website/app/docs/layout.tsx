import { DocsSidebar } from "@/components/docs-sidebar";
import { loadCommands } from "@/lib/commands";
import { docNavItems } from "@/lib/docs";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid w-[min(1180px,calc(100%-32px))] gap-8 py-14 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10 md:py-[88px]">
      <DocsSidebar items={docNavItems(loadCommands())} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
