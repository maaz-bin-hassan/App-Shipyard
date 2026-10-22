import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { ServiceMark } from "@/components/service-mark";
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

const services = [
  {
    id: "expo" as const,
    name: "Expo",
    setup: "createshipyard copies this template when you pass --platform expo, writes the app config, and installs dependencies.",
    easy: "The default platform is Flutter. Pass --platform expo for this template. The Flutter, Android, and iOS templates are still stubs.",
  },
  {
    id: "supabase" as const,
    name: "Supabase",
    setup: "Profiles, a per-user daily AI limit, and the ai-proxy function ship in the package. The app calls that function. It never calls OpenRouter.",
    easy: "You create the hosted project and set OPENROUTER_API_KEY as a Supabase secret. The agent records the model list and the daily limit. It does not ask you to paste the key.",
  },
  {
    id: "revenuecat" as const,
    name: "RevenueCat",
    setup: "The paywall loads the current offering and shows each package's store price. Restore purchases is a button. It does not run on launch.",
    easy: "/ship-paywall gates the premium features from your pricing note. Live products in Play Console or App Store Connect wait until you answer yes.",
  },
  {
    id: "posthog" as const,
    name: "PostHog",
    setup: "Product events go through one wrapper: track, identify, reset, and screen. Consent starts off.",
    easy: "Nothing is sent until a settings control turns consent on. The project key stays in .env.",
  },
  {
    id: "sentry" as const,
    name: "Sentry",
    setup: "Crashes use that same wrapper and the same consent flag.",
    easy: "The DSN stays in .env. Source maps upload from an EAS environment variable named SENTRY_AUTH_TOKEN. The token is not written into the app.",
  },
];

const docs = [
  { href: "/docs/", title: "Quick start", text: "Node, Git, the npx command, and the flags." },
  { href: "/docs/state-file/", title: "State file", text: "What .shipkit/state.json stores after each command." },
  { href: "/docs/template-architecture/", title: "Template", text: "How a command file and a platform fragment become /ship-*." },
  { href: "/docs/troubleshooting/", title: "Troubleshooting", text: "Folder names, iOS on Windows, and a missing state file." },
];

const handoff = [
  {
    number: "01",
    title: "Install into a new folder",
    text: "Run npx createshipyard my-app --agent cursor. claude is the default. opencode and all are the other choices. all writes Claude Code, Cursor, and OpenCode.",
  },
  {
    number: "02",
    title: "Open that folder in the agent",
    text: "cd my-app, then open it in the agent you named. The slash commands are already files in the project. You do not paste a prompt in.",
  },
  {
    number: "03",
    title: "Run /ship-start",
    text: "The agent asks for the app name, package id, colour, languages, and stores, once. It saves the answers in .shipkit/state.json and checks the toolchain.",
  },
  {
    number: "04",
    title: "Hand it the next command",
    text: "Run /ship-plan-pricing, /ship-paywall, /ship-analytics, or /ship-ai when you are ready. The agent reads that command and edits the files it names. Anything that spends money or publishes waits for an explicit yes.",
  },
];

export default function HomePage() {
  const commands = loadCommands();
  const transcript = loadTranscript();

  return (
    <div className="mx-auto w-[min(1080px,calc(100%-32px))]">
      <section className="py-14 md:py-[88px]">
        <p className="font-mono text-[14px] text-muted">App Shipyard 1.0.0</p>
        <h1 className="mt-4 max-w-[16ch] text-[32px] font-semibold tracking-tight md:text-[48px] md:leading-[1.05]">
          {pitch}
        </h1>
        <p className="mt-6 max-w-[68ch] text-[18px] text-muted">
          App Shipyard is a starter kit for one mobile app. It copies an Expo project, writes the same slash commands
          for Claude Code, Cursor, or OpenCode, and leaves Supabase, RevenueCat, PostHog, and Sentry ready to finish
          with your coding agent. The npm package is createshipyard.
        </p>
        <div className="mt-8 max-w-[640px]">
          <CodeBlock code={installCommand} language="bash" label="Install" copyLabel="Copy" copyVariant="primary" />
        </div>
        <p className="mt-4 max-w-[68ch] text-muted">
          That creates my-app and installs its dependencies. The{" "}
          <Link href="/docs/">install guide</Link> covers the directory name and the agent flags.
        </p>
      </section>

      <section className="pb-14 md:pb-[88px]">
        <h2 className="mb-4 text-[24px] font-semibold">What it sets up</h2>
        <p className="mb-8 max-w-[68ch] text-muted">
          The code for each service is already in the Expo template. You add accounts and secrets. The agent follows
          the matching /ship-* command and stops before a live store or a paid plan.
        </p>
        <dl className="border-t border-border">
          {services.map((item) => (
            <div key={item.id} className="grid gap-3 border-b border-border py-6 md:grid-cols-[16rem_minmax(0,1fr)] md:gap-8">
              <dt className="flex items-center gap-3 font-semibold">
                <ServiceMark id={item.id} />
                {item.name}
              </dt>
              <dd>
                <p>{item.setup}</p>
                <p className="mt-2 text-muted">{item.easy}</p>
              </dd>
            </div>
          ))}
        </dl>
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
        <h2 className="mb-8 text-[24px] font-semibold">Docs</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {docs.map((doc) => (
            <li key={doc.href}>
              <Link className="card h-full" href={doc.href}>
                <h3 className="text-[18px] font-semibold">{doc.title}</h3>
                <p>{doc.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="pb-14 md:pb-[88px]">
        <h2 className="mb-4 text-[24px] font-semibold">Set up the agent and hand it the app</h2>
        <p className="mb-8 max-w-[68ch] text-muted">
          createshipyard writes the command files. Opening the new folder is the handoff. From there you run a slash
          command, and the agent does the steps in that file.
        </p>
        <div className="mb-8 max-w-[640px]">
          <CodeBlock
            code={"npx createshipyard my-app --agent cursor"}
            language="bash"
            label="Cursor"
            copyLabel="Copy"
          />
        </div>
        <ol className="grid gap-8 md:grid-cols-2">
          {handoff.map((step) => (
            <li key={step.number} className="border-t border-border pt-4">
              <p className="font-mono text-[14px] text-muted">{step.number}</p>
              <h3 className="mt-2 text-[18px] font-semibold">{step.title}</h3>
              <p className="mt-2 text-muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="pb-14 md:pb-[88px]" aria-label="Recorded session">
        <h2 className="mb-4 text-[24px] font-semibold">A recorded run</h2>
        <TerminalDemo transcript={transcript} />
      </section>

      <section className="pb-14 md:pb-[88px]">
        <h2 className="mb-8 text-[24px] font-semibold">From scratch and App Shipyard</h2>
        <div className="table-wrap border-t border-border">
          <table>
            <caption className="sr-only">What you do by hand, what App Shipyard does, and the file that shows it</caption>
            <thead>
              <tr>
                <th scope="col">From scratch</th>
                <th scope="col">App Shipyard</th>
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
              Android native work needs Android Studio, a JDK, and the Android SDK. That template is still a stub.
            </p>
          </details>
          <details>
            <summary>Which agents work?</summary>
            <p>
              npx createshipyard my-app --agent accepts claude, cursor, opencode, or all. The default is claude.
              all writes Claude Code, Cursor, and OpenCode. Open the new folder and run /ship-start.
            </p>
          </details>
          <details>
            <summary>Does this target bare React Native?</summary>
            <p>
              No. The React Native target is Expo. There is no bare React Native template in this repository.
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
          Read the contributing guide before a pull request. Contributions have to be original. Do not paste material
          from paid or closed-source starter kits.
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
