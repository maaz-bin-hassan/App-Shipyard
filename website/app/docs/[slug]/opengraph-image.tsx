import { getDoc, loadDocs } from "@/lib/docs";
import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return loadDocs()
    .filter((page) => page.slug !== "quick-start")
    .map((page) => ({ slug: page.slug }));
}
export const alt = "Documentation";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return ogImage(getDoc(slug).title);
}
