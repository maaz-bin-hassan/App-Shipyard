import Link from "next/link";
import { SiteControls } from "./site-controls";

export function Header() {
  return (
    <header className="sticky top-0 z-20 h-14 border-b border-border bg-bg">
      <div className="relative mx-auto flex h-full w-[min(1080px,calc(100%-32px))] items-center justify-between gap-4">
        <Link href="/" className="font-mono text-[16px] font-semibold text-text no-underline">
          App Shipyard
        </Link>
        <SiteControls />
      </div>
    </header>
  );
}
