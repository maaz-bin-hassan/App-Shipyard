import { getPost, loadPosts } from "@/lib/docs";
import { ogContentType, ogImage, ogSize } from "@/lib/og";

export const dynamic = "force-static";

export function generateStaticParams() {
  return loadPosts().map((post) => ({ slug: post.slug }));
}
export const alt = "Blog post";
export const size = ogSize;
export const contentType = ogContentType;

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return ogImage(getPost(slug).title);
}
