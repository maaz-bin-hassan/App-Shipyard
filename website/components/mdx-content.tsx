import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";

function textFrom(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map((item) => textFrom(item)).join("");
  if (node && typeof node === "object" && "props" in node) {
    const element = node as { props?: { children?: ReactNode } };
    return textFrom(element.props?.children);
  }
  return "";
}

function Heading(level: 2 | 3) {
  const Tag = level === 2 ? "h2" : "h3";
  return function HeadingTag(props: { id?: string; children?: ReactNode }) {
    return (
      <Tag id={props.id}>
        {props.children}
        {props.id ? (
          <a className="heading-anchor" href={`#${props.id}`} aria-label={`Link to ${props.id}`}>
            #
          </a>
        ) : null}
      </Tag>
    );
  };
}

function Pre(props: { children?: ReactNode }) {
  const child = Array.isArray(props.children) ? props.children[0] : props.children;
  let language = "text";
  if (child && typeof child === "object" && "props" in child) {
    const className = (child as { props?: { className?: string } }).props?.className ?? "";
    const match = /language-([\w-]+)/.exec(className);
    if (match) language = match[1];
  }
  const code = textFrom(props.children).replace(/\n$/, "");
  return <CodeBlock code={code} language={language} />;
}

function Table(props: { children?: ReactNode }) {
  return (
    <div className="table-wrap">
      <table>{props.children}</table>
    </div>
  );
}

function Anchor(props: { href?: string; children?: ReactNode }) {
  const external = props.href?.startsWith("http://") || props.href?.startsWith("https://");
  return (
    <a href={props.href} rel={external ? "noreferrer" : undefined}>
      {props.children}
    </a>
  );
}

export async function Mdx({ source }: { source: string }) {
  if (source.trim() === "") throw new Error("Refusing to render an empty MDX document");
  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: false,
      blockJS: true,
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      },
    },
    components: {
      h2: Heading(2),
      h3: Heading(3),
      pre: Pre,
      table: Table,
      a: Anchor,
    },
  });
  return <div className="prose">{content}</div>;
}
