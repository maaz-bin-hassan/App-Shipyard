import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { CodeBlock } from "@/components/code-block";
import { DocFrame } from "@/components/doc-frame";
import { Markdown } from "@/components/markdown";
import { getCommand, loadCommands } from "@/lib/commands";
import { neighbors, type TocItem } from "@/lib/docs";

const toc: TocItem[] = [
  { id: "what-it-does", title: "What it does", depth: 2 },
  { id: "usage", title: "Usage", depth: 2 },
  { id: "questions", title: "Questions it asks", depth: 2 },
  { id: "files", title: "Files it changes", depth: 2 },
  { id: "example", title: "Example", depth: 2 },
  { id: "troubleshooting", title: "Troubleshooting", depth: 2 },
];

export function generateStaticParams() {
  return loadCommands().map((command) => ({ name: command.name }));
}

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const command = loadCommands().find((item) => item.name === name);
  if (!command) return { title: "Command" };
  const href = `/docs/commands/${command.name}/`;
  return {
    title: `ship-${command.name}`,
    description: command.description,
    alternates: { canonical: href },
    openGraph: { title: `ship-${command.name}`, description: command.description, url: href },
  };
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="mt-10" aria-labelledby={id}>
      <h2 id={id} className="text-[24px] font-semibold">
        {title}
        <a className="heading-anchor" href={`#${id}`} aria-label={`Link to ${title}`}>
          #
        </a>
      </h2>
      {children}
    </section>
  );
}

export default async function CommandPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const known = loadCommands().some((item) => item.name === name);
  if (!known) notFound();
  const command = getCommand(name);
  const href = `/docs/commands/${command.name}/`;
  const { prev, next } = neighbors(href, loadCommands());
  const files = command.files.map((file) => `- \`${file}\``).join("\n");
  const usage = [
    `Install with \`npx createshipyard my-app\`, open \`my-app\`, and run \`/ship-${command.name}\`.`,
    "",
    command.argumentHint === "(none)"
      ? "This command takes no arguments."
      : `The argument hint is \`${command.argumentHint}\`.`,
    "",
    "`npx createshipyard my-app --agent` accepts `claude`, `cursor`, `opencode`, or `all`. The default is `claude`. `all` writes Claude Code, Cursor, and OpenCode.",
  ].join("\n");

  return (
    <DocFrame title={`ship-${command.name}`} description={command.description} toc={toc} prev={prev} next={next}>
      <Section id="what-it-does" title="What it does">
        <Markdown source={command.goal} />
      </Section>
      <Section id="usage" title="Usage">
        <Markdown source={usage} />
      </Section>
      <Section id="questions" title="Questions it asks">
        <Markdown source={command.ask} />
      </Section>
      <Section id="files" title="Files it changes">
        <Markdown
          source={[
            "On Expo, the steps name these paths. Flutter, Android, and iOS each have their own fragment.",
            "",
            files,
            "",
            `The Expo fragment is \`platforms/expo/fragments/${command.name}.md\`.`,
          ].join("\n")}
        />
      </Section>
      <Section id="example" title="Example">
        <CodeBlock code={`/ship-${command.name}`} language="text" label="command" />
      </Section>
      <Section id="troubleshooting" title="Troubleshooting">
        <Markdown
          source={[
            "If the run stops, the Expo fragment says to roll back like this.",
            "",
            command.rollback,
            "",
            "The command file also says the agent must not do this.",
            "",
            command.never,
          ].join("\n")}
        />
      </Section>
    </DocFrame>
  );
}
