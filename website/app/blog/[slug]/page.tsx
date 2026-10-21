import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mdx } from "@/components/mdx-content";
import { getPost, loadPosts } from "@/lib/docs";

export function generateStaticParams() {
  return loadPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = loadPosts().find((item) => item.slug === slug);
  if (!post) return { title: "Blog" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: post.href },
    openGraph: { title: post.title, description: post.description, url: post.href, type: "article" },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!loadPosts().some((item) => item.slug === slug)) notFound();
  const post = getPost(slug);
  return (
    <div className="mx-auto grid w-[min(1080px,calc(100%-32px))] gap-10 py-14 md:py-[88px] xl:grid-cols-[minmax(0,720px)_180px]">
      <article className="min-w-0">
        <p className="font-mono text-[14px] text-muted">{post.date}</p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-tight">{post.title}</h1>
        <p className="mt-4 max-w-[68ch] text-[18px] text-muted">{post.description}</p>
        <div className="mt-8">
          <Mdx source={post.body} />
        </div>
        <p className="mt-14 border-t border-border pt-8">
          <Link className="btn btn-primary" href="/blog/">
            Back to the blog
          </Link>
        </p>
      </article>
      <nav aria-label="On this page" className="sticky top-20 hidden self-start xl:block">
        <p className="mb-3 text-[14px] text-muted">On this page</p>
        <ul className="flex flex-col gap-2">
          {post.toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`}>{item.title}</a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
