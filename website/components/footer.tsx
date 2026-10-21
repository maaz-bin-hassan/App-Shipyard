import Link from "next/link";
import { blobUrl, repositoryUrl } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-[min(1080px,calc(100%-32px))] flex-col gap-3 py-8 md:flex-row md:items-center md:gap-8">
        <a href={blobUrl("LICENSE")}>MIT License</a>
        <a href={repositoryUrl} rel="noreferrer">
          GitHub
        </a>
        <Link href="/changelog/">Changelog</Link>
      </div>
    </footer>
  );
}
