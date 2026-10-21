import GithubSlugger from "github-slugger";
import type { ReactNode } from "react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";
import { CodeBlock } from "./code-block";

type MdNode = {
  type: string;
  value?: string;
  url?: string;
  depth?: number;
  lang?: string;
  ordered?: boolean;
  children?: MdNode[];
};

function headingText(node: MdNode): string {
  return (node.children ?? []).map((child) => child.value ?? headingText(child)).join("");
}

async function renderChildren(nodes: MdNode[] | undefined, slugger: GithubSlugger): Promise<ReactNode[]> {
  return Promise.all((nodes ?? []).map((node, index) => renderNode(node, index, slugger)));
}

async function renderNode(node: MdNode, key: number, slugger: GithubSlugger): Promise<ReactNode> {
  switch (node.type) {
    case "text":
      return node.value ?? "";
    case "paragraph":
      return <p key={key}>{await renderChildren(node.children, slugger)}</p>;
    case "heading": {
      const depth = Math.min(Math.max(node.depth ?? 2, 2), 3);
      const Tag = depth === 2 ? "h2" : "h3";
      const id = slugger.slug(headingText(node));
      return (
        <Tag key={key} id={id}>
          {await renderChildren(node.children, slugger)}
          <a className="heading-anchor" href={`#${id}`} aria-label={`Link to ${headingText(node)}`}>
            #
          </a>
        </Tag>
      );
    }
    case "emphasis":
      return <em key={key}>{await renderChildren(node.children, slugger)}</em>;
    case "strong":
      return <strong key={key}>{await renderChildren(node.children, slugger)}</strong>;
    case "delete":
      return <del key={key}>{await renderChildren(node.children, slugger)}</del>;
    case "inlineCode":
      return <code key={key}>{node.value}</code>;
    case "link": {
      const href = node.url ?? "";
      if (href.startsWith("javascript:")) throw new Error("Refusing a javascript: link in markdown");
      const external = href.startsWith("http://") || href.startsWith("https://");
      return (
        <a key={key} href={href} rel={external ? "noreferrer" : undefined}>
          {await renderChildren(node.children, slugger)}
        </a>
      );
    }
    case "list": {
      const List = node.ordered ? "ol" : "ul";
      return <List key={key}>{await renderChildren(node.children, slugger)}</List>;
    }
    case "listItem":
      return <li key={key}>{await renderChildren(node.children, slugger)}</li>;
    case "code":
      return <CodeBlock key={key} code={node.value ?? ""} language={node.lang || "text"} />;
    case "blockquote":
      return <blockquote key={key}>{await renderChildren(node.children, slugger)}</blockquote>;
    case "thematicBreak":
      return <hr key={key} />;
    case "break":
      return <br key={key} />;
    case "html":
      return node.value ?? "";
    case "table": {
      const rows = [];
      for (const [rowIndex, row] of (node.children ?? []).entries()) {
        const cells = [];
        for (const [cellIndex, cell] of (row.children ?? []).entries()) {
          const Cell = rowIndex === 0 ? "th" : "td";
          cells.push(<Cell key={cellIndex}>{await renderChildren(cell.children, slugger)}</Cell>);
        }
        rows.push(<tr key={rowIndex}>{cells}</tr>);
      }
      return (
        <div key={key} className="table-wrap">
          <table>
            <tbody>{rows}</tbody>
          </table>
        </div>
      );
    }
    default:
      throw new Error(`Unsupported markdown node "${node.type}"`);
  }
}

export async function Markdown({ source }: { source: string }) {
  if (source.trim() === "") throw new Error("Refusing to render an empty markdown section");
  const tree = unified().use(remarkParse).use(remarkGfm).parse(source) as MdNode;
  return <div className="prose">{await renderChildren(tree.children, new GithubSlugger())}</div>;
}
