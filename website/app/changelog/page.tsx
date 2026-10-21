import type { Metadata } from "next";
import { Markdown } from "@/components/markdown";
import { loadChangelog } from "@/lib/changelog";

const description = "Changes recorded in CHANGELOG.md. createshipyard 1.0.0 is the package on npm.";

export const metadata: Metadata = {
  title: "Changelog",
  description,
  alternates: { canonical: "/changelog/" },
  openGraph: { title: "Changelog", description, url: "/changelog/" },
};

export default function ChangelogPage() {
  const changelog = loadChangelog();
  return (
    <div className="mx-auto grid w-[min(1080px,calc(100%-32px))] gap-10 py-14 md:py-[88px] xl:grid-cols-[minmax(0,720px)_180px]">
      <article className="min-w-0">
        <h1 className="text-[32px] font-semibold tracking-tight">Changelog</h1>
        <div className="mt-8">
          <Markdown source={changelog.intro} />
        </div>
        {changelog.releases.map((release) => (
          <section key={release.id} className="mt-10" aria-labelledby={release.id}>
            <h2 id={release.id} className="text-[24px] font-semibold">
              {release.title}
              <a className="heading-anchor" href={`#${release.id}`} aria-label={`Link to ${release.title}`}>
                #
              </a>
            </h2>
            <Markdown source={release.body} />
          </section>
        ))}
      </article>
      <nav aria-label="On this page" className="sticky top-20 hidden self-start xl:block">
        <p className="mb-3 text-[14px] text-muted">On this page</p>
        <ul className="flex flex-col gap-2">
          {changelog.releases.map((release) => (
            <li key={release.id}>
              <a href={`#${release.id}`}>{release.title}</a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
