import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { TerminalDemo } from "@/components/terminal-demo";
import { comparison, evidenceHref } from "@/lib/comparison";
import { loadCommands } from "@/lib/commands";
import { installCommand, pitch, repositoryUrl, siteDescription } from "@/lib/site";
import { blobUrl } from "@/lib/site";
import { loadTranscript } from "@/lib/transcript";

export const metadata: Metadata = {
  description: siteDescription,
  alternates: { canonical: "/" },
  openGraph: { title: pitch, description: siteDescription, url: "/" },
};

const steps = [
  { number: "01", title: "Type a command", text: "Run the CLI, then a /ship-* command in the agent." },
  { number: "02", title: "Answer questions", text: "The command asks once and stores the answers in .shipkit/state.json." },
  { number: "03", title: "Agent wires it", text: "The agent follows that platform's fragment and edits the files it names." },
];

const stack = [
  { name: "Expo", reason: "Default template the CLI copies. The Flutter, Android, and iOS templates are stubs." },
  { name: "TypeScript", reason: "The CLI and the Expo template." },
  { name: "Supabase", reason: "Shared profiles, the daily AI limit, and the OpenRouter proxy." },
  { name: "RevenueCat", reason: "Expo paywall. Live store products wait for an explicit yes." },
  { name: "PostHog", reason: "Product analytics. The wrapper defaults consent to off." },
  { name: "Sentry", reason: "Crash reports, behind the same consent flag." },
];

export default function HomePage() {
  const commands = loadCommands();
  const transcript = loadTranscript();

  return (
    <div className="mx-auto w-[min(1080px,calc(100%-32px))]">
      <section className="py-14 md:py-[88px]">
        <h1 className="max-w-[16ch] text-[32px] font-semibold tracking-tight md:text-[48px] md:leading-[1.05]">
          {pitch}
        </h1>
        <p className="mt-6 max-w-[62ch] text-[18px] text-muted">
          Build the CLI from this repository, then scaffold one platform. The same commands compile for Claude Code,
          Cursor, OpenCode, Antigravity, and Codex. The package is not on npm.
        </p>
        <div className="mt-8 max-w-[640px]">
          <CodeBlock code={installCommand} language="bash" label="bash" copyLabel="Copy" copyVariant="primary" />
        </div>
        <p className="mt-4">
          <Link href="/docs/">Docs</Link>
        </p>
      </section>

      <section className="pb-14 md:pb-[88px]" aria-label="Recorded session">
        <h2 className="mb-4 text-[24px] font-semibold">A recorded run</h2>
        <TerminalDemo transcript={transcript} />
      </section>

      <section className="pb-14 md:pb-[88px]">
        <h2 className="mb-8 text-[24px] font-semibold">How it works</h2>
        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number} className="border-t border-border pt-4">
              <p className="font-mono text-[14px] text-muted">{step.number}</p>
              <h3 className="mt-2 text-[18px] font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pb-14 md:pb-[88px]">
        <h2 className="mb-8 text-[24px] font-semibold">Commands</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {commands.map((command) => (
            <li key={command.name}>
              <Link className="card h-full" href={`/docs/commands/${command.name}/`}>
                <h3 className="text-[18px] font-semibold">{command.name}</h3>
                <p>{command.description}</p>
                <p className="font-mono text-[14px] text-muted">/ship-{command.name}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="pb-14 md:pb-[88px]">
        <h2 className="mb-8 text-[24px] font-semibold">Stack</h2>
        <dl className="border-t border-border">
          {stack.map((item) => (
            <div key={item.name} className="grid gap-1 border-b border-border py-4 md:grid-cols-2 md:gap-8">
              <dt className="font-semibold">{item.name}</dt>
              <dd className="text-muted">{item.reason}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="pb-14 md:pb-[88px]">
        <h2 className="mb-8 text-[24px] font-semibold">From scratch and this kit</h2>
        <div className="table-wrap border-t border-border">
          <table>
            <caption className="sr-only">What you do by hand, what the kit does, and the file that shows it</caption>
            <thead>
              <tr>
                <th scope="col">From scratch</th>
                <th scope="col">This kit</th>
                <th scope="col">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.id}>
                  <td>{row.scratch}</td>
                  <td>{row.kit}</td>
                  <td>
                    <a href={evidenceHref(row.evidencePath)} rel="noreferrer">
                      {row.evidencePath}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pb-14 md:pb-[88px]">
        <h2 className="mb-4 text-[24px] font-semibold">Questions</h2>
        <div className="faq border-t border-border">
          <details>
            <summary>Do I need Android Studio?</summary>
            <p>
              Not for the Expo checks. Those look for Node.js, JDK 17, Android SDK platform-tools, and Android SDK
              Platform 37. On macOS they also expect Xcode and CocoaPods. Off macOS, those two checks are skipped.
              CONTRIBUTING.md says Android native work needs Android Studio, a JDK, and the Android SDK. That template
              is still a stub.
            </p>
          </details>
          <details>
            <summary>Which agents work?</summary>
            <p>
              The compiler writes Claude Code, Cursor, OpenCode, Antigravity, and Codex. createshipyard --agent accepts
              claude, cursor, opencode, or all. all writes the first three. Pass antigravity or codex to
              scripts/compile-commands.mjs for the other two.
            </p>
          </details>
          <details>
            <summary>Does this target bare React Native?</summary>
            <p>
              No. The React Native target is Expo, in platforms/expo. There is no bare React Native template in this
              repository.
            </p>
          </details>
          <details>
            <summary>What is the license?</summary>
            <p>MIT. Copyright 2026 Maaz Bin Hassan.</p>
          </details>
        </div>
      </section>

      <section className="pb-14 md:pb-[88px]">
        <h2 className="mb-4 text-[24px] font-semibold">Contribute</h2>
        <p className="max-w-[68ch]">
          The repository is in early development. Read the contributing guide before a pull request. Contributions have
          to be original. Do not paste material from paid or closed-source starter kits.
        </p>
        <p className="mt-4 flex flex-col gap-2">
          <a href={repositoryUrl} rel="noreferrer">
            GitHub repository
          </a>
          <a href={blobUrl("CONTRIBUTING.md")} rel="noreferrer">
            CONTRIBUTING.md
          </a>
        </p>
      </section>
    </div>
  );
}
