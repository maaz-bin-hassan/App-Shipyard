import type { Metadata } from "next";
import Link from "next/link";
import { loadPosts } from "@/lib/docs";

const description = "Notes on the kit. One post. There is no release yet.";

export const metadata: Metadata = {
  title: "Blog",
  description,
  alternates: { canonical: "/blog/" },
  openGraph: { title: "Blog", description, url: "/blog/" },
};

export default function BlogPage() {
  const posts = loadPosts();
  return (
    <div className="mx-auto w-[min(720px,calc(100%-32px))] py-14 md:py-[88px]">
      <h1 className="text-[32px] font-semibold tracking-tight">Blog</h1>
      <p className="mt-4 text-[18px] text-muted">{description}</p>
      <ul className="mt-10 border-t border-border">
        {posts.map((post) => (
          <li key={post.slug} className="border-b border-border py-6">
            <p className="font-mono text-[14px] text-muted">{post.date}</p>
            <h2 className="mt-2 text-[24px] font-semibold">
              <Link href={post.href}>{post.title}</Link>
            </h2>
            <p className="mt-2">{post.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
