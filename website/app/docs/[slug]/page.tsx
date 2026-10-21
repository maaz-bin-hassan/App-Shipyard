import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocFrame } from "@/components/doc-frame";
import { Mdx } from "@/components/mdx-content";
import { loadCommands } from "@/lib/commands";
import { getDoc, loadDocs, neighbors } from "@/lib/docs";

export function generateStaticParams() {
  return loadDocs()
    .filter((page) => page.slug !== "quick-start")
    .map((page) => ({ slug: page.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return params.then(({ slug }) => {
    const page = loadDocs().find((item) => item.slug === slug);
    if (!page) return { title: "Docs" };
    return {
      title: page.title,
      description: page.description,
      alternates: { canonical: page.href },
      openGraph: { title: page.title, description: page.description, url: page.href },
    };
  });
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = loadDocs().find((item) => item.slug === slug);
  if (!page || page.slug === "quick-start") notFound();
  const doc = getDoc(page.slug);
  const { prev, next } = neighbors(doc.href, loadCommands());
  return (
    <DocFrame title={doc.title} description={doc.description} toc={doc.toc} prev={prev} next={next}>
      <Mdx source={doc.body} />
    </DocFrame>
  );
}
