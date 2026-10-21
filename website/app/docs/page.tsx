import type { Metadata } from "next";
import { DocFrame } from "@/components/doc-frame";
import { Mdx } from "@/components/mdx-content";
import { loadCommands } from "@/lib/commands";
import { getDoc, neighbors } from "@/lib/docs";

export function generateMetadata(): Metadata {
  const page = getDoc("quick-start");
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.href },
    openGraph: { title: page.title, description: page.description, url: page.href },
  };
}

export default function QuickStartPage() {
  const page = getDoc("quick-start");
  const { prev, next } = neighbors(page.href, loadCommands());
  return (
    <DocFrame title={page.title} description={page.description} toc={page.toc} prev={prev} next={next}>
      <Mdx source={page.body} />
    </DocFrame>
  );
}
